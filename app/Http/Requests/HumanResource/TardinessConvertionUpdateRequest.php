<?php

namespace App\Http\Requests\HumanResource;

use Illuminate\Foundation\Http\FormRequest;

class TardinessConvertionUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'equivalent_days' => ['required', 'numeric', 'min:0'],
        ];
    }
}
