<?php

namespace App\Http\Controllers\HumanResource;

use App\Http\Controllers\Controller;
use App\Http\Requests\HumanResource\ConvertedTardinessRecordManagement\ConvertedTardinessRecordRequest;
use App\Models\HumanResource\HrTardinessBatch;
use App\Services\HumanResource\ConvertedTardinessRecordService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConvertedTardinessRecordManagementController extends Controller
{
    public function __construct(
        private readonly ConvertedTardinessRecordService $convertedTardinessRecords,
    ) {}

    public function index(ConvertedTardinessRecordRequest $request)
    {
        return Inertia::render(
            'HumanResource/ConvertedTardinessRecordManagement/ConvertedTardinessRecordManagement',
            $this->convertedTardinessRecords->pageData($request),
        );
    }

    public function suggestions(Request $request)
    {
        return response()->json(
            $this->convertedTardinessRecords->suggestions($request),
        );
    }

    public function show(Request $request, HrTardinessBatch $batch)
    {
        return Inertia::render(
            'HumanResource/ConvertedTardinessRecordManagement/ConvertedTardinessRecordBatch',
            $this->convertedTardinessRecords->batchData($request, $batch),
        );
    }
}
