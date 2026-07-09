<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\TravelLocatorManagement\ApproveTravelOrderRequest;
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

    public function approveTravelOrder(ApproveTravelOrderRequest $request, int $id)
    {
        $this->travelLocatorManagement->approveTravelOrder(
            $id,
            $request,
        );

        return back()->with('success', 'Travel order approved!');
    }

    public function deleteTravelOrder(int $id, TravelLocatorManagementRequest $request)
    {
        $this->travelLocatorManagement->deleteTravelOrder($id, $request);

        return back()->with('success', 'Travel order request deleted.');
    }
}
