<?php

namespace App\Data\HumanResource\TardinessConversion;

use Illuminate\Http\Request;

class TardinessConversionFilter
{
    public const LIMITS = [10, 25, 50, 100];

    public function __construct(
        public readonly ?string $startMonth,
        public readonly ?string $endMonth,
        public readonly int|string $officeId,
        public readonly int $limit,
        public readonly int $page,
        public readonly string $search,
        public readonly ?int $employeeId = null,
    ) {}

    public static function fromRequest(Request $request): self
    {
        $limit = (int) $request->query('limit', 10);
        $officeId = $request->query('office', 'all') ?: 'all';

        if (
            is_string($officeId) &&
            in_array(strtolower(trim($officeId)), ['all', 'all offices'], true)
        ) {
            $officeId = 'all';
        }

        return new self(
            startMonth: self::cleanMonth($request->query('start_month')),
            endMonth: self::cleanMonth($request->query('end_month')),
            officeId: $officeId,
            limit: in_array($limit, self::LIMITS, true) ? $limit : 10,
            page: max((int) $request->query('page', 1), 1),
            search: trim((string) $request->query('search', '')),
        );
    }

    private static function cleanMonth(mixed $month): ?string
    {
        $month = trim((string) $month);

        return $month !== '' ? $month : null;
    }

    public function withDefaults(string $startMonth, string $endMonth): self
    {
        return new self(
            startMonth: $this->startMonth ?: $startMonth,
            endMonth: $this->endMonth ?: $endMonth,
            officeId: $this->officeId,
            limit: $this->limit,
            page: $this->page,
            search: $this->search,
            employeeId: $this->employeeId,
        );
    }

    public function withMonthRange(string $startMonth, string $endMonth): self
    {
        return new self(
            startMonth: $startMonth,
            endMonth: $endMonth,
            officeId: $this->officeId,
            limit: $this->limit,
            page: $this->page,
            search: $this->search,
            employeeId: $this->employeeId,
        );
    }

    public function withEmployeeId(?int $employeeId): self
    {
        return new self(
            startMonth: $this->startMonth,
            endMonth: $this->endMonth,
            officeId: $this->officeId,
            limit: $this->limit,
            page: $this->page,
            search: $this->search,
            employeeId: $employeeId,
        );
    }
}
