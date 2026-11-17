import asyncio
import logging

from .sse import sse_error, sse_progress, sse_success

logger = logging.getLogger("FingerprintService")


async def register_fingerprint(
    emp_id,
    service,
    match_threshold=60,
    duplicate_threshold=90,
    lease=None,
):
    """
    Register a fingerprint for an employee.
    Requires 3 consistent scans and rejects duplicates assigned to other employees.

    `lease` is this connection's use of the scanner (see scanner_owner.py):
    if another page takes the scanner before the 3 scans are done, the
    registration stops and nothing is saved.
    """
    templates = []

    def taken():
        return lease is not None and lease.taken

    try:
        # Duplicate check: compare against every station's prints (the scanner
        # memory holds only one station's), read once per registration.
        try:
            existing_prints = await asyncio.to_thread(service.templates.all_registered)
        except Exception as exc:
            logger.error("Could not read registered prints for the duplicate check: %s", exc)
            existing_prints = []

        while len(templates) < 3:
            if taken():
                yield lease.taken_event()
                return

            try:
                async with service.scan_lock:
                    if taken():
                        continue
                    capture = await asyncio.to_thread(service.zkfp2.AcquireFingerprint)
            except Exception as exc:
                logger.error("Fingerprint capture error: %s", exc)
                await asyncio.sleep(0.1)
                continue

            if not capture or taken():
                await asyncio.sleep(0.1)
                continue

            tmp, _ = capture
            if not tmp:
                await asyncio.sleep(0.1)
                continue

            try:
                for existing_emp_id, existing_template in existing_prints:
                    if int(existing_emp_id) == int(emp_id):
                        continue

                    score = service.zkfp2.DBMatch(tmp, existing_template)
                    if score >= duplicate_threshold:
                        yield sse_error(
                            "Fingerprint already registered to another employee.",
                        )
                        return
            except Exception as exc:
                logger.error("Duplicate check failed: %s", exc)

            if templates:
                score = service.zkfp2.DBMatch(templates[-1], tmp)
                if score < match_threshold:
                    yield sse_progress(
                        f"Fingerprint {len(templates) + 1} mismatch. Try again.",
                    )
                    continue

            templates.append(tmp)
            yield sse_progress(
                f"Fingerprint {len(templates)} captured. Place finger again.",
                scan_number=len(templates),
            )

        reg_temp, size = service.zkfp2.DBMerge(*templates)
        final_template = bytes(reg_temp)[:size]

        with service.db_cursor(commit=True) as cursor:
            cursor.execute(
                "SELECT MAX(finger_index) FROM biometrics WHERE employee_id=%s",
                (emp_id,),
            )
            result = cursor.fetchone()
            max_index = int(result[0]) if result and result[0] is not None else 0
            next_finger_index = max_index + 1

            cursor.execute(
                "INSERT INTO biometrics (employee_id, finger_index, fingerprint_template, created_at, updated_at) "
                "VALUES (%s, %s, %s, NOW(), NOW())",
                (emp_id, next_finger_index, final_template),
            )
            finger_id = cursor.lastrowid

        # Make the new fingerprint scannable right away. The registration is
        # already saved, so a failed reload is only logged (the next scan
        # connection retries it).
        try:
            await service.templates.refresh()
        except Exception as exc:
            logger.error("Reloading fingerprints after registration failed: %s", exc)

        yield sse_success(
            message="Fingerprint registered successfully.",
            finger_id=finger_id,
            finger_index=next_finger_index,
        )

    except asyncio.CancelledError:
        logger.info("SSE registration cancelled by client.")
        raise
    except Exception as exc:
        logger.error("Register failed: %s", exc)
        yield sse_error(f"Register failed: {str(exc)}")
