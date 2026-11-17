<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Services\Administrator\AttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function __construct(
        private readonly AttendanceService $attendance,
    ) {}

    public function index(Request $request)
    {
        return Inertia::render(
            'Attendance/Attendance',
            $this->attendance->pageData($request),
        );
    }

    public function suggestions(Request $request)
    {
        return response()->json(
            $this->attendance->suggestions($request),
        );
    }

    public function keepAlive(): JsonResponse
    {
        // server_time lets the attendance page keep its clock in sync.
        return response()->json([
            'ok' => true,
            'server_time' => now()->getTimestampMs(),
        ]);
    }

    public function scan(Request $request): JsonResponse
    {
        $data = $request->validate([
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
            'choice' => ['nullable', 'string', 'in:AM Time-In,AM Time-Out,PM Time-In,PM Time-Out'],
            // The fingerprint service's scan log row for this scan.
            'scan_id' => ['nullable', 'integer', 'min:1'],
        ]);

        return response()->json(
            $this->attendance->recordScan($request, (int) $data['employee_id']),
        );
    }

    public function choice(Request $request): JsonResponse
    {
        $data = $request->validate([
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
            'choice' => ['required', 'string', 'in:AM Time-In,AM Time-Out,PM Time-In,PM Time-Out'],
            'scan_id' => ['nullable', 'integer', 'min:1'],
        ]);

        return response()->json(
            $this->attendance->recordChoice(
                $request,
                (int) $data['employee_id'],
                $data['choice'],
            ),
        );
    }
}
