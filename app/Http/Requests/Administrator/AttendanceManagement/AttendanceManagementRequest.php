<?php

namespace App\Http\Requests\Administrator\AttendanceManagement;

use Illuminate\Foundation\Http\FormRequest;

class AttendanceManagementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'office' => ['nullable'],
            'search' => ['nullable', 'string', 'max:255'],
            'year' => ['nullable', 'integer', 'between:2000,2100'],
            'month' => ['nullable'],
            'day' => ['nullable', 'integer', 'between:1,31'],
            'limit' => ['nullable', 'integer', 'in:10,25,50,100'],
            'page' => ['nullable', 'integer', 'min:1'],
            'travel_order_page' => ['nullable', 'integer', 'min:1'],
            'modal' => ['nullable', 'string', 'in:edit'],
            'attendance_id' => ['nullable', 'integer', 'exists:attendances,id'],
            'name' => ['nullable', 'string', 'max:255'],
            'travel_order_office' => ['nullable'],
            'travel_order_search' => ['nullable', 'string', 'max:255'],
            'travel_order_year' => ['nullable', 'integer', 'between:2000,2100'],
            'travel_order_month' => ['nullable'],
            'travel_order_day' => ['nullable', 'integer', 'between:1,31'],
            'travel_order_limit' => ['nullable', 'integer', 'in:10,25,50,100'],
        ];
    }
}
