<?php

namespace App\Repositories\HumanResource;

use App\Data\HumanResource\TardinessConversion\TardinessConversionFilter;
use App\Models\Administrator\Office;
use App\Models\Administrator\TardinessRecord;
use App\Models\HumanResource\ConversionHours;
use App\Models\HumanResource\ConversionMinutes;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class TardinessConversionRepository
{
    public function paginatedSummaryRows(
        TardinessConversionFilter $filter,
        string $startDate,
        string $endDate,
    ): LengthAwarePaginator {
        return $this->filteredSummaryRowsQuery($filter, $startDate, $endDate)
            ->paginate($filter->limit, ['*'], 'page', $filter->page)
            ->withQueryString();
    }

    public function allSummaryRows(
        TardinessConversionFilter $filter,
        string $startDate,
        string $endDate,
    ): Collection {
        return $this->filteredSummaryRowsQuery($filter, $startDate, $endDate)
            ->get();
    }

    private function filteredSummaryRowsQuery(
        TardinessConversionFilter $filter,
        string $startDate,
        string $endDate,
    ) {
        return $this->summaryQuery($startDate, $endDate)
            ->when($filter->stationId, function ($query) use ($filter) {
                $query->where('employees.station_id', $filter->stationId);
            })
            ->when($filter->officeId !== 'all', function ($query) use ($filter) {
                $query->where('employees.office_id', $filter->officeId);
            })
            ->when($filter->employeeId, function ($query) use ($filter) {
                $query->where('employees.id', $filter->employeeId);
            })
            ->when(! $filter->employeeId && $filter->search !== '', function ($query) use ($filter) {
                $this->applyEmployeeSearch($query, $filter->search);
            })
            ->select([
                'employees.id as employee_id',
                'employees.first_name',
                'employees.middle_name',
                'employees.last_name',
                'employees.profile_img',
                'offices.id as office_id',
                'offices.name as office',
                'divisions.id as division_id',
                'divisions.code as division_code',
                'divisions.name as division_name',
            ])
            ->selectRaw('MIN(tardiness_records.date) as start_date')
            ->selectRaw('MAX(tardiness_records.date) as end_date')
            ->selectRaw($this->totalMinutesExpression().' as total_minutes')
            ->groupBy([
                'employees.id',
                'employees.first_name',
                'employees.middle_name',
                'employees.last_name',
                'employees.profile_img',
                'offices.id',
                'offices.name',
                'divisions.id',
                'divisions.code',
                'divisions.name',
            ])
            ->orderBy('employees.first_name')
            ->orderBy('employees.middle_name')
            ->orderBy('employees.last_name')
            ->orderBy('employees.id');
    }

    public function employeeIdForSearch(
        TardinessConversionFilter $filter,
        string $startDate,
        string $endDate,
    ): ?int {
        if ($filter->search === '') {
            return null;
        }

        return $this->summaryQuery($startDate, $endDate)
            ->when($filter->stationId, function ($query) use ($filter) {
                $query->where('employees.station_id', $filter->stationId);
            })
            ->when($filter->officeId !== 'all', function ($query) use ($filter) {
                $query->where('employees.office_id', $filter->officeId);
            })
            ->where(function ($query) use ($filter) {
                $query->whereRaw(
                    "CONCAT_WS(' ', employees.first_name, employees.middle_name, employees.last_name) = ?",
                    [$filter->search],
                )->orWhereRaw(
                    "CONCAT_WS(' ', employees.first_name, employees.last_name) = ?",
                    [$filter->search],
                );
            })
            ->orderBy('employees.first_name')
            ->value('employees.id');
    }

    public function suggestionEmployees(
        TardinessConversionFilter $filter,
        string $startDate,
        string $endDate,
    ): Collection {
        if ($filter->search === '') {
            return collect();
        }

        return $this->summaryQuery($startDate, $endDate)
            ->when($filter->stationId, function ($query) use ($filter) {
                $query->where('employees.station_id', $filter->stationId);
            })
            ->when($filter->officeId !== 'all', function ($query) use ($filter) {
                $query->where('employees.office_id', $filter->officeId);
            })
            ->tap(fn ($query) => $this->applyEmployeeSearch($query, $filter->search))
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

    public function monthList(TardinessConversionFilter $filter): Collection
    {
        return TardinessRecord::query()
            ->whereDoesntHave('tardinessConversions')
            ->when($filter->stationId, function ($query) use ($filter) {
                $query->whereHas('employee', function ($employeeQuery) use ($filter) {
                    $employeeQuery->where('station_id', $filter->stationId);
                });
            })
            ->when($filter->officeId !== 'all', function ($query) use ($filter) {
                $query->whereHas('employee', function ($employeeQuery) use ($filter) {
                    $employeeQuery->where('office_id', $filter->officeId);
                });
            })
            ->selectRaw('YEAR(date) as year, MONTH(date) as month')
            ->distinct()
            ->orderBy('year')
            ->orderBy('month')
            ->get();
    }

    public function officeOptions(?int $stationId = null): Collection
    {
        return Office::with('division:id,code,name')
            ->when($stationId, function ($query) use ($stationId) {
                $query->whereHas('employees', function ($employeeQuery) use ($stationId) {
                    $employeeQuery->where('station_id', $stationId);
                });
            })
            ->orderBy('name')
            ->get();
    }

    public function recordIdsForSummary(array $summary, ?int $stationId = null): Collection
    {
        return TardinessRecord::where('employee_id', $summary['employee_id'])
            ->whereBetween('date', [$summary['start_month'], $summary['end_month']])
            ->whereDoesntHave('tardinessConversions')
            ->when($stationId, function ($query) use ($stationId) {
                $query->whereHas('employee', function ($employeeQuery) use ($stationId) {
                    $employeeQuery->where('station_id', $stationId);
                });
            })
            ->pluck('id');
    }

    public function employeeBelongsToStation(int $employeeId, int $stationId): bool
    {
        return DB::table('employees')
            ->where('id', $employeeId)
            ->where('station_id', $stationId)
            ->exists();
    }

    public function conversionModal(string $type, int $id): ?array
    {
        $model = $this->conversionModel($type);
        $conversion = $model::find($id);

        if (! $conversion) {
            return null;
        }

        $valueKey = $this->conversionValueKey($type);

        return [
            'id' => $conversion->id,
            'type' => $type,
            'title' => $type === 'hours' ? 'Hours' : 'Minutes',
            'value_key' => $valueKey,
            'value_label' => $type === 'hours' ? 'Hours' : 'Minutes',
            'value' => $conversion->{$valueKey},
            'equivalent_days' => $conversion->equivalent_days,
        ];
    }

    public function updateConversion(string $type, int $id, float $equivalentDays): void
    {
        $model = $this->conversionModel($type);

        $model::findOrFail($id)->update([
            'equivalent_days' => $equivalentDays,
        ]);
    }

    private function applyEmployeeSearch($query, string $search): void
    {
        $query->where(function ($query) use ($search) {
            $query->where('employees.first_name', 'like', "%{$search}%")
                ->orWhere('employees.middle_name', 'like', "%{$search}%")
                ->orWhere('employees.last_name', 'like', "%{$search}%")
                ->orWhereRaw(
                    "CONCAT_WS(' ', employees.first_name, employees.middle_name, employees.last_name) LIKE ?",
                    ["%{$search}%"],
                )
                ->orWhereRaw(
                    "CONCAT_WS(' ', employees.first_name, employees.last_name) LIKE ?",
                    ["%{$search}%"],
                );
        });
    }

    private function summaryQuery(string $startDate, string $endDate)
    {
        return DB::table('tardiness_records')
            ->join('employees', 'employees.id', '=', 'tardiness_records.employee_id')
            ->leftJoin('offices', 'offices.id', '=', 'employees.office_id')
            ->leftJoin('divisions', 'divisions.id', '=', 'offices.division_id')
            ->leftJoin(
                'hr_converted_tardiness_records',
                'hr_converted_tardiness_records.tardiness_record_id',
                '=',
                'tardiness_records.id',
            )
            ->whereNull('hr_converted_tardiness_records.tardiness_record_id')
            ->whereBetween('tardiness_records.date', [$startDate, $endDate]);
    }

    private function totalMinutesExpression(): string
    {
        $value = 'COALESCE(tardiness_records.converted_tardy, 0)';

        return "SUM((FLOOR({$value}) * 60) + ROUND(({$value} - FLOOR({$value})) * 100))";
    }

    private function conversionModel(string $type): string
    {
        return $type === 'hours' ? ConversionHours::class : ConversionMinutes::class;
    }

    private function conversionValueKey(string $type): string
    {
        return $type === 'hours' ? 'hours' : 'minutes';
    }
}
