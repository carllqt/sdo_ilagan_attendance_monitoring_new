<?php

use App\Data\AttendanceMonitoring\AttendanceEmployeeData;

/*
| Attendance Monitoring status, from the first time-in of the day against the
| employee's work schedule start: On Time by 8:00, On Grace after 8:00 up to
| a later start (8:30 schedule only), Late after the start; no time-in is
| Absent.
*/

it('follows an 8:30 schedule', function (string $timeIn, string $status) {
    expect(AttendanceEmployeeData::status($timeIn, '08:30:00'))->toBe($status);
})->with([
    ['07:45:00', 'On Time'],
    ['08:00:00', 'On Time'],
    ['08:00:59', 'On Time'],
    ['08:01:00', 'On Grace'],
    ['08:30:00', 'On Grace'],
    ['08:30:59', 'On Grace'],
    ['08:31:00', 'Late'],
]);

it('has no grace on an 8:00 schedule', function (string $timeIn, string $status) {
    expect(AttendanceEmployeeData::status($timeIn, '08:00:00'))->toBe($status);
})->with([
    ['07:30:00', 'On Time'],
    ['07:59:00', 'On Time'],
    ['08:00:00', 'On Time'],
    ['08:00:59', 'On Time'],
    ['08:01:00', 'Late'],
    ['08:20:00', 'Late'],
]);

it('uses an 8:00 start when the employee has no schedule', function () {
    expect(AttendanceEmployeeData::status('07:45:00'))->toBe('On Time')
        ->and(AttendanceEmployeeData::status('08:05:00'))->toBe('Late');
});

it('is Absent with no time-in', function () {
    expect(AttendanceEmployeeData::status(null, '08:30:00'))->toBe('Absent');
});

it('uses the PM Time-In when there is no AM Time-In', function () {
    $row = (object) [
        'id' => 1, 'first_name' => 'Ana', 'middle_name' => null, 'last_name' => 'Reyes',
        'profile_img' => null, 'position' => 'Teacher', 'station_id' => 1,
        'station_name' => 'SDO', 'station_code' => 'SDO', 'schedule_time_in' => '08:30:00',
        'am_in' => null, 'am_out' => null, 'pm_in' => '13:02:00', 'pm_out' => null,
    ];

    expect(AttendanceEmployeeData::fromRow($row)['status'])->toBe('Late');

    $row->am_in = '08:10:00';
    expect(AttendanceEmployeeData::fromRow($row)['status'])->toBe('On Grace');
});
