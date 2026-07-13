import asyncio
import json
import logging

logger = logging.getLogger("FingerprintService")


def sse(payload):
    return f"data: {json.dumps(payload)}\n\n"


async def register_fingerprint(emp_id, service, match_threshold=60, duplicate_threshold=90):
    """
    Register a fingerprint for an employee.
    Requires 3 consistent scans and rejects duplicates assigned to other employees.
    """
    templates = []

    try:
        while len(templates) < 3:
            try:
                async with service.scan_lock:
                    capture = await asyncio.to_thread(service.zkfp2.AcquireFingerprint)
            except Exception as exc:
                logger.error("Fingerprint capture error: %s", exc)
                await asyncio.sleep(0.1)
                continue

            if not capture:
                await asyncio.sleep(0.1)
                continue

            tmp, _ = capture
            if not tmp:
                await asyncio.sleep(0.1)
                continue

            try:
                with service.db_cursor() as cursor:
                    cursor.execute("SELECT employee_id, fingerprint_template FROM biometrics")
                    rows = cursor.fetchall()

                for existing_emp_id, existing_template in rows:
                    if not existing_template or int(existing_emp_id) == int(emp_id):
                        continue

                    if isinstance(existing_template, memoryview):
                        existing_template = existing_template.tobytes()

                    score = service.zkfp2.DBMatch(tmp, existing_template)
                    if score >= duplicate_threshold:
                        yield sse({
                            "success": False,
                            "message": "Fingerprint already registered to another employee.",
                        })
                        return
            except Exception as exc:
                logger.error("Duplicate check failed: %s", exc)

            if templates:
                score = service.zkfp2.DBMatch(templates[-1], tmp)
                if score < match_threshold:
                    yield sse({
                        "success": None,
                        "message": f"Fingerprint {len(templates) + 1} mismatch. Try again.",
                    })
                    continue

            templates.append(tmp)
            yield sse({
                "success": None,
                "message": f"Fingerprint {len(templates)} captured. Place finger again.",
                "scan_number": len(templates),
            })

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

        yield sse({
            "success": True,
            "message": "Fingerprint registered successfully.",
            "finger_id": finger_id,
            "finger_index": next_finger_index,
        })

    except asyncio.CancelledError:
        logger.info("SSE registration cancelled by client.")
        raise
    except Exception as exc:
        logger.error("Register failed: %s", exc)
        yield sse({"success": False, "message": f"Register failed: {str(exc)}"})
