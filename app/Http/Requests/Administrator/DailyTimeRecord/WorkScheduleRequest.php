<?php

namespace App\Http\Requests\Administrator\DailyTimeRecord;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class WorkScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'work_type_id' => ['required', Rule::exists('work_types', 'id')],
            'name' => ['required', 'string', 'max:255'],
            'time_in' => ['required', 'date_format:H:i'],
            'time_out' => ['required', 'date_format:H:i'],
        ];
    }
}
