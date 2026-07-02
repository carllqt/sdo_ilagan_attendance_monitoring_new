<?php

namespace App\Repositories\Administrator;

use App\Data\Administrator\TardinessSummaryManagement\TardinessSummaryFilter;
use App\Models\Administrator\Employee;
use App\Models\Administrator\Office;
use App\Models\Administrator\Station;
use App\Models\Administrator\TardinessRecord;
use Illuminate\Support\Facades\DB;

class TardinessSummaryManagementRepository
{
    public function offices(TardinessSummaryFilter $filter)
    {
        return Office::with('division:id,code,name')
            ->select('id', 'division_id', 'name')
            ->whereHas('employees', function ($employeeQuery) use ($filter) {
                $employeeQuery->where('active_status', 1);
                $this->scopeUserStation($employeeQuery, $filter);
            })
            ->orderBy('name')
            ->get();
    }

    public function years(TardinessSummaryFilter $filter)
    {
        return TardinessRecord::query()
            ->selectRaw('YEAR(date) as year')
            ->whereHas('employee', fn ($employeeQuery) => $this->scopeUserStation($employeeQuery, $filter))
            ->distinct()
            ->orderByDesc('year')
            ->pluck('year')
            ->map(fn ($year) => (string) $year)
            ->values();
    }

    public function verificationStations()
    {
        return Station::query()
            ->select('id', 'code', 'name')
            ->whereHas('employees', function ($query) {
                $query->where('active_status', 1);
            })
            ->orderBy('name')
            ->get();
    }

    public function summaryEmployees(TardinessSummaryFilter $filter)
    {
        return $this->summaryEmployeeQuery($filter)
            ->paginate($filter->limit, ['*'], 'page', $filter->page)
            ->withQueryString();
    }

    public function printEmployees(TardinessSummaryFilter $filter)
    {
        return $this->summaryEmployeeQuery($filter)->get();
    }

    public function stationVerificationEmployees(int $stationId, TardinessSummaryFilter $filter)
    {
        if (! $stationId) {
            return Employee::query()
                ->whereRaw('1 = 0')
                ->paginate(10, ['*'], 'verification_page', 1);
        }

        return Employee::with([
            'office:id,name,division_id',
            'office.division:id,code,name',
            'station:id,code,name',
        ])
            ->select(
                'id',
                'first_name',
                'middle_name',
                'last_name',
                'profile_img',
                'position',
                'office_id',
                'station_id',
            )
            ->where('station_id', $stationId)
            ->where('active_status', 1)
            ->orderByName()
            ->paginate(10, ['*'], 'verification_page', $filter->verificationPage)
            ->withQueryString();
    }

    public function monthlyTotals($employeeIds, TardinessSummaryFilter $filter)
    {
        if ($employeeIds->isEmpty()) {
            return collect();
        }

        [$from, $to] = $filter->dateRange();

        return TardinessRecord::query()
            ->selectRaw(
                'employee_id, MONTH(date) as month, '.$this->totalMinutesExpression().' as total_minutes',
            )
            ->whereBetween('date', [$from, $to])
            ->whereIn('employee_id', $employeeIds)
            ->groupBy('employee_id', DB::raw('MONTH(date)'))
            ->get()
            ->groupBy('employee_id');
    }

    public function suggestionEmployees(TardinessSummaryFilter $filter)
    {
        if ($filter->search === '') {
            return collect();
        }

        return $this->summaryEmployeeQuery($filter)
            ->limit(10)
            ->get();
    }

    private function summaryEmployeeQuery(TardinessSummaryFilter $filter)
    {
        [$from, $to] = $filter->dateRange();

        return Employee::with([
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
                'station_id',
            )
            ->whereHas('tardinessRecords', function ($query) use ($from, $to) {
                $query->whereBetween('date', [$from, $to]);
            })
            ->tap(fn ($query) => $this->scopeUserStation($query, $filter))
            ->when($filter->search !== '', function ($query) use ($filter) {
                $query->where(function ($query) use ($filter) {
                    $query->where('employees.id', $filter->search)
                        ->orWhere('employees.first_name', 'like', "%{$filter->search}%")
                        ->orWhere('employees.middle_name', 'like', "%{$filter->search}%")
                        ->orWhere('employees.last_name', 'like', "%{$filter->search}%")
                        ->orWhereRaw(
                            "CONCAT_WS(' ', employees.first_name, employees.middle_name, employees.last_name) LIKE ?",
                            ["%{$filter->search}%"],
                        )
                        ->orWhereRaw(
                            "CONCAT_WS(' ', employees.id, employees.first_name, employees.middle_name, employees.last_name) LIKE ?",
                            ["%{$filter->search}%"],
                        );
                });
            })
            ->when($filter->office !== '' && $filter->office !== TardinessSummaryFilter::ALL_OFFICES, function ($query) use ($filter) {
                $query->whereHas('office', function ($officeQuery) use ($filter) {
                    $officeQuery->where('name', $filter->office);
                });
            })
            ->orderByName();
    }

    private function scopeUserStation($query, TardinessSummaryFilter $filter)
    {
        return $filter->userStationId
            ? $query->where('employees.station_id', $filter->userStationId)
            : $query->whereRaw('1 = 0');
    }

    private function totalMinutesExpression(): string
    {
        $value = 'COALESCE(converted_tardy, 0)';

        return "SUM((FLOOR({$value}) * 60) + ROUND(({$value} - FLOOR({$value})) * 100))";
    }
}
