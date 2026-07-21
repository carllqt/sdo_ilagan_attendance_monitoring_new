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

    public function scan(Request $request): JsonResponse
    {
        $data = $request->validate([
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
            'choice' => ['nullable', 'string', 'in:AM Time-In,AM Time-Out,PM Time-In,PM Time-Out'],
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
