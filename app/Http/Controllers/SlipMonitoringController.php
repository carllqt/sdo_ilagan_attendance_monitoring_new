<?php

namespace App\Http\Controllers;

use App\Models\ApplicationForLeave;
use App\Models\LocatorSlip;
use App\Models\TravelOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SlipMonitoringController extends Controller
{
    public function index(Request $request)
    {
        $selectedType = $request->query('type', 'locator-slip');

        if (! in_array($selectedType, ['locator-slip', 'travel-order', 'application-leave'], true)) {
            $selectedType = 'locator-slip';
        }

        $props = [
            'selectedType' => $selectedType,
            'filters' => [
                'date' => $request->date,
            ],
        ];

        if ($selectedType === 'locator-slip') {
            $props['locator_slips'] = LocatorSlip::with('employee.station')
                ->when($request->date, function ($query, $date) {
                    $query->whereDate('travel_datetime', $date);
                })
                ->latest()
                ->paginate(10)
                ->withQueryString();
        }

        if ($selectedType === 'travel-order') {
            $props['travel_orders'] = TravelOrder::with('employee.station')
                ->latest()
                ->paginate(10)
                ->withQueryString();
        }

        if ($selectedType === 'application-leave') {
            $props['leave_applications'] = ApplicationForLeave::with('employee.station', 'employee.office')
                ->when($request->date, function ($query, $date) {
                    $query->whereDate('date_of_filing', $date);
                })
                ->orderByDesc('id')
                ->paginate(10)
                ->withQueryString();
        }

        return Inertia::render('Admin/SlipMonitoring/Index', $props);
    }
}
