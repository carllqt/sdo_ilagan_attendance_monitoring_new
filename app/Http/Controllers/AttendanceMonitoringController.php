<?php

namespace App\Http\Controllers;

use App\Http\Requests\AttendanceMonitoring\AttendanceMonitoringRequest;
use App\Http\Requests\AttendanceMonitoring\AttendanceMonitoringSuggestionRequest;
use App\Services\AttendanceMonitoringService;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;

class AttendanceMonitoringController extends Controller
{
    public function __construct(
        private readonly AttendanceMonitoringService $attendanceMonitoring,
    ) {}

    public function index(AttendanceMonitoringRequest $request)
    {
        if ($redirect = $this->attendanceMonitoring->canonicalRedirect($request)) {
            return $redirect;
        }

        return Inertia::render(
            'AttendanceMonitoring/AttendanceMonitoring',
            $this->attendanceMonitoring->pageData($request),
        );
    }

    public function employeesPage(AttendanceMonitoringRequest $request): JsonResponse
    {
        return response()->json(
            $this->attendanceMonitoring->employeesPage($request),
        );
    }

    public function stationSuggestions(AttendanceMonitoringSuggestionRequest $request): JsonResponse
    {
        return response()->json(
            $this->attendanceMonitoring->stationSuggestions($request),
        );
    }

    public function employeeSuggestions(AttendanceMonitoringSuggestionRequest $request): JsonResponse
    {
        return response()->json(
            $this->attendanceMonitoring->employeeSuggestions($request),
        );
    }
}
