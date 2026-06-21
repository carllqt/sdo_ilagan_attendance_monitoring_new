<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\AttendanceManagement\AttendanceManagementRequest;
use App\Http\Requests\Administrator\AttendanceManagement\StoreEmployeeTravelOrderRequest;
use App\Http\Requests\Administrator\AttendanceManagement\StoreAttendanceRequest;
use App\Http\Requests\Administrator\AttendanceManagement\UpdateAttendanceRequest;
use App\Services\Administrator\AttendanceManagementService;
use Inertia\Inertia;

class AttendanceManagementController extends Controller
{
    public function __construct(
        private readonly AttendanceManagementService $attendanceManagement,
    ) {}

    public function index(AttendanceManagementRequest $request)
    {
        return Inertia::render(
            'Admin/AttendanceManagement/AttendanceManagement',
            $this->attendanceManagement->pageData($request, $this->stationId()),
        );
    }

    public function update(UpdateAttendanceRequest $request, int $id)
    {
        $this->attendanceManagement->updateAttendance($id, $request->validated());

        return back()->with('success', 'Attendance updated and tardiness recalculated!');
    }

    public function store(StoreAttendanceRequest $request)
    {
        $this->attendanceManagement->storeAttendance($request->validated());

        return back()->with('success', 'Attendance created and tardiness calculated!');
    }

    public function storeTravelOrder(StoreEmployeeTravelOrderRequest $request)
    {
        $this->attendanceManagement->storeTravelOrder(
            $request->validated(),
            $this->stationId(),
        );

        return back()->with('success', 'Travel order added!');
    }

    private function stationId(): int
    {
        $stationId = auth()->user()?->employee?->station_id;

        if (! $stationId) {
            abort(403, 'Station not assigned to this user.');
        }

        return (int) $stationId;
    }
}
