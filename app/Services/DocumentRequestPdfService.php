<?php

namespace App\Services;

use App\Models\LocatorSlipRequest;
use App\Models\TravelOrderRequest;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class DocumentRequestPdfService
{
    public function output(LocatorSlipRequest|TravelOrderRequest $documentRequest, string $requestType): string
    {
        File::ensureDirectoryExists(storage_path('fonts'));

        return Pdf::loadView($this->view($requestType), [
            'request' => $documentRequest,
        ])->setPaper('a4')->output();
    }

    public function filename(LocatorSlipRequest|TravelOrderRequest $documentRequest, string $requestType): string
    {
        $name = Str::of($documentRequest->employee_name)
            ->replaceMatches('/[^A-Za-z0-9]+/', '_')
            ->trim('_')
            ->value();

        return Str::of($this->title($requestType))
            ->replace(' ', '_')
            ->append('_', $name ?: 'request', '.pdf')
            ->value();
    }

    public function title(string $requestType): string
    {
        return $requestType === 'locator_slip'
            ? 'Locator Slip'
            : 'Travel Order';
    }

    private function view(string $requestType): string
    {
        return $requestType === 'locator_slip'
            ? 'pdf.locator-slip-request'
            : 'pdf.travel-order-request';
    }
}
