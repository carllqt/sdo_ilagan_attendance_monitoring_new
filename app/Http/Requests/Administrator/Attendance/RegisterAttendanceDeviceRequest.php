<?php

namespace App\Http\Requests\Administrator\Attendance;

use Illuminate\Foundation\Http\FormRequest;

class RegisterAttendanceDeviceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['nullable', 'string', 'max:255'],
        ];
    }
}
