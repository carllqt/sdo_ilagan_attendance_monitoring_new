<?php

namespace App\Services\Administrator;

use App\Data\Administrator\Attendance\AttendanceFilter;
use App\Models\Administrator\Attendance;
use App\Models\Administrator\Employee;
use App\Models\User;
use App\Repositories\Administrator\AttendanceRepository;
use App\Services\AttendanceMonitoringRealtimeService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class AttendanceService
{
    private const AM_CUTOFF_HOUR = 13;

    public function __construct(
        private readonly AttendanceRepository $repository,
        private readonly AttendanceMonitoringRealtimeService $realtime,
    ) {}

    public function pageData(Request $request): array
    {
        $user = $request->user();
        $stationId = $this->stationId($user);
        $filter = AttendanceFilter::fromRequest($request);

        return [
            'attendances' => $this->repository->todayAttendancesForStation($stationId, $filter),
            'attendanceFilters' => $filter->toArray(),
            'fingerprintServiceUrl' => $this->fingerprintServiceUrl($request),
            'attendanceAccess' => [
                'station' => [
                    'id' => $user->employee?->station?->id,
                    'name' => $user->employee?->station?->name,
                ],
                'admin' => [
                    'id' => $user->employee?->id,
                    'name' => $user->employee?->full_name,
                ],
            ],
        ];
    }

    public function suggestions(Request $request): array
    {
        return $this->repository
            ->attendanceEmployeeSuggestions(
                $this->stationId($request->user()),
                trim((string) $request->query('search', '')),
            )
            ->map(fn (Employee $employee) => $this->formatSuggestion($employee))
            ->all();
    }

    public function recordScan(Request $request, int $employeeId): array
    {
        $stationId = $this->stationId($request->user());
        $employee = $this->employeeForAttendance($employeeId, $stationId);
        $now = now();

        return DB::transaction(function () use ($employee, $now) {
            $attendance = $this->attendanceForToday((int) $employee->id, $now);
            $attendance->load(['am', 'pm', 'employee.office']);

            $am = $attendance->am;
            $forcePm = $now->hour >= 12
                && (! $am || ! $am->am_time_in || ($am->am_time_in && $am->am_time_out));

            if ($am && $am->am_time_in && ! $am->am_time_out && $now->hour >= self::AM_CUTOFF_HOUR) {
                return [
                    'success' => true,
                    'prompt' => true,
                    'prompt_type' => 'AM',
                    'message' => 'You scanned after 1 PM. Do you want to record AM Time-Out or PM Time-In?',
                    'options' => ['AM Time-Out', 'PM Time-In'],
                    'employee' => $this->employeePayload($employee),
                ];
            }

            if ($now->hour < self::AM_CUTOFF_HOUR && ! $forcePm) {
                if (! $am) {
                    $attendance->am()->create(['am_time_in' => $this->timeString($now)]);
                    return $this->recordedPayload($attendance, $employee, 'AM', 'time-in', 'AM time-in recorded', $now);
                }

                if ($am->am_time_in && ! $am->am_time_out) {
                    $am->update(['am_time_out' => $this->timeString($now)]);
                    return $this->recordedPayload($attendance, $employee, 'AM', 'time-out', 'AM time-out recorded', $now);
                }

                return $this->errorPayload('AM attendance is already complete.', $employee);
            }

            $pm = $attendance->pm;

            if (! $pm) {
                $attendance->pm()->create(['pm_time_in' => $this->timeString($now)]);
                return $this->recordedPayload($attendance, $employee, 'PM', 'time-in', 'PM time-in recorded', $now);
            }

            if (! $pm->pm_time_in) {
                $pm->update(['pm_time_in' => $this->timeString($now)]);
                return $this->recordedPayload($attendance, $employee, 'PM', 'time-in', 'PM time-in recorded', $now);
            }

            if (! $pm->pm_time_out) {
                $pm->update(['pm_time_out' => $this->timeString($now)]);
                return $this->recordedPayload($attendance, $employee, 'PM', 'time-out', 'PM time-out recorded', $now);
            }

            return $this->errorPayload('PM attendance is already complete.', $employee);
        });
    }

    public function recordChoice(Request $request, int $employeeId, string $choice): array
    {
        $stationId = $this->stationId($request->user());
        $employee = $this->employeeForAttendance($employeeId, $stationId);
        $now = now();

        return DB::transaction(function () use ($choice, $employee, $now) {
            $attendance = $this->attendanceForToday((int) $employee->id, $now);
            $attendance->load(['am', 'pm', 'employee.office']);

            if ($choice === 'AM Time-Out') {
                $am = $attendance->am;

                if (! $am || ! $am->am_time_in) {
                    return $this->errorPayload('Cannot record AM Time-Out before AM Time-In.', $employee);
                }

                if ($am->am_time_out) {
                    return $this->errorPayload('AM Time-Out already recorded.', $employee);
                }

                $am->update(['am_time_out' => $this->timeString($now)]);
                return $this->recordedPayload($attendance, $employee, 'AM', 'time-out', 'AM Time-Out recorded', $now);
            }

            if ($choice === 'PM Time-In') {
                $pm = $attendance->pm;

                if (! $pm) {
                    $attendance->pm()->create(['pm_time_in' => $this->timeString($now)]);
                    return $this->recordedPayload($attendance, $employee, 'PM', 'time-in', 'PM Time-In recorded', $now);
                }

                if ($pm->pm_time_in) {
                    return $this->errorPayload('PM Time-In already recorded.', $employee);
                }

                $pm->update(['pm_time_in' => $this->timeString($now)]);
                return $this->recordedPayload($attendance, $employee, 'PM', 'time-in', 'PM Time-In recorded', $now);
            }

            if ($choice === 'PM Time-Out') {
                $pm = $attendance->pm;

                if (! $pm || ! $pm->pm_time_in) {
                    return $this->errorPayload('Cannot record PM Time-Out before PM Time-In.', $employee);
                }

                if ($pm->pm_time_out) {
                    return $this->errorPayload('PM Time-Out already recorded.', $employee);
                }

                $pm->update(['pm_time_out' => $this->timeString($now)]);
                return $this->recordedPayload($attendance, $employee, 'PM', 'time-out', 'PM Time-Out recorded', $now);
            }

            return $this->errorPayload('Invalid attendance choice.', $employee);
        });
    }

    public function stationId(User $user): int
    {
        $employee = $user->employee;

        if (! $employee?->station_id) {
            abort(403, 'Station not assigned to this user.');
        }

        if (
            ! $user->hasAnyRole(['school_admin', 'sdo_admin', 'sdo_hr']) &&
            ! $employee->stationRoles()->where('type', 'school_admin')->exists()
        ) {
            abort(403, 'Only station admins can access attendance.');
        }

        return (int) $employee->station_id;
    }

    private function fingerprintServiceUrl(Request $request): string
    {
        return rtrim(
            env('BIOMETRIC_SERVICE_URL') ?: $request->getScheme() . '://' . $request->getHost() . ':5000',
            '/',
        );
    }

    private function employeeForAttendance(int $employeeId, int $stationId): Employee
    {
        $employee = Employee::query()
            ->with(['office:id,name'])
            ->select([
                'id',
                'first_name',
                'middle_name',
                'last_name',
                'profile_img',
                'position',
                'office_id',
                'station_id',
                'active_status',
            ])
            ->whereKey($employeeId)
            ->first();

        if (! $employee) {
            abort(404, 'Employee not found.');
        }

        if ((int) $employee->station_id !== $stationId) {
            abort(403, 'Employee is not assigned to this station.');
        }

        if (! (int) $employee->active_status) {
            abort(422, 'Employee is inactive.');
        }

        return $employee;
    }

    private function attendanceForToday(int $employeeId, Carbon $now): Attendance
    {
        return Attendance::firstOrCreate([
            'employee_id' => $employeeId,
            'date' => $now->toDateString(),
        ]);
    }

    private function recordedPayload(
        Attendance $attendance,
        Employee $employee,
        string $session,
        string $action,
        string $message,
        Carbon $now,
    ): array {
        $attendance->refresh();
        $this->realtime->broadcastForAttendance($attendance);

        return [
            'success' => true,
            'message' => $message,
            'session' => $session,
            'action' => $action,
            'time' => $this->timeString($now),
            'employee' => $this->employeePayload($employee),
        ];
    }

    private function errorPayload(string $message, Employee $employee): array
    {
        return [
            'success' => false,
            'message' => $message,
            'employee' => $this->employeePayload($employee),
        ];
    }

    private function employeePayload(Employee $employee): array
    {
        return [
            'id' => $employee->id,
            'first_name' => $employee->first_name,
            'middle_name' => $employee->middle_name,
            'last_name' => $employee->last_name,
            'profile_img' => $employee->profile_img,
            'position' => $employee->position,
            'office' => $employee->office ? [
                'id' => $employee->office->id,
                'name' => $employee->office->name,
            ] : null,
            'station_id' => $employee->station_id,
        ];
    }

    private function timeString(Carbon $time): string
    {
        return $time->format('H:i:s');
    }

    private function formatSuggestion(Employee $employee): array
    {
        $fullName = $employee->full_name ?: 'Employee';

        return [
            'id' => $employee->id,
            'label' => $fullName,
            'full_name' => $fullName,
            'meta' => collect([
                $employee->position,
                $employee->office?->name,
            ])->filter()->join(' - '),
            'search' => $fullName,
            'profile_img' => $employee->profile_img,
        ];
    }
}
