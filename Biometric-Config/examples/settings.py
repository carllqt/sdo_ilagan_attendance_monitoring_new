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

BIOMETRIC_CORS_ORIGINS (optional, comma-separated)
    Extra web addresses whose pages may use this scanner. Not needed for the
    station's own attendance page: the site on this same computer is always
    allowed, at any of the computer's addresses (port BIOMETRIC_SITE_PORT,
    default 8000) and at APP_URL.
"""
import logging
import os
from functools import cache
from urllib.parse import urlsplit

from .scanner_owner import LOCAL_ADDRESSES

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


# This laptop's development site, allowed by default as before.
DEFAULT_EXTRA_ORIGINS = "http://10.10.115.29:8000"


def allowed_origins():
    """Web pages (origins) allowed to use this scanner.

    Each station runs its own copy of the site next to its scanner, so the
    site on this computer is always allowed, whatever address the kiosk
    browser opens it at. Without this, a station whose address was missing
    from a hard-coded list could not reach its own scanner.
    """
    port = os.getenv("BIOMETRIC_SITE_PORT", "8000").strip() or "8000"
    origins = [
        f"http://{host}:{port}"
        for host in sorted(LOCAL_ADDRESSES)
        if ":" not in host  # IPv6 (::1) would need brackets; not used
    ]

    app_url = urlsplit(os.getenv("APP_URL", "").strip())
    if app_url.scheme in ("http", "https") and app_url.netloc:
        origins.append(f"{app_url.scheme}://{app_url.netloc}")

    extra = os.getenv("BIOMETRIC_CORS_ORIGINS", DEFAULT_EXTRA_ORIGINS)
    origins += [item.strip().rstrip("/") for item in extra.split(",") if item.strip()]

    return list(dict.fromkeys(origins))
