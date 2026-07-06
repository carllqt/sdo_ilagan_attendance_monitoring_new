<?php

namespace App\Http\Requests\Administrator\TravelLocatorManagement;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TravelLocatorManagementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'locator_search' => ['nullable', 'string', 'max:255'],
            'locator_page' => ['nullable', 'integer', 'min:1'],
            'travel_search' => ['nullable', 'string', 'max:255'],
            'travel_page' => ['nullable', 'integer', 'min:1'],
            'search' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', Rule::in(['locator_slip', 'travel_order'])],
        ];
    }
}
