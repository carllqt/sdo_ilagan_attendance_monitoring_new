<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\TardinessSummaryManagement\TardinessSummaryRequest;
use App\Services\Administrator\TardinessSummaryManagementService;
use Inertia\Inertia;

class TardinessSummaryManagementController extends Controller
{
    public function __construct(
        private readonly TardinessSummaryManagementService $tardinessSummary,
    ) {}

    public function index(TardinessSummaryRequest $request)
    {
        $filter = $this->tardinessSummary->filter($request);

        return Inertia::render(
            'Admin/TardinessSummaryManagement/TardinessSummary',
            $this->tardinessSummary->pageData($filter),
        );
    }

    public function suggestions(TardinessSummaryRequest $request)
    {
        return response()->json(
            $this->tardinessSummary->suggestions(
                $this->tardinessSummary->filter($request),
            ),
        );
    }
}
