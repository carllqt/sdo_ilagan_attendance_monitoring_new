<?php

namespace App\Services\Administrator;

use App\Data\Administrator\TardinessSummaryManagement\TardinessSummaryFilter;
use App\Models\Administrator\Employee;
use App\Repositories\Administrator\TardinessSummaryManagementRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TardinessSummaryManagementService
{
    private $verificationStations = null;

    public function __construct(
        private readonly TardinessSummaryManagementRepository $repository,
    ) {}

    public function filter(Request $request): TardinessSummaryFilter
    {
        $filter = TardinessSummaryFilter::fromRequest($request);

        if ($filter->isSchoolAdmin) {
            return $filter;
        }

        $stationName = $filter->verificationStation;

        if ($stationName === '') {
            $stationName = (string) ($this->verificationStations()->first()?->name ?? '');
        }

        return $filter->withVerificationStation($stationName);
    }

    public function pageData(TardinessSummaryFilter $filter): array
    {
        return [
            'summary' => fn () => $this->summary($filter),
            'printSummary' => Inertia::optional(fn () => $this->printSummary($filter)),
            'stationVerification' => fn () => $filter->isSchoolAdmin ? null : $this->stationVerification($filter),
            'verificationStationId' => fn () => $filter->isSchoolAdmin ? null : $this->verificationStationId($filter),
            'verificationStations' => fn () => $filter->isSchoolAdmin ? [] : $this->verificationStations(),
            'offices' => fn () => $this->repository->offices($filter),
            'years' => fn () => $this->repository->years($filter),
            'office' => $filter->office,
            'search' => $filter->search,
            'year' => (string) $filter->year,
        ];
    }

    public function summary(TardinessSummaryFilter $filter)
    {
        $employees = $this->repository->summaryEmployees($filter);

        $employees->setCollection(
            $this->summaryRecords($employees->getCollection(), $filter),
        );

        return $employees;
    }

    public function printSummary(TardinessSummaryFilter $filter)
    {
        return $this->summaryRecords(
            $this->repository->printEmployees($filter),
            $filter,
        );
    }

    public function stationVerification(TardinessSummaryFilter $filter)
    {
        $employees = $this->repository->stationVerificationEmployees(
            $this->verificationStationId($filter),
            $filter,
        );

        $employees->setCollection(
            $this->summaryRecords($employees->getCollection(), $filter),
        );

        return $employees;
    }

    public function suggestions(TardinessSummaryFilter $filter): array
    {
        return $this->repository
            ->suggestionEmployees($filter)
            ->map(fn (Employee $employee) => [
                'id' => $employee->id,
                'label' => $employee->full_name,
                'meta' => collect([$employee->office?->name, $employee->position])
                    ->filter()
                    ->join(' - '),
                'search' => $employee->full_name,
            ])
            ->values()
            ->all();
    }

    private function summaryRecords($employees, TardinessSummaryFilter $filter)
    {
        $monthlyTotals = $this->repository->monthlyTotals(
            $employees->pluck('id'),
            $filter,
        );

        return $employees
            ->map(function ($employee) use ($monthlyTotals, $filter) {
                $months = array_fill(1, 12, 0);
                $monthMinutes = array_fill(1, 12, 0);

                foreach ($monthlyTotals->get($employee->id, collect()) as $record) {
                    $month = (int) $record->month;
                    $minutes = (int) $record->total_minutes;

                    $monthMinutes[$month] = $minutes;
                    $months[$month] = $this->minutesToTardyDecimal($minutes);
                }

                $yearKey = (string) $filter->year;

                return [
                    'employee' => $this->employeePayload($employee),
                    'tardyPerMonths' => [$yearKey => $months],
                    'tardyPerYear' => [$yearKey => $this->minutesToTardyDecimal(array_sum($monthMinutes))],
                ];
            })
            ->values();
    }

    private function minutesToTardyDecimal(int $minutes): float
    {
        $minutes = max($minutes, 0);

        return (float) sprintf('%d.%02d', intdiv($minutes, 60), $minutes % 60);
    }

    private function employeePayload(Employee $employee): array
    {
        $office = $employee->office;
        $division = $office?->division;
        $station = $employee->relationLoaded('station') ? $employee->station : null;

        return [
            'id' => $employee->id,
            'first_name' => $employee->first_name,
            'middle_name' => $employee->middle_name,
            'last_name' => $employee->last_name,
            'full_name' => $employee->full_name,
            'profile_img' => $employee->profile_img,
            'position' => $employee->position,
            'office_id' => $employee->office_id,
            'station_id' => $employee->station_id,
            'department' => $office?->name,
            'office' => $office ? [
                'id' => $office->id,
                'name' => $office->name,
                'division_id' => $office->division_id,
                'division' => $division ? [
                    'id' => $division->id,
                    'code' => $division->code,
                    'name' => $division->name,
                ] : null,
            ] : null,
            'station' => $station ? [
                'id' => $station->id,
                'code' => $station->code,
                'name' => $station->name,
            ] : null,
        ];
    }

    private function verificationStations()
    {
        return $this->verificationStations ??= $this->repository->verificationStations();
    }

    private function verificationStationId(TardinessSummaryFilter $filter): int
    {
        $stations = $this->verificationStations();
        $station = $stations->firstWhere('name', $filter->verificationStation)
            ?? $stations->first();

        return (int) ($station?->id ?? 0);
    }
}
