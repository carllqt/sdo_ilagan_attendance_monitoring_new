<?php

namespace App\Services\Administrator;

use App\Data\Administrator\Attendance\AttendanceFilter;
use App\Models\Administrator\Attendance;
use App\Models\Administrator\Employee;
use App\Models\Administrator\Station;
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
    // Earliest time each session's Time-Out can be recorded (minutes since
    // midnight). This is the only place to change them: the attendance page
    // receives them through pageData() (attendanceRules) to lock its button.
    private const TIME_OUT_OPENS_AT = [
        'AM' => 11 * 60,
        'PM' => 13 * 60 + 30,
    ];
    // Earliest time the PM session can be used (PM Time-In, and switching the
    // attendance page to PM). Also sent to the page through attendanceRules.
    private const PM_SESSION_OPENS_AT = 12 * 60;
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
            'attendanceRules' => [
                'timeOutOpensAt' => collect(self::TIME_OUT_OPENS_AT)
                    ->map(fn (int $minutes) => [
                        'minutes' => $minutes,
                        'label' => $this->minutesLabel($minutes),
                    ])
                    ->all(),
                'pmSessionOpensAt' => [
                    'minutes' => self::PM_SESSION_OPENS_AT,
                    'label' => $this->minutesLabel(self::PM_SESSION_OPENS_AT),
                ],
                // The page follows the server's clock, not the PC's.
                'serverTime' => now()->getTimestampMs(),
            ],
            'attendanceAccess' => [
                'station' => [
                    'id' => $user?->employee?->station?->id,
                    'name' => $user?->employee?->station?->name,
                ],
                'admin' => [
                    'id' => $user?->employee?->id,
                    'name' => $user?->employee?->full_name,
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
            $locked = $this->lockedChoicePayload($employee, $choice, $now);

            if ($locked) {
                return $locked;
            }

            $prompt = match ($choice) {
                'PM Time-In' => $this->missingAmOutPrompt($employee, $now),
                'AM Time-Out', 'PM Time-Out' => $this->missingTimeInPrompt($employee, $choice, $now),
                default => null,
            };

            if ($prompt) {
                return $prompt;
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

            if ($isPmSession && $am?->am_time_in && ! $am->am_time_out && ! $pm?->pm_time_in) {
                return $this->missingAmOutPromptPayload($employee);
            }

            if (! $isPmSession && ! $forcePm) {
                if (! $am) {
                    $attendance->am()->create(['am_time_in' => $this->timeString($now)]);
                    return $this->recordedPayload($attendance, $employee, 'AM', 'time-in', 'AM time-in recorded', $now);
                }

                if ($am->am_time_in && ! $am->am_time_out) {
                    $locked = $this->lockedChoicePayload($employee, 'AM Time-Out', $now);

                    if ($locked) {
                        return $locked;
                    }

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
                $locked = $this->lockedChoicePayload($employee, 'PM Time-Out', $now);

                if ($locked) {
                    return $locked;
                }

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
        // Also covers prompt answers sent to /attendance/choice.
        $locked = $this->lockedChoicePayload($employee, $choice, $now);

        if ($locked) {
            return $locked;
        }

        return DB::transaction(function () use ($choice, $employee, $now) {
            $attendance = $this->attendanceForToday((int) $employee->id, $now);
            $attendance->load(['am', 'pm', 'employee.office']);
            $log = self::ATTENDANCE_LOGS[$choice] ?? null;

            if (! $log) {
                return $this->errorPayload('Invalid attendance choice.', $employee);
            }

            $attendanceLog = $attendance->{$log['relation']};

            if ($attendanceLog?->{$log['column']}) {
                return $this->alreadyRecordedPayload(
                    $employee,
                    $choice,
                    (string) $attendanceLog->{$log['column']},
                );
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
            // Never offer to back-fill it on later scans. With no AM Time-In
            // at all (half day), there is nothing to time out from.
            if ($pm?->pm_time_in || ! $am?->am_time_in || $am->am_time_out) {
                return null;
            }

            return $this->missingAmOutPromptPayload($employee);
        });
    }

    /**
     * The selected action defaults from the clock (e.g. Time-Out after
     * 11:00), so a late arrival can scan while Time-Out is selected. If that
     * session has no Time-In yet, ask instead of guessing.
     */
    private function missingTimeInPrompt(Employee $employee, string $choice, Carbon $now): ?array
    {
        $attendance = Attendance::query()
            ->with(['am', 'pm'])
            ->where('employee_id', $employee->id)
            ->whereDate('date', $now->toDateString())
            ->first();
        $am = $attendance?->am;
        $pm = $attendance?->pm;

        if ($choice === 'AM Time-Out') {
            // Has a Time-In, or Time-Out is already recorded (handled later).
            if ($am?->am_time_in || $am?->am_time_out) {
                return null;
            }

            return $this->missingTimeInPromptPayload($employee, 'AM');
        }

        if ($pm?->pm_time_in || $pm?->pm_time_out) {
            return null;
        }

        // AM Time-In with no lunch scans: leaving for the day, no question.
        if ($am?->am_time_in && ! $am->am_time_out) {
            return null;
        }

        return $this->missingTimeInPromptPayload($employee, 'PM');
    }

    /**
     * Refuse an action before its opening time, however the request arrives
     * (page selection, prompt answer or automatic mode):
     * AM Time-Out from 11:00 AM, PM Time-In from 12:00 PM, PM Time-Out from
     * 1:30 PM. AM Time-In is always open.
     */
    private function lockedChoicePayload(Employee $employee, string $choice, Carbon $now): ?array
    {
        $log = self::ATTENDANCE_LOGS[$choice] ?? null;

        if (! $log) {
            return null;
        }

        $opensAt = match (true) {
            $log['action'] === 'time-out' => self::TIME_OUT_OPENS_AT[$log['session']],
            $log['session'] === 'PM' => self::PM_SESSION_OPENS_AT,
            default => null,
        };

        if ($opensAt === null || $this->minutesSinceMidnight($now) >= $opensAt) {
            return null;
        }

        return $this->attendancePayload($employee, [
            'success' => false,
            'locked' => true,
            'message' => "{$choice} opens at {$this->minutesLabel($opensAt)}.",
        ]);
    }

    /** 660 → "11:00 AM", 810 → "1:30 PM". */
    private function minutesLabel(int $minutes): string
    {
        return now()->startOfDay()->addMinutes($minutes)->format('g:i A');
    }

    private function missingTimeInPromptPayload(Employee $employee, string $session): array
    {
        return $this->attendancePayload($employee, [
            'success' => true,
            'prompt' => true,
            'prompt_type' => $session,
            'message' => "No {$session} Time-In is recorded today. Are you timing in or timing out?",
            'options' => ["{$session} Time-Out", "{$session} Time-In"],
        ]);
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

    public function stationId(?User $user): ?int
    {
        if (! $user) {
            $sdoStationId = Station::query()->where('code', 'SDO')->value('id');

            if (! $sdoStationId) {
                abort(404, 'SDO station is not configured.');
            }

            return (int) $sdoStationId;
        }

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

    private function employeeForAttendance(int $employeeId, ?int $stationId): Employee
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

        if ($stationId !== null && (int) $employee->station_id !== $stationId) {
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

    private function alreadyRecordedPayload(
        Employee $employee,
        string $choice,
        string $recordedAt,
    ): array {
        return $this->attendancePayload($employee, [
            'success' => false,
            'already_recorded' => true,
            'message' => "{$choice} is already recorded.",
            'recorded_action' => $choice,
            'recorded_at' => $recordedAt,
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
