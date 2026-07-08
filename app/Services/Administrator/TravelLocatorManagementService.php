<?php

namespace App\Services\Administrator;

use App\Data\Administrator\TravelLocatorManagement\TravelLocatorRequestFilter;
use App\Repositories\Administrator\TravelLocatorManagementRepository;
use App\Services\AttendanceMonitoringRealtimeService;
use Illuminate\Http\Request;

class TravelLocatorManagementService
{
    public function __construct(
        private readonly TravelLocatorManagementRepository $repository,
        private readonly AttendanceMonitoringRealtimeService $realtime,
    ) {}

    public function pageData(Request $request): array
    {
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

    public function approveTravelOrder(int $id, int $employeeId, Request $request): void
    {
        $stationId = $this->userStationId($request);
        $travelRequest = $this->repository->travelOrderRequestForApproval($id, $stationId);

        if (! $this->repository->employeeBelongsToStation($employeeId, $stationId)) {
            abort(422, 'Selected employee does not belong to your station.');
        }

        $travelOrder = $this->repository->approveTravelOrderRequest($travelRequest, $employeeId);

        $this->realtime->broadcastForTravelOrder($travelOrder);
    }

    private function userStationId(Request $request): int
    {
        $stationId = $request->user()?->employee?->station_id;

        if (! $stationId) {
            abort(403, 'Station not assigned to this user.');
        }

        return (int) $stationId;
    }
}
