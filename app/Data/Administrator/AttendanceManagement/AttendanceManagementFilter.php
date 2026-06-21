<?php

namespace App\Data\Administrator\AttendanceManagement;

use Carbon\Carbon;
use Illuminate\Http\Request;

class AttendanceManagementFilter
{
    public const LIMITS = [10, 25, 50, 100];

    public function __construct(
        public readonly int $stationId,
        public readonly string $officeName,
        public readonly int|string $officeId,
        public readonly string $search,
        public readonly int $year,
        public readonly int $month,
        public readonly int $day,
        public readonly int $limit,
        public readonly int $page,
    ) {}

    public static function fromRequest(Request $request, int $stationId, string $prefix = ''): self
    {
        $now = now();
        $year = (int) $request->query("{$prefix}year", $now->year);
        $month = self::monthFromRequest($request, $now->month, $prefix);
        $day = (int) $request->query("{$prefix}day", $now->day);
        $page = max((int) $request->query("{$prefix}page", 1), 1);

        if ($year < 2000 || $year > 2100) {
            $year = (int) $now->year;
        }

        $maxDay = Carbon::create($year, $month, 1)->daysInMonth;

        return new self(
            stationId: $stationId,
            officeName: self::officeFromRequest($request, $prefix),
            officeId: 'all',
            search: trim((string) $request->query("{$prefix}search", '')),
            year: $year,
            month: $month,
            day: min(max($day, 1), $maxDay),
            limit: self::limitFromRequest($request, $prefix),
            page: $page,
        );
    }

    public static function limitFromRequest(Request $request, string $prefix = ''): int
    {
        $limit = (int) $request->query("{$prefix}limit", 10);

        return in_array($limit, self::LIMITS, true) ? $limit : 10;
    }

    public function date(): string
    {
        return Carbon::create($this->year, $this->month, $this->day)
            ->toDateString();
    }

    public function monthName(): string
    {
        return Carbon::create($this->year, $this->month, 1)->format('F');
    }

    public function toArray(): array
    {
        return [
            'office' => $this->officeId === 'all' ? 'all' : $this->officeName,
            'search' => $this->search,
            'year' => (string) $this->year,
            'month' => $this->monthName(),
            'day' => str_pad((string) $this->day, 2, '0', STR_PAD_LEFT),
            'date' => $this->date(),
            'limit' => $this->limit,
            'page' => $this->page,
        ];
    }

    public function withOfficeId(int|string $officeId): self
    {
        return new self(
            stationId: $this->stationId,
            officeName: $this->officeName,
            officeId: $officeId,
            search: $this->search,
            year: $this->year,
            month: $this->month,
            day: $this->day,
            limit: $this->limit,
            page: $this->page,
        );
    }

    private static function officeFromRequest(Request $request, string $prefix = ''): string
    {
        $office = trim((string) $request->query("{$prefix}office", 'all'));

        if ($office === '' || strtolower($office) === 'all') {
            return 'all';
        }

        return $office;
    }

    private static function monthFromRequest(Request $request, int $default, string $prefix = ''): int
    {
        $month = $request->query("{$prefix}month", $default);

        if (is_numeric($month)) {
            $month = (int) $month;

            return $month >= 1 && $month <= 12 ? $month : $default;
        }

        try {
            return Carbon::parse("1 {$month}")->month;
        } catch (\Throwable) {
            return $default;
        }
    }
}
