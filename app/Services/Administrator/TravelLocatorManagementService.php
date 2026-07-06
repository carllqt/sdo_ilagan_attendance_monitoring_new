<?php

namespace App\Services\Administrator;

use App\Data\Administrator\TravelLocatorManagement\TravelLocatorRequestFilter;
use App\Models\Administrator\Station;
use App\Repositories\Administrator\TravelLocatorManagementRepository;
use Illuminate\Support\Collection;
use Illuminate\Http\Request;

class TravelLocatorManagementService
{
    public function __construct(
        private readonly TravelLocatorManagementRepository $repository,
    ) {}

    public function pageData(Request $request): array
    {
        $stationOptions = $this->stationOptions($request);
        $userStationId = $this->userStationId($request);
        $locatorFilter = TravelLocatorRequestFilter::fromRequest(
            $request,
            'locator_',
            $userStationId,
        );
        $travelFilter = TravelLocatorRequestFilter::fromRequest(
            $request,
            'travel_',
            $userStationId,
        );

        return [
            'locator_slip_requests' => fn () => $this->repository->locatorSlipRequests($locatorFilter),
            'travel_order_requests' => fn () => $this->repository->travelOrderRequests($travelFilter),
            'locator_filters' => $locatorFilter->toArray(),
            'travel_filters' => $travelFilter->toArray(),
            'station_options' => fn () => $stationOptions,
        ];
    }

    public function suggestions(Request $request): array
    {
        return $this->repository->suggestions(
            type: (string) $request->query('type', 'locator_slip'),
            search: trim((string) $request->query('search', '')),
            stationId: $this->userStationId($request),
        );
    }

    private function stationOptions(Request $request): Collection
    {
        $stationId = $this->userStationId($request);

        return Station::query()
            ->select('id', 'name', 'code')
            ->where(function ($query) use ($stationId) {
                $stationId
                    ? $query->where('id', $stationId)
                    : $query->whereRaw('1 = 0');
            })
            ->orderByRaw("CASE WHEN code = 'SDO' THEN 0 ELSE 1 END")
            ->orderBy('name')
            ->get();
    }

    private function userStationId(Request $request): ?int
    {
        $stationId = $request->user()?->employee?->station_id;

        return $stationId ? (int) $stationId : null;
    }
}
