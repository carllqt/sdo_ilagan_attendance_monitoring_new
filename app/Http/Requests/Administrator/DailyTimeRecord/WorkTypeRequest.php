<?php

namespace App\Http\Requests\Administrator\DailyTimeRecord;

use Illuminate\Foundation\Http\FormRequest;

class WorkTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
        ];
    }
}
