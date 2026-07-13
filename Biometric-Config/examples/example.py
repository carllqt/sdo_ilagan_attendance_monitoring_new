from contextlib import contextmanager
from pathlib import Path
import asyncio
import logging
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pyzkfp import ZKFP2
import mysql.connector

from .register import register_fingerprint
from .attendance_scan import scan_attendance_fingerprint
from .fingerprint_choice import fingerprint_choice

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


def env_list(name: str, default: str) -> list[str]:
    return [
        item.strip()
        for item in os.getenv(name, default).split(",")
        if item.strip()
    ]


origins = env_list(
    "BIOMETRIC_CORS_ORIGINS",
    "http://127.0.0.1:8000,http://localhost:8000,http://10.10.115.29:8000",
)

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

        if self.zkfp2.GetDeviceCount() == 0:
            raise RuntimeError("No fingerprint devices found")
        if not self.zkfp2.OpenDevice(0):
            raise RuntimeError("Failed to open fingerprint device")

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

# Initialize service
service = FingerprintService()

# ----- ENDPOINTS -----
@app.get("/bioRegisterSSE/{emp_id}")
async def bio_register_sse(emp_id: int, request: Request):
    """SSE endpoint for fingerprint registration"""
    async def event_stream():
        async for event in register_fingerprint(emp_id, service):
            if await request.is_disconnected():
                break
            yield event

    return StreamingResponse(event_stream(), media_type="text/event-stream")

@app.get("/bioAttendanceScan")
async def bio_attendance_scan(request: Request, station_id: int | None = None):
    """SSE endpoint for attendance fingerprint scanning."""
    async def event_stream():
        async for msg in scan_attendance_fingerprint(service, station_id):
            if await request.is_disconnected():
                break
            yield msg

    return StreamingResponse(event_stream(), media_type="text/event-stream")


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
    return StreamingResponse(event_stream(), media_type="text/event-stream")


@app.on_event("shutdown")
def shutdown_event():
    service.close()
