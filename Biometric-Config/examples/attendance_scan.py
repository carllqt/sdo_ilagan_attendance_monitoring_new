import asyncio
import logging
from datetime import datetime

from . import scan_log, settings
from .sse import sse, sse_error, sse_status, sse_success

logger = logging.getLogger("FingerprintService")
last_scan_times = {}

COOLDOWN_SECONDS = 3
HEARTBEAT_INTERVAL = 15
# How often an open scan connection checks whether fingerprints were added
# or removed (one small query; the templates reload only on a change).
TEMPLATE_CHECK_INTERVAL = 60
FINGER_RELEASE_SECONDS = 0.5


async def scan_attendance_fingerprint(
    service,
    station_id=None,
    is_disconnected=None,
    lease=None,
    purpose="attendance",
):
    """Identify a fingerprint and return employee data. Laravel records attendance.

    `lease` is this connection's use of the scanner (see scanner_owner.py):
    once another page takes the scanner, this stops and tells the page who.

    Every identified finger is saved to the scan log with its match score
    (see scan_log.py); `purpose` (attendance or test) goes with it.
    """
    templates = service.templates

    async def log_scan(employee_id, fid, score, threshold, outcome):
        return await asyncio.to_thread(
            scan_log.record_scan,
            service,
            employee_id=employee_id,
            biometric_id=fid,
            score=score,
            threshold=threshold,
            station_id=station_id,
            purpose=purpose,
            outcome=outcome,
        )

    def taken():
        return lease is not None and lease.taken

    # Only this station's prints are matched. They stay in SDK memory between
    # connections; this reloads them only if they changed since the last load.
    try:
        await templates.refresh(station_id=station_id, lease=lease)
    except Exception as exc:
        logger.error("Error checking registered fingerprints: %s", exc)

        if not templates.loaded:
            yield sse_error("Could not load registered fingerprints.")
            return

    try:
        if taken():
            yield lease.taken_event()
            return

        yield sse_status("ready", "Fingerprint scanner ready.")
        last_heartbeat = datetime.now()
        last_template_check = datetime.now()
        sensor_armed = False
        sensor_clear_since = None
        capture_error_count = 0

        while True:
            if is_disconnected and await is_disconnected():
                logger.info("SSE attendance client disconnected; stopping scanner.")
                return

            if taken():
                yield lease.taken_event()
                return

            now = datetime.now()

            if (now - last_heartbeat).total_seconds() >= HEARTBEAT_INTERVAL:
                yield sse({})
                last_heartbeat = now

            if (now - last_template_check).total_seconds() >= TEMPLATE_CHECK_INTERVAL:
                last_template_check = now
                try:
                    await templates.refresh(station_id=station_id, lease=lease)
                except Exception as exc:
                    logger.error("Error checking registered fingerprints: %s", exc)

            try:
                async with service.scan_lock:
                    if taken():
                        continue
                    capture = await asyncio.to_thread(service.zkfp2.AcquireFingerprint)
            except Exception as exc:
                logger.error("Fingerprint capture error: %s", exc)
                capture_error_count += 1

                if capture_error_count >= 3:
                    yield sse_status(
                        "error",
                        "Fingerprint device connection lost. Reconnecting...",
                    )
                    try:
                        async with service.scan_lock:
                            await asyncio.to_thread(service.reconnect)
                        # A reopened device starts with empty memory. Reload
                        # the station loaded now, which is another page's if
                        # that page took the scanner meanwhile.
                        await templates.refresh(force=True)
                        capture_error_count = 0
                        sensor_armed = False
                        sensor_clear_since = None
                        yield sse_status(
                            "ready",
                            "Fingerprint scanner reconnected. Place your finger.",
                        )
                    except Exception as reconnect_error:
                        logger.error("Fingerprint device reconnect failed: %s", reconnect_error)
                await asyncio.sleep(0.1)
                continue

            capture_error_count = 0

            if not sensor_armed:
                if capture:
                    # Discard a finger still on the scanner (the last person's,
                    # or one placed before the page connected). A new scan is
                    # accepted only after the sensor has continuously
                    # reported no finger for FINGER_RELEASE_SECONDS.
                    sensor_clear_since = None
                    await asyncio.sleep(0.1)
                    continue

                loop_time = asyncio.get_running_loop().time()
                if sensor_clear_since is None:
                    sensor_clear_since = loop_time
                elif loop_time - sensor_clear_since >= FINGER_RELEASE_SECONDS:
                    sensor_armed = True
                    logger.info("Fingerprint sensor cleared and re-armed.")

                await asyncio.sleep(0.1)
                continue

            if not capture:
                await asyncio.sleep(0.1)
                continue

            if is_disconnected and await is_disconnected():
                logger.info("SSE attendance client disconnected after capture.")
                return

            # Taken while this finger was being read: the finger belongs to
            # the page that has the scanner now, not to this one.
            if taken():
                continue

            tmp, _ = capture

            # The page keeps this connection open from one person to the
            # next, so the lift-your-finger check above is the only gap
            # between scans: the next finger counts once this one is lifted.
            sensor_armed = False
            sensor_clear_since = None

            try:
                # Not while the templates are being reloaded.
                async with service.scan_lock:
                    fid, score = service.zkfp2.DBIdentify(tmp)

                threshold = settings.match_threshold()

                if fid == -1 or score < threshold:
                    logger.info("Scan result: no match score=%s", score)

                    # A registered finger that matched too weakly: logged as
                    # an early sign of a bad registration.
                    weak_match = templates.employee_for(fid) if fid != -1 else None
                    if weak_match:
                        await log_scan(weak_match, fid, score, threshold, scan_log.REJECTED)

                    yield sse_error("Fingerprint not recognized.")
                    continue

                employee_id = templates.employee_for(fid)
                if not employee_id:
                    yield sse_error("Fingerprint recognized but no employee linked.")
                    continue

                employee_data = service.employee_payload(employee_id)
                if not employee_data:
                    yield sse_error("Employee not found in database.")
                    continue

                if station_id is not None and int(employee_data.get("station_id") or 0) != int(station_id):
                    yield sse_error(
                        "Employee is not assigned to this station.",
                        employee=employee_data,
                    )
                    continue

                # The same finger tapped twice: ignored without a message, so
                # the first scan's result stays on the page.
                now = datetime.now()
                if employee_id in last_scan_times:
                    elapsed = (now - last_scan_times[employee_id]).total_seconds()
                    if elapsed < COOLDOWN_SECONDS:
                        logger.info(
                            "Scan ignored: employee %s scanned again within %ss.",
                            employee_id,
                            COOLDOWN_SECONDS,
                        )
                        continue

                last_scan_times[employee_id] = now
                logger.info(
                    "Scan match: fid=%s employee_id=%s score=%s",
                    fid,
                    employee_id,
                    score,
                )
                # The page sends scan_id with the attendance it records, so
                # Laravel can add what this scan recorded to the log.
                scan_id = await log_scan(employee_id, fid, score, threshold, scan_log.IDENTIFIED)
                yield sse_success(
                    finger_id=fid,
                    score=score,
                    threshold=threshold,
                    scan_id=scan_id,
                    employee=employee_data,
                )

            except Exception as exc:
                logger.error("Attendance fingerprint scan failed: %s", exc)
                yield sse_error(f"System error: {str(exc)}")
                await asyncio.sleep(0.1)

            await asyncio.sleep(0.05)

    except asyncio.CancelledError:
        logger.info("SSE attendance scan connection closed by client.")
        raise
