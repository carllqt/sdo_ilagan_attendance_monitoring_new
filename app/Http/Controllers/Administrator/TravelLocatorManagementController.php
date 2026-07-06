<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\TravelLocatorManagement\TravelLocatorManagementRequest;
use App\Services\Administrator\TravelLocatorManagementService;
use Inertia\Inertia;

class TravelLocatorManagementController extends Controller
{
    public function __construct(
        private readonly TravelLocatorManagementService $travelLocatorManagement,
    ) {}

    public function index(TravelLocatorManagementRequest $request)
    {
        return Inertia::render(
            'Admin/TravelLocatorManagement/TravelLocatorManagement',
            $this->travelLocatorManagement->pageData($request),
        );
    }

    public function suggestions(TravelLocatorManagementRequest $request)
    {
        return response()->json(
            $this->travelLocatorManagement->suggestions($request),
        );
    }
}
