<?php

namespace App\Http\Controllers;

use App\Models\TravelOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TravelOrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
   
    public function index()
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login');
        }

        $employee = $user->employee()->with('station')->first();

        if (!$employee) {
            abort(404, 'Employee record not found for this user.');
        }

        $travel_orders = TravelOrder::with('employee.station')
            ->where('employee_id', $employee->id)
            ->latest()
            ->get();

        return Inertia::render('Employee/TravelOrder/TravelOrderPage', [
            'travel_orders' => $travel_orders,
            'employee' => $employee,
            'success_message' => session('success_message'),
            'error_message' => session('error_message'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login');
        }

        $validated = $request->validate([
            'employee_name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'permanent_station' => 'required|string|max:255',
            'purpose_of_travel' => 'required|string|max:255',
            'host_of_activity' => 'nullable|string|max:255',
            'inclusive_dates' => 'required|date',
            'destination' => 'required|string|max:255',
            'fund_source' => 'nullable|string|max:255',
        ]);

        $employee = $user->employee;

        if (!$employee) {
            abort(404, 'Employee record not found for this user.');
        }

        TravelOrder::create([
            'employee_id' => $employee->id,
            ...$validated
        ]);

        return redirect()
            ->route('travelorder')
            ->with('success_message', 'Travel Order created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(TravelOrder $travelOrder)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(TravelOrder $travelOrder)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TravelOrder $travelOrder)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TravelOrder $travelOrder)
    {
        //
    }
}
