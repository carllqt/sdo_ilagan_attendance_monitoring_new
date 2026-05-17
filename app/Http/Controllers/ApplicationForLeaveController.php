<?php

namespace App\Http\Controllers;

use App\Models\ApplicationForLeave;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ApplicationForLeaveController extends Controller
{
    public function index(Request $request)
    {
        /** @var User|null $user */
        $user = Auth::user();
        $employee = $user?->employee()->with('station', 'office')->first();

        $leaveApplications = ApplicationForLeave::with('employee.station', 'employee.office')
            ->when($employee, function ($query) use ($employee) {
                $query->where('employee_id', $employee->id);
            })
            ->when($request->date, function ($query, $date) {
                $query->whereDate('date_of_filing', $date);
            })
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Employee/ApplicationLeave/ApplicationLeavePage', [
            'leave_applications' => $leaveApplications,
            'employee' => $employee,
            'filters' => [
                'date' => $request->date,
            ],
            'success_message' => session('success_message'),
            'error_message' => session('error_message'),
        ]);
    }

    public function store(Request $request)
    {
        /** @var User|null $user */
        $user = Auth::user();
        $employee = $user?->employee;

        $validated = $request->validate([
            'employee_name' => 'required|string|max:255',
            'office_department' => 'required|string|max:255',
            'date_of_filing' => 'required|date',
            'position' => 'required|string|max:255',
            'salary' => 'nullable|string|max:255',
            'type_of_leave' => 'required|string|max:255',
            'type_of_leave_other' => 'nullable|string|max:255',
            'leave_location' => 'nullable|string|max:255',
            'leave_location_details' => 'nullable|string|max:255',
            'sick_leave_location' => 'nullable|string|max:255',
            'illness' => 'nullable|string|max:255',
            'women_illness' => 'nullable|string|max:255',
            'study_leave_purpose' => 'nullable|string|max:255',
            'other_purpose' => 'nullable|string|max:255',
            'working_days' => 'required|numeric|min:0.5|max:365',
            'inclusive_dates' => 'required|string|max:255',
            'commutation' => 'required|in:not_requested,requested',
        ]);

        ApplicationForLeave::create([
            'employee_id' => $employee?->id,
            ...$validated,
        ]);

        return redirect()
            ->route('application-leave')
            ->with('success_message', 'Application for Leave created successfully.');
    }
}
