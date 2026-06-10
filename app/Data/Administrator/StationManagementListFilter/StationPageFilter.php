<?php

namespace App\Data\Administrator\StationManagementListFilter;

use Illuminate\Http\Request;

class StationPageFilter
{
    public const STATION_LIMITS = [5, 10, 25, 50];
    public const ADMIN_LIMITS = [10, 25, 50, 100];

    public function __construct(
        public readonly string $search,
        public readonly int $stationPage,
        public readonly int $adminPage,
        public readonly int $stationLimit,
        public readonly int $adminLimit,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            search: trim((string) $request->query('search', '')),
            stationPage: max((int) $request->query('station_page', 1), 1),
            adminPage: max((int) $request->query('admin_page', 1), 1),
            stationLimit: self::limitFromRequest($request, 'station_limit', self::STATION_LIMITS, 5),
            adminLimit: self::limitFromRequest($request, 'admin_limit', self::ADMIN_LIMITS, 10),
        );
    }

    public static function limitFromRequest(Request $request, string $key, array $limits, int $default): int
    {
        $limit = (int) $request->query($key, $default);

        return in_array($limit, $limits, true) ? $limit : $default;
    }

    public function hasInvalidLimits(Request $request): bool
    {
        return ($request->has('station_limit') && (string) $request->query('station_limit') !== (string) $this->stationLimit) ||
            ($request->has('admin_limit') && (string) $request->query('admin_limit') !== (string) $this->adminLimit);
    }
}
