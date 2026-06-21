<?php

namespace App\Repositories\Administrator;

use App\Data\Administrator\AttendanceManagement\AttendanceManagementFilter;
use App\Models\Administrator\Attendance;
use App\Models\Administrator\Office;
use App\Models\EmployeeTravelOrder;

class AttendanceManagementRepository
{
    public function offices()
    {
        return Office::with('division:id,code,name')
            ->select('id', 'division_id', 'name')
            ->orderBy('name')
            ->get();
    }

    public function attendanceYears(int $stationId)
    {
        return Attendance::query()
            ->selectRaw('YEAR(date) as year')
            ->join('employees', 'employees.id', '=', 'attendances.employee_id')
            ->where('employees.station_id', $stationId)
            ->where('employees.active_status', 1)
            ->distinct()
            ->orderByDesc('year')
            ->pluck('year')
            ->map(fn ($year) => (string) $year)
            ->values();
    }

    public function incompleteAttendances(AttendanceManagementFilter $filter)
    {
        $query = Attendance::query()
            ->select('attendances.*')
            ->distinct()
            ->join('employees', 'employees.id', '=', 'attendances.employee_id')
            ->leftJoin('attendance_ams', 'attendance_ams.attendance_id', '=', 'attendances.id')
            ->leftJoin('attendance_pms', 'attendance_pms.attendance_id', '=', 'attendances.id')
            ->with([
                'employee:id,first_name,middle_name,last_name,profile_img,office_id,station_id,active_status',
                'employee.office:id,division_id,name',
                'employee.office.division:id,code,name',
                'am:id,attendance_id,am_time_in,am_time_out',
                'pm:id,attendance_id,pm_time_in,pm_time_out',
            ])
            ->where('attendances.date', $filter->date())
            ->where('employees.station_id', $filter->stationId)
            ->where('employees.active_status', 1)
            ->whereDoesntHave('employee.employeeTravelOrders', function ($query) use ($filter) {
                $query->whereDate('start_date', '<=', $filter->date())
                    ->whereDate('end_date', '>=', $filter->date());
            })
            ->where(function ($query) {
                $query->whereNull('attendance_ams.am_time_in')
                    ->orWhereNull('attendance_ams.am_time_out')
                    ->orWhereNull('attendance_pms.pm_time_in')
                    ->orWhereNull('attendance_pms.pm_time_out');
            });

        if ($filter->officeId !== 'all') {
            $query->where('employees.office_id', (int) $filter->officeId);
        }

        if ($filter->search !== '') {
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
        }

        return $query
            ->orderBy('attendances.date')
            ->orderBy('employees.first_name')
            ->orderBy('employees.middle_name')
            ->orderBy('employees.last_name')
            ->orderBy('employees.id')
            ->paginate($filter->limit, ['*'], 'page', $filter->page)
            ->withQueryString();
    }

    public function employeeTravelOrders(AttendanceManagementFilter $filter)
    {
        $query = EmployeeTravelOrder::query()
            ->select('employee_travel_orders.*')
            ->join('employees', 'employees.id', '=', 'employee_travel_orders.employee_id')
            ->with([
                'employee:id,first_name,middle_name,last_name,profile_img,office_id,station_id,active_status',
                'employee.office:id,division_id,name',
                'employee.office.division:id,code,name',
            ])
            ->where('employees.station_id', $filter->stationId)
            ->where('employees.active_status', 1)
            ->whereDate('employee_travel_orders.start_date', '<=', $filter->date())
            ->whereDate('employee_travel_orders.end_date', '>=', $filter->date());

        if ($filter->officeId !== 'all') {
            $query->where('employees.office_id', (int) $filter->officeId);
        }

        if ($filter->search !== '') {
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
        }

        return $query
            ->orderBy('employee_travel_orders.start_date')
            ->orderBy('employee_travel_orders.end_date')
            ->orderBy('employees.first_name')
            ->orderBy('employees.middle_name')
            ->orderBy('employees.last_name')
            ->orderBy('employees.id')
            ->paginate($filter->limit, ['*'], 'travel_order_page', $filter->page)
            ->withQueryString();
    }

    public function attendanceForUpdate(int $id): Attendance
    {
        return Attendance::with([
            'am',
            'pm',
            'employee.workSchedule.workType',
        ])->findOrFail($id);
    }

    public function editModalAttendance(int $attendanceId): ?Attendance
    {
        return Attendance::with([
            'employee:id,first_name,middle_name,last_name,profile_img,office_id,station_id,active_status',
            'employee.office:id,division_id,name',
            'employee.office.division:id,code,name',
            'am:id,attendance_id,am_time_in,am_time_out',
            'pm:id,attendance_id,pm_time_in,pm_time_out',
        ])->find($attendanceId);
    }

    public function createAttendance(array $data): Attendance
    {
        $attendance = Attendance::create([
            'employee_id' => $data['employee_id'],
            'date' => $data['date'],
        ]);

        $attendance->am()->create([
            'am_time_in' => $data['am_time_in'] ?? null,
            'am_time_out' => $data['am_time_out'] ?? null,
        ]);

        $attendance->pm()->create([
            'pm_time_in' => $data['pm_time_in'] ?? null,
            'pm_time_out' => $data['pm_time_out'] ?? null,
        ]);

        return $attendance;
    }

    public function employeeBelongsToStation(int $employeeId, int $stationId): bool
    {
        return \App\Models\Administrator\Employee::query()
            ->where('id', $employeeId)
            ->where('station_id', $stationId)
            ->where('active_status', 1)
            ->exists();
    }

    public function createEmployeeTravelOrder(array $data): EmployeeTravelOrder
    {
        return EmployeeTravelOrder::create([
            'employee_id' => $data['employee_id'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
        ]);
    }

    public function loadForTardiness(Attendance $attendance): Attendance
    {
        return $attendance->load(['am', 'pm', 'employee.workSchedule.workType']);
    }

}
