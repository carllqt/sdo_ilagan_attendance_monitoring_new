"""Fingerprint settings, read from the project's .env (each station's copy
has its own). Restart the fingerprint service after changing them.

BIOMETRIC_MATCH_THRESHOLD (default 60, allowed 40-95)
    The lowest match score accepted at attendance. Higher rejects more weak
    matches; lower lets more through and risks recording the wrong person.
    The scanner SDK has its own cutoff too: a value below it changes nothing.

BIOMETRIC_WEAK_REGISTRATION_SCORE (default 75, allowed 0-100)
    At registration, the 3 scans are compared with each other. If the
    weakest pair scores below this, the person is asked to scan again (up to
    3 tries), and a finger saved below it is reported as weak. A starting
    value: the saved registration scores show what is normal for your
    scanners.
"""
import logging
import os
from functools import cache

logger = logging.getLogger("FingerprintService")


def _int_setting(name, default, low, high):
    raw = os.getenv(name, "").strip()

    if not raw:
        return default

    try:
        value = int(raw)
    except ValueError:
        logger.warning("%s=%r is not a whole number; using %s.", name, raw, default)
        return default

    if not low <= value <= high:
        clamped = min(max(value, low), high)
        logger.warning("%s=%s is outside %s-%s; using %s.", name, value, low, high, clamped)
        return clamped

    return value


@cache
def match_threshold():
    return _int_setting("BIOMETRIC_MATCH_THRESHOLD", 60, 40, 95)


@cache
def weak_registration_score():
    return _int_setting("BIOMETRIC_WEAK_REGISTRATION_SCORE", 75, 0, 100)
