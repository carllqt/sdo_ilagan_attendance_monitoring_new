<?php

namespace App\Data\Administrator\DepartmentManagementListFilter;

use Illuminate\Http\Request;

class DepartmentPageFilter
{
    public const OFFICE_LIMIT = 6;
    public const OFFICE_LIMITS = [6, 10, 25, 50, 100];
    public const HEAD_LIMIT = 10;
    public const HEAD_LIMITS = [10, 25, 50, 100];
    public const DIVISION_LIMIT = 3;
    public const DIVISION_LIMITS = [3, 6, 10, 25, 50];
    public const DIVISION_HEAD_LIMIT = 3;
    public const DIVISION_HEAD_LIMITS = [3, 6, 10, 25, 50];

    public function __construct(
        public readonly string $officeSearch,
        public readonly string $divisionSearch,
        public readonly int $officePage,
        public readonly int $officeLimit,
        public readonly int $officeHeadPage,
        public readonly int $officeHeadLimit,
        public readonly ?int $officeHeadOfficeId,
        public readonly int $divisionPage,
        public readonly int $divisionLimit,
        public readonly int $divisionHeadPage,
        public readonly int $divisionHeadLimit,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            officeSearch: trim((string) $request->query('office_search', $request->query('search', ''))),
            divisionSearch: trim((string) $request->query('division_search', '')),
            officePage: max((int) $request->query('office_page', 1), 1),
            officeLimit: self::officeLimitFromRequest($request),
            officeHeadPage: max((int) $request->query('office_head_page', 1), 1),
            officeHeadLimit: self::officeHeadLimitFromRequest($request),
            officeHeadOfficeId: $request->filled('office_head_office_id')
                ? (int) $request->query('office_head_office_id')
                : null,
            divisionPage: max((int) $request->query('division_page', 1), 1),
            divisionLimit: self::divisionLimitFromRequest($request),
            divisionHeadPage: max((int) $request->query('division_head_page', 1), 1),
            divisionHeadLimit: self::divisionHeadLimitFromRequest($request),
        );
    }

    private static function officeLimitFromRequest(Request $request): int
    {
        $limit = (int) $request->query('limit', self::OFFICE_LIMIT);

        return in_array($limit, self::OFFICE_LIMITS, true)
            ? $limit
            : self::OFFICE_LIMIT;
    }

    private static function officeHeadLimitFromRequest(Request $request): int
    {
        $limit = (int) $request->query('office_head_limit', self::HEAD_LIMIT);

        return in_array($limit, self::HEAD_LIMITS, true)
            ? $limit
            : self::HEAD_LIMIT;
    }

    private static function divisionLimitFromRequest(Request $request): int
    {
        $limit = (int) $request->query('division_limit', self::DIVISION_LIMIT);

        return in_array($limit, self::DIVISION_LIMITS, true)
            ? $limit
            : self::DIVISION_LIMIT;
    }

    private static function divisionHeadLimitFromRequest(Request $request): int
    {
        $limit = (int) $request->query('division_head_limit', self::DIVISION_HEAD_LIMIT);

        return in_array($limit, self::DIVISION_HEAD_LIMITS, true)
            ? $limit
            : self::DIVISION_HEAD_LIMIT;
    }
}
