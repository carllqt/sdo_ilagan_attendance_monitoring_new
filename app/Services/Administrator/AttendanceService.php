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
    private const PM_SESSION_START_MINUTES = 12 * 60 + 20;
    private const SCAN_COOLDOWN_MINUTES = 15;
    private const ATTENDANCE_CHOICES = [
        'AM Time-In',
        'AM Time-Out',
        'PM Time-In',
        'PM Time-Out',
    ];
    private const ATTENDANCE_LOGS = [
        'AM Time-In' => ['relation' => 'am', 'column' => 'am_time_in', 'session' => 'AM', 'action' => 'time-in'],
        'AM Time-Out' => ['relation' => 'am', 'column' => 'am_time_out', 'session' => 'AM', 'action' => 'time-out'],
        'PM Time-In' => ['relation' => 'pm', 'column' => 'pm_time_in', 'session' => 'PM', 'action' => 'time-in'],
        'PM Time-Out' => ['relation' => 'pm', 'column' => 'pm_time_out', 'session' => 'PM', 'action' => 'time-out'],
    ];

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
        $choice = (string) $request->input('choice', '');
        $cooldown = $this->scanCooldownPayload($employee, $now);

        if ($cooldown) {
            return $cooldown;
        }

        if (in_array($choice, self::ATTENDANCE_CHOICES, true)) {
            if ($choice === 'PM Time-In') {
                $prompt = $this->missingAmOutPrompt($employee, $now);

                if ($prompt) {
                    return $prompt;
                }
            }

            return $this->recordChoiceForEmployee($employee, $choice, $now);
        }

        return DB::transaction(function () use ($employee, $now) {
            $attendance = $this->attendanceForToday((int) $employee->id, $now);
            $attendance->load(['am', 'pm', 'employee.office']);

            $am = $attendance->am;
            $isPmSession = $this->minutesSinceMidnight($now) >= self::PM_SESSION_START_MINUTES;
            $forcePm = $isPmSession
                && (! $am || ! $am->am_time_in || ($am->am_time_in && $am->am_time_out));

            $pm = $attendance->pm;

            if ($isPmSession && (! $am || ! $am->am_time_out) && ! $pm?->pm_time_in) {
                return $this->missingAmOutPromptPayload($employee);
            }

            if (! $isPmSession && ! $forcePm) {
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

        return $this->recordChoiceForEmployee($employee, $choice, $now);
    }

    private function recordChoiceForEmployee(Employee $employee, string $choice, Carbon $now): array
    {
        return DB::transaction(function () use ($choice, $employee, $now) {
            $attendance = $this->attendanceForToday((int) $employee->id, $now);
            $attendance->load(['am', 'pm', 'employee.office']);
            $log = self::ATTENDANCE_LOGS[$choice] ?? null;

            if (! $log) {
                return $this->errorPayload('Invalid attendance choice.', $employee);
            }

            $attendanceLog = $attendance->{$log['relation']};

            if ($attendanceLog?->{$log['column']}) {
                return $this->errorPayload("{$choice} already recorded.", $employee);
            }

            if (! $attendanceLog) {
                $attendance->{$log['relation']}()->create([
                    $log['column'] => $this->timeString($now),
                ]);
            } else {
                $attendanceLog->update([
                    $log['column'] => $this->timeString($now),
                ]);
            }

            return $this->recordedPayload(
                $attendance,
                $employee,
                $log['session'],
                $log['action'],
                "{$choice} recorded",
                $now,
            );
        });
    }

    private function missingAmOutPrompt(Employee $employee, Carbon $now): ?array
    {
        if ($this->minutesSinceMidnight($now) < self::PM_SESSION_START_MINUTES) {
            return null;
        }

        return DB::transaction(function () use ($employee, $now) {
            $attendance = $this->attendanceForToday((int) $employee->id, $now);
            $attendance->load(['am', 'pm', 'employee.office']);
            $am = $attendance->am;
            $pm = $attendance->pm;

            // Once PM Time-In exists, a missing AM Time-Out is intentional.
            // Never offer to back-fill it on later scans.
            if ($pm?->pm_time_in || ($am && $am->am_time_out)) {
                return null;
            }

            return $this->missingAmOutPromptPayload($employee);
        });
    }

    private function missingAmOutPromptPayload(Employee $employee): array
    {
        return $this->attendancePayload($employee, [
            'success' => true,
            'prompt' => true,
            'prompt_type' => 'AM',
            'message' => 'AM Time-Out is still not recorded. Do you want to record AM Time-Out or PM Time-In?',
            'options' => ['AM Time-Out', 'PM Time-In'],
        ]);
    }

    private function scanCooldownPayload(Employee $employee, Carbon $now): ?array
    {
        $attendance = Attendance::query()
            ->with(['am', 'pm'])
            ->where('employee_id', $employee->id)
            ->whereDate('date', $now->toDateString())
            ->first();

        if (! $attendance) {
            return null;
        }

        $recordedTimes = collect([
            ['label' => 'AM Time-In', 'time' => $attendance->am?->am_time_in],
            ['label' => 'AM Time-Out', 'time' => $attendance->am?->am_time_out],
            ['label' => 'PM Time-In', 'time' => $attendance->pm?->pm_time_in],
            ['label' => 'PM Time-Out', 'time' => $attendance->pm?->pm_time_out],
        ])->filter(fn (array $record) => filled($record['time']));

        if ($recordedTimes->isEmpty()) {
            return null;
        }

        $lastRecordedAt = $recordedTimes
            ->map(fn (array $record) => [
                ...$record,
                'recorded_at' => Carbon::parse(
                    "{$attendance->date} {$record['time']}",
                    $now->timezone,
                ),
            ])
            ->sortByDesc('recorded_at')
            ->first();
        $cooldownSeconds = self::SCAN_COOLDOWN_MINUTES * 60;
        $elapsedSeconds = (int) $lastRecordedAt['recorded_at']->diffInSeconds($now);

        if ($elapsedSeconds >= $cooldownSeconds) {
            return null;
        }

        $remainingSeconds = $cooldownSeconds - $elapsedSeconds;

        return $this->attendancePayload($employee, [
            'success' => false,
            'cooldown' => true,
            'message' => 'Attendance was already recorded recently.',
            'last_recorded_action' => $lastRecordedAt['label'],
            'last_recorded_at' => $this->timeString($lastRecordedAt['recorded_at']),
            'remaining_seconds' => $remainingSeconds,
            'remaining_minutes' => (int) ceil($remainingSeconds / 60),
        ]);
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

        return $this->attendancePayload($employee, [
            'success' => true,
            'message' => $message,
            'session' => $session,
            'action' => $action,
            'time' => $this->timeString($now),
        ]);
    }

    private function errorPayload(string $message, Employee $employee): array
    {
        return $this->attendancePayload($employee, [
            'success' => false,
            'message' => $message,
        ]);
    }

    private function attendancePayload(Employee $employee, array $payload): array
    {
        return [
            ...$payload,
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

    private function minutesSinceMidnight(Carbon $time): int
    {
        return $time->hour * 60 + $time->minute;
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