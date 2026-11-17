import asyncio
import logging
from itertools import combinations

from . import settings
from .sse import sse_error, sse_progress, sse_success

logger = logging.getLogger("FingerprintService")

# Scans needed for one registration.
CAPTURES_PER_REGISTRATION = 3
# When the scans match each other only weakly, the person starts over; after
# this many tries the best one is saved anyway (and reported as weak), so a
# person with worn fingerprints can still be registered.
MAX_REGISTRATION_ATTEMPTS = 3


def registration_score(zkfp2, captures):
    """How well the scans match each other: the weakest of all pairs."""
    return min(zkfp2.DBMatch(a, b) for a, b in combinations(captures, 2))


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

    The 3 scans are then compared with each other; the weakest pair is the
    registration score, saved with the fingerprint. Below
    BIOMETRIC_WEAK_REGISTRATION_SCORE the person is asked to scan again.

    `lease` is this connection's use of the scanner (see scanner_owner.py):
    if another page takes the scanner before the scans are done, the
    registration stops and nothing is saved.
    """
    templates = []
    attempt = 1
    best = None  # (score, captures) of the best try so far
    weak_score = settings.weak_registration_score()

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

        while True:
            if len(templates) == CAPTURES_PER_REGISTRATION:
                score = registration_score(service.zkfp2, templates)
                logger.info("Registration try %s for employee %s: score %s.", attempt, emp_id, score)

                if best is None or score > best[0]:
                    best = (score, list(templates))

                if score >= weak_score or attempt >= MAX_REGISTRATION_ATTEMPTS:
                    break

                attempt += 1
                templates = []
                yield sse_progress(
                    f"The 3 scans did not match each other well (score {score}). "
                    f"Let's try again ({attempt} of {MAX_REGISTRATION_ATTEMPTS}): "
                    "place the same finger flat on the scanner.",
                    attempt=attempt,
                )
                continue

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

        score, templates = best
        weak = score < weak_score
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
                "INSERT INTO biometrics "
                "(employee_id, finger_index, fingerprint_template, registration_score, created_at, updated_at) "
                "VALUES (%s, %s, %s, %s, NOW(), NOW())",
                (emp_id, next_finger_index, final_template, score),
            )
            finger_id = cursor.lastrowid

        if weak:
            logger.warning(
                "Weak registration saved for employee %s (score %s, below %s).",
                emp_id,
                score,
                weak_score,
            )

        # Make the new fingerprint scannable right away. The registration is
        # already saved, so a failed reload is only logged (the next scan
        # connection retries it).
        try:
            await service.templates.refresh()
        except Exception as exc:
            logger.error("Reloading fingerprints after registration failed: %s", exc)

        yield sse_success(
            message=(
                f"Fingerprint registered, but the scans were weak (score {score}). "
                "If this finger is often not recognized, register a different finger."
                if weak
                else "Fingerprint registered successfully."
            ),
            finger_id=finger_id,
            finger_index=next_finger_index,
            registration_score=score,
            weak=weak,
        )

    except asyncio.CancelledError:
        logger.info("SSE registration cancelled by client.")
        raise
    except Exception as exc:
        logger.error("Register failed: %s", exc)
        yield sse_error(f"Register failed: {str(exc)}")
