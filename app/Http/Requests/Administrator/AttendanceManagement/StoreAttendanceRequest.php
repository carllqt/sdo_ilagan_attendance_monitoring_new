<?php

namespace App\Http\Requests\Administrator\AttendanceManagement;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        // Store and compare dates as Y-m-d, the format of attendances.date.
        if ($this->filled('date') && strtotime((string) $this->input('date')) !== false) {
            $this->merge([
                'date' => Carbon::parse((string) $this->input('date'))->toDateString(),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
            'date' => [
                'required',
                'date',
                // One attendance per employee per day (unique index too).
                Rule::unique('attendances', 'date')
                    ->where('employee_id', (int) $this->input('employee_id')),
            ],
            'am_time_in' => ['nullable', 'date_format:H:i'],
            'am_time_out' => ['nullable', 'date_format:H:i'],
            'pm_time_in' => ['nullable', 'date_format:H:i'],
            'pm_time_out' => ['nullable', 'date_format:H:i'],
        ];
    }

    public function messages(): array
    {
        return [
            'date.unique' => 'This employee already has an attendance record for this date. Edit that record instead.',
        ];
    }
}
