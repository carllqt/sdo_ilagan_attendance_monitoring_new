<?php

namespace App\Services;

use App\Data\AttendanceMonitoring\AttendanceEmployeeData;
use App\Data\AttendanceMonitoring\AttendanceMonitoringFilter;
use App\Data\AttendanceMonitoring\EarliestTimeInData;
use App\Data\AttendanceMonitoring\RecentAttendanceLogData;
use App\Data\AttendanceMonitoring\TravelOrderData;
use App\Events\AttendanceMonitoringUpdated;
use App\Models\Administrator\Attendance;
use App\Models\Administrator\Employee;
use App\Models\EmployeeTravelOrder;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AttendanceMonitoringRealtimeService
{
    public function broadcastForAttendance(Attendance $attendance): void
    {
        $employeeId = (int) $attendance->employee_id;

        if ($employeeId) {
            $stationId = Employee::query()
                ->whereKey($employeeId)
                ->value('station_id');

            if (! $stationId) {
                return;
            }

            broadcast(new AttendanceMonitoringUpdated(
                (int) $stationId,
                $this->payload((int) $stationId, $employeeId, includeTravelOrders: false),
            ));
        }
    }

    public function broadcastForEmployee(int $employeeId): void
    {
        $stationId = Employee::query()
            ->whereKey($employeeId)
            ->value('station_id');

        if (! $stationId) {
            return;
        }

        $this->broadcastForStation((int) $stationId, $employeeId);
    }

    public function broadcastForTravelOrder(EmployeeTravelOrder $travelOrder): void
    {
        $stationId = Employee::query()
            ->whereKey((int) $travelOrder->employee_id)
            ->value('station_id');

        if (! $stationId) {
            return;
        }

        broadcast(new AttendanceMonitoringUpdated(
            (int) $stationId,
            $this->payload(
                (int) $stationId,
                (int) $travelOrder->employee_id,
                includeRecentLogs: false,
                includeTopFirstTimeIns: false,
            ),
        ));
    }

    public function broadcastForStation(int $stationId, ?int $employeeId = null): void
    {
        broadcast(new AttendanceMonitoringUpdated(
            $stationId,
            $this->payload($stationId, $employeeId),
        ));
    }

    private function payload(
        int $stationId,
        ?int $employeeId,
        bool $includeRecentLogs = true,
        bool $includeTopFirstTimeIns = true,
        bool $includeTravelOrders = true,
    ): array
    {
        $today = Carbon::today();

        $payload = [
            'station_id' => $stationId,
            'employee_id' => $employeeId,
            'employee' => $employeeId
                ? $this->employeeRow($today, $stationId, $employeeId)
                : null,
        ];

        if ($includeRecentLogs) {
            $payload['recentLogs'] = $this->recentLogs($today, $stationId);
        }

        if ($includeTopFirstTimeIns) {
            $payload['topFirstTimeIns'] = $this->topFirstTimeIns($today, $stationId);
        }

        if ($includeTravelOrders) {
            $payload['travelOrders'] = $this->travelOrders($today, $stationId);
        }

        return $payload;
    }

    private function employeeRow(Carbon $today, int $stationId, int $employeeId): ?array
    {
        $todayAttendance = Attendance::query()
            ->selectRaw('employee_id, MAX(id) as attendance_id')
            ->whereDate('date', $today)
            ->groupBy('employee_id');

        $employee = Employee::query()
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
            ->where('employees.station_id', $stationId)
            ->where('employees.id', $employeeId)
            ->first();

        return $employee ? AttendanceEmployeeData::fromRow($employee) : null;
    }

    private function topFirstTimeIns(Carbon $today, int $stationId)
    {
        return Attendance::query()
            ->join('attendance_ams', 'attendance_ams.attendance_id', '=', 'attendances.id')
            ->join('employees', 'employees.id', '=', 'attendances.employee_id')
            ->leftJoin('stations', 'stations.id', '=', 'employees.station_id')
            ->whereDate('attendances.date', $today)
            ->where('employees.station_id', $stationId)
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
            ->limit(AttendanceMonitoringFilter::SIDE_PANEL_LIMIT)
            ->get()
            ->map(fn ($row) => EarliestTimeInData::fromRow($row))
            ->values();
    }

    private function recentLogs(Carbon $today, int $stationId)
    {
        $limit = AttendanceMonitoringFilter::SIDE_PANEL_LIMIT;
        $amIn = $this->recentLogQuery($today, $stationId, 'attendance_ams', 'am_time_in', 'AM In');
        $amOut = $this->recentLogQuery($today, $stationId, 'attendance_ams', 'am_time_out', 'AM Out');
        $pmIn = $this->recentLogQuery($today, $stationId, 'attendance_pms', 'pm_time_in', 'PM In');
        $pmOut = $this->recentLogQuery($today, $stationId, 'attendance_pms', 'pm_time_out', 'PM Out');

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

    private function travelOrders(Carbon $today, int $stationId)
    {
        return EmployeeTravelOrder::query()
            ->select('employee_travel_orders.*')
            ->join('employees', 'employees.id', '=', 'employee_travel_orders.employee_id')
            ->with('employee:id,first_name,middle_name,last_name,profile_img,position,station_id')
            ->where('employees.station_id', $stationId)
            ->where('employees.active_status', 1)
            ->whereDate('employee_travel_orders.start_date', '<=', $today)
            ->whereDate('employee_travel_orders.end_date', '>=', $today)
            ->orderBy('employee_travel_orders.start_date')
            ->orderBy('employee_travel_orders.end_date')
            ->orderBy('employees.first_name')
            ->limit(AttendanceMonitoringFilter::SIDE_PANEL_LIMIT)
            ->get()
            ->map(fn (EmployeeTravelOrder $travelOrder) => TravelOrderData::fromModel($travelOrder))
            ->values();
    }
}
