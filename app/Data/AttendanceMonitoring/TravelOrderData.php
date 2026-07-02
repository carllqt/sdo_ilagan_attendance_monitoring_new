<?php

namespace App\Data\AttendanceMonitoring;

use App\Models\EmployeeTravelOrder;

class TravelOrderData
{
    public static function fromModel(EmployeeTravelOrder $travelOrder): array
    {
        $employee = $travelOrder->employee;

        return [
            'id' => $travelOrder->id,
            'employee' => $employee ? [
                'id' => $employee->id,
                'first_name' => $employee->first_name,
                'middle_name' => $employee->middle_name,
                'last_name' => $employee->last_name,
                'profile_img' => $employee->profile_img,
                'position' => $employee->position,
            ] : null,
            'start_date' => optional($travelOrder->start_date)->toDateString(),
            'end_date' => optional($travelOrder->end_date)->toDateString(),
        ];
    }
}
