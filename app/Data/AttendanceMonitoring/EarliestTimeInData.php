<?php

namespace App\Data\AttendanceMonitoring;

class EarliestTimeInData
{
    public static function fromRow(object $row): array
    {
        return [
            'id' => $row->id,
            'first_name' => $row->first_name,
            'middle_name' => $row->middle_name,
            'last_name' => $row->last_name,
            'profile_img' => $row->profile_img,
            'position' => $row->position,
            'station' => $row->station_name,
            'am_in' => $row->am_time_in,
        ];
    }
}
