import asyncio
import logging
import json

logger = logging.getLogger("FingerprintService")

async def register_fingerprint(emp_id, service, match_threshold=60, duplicate_threshold=90):
    """
    Async SSE fingerprint registration for an employee.
    Requires 3 consistent scans.
    Duplicate check runs on every scan but uses stricter threshold.
    Handles integer finger_index (increments per employee).
    """
    templates = []

    try:
        while len(templates) < 3:
            try:
                # Non-blocking acquisition
                capture = await asyncio.to_thread(service.zkfp2.AcquireFingerprint)
            except Exception as e:
                logger.error(f"Fingerprint capture error: {e}")
                await asyncio.sleep(0.1)
                continue

            if not capture:
                await asyncio.sleep(0.1)
                continue

            tmp, _ = capture
            if not tmp:
                await asyncio.sleep(0.1)
                continue

            # --- Duplicate check (every scan, strict threshold) ---
            try:
                service.cursor.execute("SELECT employee_id, fingerprint_template FROM biometrics")
                rows = service.cursor.fetchall()

                for existing_emp_id, existing_template in rows:
                    if not existing_template or existing_emp_id == emp_id:
                        continue  # skip empty & self
                    if isinstance(existing_template, memoryview):
                        existing_template = existing_template.tobytes()

                    score = service.zkfp2.DBMatch(tmp, existing_template)
                    if score >= duplicate_threshold:
                        yield f"data: {json.dumps({'success': False, 'message': 'Fingerprint already registered to another employee.'})}\n\n"
                        return
            except Exception as e:
                logger.error(f"MySQL duplicate check failed: {e}")

            # --- Consistency check with previous scans ---
            if templates:
                score = service.zkfp2.DBMatch(templates[-1], tmp)
                if score < match_threshold:
                    yield f"data: {json.dumps({'success': None, 'message': f'Fingerprint {len(templates)+1} mismatch. Try again.'})}\n\n"
                    continue

            templates.append(tmp)
            yield f"data: {json.dumps({'success': None, 'message': f'✅ Fingerprint {len(templates)} captured. Place finger again.', 'scan_number': len(templates)})}\n\n"

        # --- Merge and save final template ---
        regTemp, size = service.zkfp2.DBMerge(*templates)
        if isinstance(regTemp, (bytes, bytearray)):
            final_template = regTemp[:size]
        else:
            final_template = bytes(regTemp)[:size]

        # --- Determine next finger_index for this employee ---
        try:
            service.cursor.execute(
                "SELECT MAX(finger_index) FROM biometrics WHERE employee_id=%s",
                (emp_id,)
            )
            result = service.cursor.fetchone()
            max_index = int(result[0]) if result[0] is not None else 0
            next_finger_index = max_index + 1
        except Exception as e:
            logger.error(f"Failed to get next finger index: {e}")
            next_finger_index = 1  # fallback

        finger_id = service.get_next_finger_id()
        service.cursor.execute(
            "INSERT INTO biometrics (id, employee_id, finger_index, fingerprint_template, created_at, updated_at) "
            "VALUES (%s, %s, %s, %s, NOW(), NOW())",
            (finger_id, emp_id, next_finger_index, final_template)
        )
        service.conn.commit()

        yield f"data: {json.dumps({'success': True, 'message': '🎉 Fingerprint registered successfully', 'finger_id': finger_id, 'finger_index': next_finger_index})}\n\n"

    except Exception as e:
        logger.error(f"Register failed: {e}")
        yield f"data: {json.dumps({'success': False, 'message': f'Register failed: {str(e)}'})}\n\n"
    except asyncio.CancelledError:
        logger.info("SSE registration cancelled by client.")
        raise