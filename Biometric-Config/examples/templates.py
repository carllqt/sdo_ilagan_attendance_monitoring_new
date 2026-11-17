import asyncio
import logging

logger = logging.getLogger("FingerprintService")

# refresh() default: keep whichever station is loaded now.
KEEP_STATION = object()


class FingerprintTemplates:
    """Registered fingerprints, kept in the scanner SDK's memory.

    Only one station's prints are loaded: the station of the attendance page
    using this scanner. A finger is matched against that station's employees
    only, which stays fast and avoids false matches as more schools enroll.
    (station_id None means every station, e.g. a page that sent none.)

    Loaded once, then reloaded only when that station's prints change
    (checked with one small query), including an employee with prints moving
    in or out of the station, or when a page for another station connects.
    """

    def __init__(self, service):
        self.service = service
        self.employee_by_fid = {}
        self.station_id = None
        self.signature = None
        self._reload_lock = asyncio.Lock()

    @property
    def loaded(self):
        return self.signature is not None

    async def refresh(self, station_id=KEEP_STATION, force=False):
        """Load `station_id`'s prints if they are not loaded yet or changed,
        or always with force=True (e.g. after the device reconnects and its
        memory is empty).

        Returns True when the templates were reloaded.
        """
        async with self._reload_lock:
            if station_id is KEEP_STATION:
                station_id = self.station_id

            signature = await asyncio.to_thread(self._signature, station_id)

            if (
                not force
                and self.loaded
                and station_id == self.station_id
                and signature == self.signature
            ):
                return False

            if self.loaded and station_id != self.station_id:
                logger.info(
                    "Scanner switched from %s to %s.",
                    self._describe(self.station_id),
                    self._describe(station_id),
                )

            rows = await asyncio.to_thread(self._fetch_rows, station_id)

            # No capture or identify may run while the SDK memory is rebuilt.
            async with self.service.scan_lock:
                self._load_into_sdk(rows)

            self.station_id = station_id
            self.signature = signature
            logger.info(
                "Loaded %s fingerprints into SDK memory (%s).",
                len(self.employee_by_fid),
                self._describe(station_id),
            )
            return True

    def employee_for(self, fid):
        """Employee id linked to an identified fingerprint id, or None."""
        return self.employee_by_fid.get(int(fid))

    def all_registered(self):
        """(employee_id, template) for every print in every station, read
        from the database. For the registration duplicate check: a person must
        not be enrolled under two employees, whatever their station.
        """
        with self.service.db_cursor() as cursor:
            cursor.execute("SELECT employee_id, fingerprint_template FROM biometrics")
            rows = cursor.fetchall()

        return [
            (int(employee_id), self._template_bytes(template))
            for employee_id, template in rows
            if template
        ]

    @staticmethod
    def _describe(station_id):
        return "all stations" if station_id is None else f"station {station_id}"

    @staticmethod
    def _template_bytes(template):
        return template.tobytes() if isinstance(template, memoryview) else template

    @staticmethod
    def _scope(station_id):
        """FROM/WHERE for the prints of one station (or all), and its params."""
        if station_id is None:
            return "FROM biometrics b", ()

        return (
            "FROM biometrics b JOIN employees e ON e.id = b.employee_id "
            "WHERE e.station_id = %s",
            (int(station_id),),
        )

    def _signature(self, station_id):
        scope, params = self._scope(station_id)

        with self.service.db_cursor() as cursor:
            cursor.execute(
                f"SELECT COUNT(*), COALESCE(SUM(b.id), 0), MAX(b.updated_at) {scope}",
                params,
            )
            return tuple(str(value) for value in cursor.fetchone())

    def _fetch_rows(self, station_id):
        scope, params = self._scope(station_id)

        with self.service.db_cursor() as cursor:
            cursor.execute(
                f"SELECT b.id, b.employee_id, b.fingerprint_template {scope}",
                params,
            )
            return cursor.fetchall()

    def _load_into_sdk(self, rows):
        zkfp2 = self.service.zkfp2
        zkfp2.DBClear()

        employee_by_fid = {}

        for fid, employee_id, template in rows:
            if not template:
                continue

            zkfp2.DBAdd(fid, self._template_bytes(template))
            employee_by_fid[int(fid)] = int(employee_id)

        self.employee_by_fid = employee_by_fid
