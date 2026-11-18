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
}
