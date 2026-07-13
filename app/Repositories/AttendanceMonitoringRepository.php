<?php

namespace App\Repositories;

use App\Data\AttendanceMonitoring\AttendanceEmployeeData;
use App\Data\AttendanceMonitoring\AttendanceMonitoringFilter;
use App\Data\AttendanceMonitoring\EarliestTimeInData;
use App\Data\AttendanceMonitoring\RecentAttendanceLogData;
use App\Data\AttendanceMonitoring\TravelOrderData;
use App\Models\Administrator\Attendance;
use App\Models\Administrator\Employee;
use App\Models\Administrator\Station;
use App\Models\EmployeeTravelOrder;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AttendanceMonitoringRepository
{
    public function employees(Carbon $today, AttendanceMonitoringFilter $filter)
    {
        $employees = $this->employeeQuery($today, $filter)
            ->when($filter->search !== '', function ($query) use ($filter) {
                $this->applyEmployeeSearch($query, $filter->search);
            })
            ->paginate($filter->employeeLimit, ['*'], 'page', $filter->page);

        $employees->setCollection($employees->getCollection()
            ->map(fn ($employee) => AttendanceEmployeeData::fromRow($employee)));

        return $employees;
    }

    public function stationOptions(AttendanceMonitoringFilter $filter)
    {
        $stations = Station::query()
            ->select('id', 'name', 'code')
            ->orderByRaw("CASE WHEN code = 'SDO' THEN 0 ELSE 1 END")
            ->orderBy('name')
            ->limit(20)
            ->get();

        if ($filter->station && ! $stations->contains('id', $filter->stationId)) {
            $stations->prepend($filter->station);
        }

        return $stations;
    }

    public function stationSuggestions(string $search): array
    {
        if ($search === '') {
            return [];
        }

        return Station::query()
            ->select('id', 'name', 'code')
            ->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            })
            ->orderByRaw("CASE WHEN code = 'SDO' THEN 0 ELSE 1 END")
            ->orderBy('name')
            ->limit(8)
            ->get()
            ->map(fn ($station) => [
                'id' => $station->id,
                'code' => $station->code,
                'name' => $station->name,
            ])
            ->values()
            ->all();
    }

    public function employeeSuggestions(string $search, int $stationId): array
    {
        if ($search === '') {
            return [];
        }

        return Employee::query()
            ->with('station:id,name,code')
            ->select([
                'id',
                'first_name',
                'middle_name',
                'last_name',
                'profile_img',
                'position',
                'station_id',
            ])
            ->where('station_id', $stationId)
            ->where(function ($query) use ($search) {
                $query->where('id', $search)
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhereRaw(
                        "CONCAT_WS(' ', first_name, middle_name, last_name) LIKE ?",
                        ["%{$search}%"],
                    );
            })
            ->orderByName()
            ->limit(8)
            ->get()
            ->map(function ($employee) {
                $fullName = collect([
                    $employee->first_name,
                    $employee->middle_name,
                    $employee->last_name,
                ])->filter()->join(' ');

                return [
                    'id' => $employee->id,
                    'name' => $fullName,
                    'position' => $employee->position,
                    'station' => $employee->station?->name,
                ];
            })
            ->values()
            ->all();
    }

    public function employeeStation(int $employeeId): Employee
    {
        return Employee::query()
            ->select('id', 'station_id')
            ->findOrFail($employeeId);
    }

    public function liveTestEmployee(int $stationId): ?Employee
    {
        return $this->liveTestEmployeeQuery($stationId)->first();
    }

    public function liveTestEmployees(int $stationId, int $limit = 12)
    {
        return $this->liveTestEmployeeQuery($stationId)
            ->limit($limit)
            ->get();
    }

    private function liveTestEmployeeQuery(int $stationId)
    {
        return Employee::query()
            ->with('station:id,name,code')
            ->select([
                'id',
                'first_name',
                'middle_name',
                'last_name',
                'position',
                'station_id',
            ])
            ->where('station_id', $stationId)
            ->where('active_status', 1)
            ->orderByName();
    }

    public function cycleLiveTestAttendance(Employee $employee): array
    {
        return DB::transaction(function () use ($employee) {
            $time = now()->format('H:i:s');
            $attendance = Attendance::firstOrCreate([
                'employee_id' => $employee->id,
                'date' => Carbon::today()->toDateString(),
            ]);
            $attendance->load(['am', 'pm']);

            $am = $attendance->am ?: $attendance->am()->make();
            $pm = $attendance->pm ?: $attendance->pm()->make();
            $action = 'AM In';

            if (! $am->am_time_in) {
                $am->am_time_in = $time;
            } elseif (! $am->am_time_out) {
                $am->am_time_out = $time;
                $action = 'AM Out';
            } elseif (! $pm->pm_time_in) {
                $pm->pm_time_in = $time;
                $action = 'PM In';
            } elseif (! $pm->pm_time_out) {
                $pm->pm_time_out = $time;
                $action = 'PM Out';
            } else {
                $am->am_time_in = $time;
                $am->am_time_out = null;
                $pm->pm_time_in = null;
                $pm->pm_time_out = null;
                $action = 'AM In';
            }

            $am->save();
            $pm->save();

            return [
                'attendance' => $attendance->fresh(['am', 'pm', 'employee.station']),
                'action' => $action,
                'time' => $time,
            ];
        });
    }

    public function topFirstTimeIns(Carbon $today, AttendanceMonitoringFilter $filter)
    {
        return Attendance::query()
            ->join('attendance_ams', 'attendance_ams.attendance_id', '=', 'attendances.id')
            ->join('employees', 'employees.id', '=', 'attendances.employee_id')
            ->leftJoin('stations', 'stations.id', '=', 'employees.station_id')
            ->whereDate('attendances.date', $today)
            ->where('employees.station_id', $filter->stationId)
            ->whereNotNull('attendance_ams.am_time_in')
            ->select([
                'employees.id',
                'employees.first_name',
                'employees.middle_name',
                'employees.last_name',
                'employees.profile_img',
                'employees.position',
                'stations.name as station_name',
                'attendance_ams.am_time_in',
            ])
            ->orderBy('attendance_ams.am_time_in')
            ->limit($filter->sidePanelLimit)
            ->get()
            ->map(fn ($row) => EarliestTimeInData::fromRow($row))
            ->values();
    }

    public function recentLogs(Carbon $today, AttendanceMonitoringFilter $filter)
    {
        $limit = AttendanceMonitoringFilter::RECENT_LOG_LIMIT;
        $amIn = $this->recentLogQuery($today, $filter->stationId, 'attendance_ams', 'am_time_in', 'AM In');
        $amOut = $this->recentLogQuery($today, $filter->stationId, 'attendance_ams', 'am_time_out', 'AM Out');
        $pmIn = $this->recentLogQuery($today, $filter->stationId, 'attendance_pms', 'pm_time_in', 'PM In');
        $pmOut = $this->recentLogQuery($today, $filter->stationId, 'attendance_pms', 'pm_time_out', 'PM Out');

        return DB::query()
            ->fromSub(
                $amIn
                    ->unionAll($amOut)
                    ->unionAll($pmIn)
                    ->unionAll($pmOut),
                'recent_logs',
            )
            ->orderByDesc('logged_at')
            ->orderByDesc('time')
            ->orderByDesc('log_id')
            ->limit($limit * 4)
            ->get()
            ->unique('employee_id')
            ->take($limit)
            ->map(fn ($row) => RecentAttendanceLogData::fromRow($row))
            ->values();
    }

    public function travelOrders(Carbon $today, AttendanceMonitoringFilter $filter)
    {
        return EmployeeTravelOrder::query()
            ->select('employee_travel_orders.*')
            ->join('employees', 'employees.id', '=', 'employee_travel_orders.employee_id')
            ->with('employee:id,first_name,middle_name,last_name,profile_img,position,station_id')
            ->where('employees.station_id', $filter->stationId)
            ->where('employees.active_status', 1)
            ->whereDate('employee_travel_orders.start_date', '<=', $today)
            ->whereDate('employee_travel_orders.end_date', '>=', $today)
            ->orderBy('employee_travel_orders.start_date')
            ->orderBy('employee_travel_orders.end_date')
            ->orderBy('employees.first_name')
            ->limit($filter->sidePanelLimit)
            ->get()
            ->map(fn (EmployeeTravelOrder $travelOrder) => TravelOrderData::fromModel($travelOrder))
            ->values();
    }

    private function employeeQuery(Carbon $today, AttendanceMonitoringFilter $filter)
    {
        $todayAttendance = Attendance::query()
            ->selectRaw('employee_id, MAX(id) as attendance_id')
            ->whereDate('date', $today)
            ->groupBy('employee_id');

        return Employee::query()
            ->leftJoin('stations', 'stations.id', '=', 'employees.station_id')
            ->leftJoinSub($todayAttendance, 'today_attendances', function ($join) {
                $join->on('today_attendances.employee_id', '=', 'employees.id');
            })
            ->leftJoin('attendances', 'attendances.id', '=', 'today_attendances.attendance_id')
            ->leftJoin('attendance_ams', 'attendance_ams.attendance_id', '=', 'attendances.id')
            ->leftJoin('attendance_pms', 'attendance_pms.attendance_id', '=', 'attendances.id')
            ->select([
                'employees.id',
                'employees.first_name',
                'employees.middle_name',
                'employees.last_name',
                'employees.profile_img',
                'employees.position',
                'employees.station_id',
                'stations.name as station_name',
                'stations.code as station_code',
                'attendance_ams.am_time_in as am_in',
                'attendance_ams.am_time_out as am_out',
                'attendance_pms.pm_time_in as pm_in',
                'attendance_pms.pm_time_out as pm_out',
            ])
            ->where('employees.station_id', $filter->stationId)
            ->orderByRaw("CASE WHEN stations.code = 'SDO' THEN 0 ELSE 1 END")
            ->orderBy('stations.name')
            ->orderBy('employees.first_name')
            ->orderBy('employees.middle_name')
            ->orderBy('employees.last_name');
    }

    private function applyEmployeeSearch($query, string $search): void
    {
        $query->where(function ($query) use ($search) {
            $query->where('employees.id', $search)
                ->orWhere('employees.first_name', 'like', "%{$search}%")
                ->orWhere('employees.middle_name', 'like', "%{$search}%")
                ->orWhere('employees.last_name', 'like', "%{$search}%")
                ->orWhereRaw(
                    "CONCAT_WS(' ', employees.first_name, employees.middle_name, employees.last_name) LIKE ?",
                    ["%{$search}%"],
                )
                ->orWhere('stations.name', 'like', "%{$search}%")
                ->orWhere('stations.code', 'like', "%{$search}%");
        });
    }

    private function recentLogQuery(
        Carbon $today,
        int $stationId,
        string $attendanceTable,
        string $timeColumn,
        string $label,
    ) {
        return Attendance::query()
            ->join('employees', 'employees.id', '=', 'attendances.employee_id')
            ->join($attendanceTable, "{$attendanceTable}.attendance_id", '=', 'attendances.id')
            ->whereDate('attendances.date', $today)
            ->where('employees.station_id', $stationId)
            ->whereNotNull("{$attendanceTable}.{$timeColumn}")
            ->select([
                'employees.id as employee_id',
                'employees.first_name',
                'employees.middle_name',
                'employees.last_name',
                'employees.profile_img',
                'employees.position',
            ])
            ->selectRaw('? as label', [$label])
            ->selectRaw("{$attendanceTable}.{$timeColumn} as time")
            ->selectRaw("{$attendanceTable}.updated_at as logged_at")
            ->selectRaw("{$attendanceTable}.id as log_id");
    }
}
