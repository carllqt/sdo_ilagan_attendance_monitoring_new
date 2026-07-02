<?php

namespace App\Data\AttendanceMonitoring;

use App\Models\Administrator\Station;
use Illuminate\Http\Request;

class AttendanceMonitoringFilter
{
    public const EMPLOYEE_PAGE_LIMIT = 16;
    public const SIDE_PANEL_LIMIT = 4;

    public function __construct(
        public readonly string $search,
        public readonly int $page,
        public readonly int $employeeLimit,
        public readonly int $sidePanelLimit,
        public readonly int $stationId,
        public readonly string $stationCode,
        public readonly string $stationName,
        public readonly ?Station $station,
    ) {}

    public static function fromRequest(Request $request): self
    {
        $station = self::resolveSelectedStation($request);
        $stationCode = trim((string) $request->query('station_code', ''));
        $stationName = trim((string) $request->query('station_name', 'School Division Office'));

        return new self(
            search: trim((string) $request->query('search', '')),
            page: max((int) $request->query('page', 1), 1),
            employeeLimit: self::EMPLOYEE_PAGE_LIMIT,
            sidePanelLimit: self::SIDE_PANEL_LIMIT,
            stationId: $station?->id ?? 1,
            stationCode: $station?->code ?? ($stationCode ?: 'SDO'),
            stationName: $station?->name ?? ($stationName ?: 'School Division Office'),
            station: $station,
        );
    }

    public function shouldRedirectToCanonical(Request $request): bool
    {
        return $request->query('station_id')
            || ! $request->query('page')
            || (string) $request->query('station_code') !== (string) $this->stationCode
            || (string) $request->query('station_name') !== (string) $this->stationName
            || $request->query('limit');
    }

    public function canonicalQuery(Request $request): array
    {
        $query = $request->query();
        unset($query['station_id'], $query['limit']);

        return array_merge($query, [
            'page' => $request->query('page', $this->page),
            'station_code' => $this->stationCode,
            'station_name' => $this->stationName,
        ]);
    }

    public function toArray(): array
    {
        return [
            'search' => $this->search,
            'station_id' => $this->stationId,
            'station_code' => $this->stationCode,
            'station_name' => $this->stationName,
        ];
    }

    public static function resolveSelectedStation(Request $request): ?Station
    {
        $stationCode = trim((string) $request->query('station_code', ''));

        if ($stationCode !== '') {
            $station = Station::select('id', 'name', 'code')
                ->where('code', $stationCode)
                ->first();

            if ($station) {
                return $station;
            }
        }

        $stationName = trim((string) $request->query('station_name', 'School Division Office'));

        if ($stationName !== '') {
            $station = Station::select('id', 'name', 'code')
                ->where('name', $stationName)
                ->orWhere('code', $stationName)
                ->first();

            if ($station) {
                return $station;
            }
        }

        return Station::select('id', 'name', 'code')
            ->where('code', 'SDO')
            ->orWhere('id', 1)
            ->orderByRaw("CASE WHEN code = 'SDO' THEN 0 ELSE 1 END")
            ->first();
    }
}
