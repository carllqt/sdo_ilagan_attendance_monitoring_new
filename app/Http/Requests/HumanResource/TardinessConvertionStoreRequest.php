<?php

namespace App\Http\Requests\HumanResource;

use Illuminate\Foundation\Http\FormRequest;

class TardinessConvertionStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'summaries' => ['required', 'array', 'min:1'],
            'summaries.*.employee_id' => ['required', 'exists:employees,id'],
            'summaries.*.start_month' => ['required', 'date'],
            'summaries.*.end_month' => ['required', 'date'],
            'summaries.*.total_tardy' => ['required', 'numeric'],
            'summaries.*.total_hours' => ['required', 'numeric'],
            'summaries.*.total_minutes' => ['required', 'numeric'],
            'summaries.*.total_equivalent' => ['required', 'numeric'],
        ];
    }
}
