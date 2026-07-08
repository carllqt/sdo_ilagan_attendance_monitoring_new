<?php

namespace App\Http\Requests\Administrator\EmployeeManagement;

class UpdateEmployeeRequest extends StoreEmployeeRequest
{
    public function rules(): array
    {
        return [
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'extension_name' => 'nullable|string|max:50',
            'last_name' => 'required|string|max:255',
            'profile_img' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'position' => 'required|string|max:255',
            'office_id' => 'nullable|exists:offices,id',
            'work_schedule_id' => 'required|exists:work_schedules,id',
            'station_id' => 'required|exists:stations,id',
            'active_status' => 'required|boolean',
        ];
    }
}
