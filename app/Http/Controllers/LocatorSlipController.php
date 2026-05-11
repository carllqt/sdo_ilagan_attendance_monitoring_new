<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\User;
use App\Models\LocatorSlip;
use Carbon\Carbon;

class LocatorSlipController extends Controller
{
    public function index()
    {
        /** @var User|null $user */
        $user = Auth::user();
        $employee = $user?->employee()->with('station')->first();
        $locator_slips = LocatorSlip::with('employee.station')
            ->when($employee, fn ($query) => $query->where('employee_id', $employee->id))
            ->when(!$employee, fn ($query) => $query->whereNull('employee_id'))
            ->latest()
            ->get();

        return Inertia::render('Employee/LocatorSlip/LocatorSlipPage', [
            'locator_slips' => $locator_slips,
            'employee' => $employee,
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
            'position' => 'required|string|max:255',
            'permanent_station' => 'required|string|max:255',
            'purpose_of_travel' => 'required|string|max:255',
            'destination' => 'required|string|max:255',
            'travel_type' => 'required|in:official_business,official_time',
            'travel_datetime' => 'required|date',
        ]);

        LocatorSlip::create([
            'employee_id' => $employee?->id,
            'employee_name' => $validated['employee_name'],
            'position' => $validated['position'],
            'permanent_station' => $validated['permanent_station'],
            'purpose_of_travel' => $validated['purpose_of_travel'],
            'destination' => $validated['destination'],
            'travel_type' => $validated['travel_type'],
            'travel_datetime' => Carbon::parse($validated['travel_datetime']),
        ]);

        return redirect()
            ->route('locator-slips')
            ->with('success_message', 'Locator Slip created successfully.');
    }
}
