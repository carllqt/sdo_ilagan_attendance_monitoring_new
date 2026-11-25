<?php

namespace App\Http\Requests\AttendanceMonitoring;

use App\Data\AttendanceMonitoring\AttendanceEmployeeData;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AttendanceMonitoringRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'station_id' => ['nullable', 'integer'],
            'station_code' => ['nullable', 'string', 'max:50'],
            'station_name' => ['nullable', 'string', 'max:255'],
            'page' => ['nullable', 'integer', 'min:1'],
            'limit' => ['nullable', 'integer'],
            'status' => ['nullable', Rule::in(array_keys(AttendanceEmployeeData::STATUSES))],
        ];
    }
}
