<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'request_type' => ['required', Rule::in(['locator_slip', 'travel_order'])],
            'employee_id' => ['required', 'string', 'max:50'],
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'extension_name' => ['nullable', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:255'],
            'position' => ['required', 'string', 'max:255'],
            'station_id' => ['required', 'integer', 'exists:stations,id'],
            'purpose_of_travel' => ['required', 'string', 'max:2000'],
            'destination' => ['required', 'string', 'max:255'],
            'travel_datetime' => [
                Rule::requiredIf($this->input('request_type') === 'locator_slip'),
                'nullable',
                'date',
            ],
            'travel_type' => [
                Rule::requiredIf($this->input('request_type') === 'locator_slip'),
                'nullable',
                Rule::in(['official_business', 'official_time']),
            ],
            'host_of_activity' => [
                Rule::requiredIf($this->input('request_type') === 'travel_order'),
                'nullable',
                'string',
                'max:255',
            ],
            'inclusive_dates' => [
                Rule::requiredIf($this->input('request_type') === 'travel_order'),
                'nullable',
                'date',
            ],
            'fund_source' => [
                Rule::requiredIf($this->input('request_type') === 'travel_order'),
                'nullable',
                'string',
                'max:255',
            ],
        ];
    }

    public function attributes(): array
    {
        return [
            'employee_id' => 'employee id',
            'first_name' => 'first name',
            'middle_name' => 'middle name',
            'last_name' => 'last name',
            'extension_name' => 'extension name',
            'email' => 'email address',
            'position' => 'position / designation',
            'station_id' => 'permanent station',
            'purpose_of_travel' => 'purpose of travel',
            'destination' => 'destination',
            'travel_datetime' => 'date and time',
            'travel_type' => 'travel type',
            'host_of_activity' => 'host of activity',
            'inclusive_dates' => 'inclusive dates',
            'fund_source' => 'fund source',
        ];
    }
}
