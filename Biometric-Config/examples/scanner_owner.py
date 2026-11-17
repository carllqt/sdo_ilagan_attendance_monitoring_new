"""Which page is using the fingerprint scanner.

There is one scanner, but several pages can try to use it: the attendance
page, fingerprint registration and the fingerprint test. Each open browser
tab sends its own `client` id. Only one tab's connection reads fingers at a
time:

- A connection made because someone opened the page or pressed a button
  (`claim=1`) takes the scanner. The tab that had it is told who took it and
  stops scanning (it does not reconnect on its own).
- An automatic reconnect (`claim=0`) gets the scanner only if no other tab is
  using it. Otherwise it is told who is, and that tab waits (it checks
  /bioScannerStatus) until the scanner is free again.

The attendance page closes its connection for a few seconds after every scan
(while the attendance is saved and the result is shown), so it keeps the
scanner for OWNER_HOLD_SECONDS after a disconnect. A forgotten tab cannot slip
in during that pause. Registration and the test give the scanner back as soon
as they end, and the attendance page releases it when it is closed.
"""
import itertools
import logging
import socket
import time
from datetime import datetime

from .sse import sse_status

logger = logging.getLogger("FingerprintService")

OWNER_HOLD_SECONDS = 60

ATTENDANCE = "attendance"
REGISTRATION = "registration"
TEST = "test"

_anonymous_ids = itertools.count(1)


def _local_addresses():
    addresses = {"127.0.0.1", "::1", "localhost"}

    try:
        addresses.update(socket.gethostbyname_ex(socket.gethostname())[2])
    except OSError:
        pass

    return addresses


LOCAL_ADDRESSES = _local_addresses()


def _computer(host):
    """The same key for every address of the scanner computer."""
    host = (host or "").removeprefix("::ffff:")
    return "scanner-computer" if host in LOCAL_ADDRESSES else host


def where_text(owner_host, viewer_host):
    """Where the owner is, as seen by the viewer."""
    owner = _computer(owner_host)

    if not owner or owner == _computer(viewer_host):
        return "on this computer"
    if owner == "scanner-computer":
        return "on the scanner computer"
    return f"on another computer ({owner})"


def clock_text(moment):
    return moment.strftime("%I:%M %p").lstrip("0")


class ScannerLease:
    """One connection's use of the scanner."""

    def __init__(self, client, mode, label, host, keeps_scanner):
        self.client = client
        self.mode = mode
        self.label = label
        self.host = host
        self.keeps_scanner = keeps_scanner
        self.started_at = datetime.now()
        self.connected = True
        self.ended_at = None
        self.released = False
        self.taken_by = None

    @property
    def taken(self):
        """Another connection has the scanner now; stop scanning."""
        return self.taken_by is not None

    def describe(self, viewer_host):
        where = where_text(self.host, viewer_host)
        return {
            "mode": self.mode,
            "label": self.label,
            "where": where,
            "since": clock_text(self.started_at),
            "summary": f"{self.label} {where}",
        }

    def taken_event(self):
        """The message sent to this connection's page when it lost the scanner."""
        owner = self.taken_by.describe(self.host)
        return sse_status(
            "taken",
            f"{owner['summary']} took over the scanner.",
            owner=owner,
        )

    def __repr__(self):
        return f"{self.label} ({self.host or 'unknown'})"


class ScannerOwnership:
    def __init__(self, hold_seconds=OWNER_HOLD_SECONDS, clock=time.monotonic):
        self.current = None
        self.hold_seconds = hold_seconds
        self.clock = clock

    def _in_use(self, lease):
        if lease is None:
            return False
        if lease.connected:
            return True
        if lease.released or not lease.keeps_scanner:
            return False
        return self.clock() - lease.ended_at < self.hold_seconds

    def owner(self):
        """The lease of the page using the scanner, or None when it is free."""
        return self.current if self._in_use(self.current) else None

    def acquire(self, client, mode, label, host, claim):
        """Start using the scanner.

        Returns (lease, other). `lease` is None when another tab is using the
        scanner and this connection did not claim it; `other` is then that
        tab. With a lease, `other` is the tab it was taken from (or None).
        """
        owner = self.owner()
        other = owner if owner is not None and owner.client != client else None

        if other is not None and not claim:
            return None, other

        # A page without a client id (an old page) never holds the scanner
        # between its connections, so it cannot block anyone.
        keeps_scanner = mode == ATTENDANCE and bool(client)
        lease = ScannerLease(
            client or f"anonymous-{next(_anonymous_ids)}",
            mode,
            label,
            host,
            keeps_scanner,
        )

        if self.current is not None and self.current.connected:
            self.current.taken_by = lease

        self.current = lease

        if other is not None:
            logger.info("Scanner: %r took over from %r.", lease, other)
        else:
            logger.info("Scanner: now used by %r.", lease)

        return lease, other

    def finish(self, lease):
        """The lease's connection closed."""
        lease.connected = False
        lease.ended_at = self.clock()

        if lease.taken:
            lease.released = True

    def release(self, client):
        """The tab is closing: give the scanner back once its connection ends."""
        lease = self.current

        if lease is not None and client and lease.client == client:
            lease.released = True

            if not lease.connected:
                logger.info("Scanner: released by %r.", lease)

    def status(self, client, viewer_host):
        owner = self.owner()
        yours = owner is not None and bool(client) and owner.client == client

        return {
            "free": owner is None or yours,
            "yours": yours,
            "owner": owner.describe(viewer_host) if owner is not None else None,
        }


async def run_with_scanner(
    ownership,
    *,
    client,
    claim,
    mode,
    label,
    host,
    scan,
    is_disconnected=None,
):
    """Run `scan(lease)` (an SSE event generator) only while this connection
    has the scanner.

    Without the scanner (another tab has it and this is not a claim), the
    page is told who is using it and the stream ends.
    """
    lease, other = ownership.acquire(client, mode, label, host, claim)

    if lease is None:
        yield busy_event(other, host)
        return

    try:
        if other is not None:
            yield took_over_event(other, host)

        async for event in scan(lease):
            if is_disconnected and await is_disconnected():
                break
            yield event
    finally:
        ownership.finish(lease)


def busy_event(other, viewer_host):
    owner = other.describe(viewer_host)
    return sse_status(
        "busy",
        f"{owner['summary']} is using the scanner.",
        owner=owner,
    )


def took_over_event(other, viewer_host):
    previous = other.describe(viewer_host)
    return sse_status(
        "took_over",
        f"Scanner moved here from {previous['summary']}.",
        previous=previous,
    )


def attendance_label(service, station_id):
    if station_id is None:
        return "Attendance page (all stations)"

    try:
        with service.db_cursor() as cursor:
            cursor.execute("SELECT name FROM stations WHERE id = %s", (int(station_id),))
            row = cursor.fetchone()
    except Exception as exc:
        logger.error("Could not read the station name: %s", exc)
        row = None

    return f"Attendance page ({row[0]})" if row and row[0] else f"Attendance page (station {station_id})"


def registration_label(service, employee_id):
    try:
        employee = service.employee_payload(employee_id)
    except Exception as exc:
        logger.error("Could not read the employee name: %s", exc)
        employee = None

    if not employee:
        return "Fingerprint registration"

    name = " ".join(
        part for part in (employee.get("first_name"), employee.get("last_name")) if part
    )
    return f"Fingerprint registration for {name}" if name else "Fingerprint registration"


TEST_LABEL = "Fingerprint test (Employee Management)"
