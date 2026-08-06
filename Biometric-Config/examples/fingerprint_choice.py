from .sse import sse_error


async def fingerprint_choice(service, employee_id: int, choice: str, station_id=None):
    """Attendance choices are now recorded by Laravel."""
    yield sse_error(
        "Attendance choices are handled by Laravel. Use /attendance/choice.",
    )
