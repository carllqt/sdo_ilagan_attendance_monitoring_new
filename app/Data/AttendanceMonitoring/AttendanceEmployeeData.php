<?php

namespace App\Data\AttendanceMonitoring;

class AttendanceEmployeeData
{
    /*
    | Status from the first time-in of the day (AM, or PM for someone who
    | came in the afternoon), against the employee's work schedule start:
    |
    |   On Time   by 8:00 (or by the start, if it is earlier)
    |   On Grace  after 8:00 up to the start: only later schedules have it
    |             (8:30-5:30: 8:01-8:30; 8:00-5:00: none)
    |   Late      after the start
    |
    | Late matches the tardiness records, which also count from the start.
    | Times count by the minute (8:00:45 is 8:00). No schedule: 8:00 start.
    | On Travel is set on the page.
    */
    public const ON_TIME = 'On Time';
    public const ON_GRACE = 'On Grace';
    public const LATE = 'Late';
    public const ABSENT = 'Absent';

    private const DEFAULT_START = '08:00';
    private const ON_TIME_UNTIL = '08:00';

    public static function fromRow(object $employee): array
    {
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
            'status' => self::status(
                $employee->am_in ?: $employee->pm_in,
                $employee->schedule_time_in ?? null,
            ),
        ];
    }

    public static function status(?string $firstTimeIn, ?string $scheduleStart = null): string
    {
        if (! $firstTimeIn) {
            return self::ABSENT;
        }

        $timeIn = self::minutes($firstTimeIn);
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
