<?php

namespace App\Data\AttendanceMonitoring;

use Carbon\CarbonInterface;

class AttendanceEmployeeData
{
    /*
    | Status for the day, checked in this order:
    |
    |   On Travel    a travel order covers the day (scans are not shown)
    |   Absent       no scans at all
    |   No Time-In   an AM Time-Out with no AM Time-In: they came, but there
    |                is no time-in to judge, so HR should check it
    |   Half Day     only PM scans (afternoon), or AM In + AM Out with no PM
    |                Time-In by 1:00 PM (morning)
    |   On Time      AM Time-In by 8:00 (or by the start, if it is earlier)
    |   On Grace     after 8:00 up to the schedule start: only later
    |                schedules have it (8:30-5:30: 8:01-8:30; 8:00-5:00: none)
    |   Late         after the schedule start, matching the tardiness records
    |
    | Times count by the minute (8:00:45 is 8:00). No schedule: 8:00 start.
    */
    public const ON_TRAVEL = 'On Travel';
    public const ON_TIME = 'On Time';
    public const ON_GRACE = 'On Grace';
    public const LATE = 'Late';
    public const HALF_DAY = 'Half Day';
    public const NO_TIME_IN = 'No Time-In';
    public const ABSENT = 'Absent';

    // Every status, by the key the page uses to filter by it (?status=late).
    public const STATUSES = [
        'on-time' => self::ON_TIME,
        'on-grace' => self::ON_GRACE,
        'late' => self::LATE,
        'half-day' => self::HALF_DAY,
        'no-time-in' => self::NO_TIME_IN,
        'on-travel' => self::ON_TRAVEL,
        'absent' => self::ABSENT,
    ];

    private const DEFAULT_START = '08:00';
    private const ON_TIME_UNTIL = '08:00';
    // The afternoon starts at 1:00 PM (as in the tardiness records): someone
    // who timed out at lunch and has not timed in by then is on a half day.
    private const PM_START = '13:00';

    /**
     * @param  CarbonInterface  $at  the time the status is for: now for
     *                                today, the end of the day for a past day
     */
    public static function fromRow(object $employee, CarbonInterface $at): array
    {
        $onTravel = (bool) ($employee->on_travel ?? false);

        return [
            'id' => $employee->id,
            'employee_id' => $employee->id,
            'first_name' => $employee->first_name,
            'middle_name' => $employee->middle_name,
            'last_name' => $employee->last_name,
            'profile_img' => $employee->profile_img,
            'position' => $employee->position,
            'station' => [
                'id' => $employee->station_id,
                'name' => $employee->station_name,
                'code' => $employee->station_code,
            ],
            'am_in' => $employee->am_in,
            'am_out' => $employee->am_out,
            'pm_in' => $employee->pm_in,
            'pm_out' => $employee->pm_out,
            'on_travel' => $onTravel,
            'status' => $onTravel ? self::ON_TRAVEL : self::status(
                $employee->am_in,
                $employee->am_out,
                $employee->pm_in,
                $employee->pm_out,
                $employee->schedule_time_in ?? null,
                $at->format('H:i'),
            ),
        ];
    }

    public static function status(
        ?string $amIn,
        ?string $amOut,
        ?string $pmIn,
        ?string $pmOut,
        ?string $scheduleStart,
        string $now,
    ): string {
        if (! $amIn && ! $amOut && ! $pmIn && ! $pmOut) {
            return self::ABSENT;
        }

        if (! $amIn && $amOut) {
            return self::NO_TIME_IN;
        }

        // Afternoon only.
        if (! $amIn) {
            return self::HALF_DAY;
        }

        // Morning only: timed out at lunch, not back by the afternoon start.
        if ($amOut && ! $pmIn && ! $pmOut && self::minutes($now) > self::minutes(self::PM_START)) {
            return self::HALF_DAY;
        }

        return self::arrival($amIn, $scheduleStart);
    }

    private static function arrival(string $amIn, ?string $scheduleStart): string
    {
        $timeIn = self::minutes($amIn);
        $start = self::minutes($scheduleStart ?: self::DEFAULT_START);
        $onTimeUntil = min(self::minutes(self::ON_TIME_UNTIL), $start);

        return match (true) {
            $timeIn <= $onTimeUntil => self::ON_TIME,
            $timeIn <= $start => self::ON_GRACE,
            default => self::LATE,
        };
    }

    private static function minutes(string $time): int
    {
        [$hour, $minute] = array_map('intval', explode(':', $time) + [0, 0]);

        return $hour * 60 + $minute;
    }
}
