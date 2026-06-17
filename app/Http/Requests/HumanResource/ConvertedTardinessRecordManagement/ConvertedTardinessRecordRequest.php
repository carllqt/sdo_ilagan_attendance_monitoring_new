<?php

namespace App\Http\Requests\HumanResource\ConvertedTardinessRecordManagement;

use Illuminate\Foundation\Http\FormRequest;

class ConvertedTardinessRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'page' => ['nullable', 'integer', 'min:1'],
            'limit' => ['nullable', 'integer', 'in:10,25,50,100'],
            'batch_page' => ['nullable', 'integer', 'min:1'],
            'batch_limit' => ['nullable', 'integer', 'in:5'],
            'batch_id' => ['nullable', 'integer', 'exists:hr_tardiness_batches,id'],
            'year' => ['nullable', 'integer', 'between:2000,2100'],
            'search' => ['nullable', 'string', 'max:255'],
        ];
    }
}
