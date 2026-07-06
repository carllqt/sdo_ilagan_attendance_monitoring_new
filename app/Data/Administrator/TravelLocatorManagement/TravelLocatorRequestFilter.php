<?php

namespace App\Data\Administrator\TravelLocatorManagement;

use Illuminate\Http\Request;

class TravelLocatorRequestFilter
{
    public const LIMIT = 10;

    public function __construct(
        public readonly string $search,
        public readonly int $page,
        public readonly ?int $stationId,
        public readonly int $limit = self::LIMIT,
    ) {}

    public static function fromRequest(
        Request $request,
        string $prefix = '',
        ?int $stationId = null,
    ): self
    {
        return new self(
            search: trim((string) $request->query("{$prefix}search", '')),
            page: max((int) $request->query("{$prefix}page", 1), 1),
            stationId: $stationId ? (int) $stationId : null,
        );
    }

    public function toArray(): array
    {
        return [
            'search' => $this->search,
            'page' => $this->page,
            'station_id' => $this->stationId,
            'limit' => $this->limit,
        ];
    }
}
