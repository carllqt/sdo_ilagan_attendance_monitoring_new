<?php

namespace App\Http\Requests\Administrator\TravelLocatorManagement;

use Illuminate\Foundation\Http\FormRequest;

class ApproveTravelOrderRequest extends FormRequest
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
