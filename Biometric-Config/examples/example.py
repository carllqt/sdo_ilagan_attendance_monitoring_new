from contextlib import contextmanager
from pathlib import Path
import asyncio
import logging
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pyzkfp import ZKFP2
import mysql.connector

from . import scanner_owner, settings
from .register import register_fingerprint
from .attendance_scan import scan_attendance_fingerprint
from .fingerprint_choice import fingerprint_choice
from .scanner_owner import ScannerOwnership
from .sse import stream_response
from .templates import FingerprintTemplates

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("FingerprintService")

app = FastAPI()


def load_env_file(path: Path) -> None:
    if not path.exists():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_env_file(Path(__file__).resolve().parents[2] / ".env")
load_env_file(Path(__file__).resolve().parents[1] / ".env")


# Pages allowed to use this scanner: the attendance site on this computer
# (any of its addresses), plus BIOMETRIC_CORS_ORIGINS. See settings.py.
origins = settings.allowed_origins()
logger.info("Pages allowed to use the scanner: %s", ", ".join(origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----- INIT SERVICE -----
class FingerprintService:
    def __init__(self):
        self.zkfp2 = ZKFP2()
        self.zkfp2.Init()
        self.scan_lock = asyncio.Lock()
        # Registered fingerprints of the attendance page's station, kept in
        # SDK memory. Loaded when the page first connects (before anyone
        # scans) and reloaded only when that station's prints change.
        self.templates = FingerprintTemplates(self)
        # Which page is using the scanner; one at a time.
        self.ownership = ScannerOwnership()

        if self.zkfp2.GetDeviceCount() == 0:
            raise RuntimeError("No fingerprint devices found")
        if not self.zkfp2.OpenDevice(0):
            raise RuntimeError("Failed to open fingerprint device")

        # From .env; see settings.py.
        logger.info(
            "Match threshold %s; registrations below %s are weak.",
            settings.match_threshold(),
            settings.weak_registration_score(),
        )

        self.db_config = {
            "host": os.getenv("BIOMETRIC_DB_HOST", os.getenv("DB_HOST", "127.0.0.1")),
            "port": int(os.getenv("BIOMETRIC_DB_PORT", os.getenv("DB_PORT", "3306"))),
            "user": os.getenv("BIOMETRIC_DB_USER", os.getenv("DB_USERNAME", "root")),
            "password": os.getenv("BIOMETRIC_DB_PASSWORD", os.getenv("DB_PASSWORD", "")),
            "database": os.getenv(
                "BIOMETRIC_DB_DATABASE",
                os.getenv("DB_DATABASE", "sdo_ilagan_attendance_monitoring"),
            ),
        }

    @contextmanager
    def db_cursor(self, commit: bool = False):
        conn = mysql.connector.connect(**self.db_config)
        cursor = conn.cursor()
        try:
            yield cursor
            if commit:
                conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            cursor.close()
            conn.close()

    def get_next_finger_id(self):
        with self.db_cursor() as cursor:
            cursor.execute("SELECT MAX(id) FROM biometrics")
            max_id = cursor.fetchone()[0]
        return (max_id + 1) if max_id else 1

    def employee_payload(self, employee_id: int):
        with self.db_cursor() as cursor:
            cursor.execute("""
                SELECT e.id, e.first_name, e.middle_name, e.last_name, e.position, wt.name, o.id, o.name, e.station_id, s.name
                FROM employees e
                LEFT JOIN offices o ON o.id = e.office_id
                LEFT JOIN stations s ON s.id = e.station_id
                LEFT JOIN work_schedules ws ON ws.id = e.work_schedule_id
                LEFT JOIN work_types wt ON wt.id = ws.work_type_id
                WHERE e.id=%s
            """, (employee_id,))
            row = cursor.fetchone()

        if not row:
            return None

        return {
            "id": row[0],
            "first_name": row[1],
            "middle_name": row[2],
            "last_name": row[3],
            "position": row[4],
            "work_type": row[5],
            "office": {
                "id": row[6],
                "name": row[7],
            } if row[6] else None,
            "station_id": row[8],
            "station": {
                "id": row[8],
                "name": row[9],
            } if row[8] else None,
        }

    def close(self):
        try:
            self.zkfp2.Terminate()
        except Exception:
            pass

    def reconnect(self):
        self.close()
        self.zkfp2 = ZKFP2()
        self.zkfp2.Init()

        if self.zkfp2.GetDeviceCount() == 0:
            raise RuntimeError("No fingerprint devices found")
        if not self.zkfp2.OpenDevice(0):
            raise RuntimeError("Failed to reconnect fingerprint device")

        logger.info("Fingerprint device reconnected.")

# Initialize service
service = FingerprintService()

def client_host(request: Request) -> str:
    return request.client.host if request.client else ""


def with_scanner(request: Request, client: str, claim: bool, mode: str, label: str, scan):
    return scanner_owner.run_with_scanner(
        service.ownership,
        client=client,
        claim=claim,
        mode=mode,
        label=label,
        host=client_host(request),
        scan=scan,
        is_disconnected=request.is_disconnected,
    )


# ----- ENDPOINTS -----
# Each page sends `client` (its tab's id) and `claim=1` when a person opened
# the page or pressed a button; automatic reconnects send no claim.
@app.get("/bioRegisterSSE/{emp_id}")
async def bio_register_sse(emp_id: int, request: Request, client: str = "", claim: bool = True):
    """SSE endpoint for fingerprint registration"""
    async def event_stream():
        label = await asyncio.to_thread(scanner_owner.registration_label, service, emp_id)

        async for event in with_scanner(
            request,
            client,
            claim,
            scanner_owner.REGISTRATION,
            label,
            lambda lease: register_fingerprint(emp_id, service, lease=lease),
        ):
            yield event

    return stream_response(event_stream())

@app.get("/bioAttendanceScan")
async def bio_attendance_scan(
    request: Request,
    station_id: int | None = None,
    client: str = "",
    claim: bool = False,
    purpose: str = "attendance",
):
    """SSE endpoint for attendance fingerprint scanning (and the fingerprint
    test, with purpose=test)."""
    async def event_stream():
        if purpose == scanner_owner.TEST:
            mode, label = scanner_owner.TEST, scanner_owner.TEST_LABEL
        else:
            mode = scanner_owner.ATTENDANCE
            label = await asyncio.to_thread(scanner_owner.attendance_label, service, station_id)

        async for event in with_scanner(
            request,
            client,
            claim,
            mode,
            label,
            lambda lease: scan_attendance_fingerprint(
                service,
                station_id,
                request.is_disconnected,
                lease=lease,
                purpose=mode,
            ),
        ):
            yield event

    return stream_response(event_stream())


@app.get("/bioScannerStatus")
async def bio_scanner_status(request: Request, client: str = ""):
    """Who is using the scanner: {free, yours, owner}."""
    return service.ownership.status(client, client_host(request))


@app.post("/bioScannerRelease")
async def bio_scanner_release(client: str = ""):
    """A page is closing: give the scanner back without the usual wait."""
    service.ownership.release(client)
    return {"ok": True}


@app.get("/bioFingerprintChoice/{employee_id}/{choice}")
async def bio_fingerprint_choice_sse(
    request: Request,
    employee_id: int,
    choice: str,
    station_id: int | None = None,
):
    """SSE endpoint for recording AM Time-Out or PM Time-In choice"""
    async def event_stream():
        async for msg in fingerprint_choice(service, employee_id, choice, station_id):
            if await request.is_disconnected():
                break
            yield msg
    return stream_response(event_stream())


@app.on_event("shutdown")
def shutdown_event():
    service.close()
