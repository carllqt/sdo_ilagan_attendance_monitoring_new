<?php

namespace App\Repositories\Administrator;

use App\Data\Administrator\Attendance\AttendanceFilter;
use App\Models\Administrator\Attendance;
use App\Models\Administrator\Employee;
use Carbon\Carbon;

class AttendanceRepository
{
    public function todayAttendancesForStation(int $stationId, AttendanceFilter $filter)
    {
        $timeInColumn = $filter->session === 'AM'
            ? 'attendance_ams.am_time_in'
            : 'attendance_pms.pm_time_in';
        $timeOutColumn = $filter->session === 'AM'
            ? 'attendance_ams.am_time_out'
            : 'attendance_pms.pm_time_out';

        $query = Attendance::query()
            ->select('attendances.*')
            ->with([
                'employee:id,first_name,middle_name,last_name,profile_img,position,office_id,station_id,active_status',
                'employee.office:id,name',
                'am',
                'pm',
            ])
            ->join('employees', 'employees.id', '=', 'attendances.employee_id')
            ->leftJoin('offices', 'offices.id', '=', 'employees.office_id')
            ->leftJoin('attendance_ams', 'attendance_ams.attendance_id', '=', 'attendances.id')
            ->leftJoin('attendance_pms', 'attendance_pms.attendance_id', '=', 'attendances.id')
            ->where('employees.station_id', $stationId)
            ->where('employees.active_status', 1)
            ->whereDate('attendances.date', Carbon::today());

        if ($filter->employeeId) {
            $query->where('employees.id', $filter->employeeId);
        }

        return $query
            ->orderByRaw("COALESCE({$timeOutColumn}, {$timeInColumn}, '00:00:00') DESC")
            ->orderBy('employees.first_name')
            ->orderBy('employees.middle_name')
            ->orderBy('employees.last_name')
            ->get();
    }

    public function attendanceEmployeeSuggestions(int $stationId, string $search)
    {
        if ($search === '') {
            return collect();
        }

        return Employee::with(['office:id,name'])
            ->select(
                'id',
                'first_name',
                'middle_name',
                'last_name',
                'profile_img',
                'position',
                'office_id',
                'station_id',
                'active_status',
            )
            ->where('station_id', $stationId)
            ->where('active_status', 1)
            ->where(function ($query) use ($search) {
                $query->where('id', $search)
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('position', 'like', "%{$search}%")
                    ->orWhereRaw(
                        "CONCAT_WS(' ', first_name, middle_name, last_name) LIKE ?",
                        ["%{$search}%"],
                    )
                    ->orWhereRaw(
                        "CONCAT_WS(' ', id, first_name, middle_name, last_name) LIKE ?",
                        ["%{$search}%"],
                    )
                    ->orWhereHas('office', function ($officeQuery) use ($search) {
                        $officeQuery->where('name', 'like', "%{$search}%");
                    });
            })
            ->orderByName()
            ->limit(6)
            ->get();
    }

}
