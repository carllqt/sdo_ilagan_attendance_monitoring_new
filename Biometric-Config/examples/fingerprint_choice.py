import json


def sse(payload):
    return f"data: {json.dumps(payload)}\n\n"


async def fingerprint_choice(service, employee_id: int, choice: str, station_id=None):
    """Attendance choices are now recorded by Laravel."""
    yield sse({
        "success": False,
        "message": "Attendance choices are handled by Laravel. Use /attendance/choice.",
    })
