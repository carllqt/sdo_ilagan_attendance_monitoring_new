<?php

use App\Data\AttendanceMonitoring\AttendanceEmployeeData;
use App\Data\AttendanceMonitoring\AttendanceMonitoringFilter;
use App\Models\Administrator\Employee;
use App\Models\Administrator\Station;
use App\Models\EmployeeTravelOrder;
use App\Repositories\AttendanceMonitoringRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/*
| Attendance Monitoring status for the day (see AttendanceEmployeeData):
| Absent, No Time-In, Half Day, then On Time / On Grace / Late from the AM
| Time-In against the work schedule start.
*/

function statusOf(?string $amIn, ?string $amOut = null, ?string $pmIn = null, ?string $pmOut = null, ?string $start = '08:30:00', string $now = '17:00'): string
{
    return AttendanceEmployeeData::status($amIn, $amOut, $pmIn, $pmOut, $start, $now);
}

it('follows an 8:30 schedule', function (string $amIn, string $status) {
    expect(statusOf($amIn, start: '08:30:00'))->toBe($status);
})->with([
    ['07:45:00', 'On Time'],
    ['08:00:00', 'On Time'],
    ['08:00:59', 'On Time'],
    ['08:01:00', 'On Grace'],
    ['08:30:00', 'On Grace'],
    ['08:30:59', 'On Grace'],
    ['08:31:00', 'Late'],
]);

it('has no grace on an 8:00 schedule', function (string $amIn, string $status) {
    expect(statusOf($amIn, start: '08:00:00'))->toBe($status);
})->with([
    ['07:30:00', 'On Time'],
    ['08:00:00', 'On Time'],
    ['08:00:59', 'On Time'],
    ['08:01:00', 'Late'],
]);

it('uses an 8:00 start when the employee has no schedule', function () {
    expect(statusOf('07:45:00', start: null))->toBe('On Time')
        ->and(statusOf('08:05:00', start: null))->toBe('Late');
});

it('is Absent with no scans', function () {
    expect(statusOf(null))->toBe('Absent');
});

it('is No Time-In with an AM Time-Out but no AM Time-In', function () {
    expect(statusOf(null, '12:01:00', now: '12:30'))->toBe('No Time-In')
        ->and(statusOf(null, '12:01:00', '12:58:00', '17:31:00'))->toBe('No Time-In');
});

it('is Half Day when only the afternoon is scanned', function () {
    expect(statusOf(null, null, '12:55:00', now: '14:00'))->toBe('Half Day')
        ->and(statusOf(null, null, '12:55:00', '17:31:00'))->toBe('Half Day')
        ->and(statusOf(null, null, null, '17:31:00'))->toBe('Half Day');
});

it('is Half Day after a morning with no PM Time-In by 1:00 PM', function () {
    // Before 1:00 PM the lunch break is still on: the morning status shows.
    expect(statusOf('07:55:00', '12:00:00', now: '12:40'))->toBe('On Time')
        ->and(statusOf('07:55:00', '12:00:00', now: '13:00'))->toBe('On Time')
        ->and(statusOf('07:55:00', '12:00:00', now: '13:01'))->toBe('Half Day')
        // Back after lunch: a full day again.
        ->and(statusOf('07:55:00', '12:00:00', '12:58:00', now: '13:05'))->toBe('On Time');
});

it('is not Half Day for someone who skipped the lunch scans', function () {
    expect(statusOf('08:10:00', null, null, '17:31:00'))->toBe('On Grace')
        ->and(statusOf('08:10:00', null, null, null, now: '15:00'))->toBe('On Grace');
});

it('shows On Travel for everyone on travel, not only the side panel few', function () {
    $station = Station::create(['name' => 'School Division Office', 'code' => 'SDO']);
    $today = Carbon::parse('2026-11-25');
    $employees = collect(range(1, 6))->map(fn ($n) => Employee::create([
        'first_name' => "Traveler{$n}",
        'last_name' => 'Cruz',
        'position' => 'Teacher I',
        'station_id' => $station->id,
        'active_status' => true,
    ]));

    // Five on travel today (one ending today, one starting today), one not.
    foreach ($employees->take(5) as $n => $employee) {
        EmployeeTravelOrder::create([
            'employee_id' => $employee->id,
            'start_date' => $n === 0 ? '2026-11-25' : '2026-11-24',
            'end_date' => $n === 1 ? '2026-11-25' : '2026-11-27',
        ]);
    }
    EmployeeTravelOrder::create([
        'employee_id' => $employees->last()->id,
        'start_date' => '2026-11-20',
        'end_date' => '2026-11-24',
    ]);

    $filter = AttendanceMonitoringFilter::fromRequest(
        Request::create('/attendance-monitoring', 'GET', ['station_code' => 'SDO']),
    );
    $statuses = collect(app(AttendanceMonitoringRepository::class)->employees($today, $filter)->items())
        ->pluck('status', 'first_name');

    expect($statuses->filter(fn ($status) => $status === 'On Travel')->count())->toBe(5)
        ->and($statuses['Traveler6'])->toBe('Absent');
});

it('builds the status from a row at the given time', function () {
    $row = (object) [
        'id' => 1, 'first_name' => 'Ana', 'middle_name' => null, 'last_name' => 'Reyes',
        'profile_img' => null, 'position' => 'Teacher', 'station_id' => 1,
        'station_name' => 'SDO', 'station_code' => 'SDO', 'schedule_time_in' => '08:30:00',
        'am_in' => '08:10:00', 'am_out' => '12:00:00', 'pm_in' => null, 'pm_out' => null,
    ];

    expect(AttendanceEmployeeData::fromRow($row, Carbon::parse('2026-11-25 12:30'))['status'])->toBe('On Grace')
        ->and(AttendanceEmployeeData::fromRow($row, Carbon::parse('2026-11-25 15:00'))['status'])->toBe('Half Day');
});
