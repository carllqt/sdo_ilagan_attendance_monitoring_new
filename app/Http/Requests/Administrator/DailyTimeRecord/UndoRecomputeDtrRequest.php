<?php

namespace App\Http\Requests\Administrator\DailyTimeRecord;

use Illuminate\Foundation\Http\FormRequest;

class UndoRecomputeDtrRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'token' => ['required', 'string'],
        ];
    }
}
