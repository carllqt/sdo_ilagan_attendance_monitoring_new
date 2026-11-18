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

/*
| Time-Out is locked until 11:00 AM (AM) and 1:30 PM (PM). The page locks
| the button; the server refuses early Time-Outs on every path as well.
*/

it('refuses AM Time-Out before 11:00 AM', function () {
    seedToday(am: ['am_time_in' => '07:50:00']);

    scanAt('10:30:00', 'AM Time-Out')
        ->assertOk()
        ->assertJson(['success' => false, 'locked' => true, 'message' => 'AM Time-Out opens at 11:00 AM.']);

    expect(todayAttendance()->am->am_time_out)->toBeNull();
});

it('refuses AM Time-Out before 11:00 AM even with no Time-In (no prompt)', function () {
    scanAt('10:30:00', 'AM Time-Out')
        ->assertOk()
        ->assertJson(['success' => false, 'locked' => true])
        ->assertJsonMissing(['prompt' => true]);
});

it('allows AM Time-Out at exactly 11:00 AM', function () {
    seedToday(am: ['am_time_in' => '07:50:00']);

    scanAt('11:00:00', 'AM Time-Out')
        ->assertOk()
        ->assertJson(['success' => true, 'session' => 'AM', 'action' => 'time-out']);
});

it('refuses PM Time-Out before 1:30 PM', function () {
    seedToday(
        am: ['am_time_in' => '07:50:00', 'am_time_out' => '12:00:00'],
        pm: ['pm_time_in' => '12:40:00'],
    );

    scanAt('13:15:00', 'PM Time-Out')
        ->assertOk()
        ->assertJson(['success' => false, 'locked' => true, 'message' => 'PM Time-Out opens at 1:30 PM.']);

    expect(todayAttendance()->pm->pm_time_out)->toBeNull();
});

it('allows PM Time-Out at exactly 1:30 PM', function () {
    seedToday(
        am: ['am_time_in' => '07:50:00', 'am_time_out' => '12:00:00'],
        pm: ['pm_time_in' => '12:40:00'],
    );

    scanAt('13:30:00', 'PM Time-Out')
        ->assertOk()
        ->assertJson(['success' => true, 'session' => 'PM', 'action' => 'time-out']);
});

it('refuses an early Time-Out sent as a prompt answer', function () {
    $this->travelTo(Carbon::parse('2026-11-17 10:30:00'));

    $this->postJson(route('attendance.choice'), [
        'employee_id' => $this->employee->id,
        'choice' => 'AM Time-Out',
    ])->assertOk()->assertJson(['success' => false, 'locked' => true]);

    expect(todayAttendance())->toBeNull();
});

it('refuses an early Time-Out in automatic mode (no choice sent)', function () {
    seedToday(am: ['am_time_in' => '07:50:00']);
    $this->travelTo(Carbon::parse('2026-11-17 10:30:00'));

    $this->postJson(route('attendance.scan'), [
        'employee_id' => $this->employee->id,
    ])->assertOk()->assertJson(['success' => false, 'locked' => true]);

    expect(todayAttendance()->am->am_time_out)->toBeNull();
});

/*
| The page gets the unlock times and the server's clock from the server, so
| there is one place to change the times and the page follows server time.
*/

it('sends the unlock times and server time to the attendance page', function () {
    $this->travelTo(Carbon::parse('2026-11-17 09:15:00'));

    $this->get(route('attendance'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Attendance/Attendance')
            ->where('attendanceRules.timeOutOpensAt.AM', ['minutes' => 660, 'label' => '11:00 AM'])
            ->where('attendanceRules.timeOutOpensAt.PM', ['minutes' => 810, 'label' => '1:30 PM'])
            ->where('attendanceRules.serverTime', Carbon::parse('2026-11-17 09:15:00')->getTimestampMs())
        );
});

it('returns the server time on keep-alive', function () {
    $this->travelTo(Carbon::parse('2026-11-17 10:59:30'));

    $this->getJson(route('attendance.keep-alive'))
        ->assertOk()
        ->assertJson([
            'ok' => true,
            'server_time' => Carbon::parse('2026-11-17 10:59:30')->getTimestampMs(),
        ]);
});

/*
| The PM session opens at 12:00 PM: the page will not switch to PM before
| then, and the server refuses a PM Time-In before then.
*/

it('refuses PM Time-In before 12:00 PM', function () {
    scanAt('11:30:00', 'PM Time-In')
        ->assertOk()
        ->assertJson(['success' => false, 'locked' => true, 'message' => 'PM Time-In opens at 12:00 PM.']);

    expect(todayAttendance()?->pm?->pm_time_in)->toBeNull();
});

it('allows PM Time-In at exactly 12:00 PM', function () {
    scanAt('12:00:00', 'PM Time-In')
        ->assertOk()
        ->assertJson(['success' => true, 'session' => 'PM', 'action' => 'time-in']);
});

it('refuses an early PM Time-In sent as a prompt answer', function () {
    $this->travelTo(Carbon::parse('2026-11-17 11:30:00'));

    $this->postJson(route('attendance.choice'), [
        'employee_id' => $this->employee->id,
        'choice' => 'PM Time-In',
    ])->assertOk()->assertJson(['success' => false, 'locked' => true]);

    expect(todayAttendance())->toBeNull();
});

it('still allows AM Time-In at any time', function () {
    scanAt('06:00:00', 'AM Time-In')
        ->assertOk()
        ->assertJson(['success' => true, 'session' => 'AM', 'action' => 'time-in']);
});

it('sends the PM session opening time to the attendance page', function () {
    $this->get(route('attendance'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('attendanceRules.pmSessionOpensAt', ['minutes' => 720, 'label' => '12:00 PM'])
        );
});

/*
| No duplicate records: one attendance per employee per day and one AM / PM
| row per attendance (unique indexes), and one scan at a time per employee.
*/

it('refuses a second attendance row for the same employee and day', function () {
    seedToday();

    expect(fn () => Attendance::create([
        'employee_id' => $this->employee->id,
        'date' => '2026-11-17',
    ]))->toThrow(Illuminate\Database\UniqueConstraintViolationException::class);
});

it('refuses a second AM or PM row for the same attendance', function () {
    seedToday(am: ['am_time_in' => '07:50:00'], pm: ['pm_time_in' => '12:40:00']);
    $attendance = todayAttendance();

    expect(fn () => $attendance->am()->create(['am_time_in' => '08:00:00']))
        ->toThrow(Illuminate\Database\UniqueConstraintViolationException::class)
        ->and(fn () => $attendance->pm()->create(['pm_time_in' => '13:00:00']))
        ->toThrow(Illuminate\Database\UniqueConstraintViolationException::class);
});

it('makes a second scan wait while one is being saved for the same employee', function () {
    $lock = Illuminate\Support\Facades\Cache::lock("attendance-scan:{$this->employee->id}", 10);
    $lock->get();

    // Real time on purpose: the lock wait is timed with now(), which a
    // frozen test clock would never move.
    $this->postJson(route('attendance.scan'), [
        'employee_id' => $this->employee->id,
        'choice' => 'AM Time-In',
    ])
        ->assertOk()
        ->assertJson([
            'success' => false,
            'message' => 'Another scan for this employee is still being saved. Please scan again.',
        ]);

    $lock->release();

    expect(Attendance::count())->toBe(0);
});

it('sends every session time to the attendance page', function () {
    $this->get(route('attendance'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('attendanceRules.pmLogsShownFrom', ['minutes' => 735, 'label' => '12:15 PM'])
            ->where('attendanceRules.pmSessionStartsAt', ['minutes' => 740, 'label' => '12:20 PM'])
            ->where('attendanceRules.amSessionClosesAt', ['minutes' => 780, 'label' => '1:00 PM'])
        );
});

it('tells a guest attendance page which station it records for', function () {
    // The fingerprint scanner loads only this station's prints.
    $this->get(route('attendance'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('attendanceAccess.station.id', $this->employee->station_id)
            ->where('attendanceAccess.station.name', 'School Division Office')
        );
});
