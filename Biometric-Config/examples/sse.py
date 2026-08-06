import json

from fastapi.responses import StreamingResponse


SSE_HEADERS = {
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
}


def sse(payload: dict) -> str:
    return f"data: {json.dumps(payload)}\n\n"


def sse_error(message: str, **payload) -> str:
    return sse({"success": False, "message": message, **payload})


def sse_progress(message: str, **payload) -> str:
    return sse({"success": None, "message": message, **payload})


def sse_status(status: str, message: str) -> str:
    return sse({"status": status, "message": message})


def sse_success(**payload) -> str:
    return sse({"success": True, **payload})


def stream_response(events) -> StreamingResponse:
    return StreamingResponse(
        events,
        media_type="text/event-stream",
        headers=SSE_HEADERS,
    )
