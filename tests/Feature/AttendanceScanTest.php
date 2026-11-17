<?php

use App\Models\Administrator\Attendance;
use App\Models\Administrator\Employee;
use App\Models\Administrator\Station;
use Illuminate\Support\Carbon;

/*
| The attendance page pre-selects Time-In or Time-Out from the clock
| (e.g. Time-Out after 11:00). The server must not trust that default
| blindly: a Time-Out with no Time-In for that session asks the employee.
*/

beforeEach(function () {
    config(['broadcasting.default' => 'null']);

    $station = Station::create(['name' => 'School Division Office', 'code' => 'SDO']);

    $this->employee = Employee::create([
        'first_name' => 'Juan',
        'last_name' => 'Cruz',
        'position' => 'Administrative Officer I',
        'station_id' => $station->id,
        'active_status' => true,
    ]);
});

function scanAt(string $time, string $choice)
{
    test()->travelTo(Carbon::parse("2026-11-17 {$time}"));

    return test()->postJson(route('attendance.scan'), [
        'employee_id' => test()->employee->id,
        'choice' => $choice,
    ]);
}

function seedToday(array $am = [], array $pm = []): void
{
    $attendance = Attendance::create([
        'employee_id' => test()->employee->id,
        'date' => '2026-11-17',
    ]);

    if ($am) {
        $attendance->am()->create($am);
    }

    if ($pm) {
        $attendance->pm()->create($pm);
    }
}

function todayAttendance(): ?Attendance
{
    return Attendance::with(['am', 'pm'])
        ->where('employee_id', test()->employee->id)
        ->whereDate('date', '2026-11-17')
        ->first();
}

it('asks a late arrival instead of recording AM Time-Out', function () {
    scanAt('11:05:00', 'AM Time-Out')
        ->assertOk()
        ->assertJson([
            'prompt' => true,
            'prompt_type' => 'AM',
            'options' => ['AM Time-Out', 'AM Time-In'],
        ]);

    expect(todayAttendance()?->am?->am_time_out)->toBeNull();
});

it('records AM Time-In when the employee answers the prompt', function () {
    scanAt('11:05:00', 'AM Time-Out');

    $this->postJson(route('attendance.choice'), [
        'employee_id' => $this->employee->id,
        'choice' => 'AM Time-In',
    ])->assertOk()->assertJson(['success' => true, 'session' => 'AM', 'action' => 'time-in']);

    expect(todayAttendance()->am->am_time_in)->toStartWith('11:05')
        ->and(todayAttendance()->am->am_time_out)->toBeNull();
});

it('records AM Time-Out normally when AM Time-In exists', function () {
    seedToday(am: ['am_time_in' => '07:50:00']);

    scanAt('12:00:00', 'AM Time-Out')
        ->assertOk()
        ->assertJson(['success' => true, 'session' => 'AM', 'action' => 'time-out']);

    expect(todayAttendance()->am->am_time_out)->toStartWith('12:00');
});

it('asks a late afternoon arrival instead of recording PM Time-Out', function () {
    scanAt('13:35:00', 'PM Time-Out')
        ->assertOk()
        ->assertJson([
            'prompt' => true,
            'prompt_type' => 'PM',
            'options' => ['PM Time-Out', 'PM Time-In'],
        ]);

    expect(todayAttendance()?->pm?->pm_time_out)->toBeNull();
});

it('asks when AM is complete but PM Time-In is missing', function () {
    seedToday(am: ['am_time_in' => '07:50:00', 'am_time_out' => '12:00:00']);

    scanAt('17:00:00', 'PM Time-Out')
        ->assertOk()
        ->assertJson(['prompt' => true, 'prompt_type' => 'PM']);
});

it('does not ask someone who only scans in and out for the day', function () {
    seedToday(am: ['am_time_in' => '07:50:00']);

    scanAt('17:00:00', 'PM Time-Out')
        ->assertOk()
        ->assertJson(['success' => true, 'session' => 'PM', 'action' => 'time-out']);

    expect(todayAttendance()->pm->pm_time_out)->toStartWith('17:00');
});

it('records PM Time-In directly for a half day with no AM', function () {
    scanAt('13:00:00', 'PM Time-In')
        ->assertOk()
        ->assertJson(['success' => true, 'session' => 'PM', 'action' => 'time-in']);

    expect(todayAttendance()->pm->pm_time_in)->toStartWith('13:00');
});

it('still asks about a missing AM Time-Out after lunch', function () {
    seedToday(am: ['am_time_in' => '07:50:00']);

    scanAt('13:00:00', 'PM Time-In')
        ->assertOk()
        ->assertJson([
            'prompt' => true,
            'prompt_type' => 'AM',
            'options' => ['AM Time-Out', 'PM Time-In'],
        ]);
});
