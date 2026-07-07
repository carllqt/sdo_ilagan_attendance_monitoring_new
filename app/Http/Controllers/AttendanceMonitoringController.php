<?php

namespace App\Http\Controllers;

use App\Data\AttendanceMonitoring\AttendanceEmployeeData;
use App\Data\AttendanceMonitoring\AttendanceMonitoringFilter;
use App\Data\AttendanceMonitoring\EarliestTimeInData;
use App\Data\AttendanceMonitoring\RecentAttendanceLogData;
use App\Data\AttendanceMonitoring\TravelOrderData;
use App\Http\Requests\AttendanceMonitoring\AttendanceMonitoringRequest;
use App\Http\Requests\AttendanceMonitoring\AttendanceMonitoringSuggestionRequest;
use App\Models\Administrator\Attendance;
use App\Models\Administrator\Employee;
use App\Models\Administrator\Station;
use App\Models\EmployeeTravelOrder;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AttendanceMonitoringController extends Controller
{
    public function index(AttendanceMonitoringRequest $request)
    {
        $today = Carbon::today();
        $filter = AttendanceMonitoringFilter::fromRequest($request);

        if ($filter->shouldRedirectToCanonical($request)) {
            return redirect()->route('attendance-monitoring', $filter->canonicalQuery($request));
        }

        $stations = Station::query()
            ->select('id', 'name', 'code')
            ->orderByRaw("CASE WHEN code = 'SDO' THEN 0 ELSE 1 END")
            ->orderBy('name')
            ->limit(20)
            ->get();

        if ($filter->station && ! $stations->contains('id', $filter->stationId)) {
            $stations->prepend($filter->station);
        }

        return Inertia::render('AttendanceMonitoring/AttendanceMonitoring', [
            'employees' => fn () => $this->employees($today, $filter),
            'stations' => fn () => $stations->values(),
            'recentLogs' => fn () => $this->recentLogs($today, $filter),
            'topFirstTimeIns' => fn () => $this->topFirstTimeIns($today, $filter),
            'travelOrders' => fn () => $this->travelOrders($today, $filter),
            'filters' => $filter->toArray(),
        ]);
    }

    private function employees(Carbon $today, AttendanceMonitoringFilter $filter)
    {
        $todayAttendance = Attendance::query()
            ->selectRaw('employee_id, MAX(id) as attendance_id')
            ->whereDate('date', $today)
            ->groupBy('employee_id');

        $employees = Employee::query()
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
                        ->orWhere('stations.name', 'like', "%{$filter->search}%")
                        ->orWhere('stations.code', 'like', "%{$filter->search}%");
                });
            })
            ->orderByRaw("CASE WHEN stations.code = 'SDO' THEN 0 ELSE 1 END")
            ->orderBy('stations.name')
            ->orderBy('employees.first_name')
            ->orderBy('employees.middle_name')
            ->orderBy('employees.last_name')
            ->paginate($filter->employeeLimit, ['*'], 'page', $filter->page)
            ->withQueryString();

        $employees->setCollection($employees->getCollection()
            ->map(fn ($employee) => AttendanceEmployeeData::fromRow($employee)));

        return $employees;
    }

    public function stationSuggestions(AttendanceMonitoringSuggestionRequest $request)
    {
        $search = trim((string) $request->query('search', ''));

        if ($search === '') {
            return response()->json([]);
        }

        $stations = Station::query()
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
            ]);

        return response()->json($stations);
    }

    public function employeeSuggestions(AttendanceMonitoringSuggestionRequest $request)
    {
        $search = trim((string) $request->query('search', ''));

        if ($search === '') {
            return response()->json([]);
        }

        $selectedStation = AttendanceMonitoringFilter::resolveSelectedStation($request);
        $stationId = $selectedStation?->id ?? 1;

        $employees = Employee::query()
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
            });

        return response()->json($employees);
    }

    private function topFirstTimeIns(Carbon $today, AttendanceMonitoringFilter $filter)
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

    private function recentLogs(Carbon $today, AttendanceMonitoringFilter $filter)
    {
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
            ->orderByDesc('time')
            ->limit($filter->sidePanelLimit)
            ->get()
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
            ->selectRaw("{$attendanceTable}.{$timeColumn} as time");
    }

    private function travelOrders(Carbon $today, AttendanceMonitoringFilter $filter)
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
}
