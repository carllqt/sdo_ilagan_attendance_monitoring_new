<?php

namespace App\Data\AttendanceMonitoring;

class RecentAttendanceLogData
{
    public static function fromRow(object $row): array
    {
        return [
            'id' => "{$row->employee_id}-{$row->label}-{$row->time}",
            'employee_id' => $row->employee_id,
            'first_name' => $row->first_name,
            'middle_name' => $row->middle_name,
            'last_name' => $row->last_name,
            'profile_img' => $row->profile_img,
            'position' => $row->position,
            'label' => $row->label,
            'time' => $row->time,
        ];
    }
}
