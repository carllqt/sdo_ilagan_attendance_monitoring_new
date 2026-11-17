"""The scan log (fingerprint_scans): every identified finger and its match
score. Low scores for one registered finger are an early sign it should be
registered again. Laravel later adds what the scan recorded.
"""
import logging

logger = logging.getLogger("FingerprintService")

IDENTIFIED = "identified"
REJECTED = "rejected"  # the finger was known, but scored below the threshold


def record_scan(service, *, employee_id, biometric_id, score, threshold, station_id, purpose, outcome):
    """Save one scan; returns its id, or None if it could not be saved (the
    scan itself goes on either way)."""
    try:
        with service.db_cursor(commit=True) as cursor:
            cursor.execute(
                "INSERT INTO fingerprint_scans "
                "(employee_id, biometric_id, station_id, purpose, score, threshold, outcome, created_at, updated_at) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())",
                (
                    int(employee_id),
                    int(biometric_id) if biometric_id else None,
                    int(station_id) if station_id is not None else None,
                    purpose,
                    max(int(score), 0),
                    int(threshold),
                    outcome,
                ),
            )
            return cursor.lastrowid
    except Exception as exc:
        logger.error("Could not save the scan to the scan log: %s", exc)
        return None
