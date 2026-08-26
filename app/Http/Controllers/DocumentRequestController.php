<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDocumentRequest;
use App\Models\LocatorSlipRequest;
use App\Models\TravelOrderRequest;
use Illuminate\Http\RedirectResponse;

class DocumentRequestController extends Controller
{
    public function store(StoreDocumentRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $employeeName = $this->composeEmployeeName($data);

        if ($data['request_type'] === 'locator_slip') {
            $documentRequest = LocatorSlipRequest::create([
                'employee_id' => $data['employee_id'],
                'first_name' => $data['first_name'],
                'middle_name' => $data['middle_name'] ?? null,
                'last_name' => $data['last_name'],
                'extension_name' => $data['extension_name'] ?? null,
                'employee_name' => $employeeName,
                'position' => $data['position'],
                'station_id' => $data['station_id'],
                'purpose_of_travel' => $data['purpose_of_travel'],
                'destination' => $data['destination'],
                'travel_datetime' => $data['travel_datetime'],
                'travel_type' => $data['travel_type'],
            ]);
        } else {
            $documentRequest = TravelOrderRequest::create([
                'employee_id' => $data['employee_id'],
                'first_name' => $data['first_name'],
                'middle_name' => $data['middle_name'] ?? null,
                'last_name' => $data['last_name'],
                'extension_name' => $data['extension_name'] ?? null,
                'employee_name' => $employeeName,
                'position' => $data['position'],
                'station_id' => $data['station_id'],
                'purpose_of_travel' => $data['purpose_of_travel'],
                'destination' => $data['destination'],
                'host_of_activity' => $data['host_of_activity'],
                'inclusive_dates' => $data['inclusive_dates'],
                'fund_source' => $data['fund_source'],
            ]);
        }

        return back()->with('success', 'Request submitted successfully.');
    }

    private function composeEmployeeName(array $data): string
    {
        return collect([
            $data['first_name'] ?? null,
            $data['middle_name'] ?? null,
            $data['last_name'] ?? null,
            $data['extension_name'] ?? null,
        ])
            ->filter(fn ($value) => filled($value))
            ->implode(' ');
    }
}
