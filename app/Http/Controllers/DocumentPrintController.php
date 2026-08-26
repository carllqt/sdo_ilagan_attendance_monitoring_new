<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class DocumentPrintController extends Controller
{
    public function travelOrderSample(): InertiaResponse
    {
        return Inertia::render('Admin/TravelLocatorManagement/TravelOrderSample');
    }
}
