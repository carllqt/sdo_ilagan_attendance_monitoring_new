<?php

namespace App\Http\Controllers\HumanResource;

use App\Http\Controllers\Controller;
use App\Models\HumanResource\HrTardinessBatch;
use App\Services\HumanResource\ConvertedTardinessRecordService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConvertedTardinessRecordManagementController extends Controller
{
    public function __construct(
        private readonly ConvertedTardinessRecordService $convertedTardinessRecords,
    ) {}

    public function index(Request $request)
    {
        return Inertia::render(
            'HumanResource/ConvertedTardinessRecordManagement/ConvertedTardinessRecordManagement',
            $this->convertedTardinessRecords->pageData($request),
        );
    }

    public function show(HrTardinessBatch $batch)
    {
        return Inertia::render(
            'HumanResource/ConvertedTardinessRecordManagement/ConvertedTardinessRecordBatch',
            $this->convertedTardinessRecords->batchData($batch),
        );
    }
}
