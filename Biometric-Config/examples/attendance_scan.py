import asyncio
import json
import logging
from datetime import datetime

logger = logging.getLogger("FingerprintService")
last_scan_times = {}

COOLDOWN_SECONDS = 3
HEARTBEAT_INTERVAL = 15
MATCH_THRESHOLD = 60


def sse(payload):
    return f"data: {json.dumps(payload)}\n\n"


def load_fingerprints(service):
    service.zkfp2.DBClear()

    with service.db_cursor() as cursor:
        cursor.execute("SELECT id, employee_id, fingerprint_template FROM biometrics")
        rows = cursor.fetchall()

    fingerprint_employees = {}

    for fid, employee_id, template in rows:
        if not template:
            continue

        if isinstance(template, memoryview):
            template = template.tobytes()

        service.zkfp2.DBAdd(fid, template)
        fingerprint_employees[int(fid)] = int(employee_id)
        logger.info("Loaded fingerprint fid=%s employee_id=%s", fid, employee_id)

    logger.info("Loaded %s fingerprints into SDK memory.", len(fingerprint_employees))
    return fingerprint_employees


async def scan_attendance_fingerprint(service, station_id=None):
    """Identify a fingerprint and return employee data. Laravel records attendance."""
    try:
        fingerprint_employees = load_fingerprints(service)
    except Exception as exc:
        logger.error("Error loading fingerprints into SDK memory: %s", exc)
        yield sse({"success": False, "message": "Could not load registered fingerprints."})
        return

    try:
        last_heartbeat = datetime.now()

        while True:
            now = datetime.now()

            if (now - last_heartbeat).total_seconds() >= HEARTBEAT_INTERVAL:
                yield sse({})
                last_heartbeat = now

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

            try:
                fid, score = service.zkfp2.DBIdentify(tmp)

                if fid == -1 or score < MATCH_THRESHOLD:
                    logger.info("Scan result: no match score=%s", score)
                    yield sse({"success": False, "message": "Fingerprint not recognized."})
                    continue

                employee_id = fingerprint_employees.get(int(fid))
                if not employee_id:
                    yield sse({"success": False, "message": "Fingerprint recognized but no employee linked."})
                    continue

                employee_data = service.employee_payload(employee_id)
                if not employee_data:
                    yield sse({"success": False, "message": "Employee not found in database."})
                    continue

                if station_id is not None and int(employee_data.get("station_id") or 0) != int(station_id):
                    yield sse({
                        "success": False,
                        "message": "Employee is not assigned to this station.",
                        "employee": employee_data,
                    })
                    continue

                now = datetime.now()
                if employee_id in last_scan_times:
                    elapsed = (now - last_scan_times[employee_id]).total_seconds()
                    if elapsed < COOLDOWN_SECONDS:
                        yield sse({
                            "success": False,
                            "message": "Scan ignored: please wait a moment before scanning again.",
                            "employee": employee_data,
                        })
                        continue

                last_scan_times[employee_id] = now
                logger.info(
                    "Scan match: fid=%s employee_id=%s score=%s",
                    fid,
                    employee_id,
                    score,
                )
                yield sse({
                    "success": True,
                    "finger_id": fid,
                    "score": score,
                    "employee": employee_data,
                })

            except Exception as exc:
                logger.error("Attendance fingerprint scan failed: %s", exc)
                yield sse({"success": False, "message": f"System error: {str(exc)}"})
                await asyncio.sleep(0.1)

            await asyncio.sleep(0.05)

    except asyncio.CancelledError:
        logger.info("SSE attendance scan connection closed by client.")
        raise
