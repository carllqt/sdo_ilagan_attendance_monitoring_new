<?php

namespace App\Repositories\HumanResource;

use App\Data\HumanResource\ConvertedTardinessRecordManagement\ConvertedTardinessRecordFilter;
use App\Models\Administrator\Employee;
use App\Models\HumanResource\HrTardinessBatch;
use App\Models\HumanResource\HrTardinessConversion;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ConvertedTardinessRecordRepository
{
    public function paginatedRecords(ConvertedTardinessRecordFilter $filter): LengthAwarePaginator
    {
        return Employee::query()
            ->with([
                'office:id,name,division_id',
                'office.division:id,code,name',
            ])
            ->select(
                'id',
                'first_name',
                'middle_name',
                'last_name',
                'profile_img',
                'position',
                'office_id',
            )
            ->when($filter->stationId, function ($query) use ($filter) {
                $query->where('station_id', $filter->stationId);
            })
            ->whereHas('tardinessConversion.batch', function ($query) use ($filter) {
                $query->whereYear('start_month', $filter->year);
            })
            ->when($filter->search !== '', function ($query) use ($filter) {
                $query->where(function ($employeeQuery) use ($filter) {
                    $employeeQuery->where('first_name', 'like', "%{$filter->search}%")
                        ->orWhere('middle_name', 'like', "%{$filter->search}%")
                        ->orWhere('last_name', 'like', "%{$filter->search}%")
                        ->orWhere('position', 'like', "%{$filter->search}%")
                        ->orWhereRaw(
                            "CONCAT_WS(' ', first_name, middle_name, last_name) LIKE ?",
                            ["%{$filter->search}%"],
                        )
                        ->orWhereRaw(
                            "CONCAT_WS(' ', last_name, first_name, middle_name) LIKE ?",
                            ["%{$filter->search}%"],
                        );
                });
            })
            ->orderByName()
            ->paginate($filter->limit, ['*'], 'page', $filter->page)
            ->withQueryString();
    }

    public function monthlySummaries(
        Collection $employeeIds,
        ConvertedTardinessRecordFilter $filter,
    ): Collection
    {
        if ($employeeIds->isEmpty()) {
            return collect();
        }

        return HrTardinessConversion::query()
            ->join('hr_tardiness_batches', 'hr_tardiness_batches.id', '=', 'hr_tardiness_convertions.batch_id')
            ->whereIn('hr_tardiness_convertions.employee_id', $employeeIds)
            ->whereYear('hr_tardiness_batches.start_month', $filter->year)
            ->selectRaw('
                hr_tardiness_convertions.employee_id,
                MONTH(hr_tardiness_batches.start_month) as start_month,
                MAX(MONTH(hr_tardiness_batches.end_month)) as end_month,
                '.$this->totalTardyMinutesExpression().' as total_tardy_minutes,
                GROUP_CONCAT(
                    CONCAT(
                        hr_tardiness_convertions.batch_id,
                        "|",
                        hr_tardiness_batches.start_month,
                        "|",
                        hr_tardiness_batches.end_month
                    )
                    ORDER BY hr_tardiness_convertions.batch_id
                    SEPARATOR ";;"
                ) as batch_items
            ')
            ->groupBy(
                'hr_tardiness_convertions.employee_id',
                DB::raw('MONTH(hr_tardiness_batches.start_month)'),
            )
            ->get()
            ->groupBy('employee_id');
    }

    public function batchRecords(HrTardinessBatch $batch, ?int $stationId = null): Collection
    {
        return $batch->tardinessConversions()
            ->with('employee', 'tardinessRecords')
            ->when($stationId, function ($query) use ($stationId) {
                $query->whereHas('employee', function ($employeeQuery) use ($stationId) {
                    $employeeQuery->where('station_id', $stationId);
                });
            })
            ->get();
    }

    public function batchHistory(ConvertedTardinessRecordFilter $filter): LengthAwarePaginator
    {
        return HrTardinessBatch::query()
            ->withCount([
                'tardinessConversions' => function ($query) use ($filter) {
                    $query->when($filter->stationId, function ($conversionQuery) use ($filter) {
                        $conversionQuery->whereHas('employee', function ($employeeQuery) use ($filter) {
                            $employeeQuery->where('station_id', $filter->stationId);
                        });
                    });
                },
            ])
            ->whereYear('start_month', $filter->year)
            ->when($filter->stationId, function ($query) use ($filter) {
                $query->whereHas('tardinessConversions.employee', function ($employeeQuery) use ($filter) {
                    $employeeQuery->where('station_id', $filter->stationId);
                });
            })
            ->latest()
            ->paginate(
                $filter->batchHistoryLimit,
                ['*'],
                'batch_page',
                $filter->batchHistoryPage,
            )
            ->withQueryString();
    }

    public function availableYears(ConvertedTardinessRecordFilter $filter): Collection
    {
        return HrTardinessBatch::query()
            ->when($filter->stationId, function ($query) use ($filter) {
                $query->whereHas('tardinessConversions.employee', function ($employeeQuery) use ($filter) {
                    $employeeQuery->where('station_id', $filter->stationId);
                });
            })
            ->selectRaw('YEAR(start_month) as year')
            ->distinct()
            ->orderByDesc('year')
            ->pluck('year')
            ->map(fn ($year) => (int) $year)
            ->values();
    }

    public function suggestionEmployees(ConvertedTardinessRecordFilter $filter): Collection
    {
        if ($filter->search === '') {
            return collect();
        }

        return Employee::query()
            ->leftJoin('offices', 'offices.id', '=', 'employees.office_id')
            ->when($filter->stationId, function ($query) use ($filter) {
                $query->where('employees.station_id', $filter->stationId);
            })
            ->whereHas('tardinessConversion.batch', function ($query) use ($filter) {
                $query->whereYear('start_month', $filter->year);
            })
            ->where(function ($employeeQuery) use ($filter) {
                $employeeQuery->where('employees.first_name', 'like', "%{$filter->search}%")
                    ->orWhere('employees.middle_name', 'like', "%{$filter->search}%")
                    ->orWhere('employees.last_name', 'like', "%{$filter->search}%")
                    ->orWhere('employees.position', 'like', "%{$filter->search}%")
                    ->orWhereRaw(
                        "CONCAT_WS(' ', employees.first_name, employees.middle_name, employees.last_name) LIKE ?",
                        ["%{$filter->search}%"],
                    )
                    ->orWhereRaw(
                        "CONCAT_WS(' ', employees.last_name, employees.first_name, employees.middle_name) LIKE ?",
                        ["%{$filter->search}%"],
                    );
            })
            ->select([
                'employees.id',
                'employees.first_name',
                'employees.middle_name',
                'employees.last_name',
                'employees.position',
                'offices.name as office',
            ])
            ->distinct()
            ->orderBy('employees.first_name')
            ->orderBy('employees.middle_name')
            ->orderBy('employees.last_name')
            ->limit(10)
            ->get();
    }

    public function batchDetails(int $batchId, ?int $stationId = null): ?HrTardinessBatch
    {
        return HrTardinessBatch::query()
            ->with([
                'tardinessConversions' => fn ($query) => $query
                    ->with('employee.office:id,name,division_id', 'employee.office.division:id,code,name')
                    ->when($stationId, function ($conversionQuery) use ($stationId) {
                        $conversionQuery->whereHas('employee', function ($employeeQuery) use ($stationId) {
                            $employeeQuery->where('station_id', $stationId);
                        });
                    })
                    ->orderBy('employee_id'),
            ])
            ->when($stationId, function ($query) use ($stationId) {
                $query->whereHas('tardinessConversions.employee', function ($employeeQuery) use ($stationId) {
                    $employeeQuery->where('station_id', $stationId);
                });
            })
            ->find($batchId);
    }

    private function totalTardyMinutesExpression(): string
    {
        $value = 'COALESCE(hr_tardiness_convertions.total_tardy, 0)';

        return "SUM((FLOOR({$value}) * 60) + ROUND(({$value} - FLOOR({$value})) * 100))";
    }
}
