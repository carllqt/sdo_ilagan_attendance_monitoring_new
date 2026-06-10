<?php

namespace App\Data\HumanResource;

use Illuminate\Http\Request;

class ConvertedTardinessRecordFilter
{
    public const LIMITS = [10, 25, 50, 100];

    public function __construct(
        public readonly int $limit,
        public readonly int $page,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            limit: self::limitFromRequest($request),
            page: max((int) $request->query('page', 1), 1),
        );
    }

    public static function limitFromRequest(Request $request): int
    {
        $limit = (int) $request->query('limit', 10);

        return in_array($limit, self::LIMITS, true) ? $limit : 10;
    }
}
