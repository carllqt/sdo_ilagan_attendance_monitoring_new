<?php

namespace App\Data\HumanResource\ConvertedTardinessRecordManagement;

use Illuminate\Http\Request;

class ConvertedTardinessRecordFilter
{
    public const LIMITS = [10, 25, 50, 100];

    public function __construct(
        public readonly int $limit,
        public readonly int $page,
        public readonly int $batchHistoryLimit,
        public readonly int $batchHistoryPage,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            limit: self::limitFromRequest($request),
            page: max((int) $request->query('page', 1), 1),
            batchHistoryLimit: self::batchHistoryLimitFromRequest($request),
            batchHistoryPage: max((int) $request->query('batch_page', 1), 1),
        );
    }

    public static function limitFromRequest(Request $request): int
    {
        $limit = (int) $request->query('limit', 10);

        return in_array($limit, self::LIMITS, true) ? $limit : 10;
    }

    public static function batchHistoryLimitFromRequest(Request $request): int
    {
        return (int) $request->query('batch_limit', 5) === 5 ? 5 : 5;
    }
}
