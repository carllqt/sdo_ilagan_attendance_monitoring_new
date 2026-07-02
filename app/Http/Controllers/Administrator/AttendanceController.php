<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\Attendance\RegisterAttendanceDeviceRequest;
use App\Http\Requests\Administrator\Attendance\UnlockAttendanceRequest;
use App\Services\Administrator\AttendanceService;
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

    public function registerDevice(RegisterAttendanceDeviceRequest $request)
    {
        $device = $this->attendance->registerDevice($request);

        return back()->withCookie(
            cookie(
                AttendanceService::DEVICE_COOKIE,
                $device['token'],
                $device['minutes'],
                null,
                null,
                false,
                true,
                false,
                'Strict',
            ),
        )->with('success', 'Attendance device registered.');
    }

    public function unlock(UnlockAttendanceRequest $request)
    {
        $this->attendance->unlock(
            $request,
            (int) $request->validated('employee_id'),
        );

        return back()->with('success', 'Attendance scanner unlocked.');
    }

    public function lock()
    {
        $this->attendance->lock();

        return back()->with('success', 'Attendance scanner locked.');
    }
}
