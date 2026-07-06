<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDocumentRequest;
use App\Mail\DocumentRequestSubmitted;
use App\Models\LocatorSlipRequest;
use App\Models\TravelOrderRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;

class DocumentRequestController extends Controller
{
    public function store(StoreDocumentRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($data['request_type'] === 'locator_slip') {
            $documentRequest = LocatorSlipRequest::create([
                'employee_name' => $data['employee_name'],
                'email' => $data['email'],
                'position' => $data['position'],
                'station_id' => $data['station_id'],
                'purpose_of_travel' => $data['purpose_of_travel'],
                'destination' => $data['destination'],
                'travel_datetime' => $data['travel_datetime'],
                'travel_type' => $data['travel_type'],
            ]);
        } else {
            $documentRequest = TravelOrderRequest::create([
                'employee_name' => $data['employee_name'],
                'email' => $data['email'],
                'position' => $data['position'],
                'station_id' => $data['station_id'],
                'purpose_of_travel' => $data['purpose_of_travel'],
                'destination' => $data['destination'],
                'host_of_activity' => $data['host_of_activity'],
                'inclusive_dates' => $data['inclusive_dates'],
                'fund_source' => $data['fund_source'],
            ]);
        }

        $documentRequest->load('station:id,name,code');

        try {
            Mail::to($documentRequest->email)->send(
                new DocumentRequestSubmitted($documentRequest, $data['request_type']),
            );
        } catch (TransportExceptionInterface $exception) {
            Log::warning('Document request email failed.', [
                'request_type' => $data['request_type'],
                'email' => $documentRequest->email,
                'error' => $exception->getMessage(),
            ]);

            return back()->with('error', 'Request submitted, but the PDF email could not be sent. Please check the mail SSL/certificate settings.');
        }

        return back()->with('success', 'Request submitted successfully. A PDF copy has been sent to your email.');
    }
}
