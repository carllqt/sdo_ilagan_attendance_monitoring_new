<?php

namespace App\Data\Administrator\TardinessSummaryManagement;

use Illuminate\Http\Request;

class TardinessSummaryFilter
{
    public const LIMITS = [10, 25, 50, 100];
    public const ALL_OFFICES = 'All Offices';

    public function __construct(
        public readonly string $office,
        public readonly string $search,
        public readonly int $year,
        public readonly int $limit,
        public readonly int $page,
        public readonly int $verificationPage,
        public readonly string $verificationStation,
        public readonly bool $isSchoolAdmin,
        public readonly ?int $userStationId,
    ) {}

    public static function fromRequest(Request $request): self
    {
        $user = $request->user();
        $isSchoolAdmin = $user?->hasRole('school_admin') && ! $user?->hasRole('sdo_admin');
        $year = (int) $request->query('year', now()->year);
        $search = trim((string) $request->query('search', ''));

        $office = trim((string) $request->query('office', self::ALL_OFFICES)) ?: self::ALL_OFFICES;

        if (strtolower($office) === 'all') {
            $office = self::ALL_OFFICES;
        }

        return new self(
            office: $office,
            search: $search,
            year: $year >= 2000 && $year <= 2100 ? $year : now()->year,
            limit: self::limitFromRequest($request),
            page: max((int) $request->query('page', 1), 1),
            verificationPage: max((int) $request->query('verification_page', 1), 1),
            verificationStation: trim((string) $request->query('verification_station', '')),
            isSchoolAdmin: (bool) $isSchoolAdmin,
            userStationId: $user?->employee?->station_id ? (int) $user->employee->station_id : null,
        );
    }

    public static function limitFromRequest(Request $request): int
    {
        $limit = (int) $request->query('limit', 10);

        return in_array($limit, self::LIMITS, true) ? $limit : 10;
    }

    public function dateRange(): array
    {
        return [
            "{$this->year}-01-01",
            "{$this->year}-12-31",
        ];
    }

    public function withVerificationStation(string $stationName): self
    {
        return new self(
            office: $this->office,
            search: $this->search,
            year: $this->year,
            limit: $this->limit,
            page: $this->page,
            verificationPage: $this->verificationPage,
            verificationStation: $stationName,
            isSchoolAdmin: $this->isSchoolAdmin,
            userStationId: $this->userStationId,
        );
    }
}
