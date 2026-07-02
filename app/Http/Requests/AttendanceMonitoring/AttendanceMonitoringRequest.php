<?php

namespace App\Http\Requests\AttendanceMonitoring;

use Illuminate\Foundation\Http\FormRequest;

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
        ];
    }
}
