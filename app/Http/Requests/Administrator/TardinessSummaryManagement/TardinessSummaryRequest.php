<?php

namespace App\Http\Requests\Administrator\TardinessSummaryManagement;

use Illuminate\Foundation\Http\FormRequest;

class TardinessSummaryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'office' => ['nullable', 'string', 'max:255'],
            'search' => ['nullable', 'string', 'max:255'],
            'year' => ['nullable', 'integer', 'between:2000,2100'],
            'limit' => ['nullable', 'integer', 'in:10,25,50,100'],
            'page' => ['nullable', 'integer', 'min:1'],
            'verification_page' => ['nullable', 'integer', 'min:1'],
            'verification_station' => ['nullable', 'string', 'max:255'],
        ];
    }
}
