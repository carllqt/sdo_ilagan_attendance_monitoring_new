<?php

namespace App\Http\Controllers;

use App\Models\LocatorSlipRequest;
use App\Models\TravelOrderRequest;
use App\Services\DocumentRequestPdfService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class DocumentPdfController extends Controller
{
    public function __construct(
        private readonly DocumentRequestPdfService $pdf,
    ) {}

    public function store(Request $request, string $type): Response
    {
        abort_unless(in_array($type, ['locator-slip', 'travel-order'], true), 404);

        $requestType = str_replace('-', '_', $type);
        $data = $this->validatedData($request, $requestType);
        $documentRequest = $this->documentRequest($data, $requestType);

        return response($this->pdf->output($documentRequest, $requestType), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$this->pdf->filename($documentRequest, $requestType).'"',
        ]);
    }

    private function validatedData(Request $request, string $requestType): array
    {
        $commonRules = [
            'employee_name' => ['nullable', 'string', 'max:255'],
            'position' => ['nullable', 'string', 'max:255'],
            'permanent_station' => ['nullable', 'string', 'max:255'],
            'purpose_of_travel' => ['nullable', 'string', 'max:2000'],
            'destination' => ['nullable', 'string', 'max:255'],
        ];

        if ($requestType === 'locator_slip') {
            return $request->validate([
                ...$commonRules,
                'travel_datetime' => ['nullable', 'date'],
                'travel_type' => ['nullable', Rule::in(['official_business', 'official_time'])],
            ]);
        }

        return $request->validate([
            ...$commonRules,
            'host_of_activity' => ['nullable', 'string', 'max:255'],
            'inclusive_dates' => ['nullable', 'date'],
            'fund_source' => ['nullable', 'string', 'max:255'],
        ]);
    }

    private function documentRequest(array $data, string $requestType): LocatorSlipRequest|TravelOrderRequest
    {
        if ($requestType === 'locator_slip') {
            return (new LocatorSlipRequest())->forceFill([
                'employee_name' => $data['employee_name'] ?? '',
                'position' => $data['position'] ?? '',
                'permanent_station' => $data['permanent_station'] ?? '',
                'purpose_of_travel' => $data['purpose_of_travel'] ?? '',
                'destination' => $data['destination'] ?? '',
                'travel_datetime' => $data['travel_datetime'] ?? null,
                'travel_type' => $data['travel_type'] ?? null,
            ]);
        }

        return (new TravelOrderRequest())->forceFill([
            'employee_name' => $data['employee_name'] ?? '',
            'position' => $data['position'] ?? '',
            'permanent_station' => $data['permanent_station'] ?? '',
            'purpose_of_travel' => $data['purpose_of_travel'] ?? '',
            'destination' => $data['destination'] ?? '',
            'host_of_activity' => $data['host_of_activity'] ?? '',
            'inclusive_dates' => $data['inclusive_dates'] ?? null,
            'fund_source' => $data['fund_source'] ?? '',
        ]);
    }
}
