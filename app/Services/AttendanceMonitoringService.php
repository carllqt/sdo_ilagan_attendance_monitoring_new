<?php

namespace App\Services;

use App\Data\AttendanceMonitoring\AttendanceMonitoringFilter;
use App\Repositories\AttendanceMonitoringRepository;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AttendanceMonitoringService
{
    public function __construct(
        private readonly AttendanceMonitoringRepository $repository,
        private readonly AttendanceMonitoringRealtimeService $realtime,
    ) {}

    public function canonicalRedirect(Request $request): ?RedirectResponse
    {
        $filter = AttendanceMonitoringFilter::fromRequest($request);

        if (! $filter->shouldRedirectToCanonical($request)) {
            return null;
        }

        return redirect()->route('attendance-monitoring', $filter->canonicalQuery($request));
    }

    public function pageData(Request $request): array
    {
        $today = Carbon::today();
        $filter = AttendanceMonitoringFilter::fromRequest($request);
        $stations = $this->repository->stationOptions($filter);

        return [
            'employees' => fn () => $this->repository->employees($today, $filter),
            'stations' => fn () => $stations->values(),
            'recentLogs' => fn () => $this->repository->recentLogs($today, $filter),
            'topFirstTimeIns' => fn () => $this->repository->topFirstTimeIns($today, $filter),
            'travelOrders' => fn () => $this->repository->travelOrders($today, $filter),
            'filters' => $filter->toArray(),
        ];
    }

    public function employeesPage(Request $request): array
    {
        return [
            'employees' => $this->repository->employees(
                Carbon::today(),
                AttendanceMonitoringFilter::fromRequest($request),
            ),
        ];
    }

    public function stationSuggestions(Request $request): array
    {
        return $this->repository->stationSuggestions(
            trim((string) $request->query('search', '')),
        );
    }

    public function employeeSuggestions(Request $request): array
    {
        $search = trim((string) $request->query('search', ''));
        $station = AttendanceMonitoringFilter::resolveSelectedStation($request);

        return $this->repository->employeeSuggestions(
            $search,
            $station?->id ?? 1,
        );
    }

    public function liveTestPageData(Request $request): array
    {
        $station = AttendanceMonitoringFilter::resolveSelectedStation($request);
        $stationId = (int) ($request->user()?->employee?->station_id ?: ($station?->id ?? 1));
        $employees = $this->repository->liveTestEmployees($stationId);
        $targetEmployee = $employees->first();

        return [
            'station' => $targetEmployee?->station ?: $station,
            'targetEmployee' => $targetEmployee ? $this->formatEmployee($targetEmployee) : null,
            'targetEmployees' => $employees
                ->map(fn ($employee) => $this->formatEmployee($employee))
                ->values(),
        ];
    }

    public function triggerLiveTest(Request $request, ?int $employeeId = null): array
    {
        $employee = $employeeId
            ? $this->repository->employeeStation($employeeId)
            : $this->repository->liveTestEmployee((int) ($request->user()?->employee?->station_id ?: 1));

        abort_unless($employee, 422, 'No employee is available for live testing.');
        $this->authorizeStationEmployee($request, (int) $employee->station_id);

        $result = $this->repository->cycleLiveTestAttendance($employee);

        $this->realtime->broadcastForAttendance($result['attendance']);

        return [
            'ok' => true,
            'action' => $result['action'],
            'time' => $result['time'],
            'employee' => $this->formatEmployee($result['attendance']->employee),
        ];
    }

    public function triggerLiveTestMany(Request $request, array $employeeIds): array
    {
        $results = collect($employeeIds)
            ->take(25)
            ->map(fn (int $employeeId) => $this->triggerLiveTest($request, $employeeId))
            ->values();

        return [
            'ok' => true,
            'count' => $results->count(),
            'results' => $results,
        ];
    }

    public function broadcast(Request $request, int $employeeId): void
    {
        $employee = $this->repository->employeeStation($employeeId);
        $this->authorizeStationEmployee($request, (int) $employee->station_id);

        $this->realtime->broadcastForEmployee((int) $employee->id);
    }

    private function authorizeStationEmployee(Request $request, int $stationId): void
    {
        $user = $request->user();
        $canAccessStation = (int) $user?->employee?->station_id === $stationId
            || $user?->hasAnyRole(['sdo_admin', 'sdo_hr']);

        abort_unless($canAccessStation, 403);
    }

    private function formatEmployee($employee): array
    {
        return [
            'id' => $employee->id,
            'name' => $employee->full_name,
            'position' => $employee->position,
            'station' => [
                'id' => $employee->station?->id ?? $employee->station_id,
                'name' => $employee->station?->name,
                'code' => $employee->station?->code,
            ],
        ];
    }
}
