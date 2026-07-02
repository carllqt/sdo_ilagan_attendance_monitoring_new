<?php

namespace App\Data\AttendanceMonitoring;

use Carbon\Carbon;

class AttendanceEmployeeData
{
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
            'status' => self::statusFromAmIn($employee->am_in),
        ];
    }

    private static function statusFromAmIn(?string $amTimeIn): string
    {
        if (! $amTimeIn) {
            return 'Absent';
        }

        if (Carbon::parse($amTimeIn)->format('H:i:s') > '08:00:00') {
            return 'Late';
        }

        return 'Present';
    }
}
