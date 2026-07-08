<?php

namespace App\Http\Controllers;

use App\Http\Requests\AttendanceMonitoring\AttendanceMonitoringRequest;
use App\Http\Requests\AttendanceMonitoring\AttendanceMonitoringSuggestionRequest;
use App\Services\AttendanceMonitoringService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

    public function liveTest(Request $request)
    {
        return Inertia::render(
            'AttendanceMonitoring/LiveTest',
            $this->attendanceMonitoring->liveTestPageData($request),
        );
    }

    public function triggerLiveTest(Request $request): JsonResponse
    {
        $data = $request->validate([
            'employee_id' => ['nullable', 'integer', 'exists:employees,id'],
            'employee_ids' => ['nullable', 'array', 'max:25'],
            'employee_ids.*' => ['integer', 'distinct', 'exists:employees,id'],
        ]);

        if (! empty($data['employee_ids'])) {
            return response()->json(
                $this->attendanceMonitoring->triggerLiveTestMany(
                    $request,
                    array_map('intval', $data['employee_ids']),
                ),
            );
        }

        return response()->json(
            $this->attendanceMonitoring->triggerLiveTest(
                $request,
                isset($data['employee_id']) ? (int) $data['employee_id'] : null,
            ),
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

    public function broadcast(Request $request): JsonResponse
    {
        $data = $request->validate([
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
        ]);

        $this->attendanceMonitoring->broadcast($request, (int) $data['employee_id']);

        return response()->json(['ok' => true]);
    }
}
