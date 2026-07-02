<?php

namespace App\Http\Requests\Administrator\Attendance;

use Illuminate\Foundation\Http\FormRequest;

class UnlockAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
        ];
    }
}
