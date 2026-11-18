<?php

use App\Models\Administrator\Employee;
use App\Models\Administrator\Station;
use App\Models\FingerprintScan;
use Illuminate\Support\Carbon;

/*
| The fingerprint service logs each identified finger with its match score
| and gives the page the row's id (scan_id). The page sends it with the
| attendance it records, and Laravel adds what the scan recorded.
*/

beforeEach(function () {
    $this->station = Station::create(['name' => 'School Division Office', 'code' => 'SDO']);
    $this->employee = Employee::create([
        'first_name' => 'Juan',
        'last_name' => 'Cruz',
        'position' => 'Administrative Officer I',
        'station_id' => $this->station->id,
        'active_status' => true,
    ]);
});

function loggedScan(?Employee $employee = null, string $outcome = FingerprintScan::IDENTIFIED): FingerprintScan
{
    return FingerprintScan::create([
        'employee_id' => ($employee ?? test()->employee)->id,
        'station_id' => test()->station->id,
        'purpose' => 'attendance',
        'score' => 84,
        'threshold' => 60,
        'outcome' => $outcome,
    ]);
}

function scanWithLog(string $time, string $choice, FingerprintScan $scan)
{
    test()->travelTo(Carbon::parse("2026-11-17 {$time}"));

    return test()->postJson(route('attendance.scan'), [
        'employee_id' => test()->employee->id,
        'choice' => $choice,
        'scan_id' => $scan->id,
    ]);
}

it('saves what the scan recorded on its log row', function () {
    $scan = loggedScan();

    scanWithLog('07:45:00', 'AM Time-In', $scan)->assertOk()->assertJson(['success' => true]);

    expect($scan->fresh())
        ->outcome->toBe(FingerprintScan::RECORDED)
        ->recorded->toBe('AM Time-In')
        ->score->toBe(84);
});

it('completes a prompted scan with the answer', function () {
    $scan = loggedScan();

    scanWithLog('11:05:00', 'AM Time-Out', $scan)->assertJson(['prompt' => true]);
    expect($scan->fresh()->outcome)->toBe(FingerprintScan::PROMPT);

    $this->postJson(route('attendance.choice'), [
        'employee_id' => $this->employee->id,
        'choice' => 'AM Time-In',
        'scan_id' => $scan->id,
    ])->assertJson(['success' => true]);

    expect($scan->fresh())
        ->outcome->toBe(FingerprintScan::RECORDED)
        ->recorded->toBe('AM Time-In');
});

it('notes a scan that recorded nothing', function () {
    scanWithLog('07:45:00', 'AM Time-In', loggedScan());

    $cooldown = loggedScan();
    scanWithLog('07:50:00', 'AM Time-In', $cooldown)->assertJson(['cooldown' => true]);
    expect($cooldown->fresh())->outcome->toBe(FingerprintScan::COOLDOWN)->recorded->toBeNull();

    $locked = loggedScan();
    scanWithLog('12:10:00', 'PM Time-Out', $locked)->assertJson(['locked' => true]);
    expect($locked->fresh()->outcome)->toBe(FingerprintScan::LOCKED);
});

it("does not touch another employee's scan", function () {
    $other = Employee::create([
        'first_name' => 'Maria',
        'last_name' => 'Santos',
        'position' => 'Teacher I',
        'station_id' => $this->station->id,
        'active_status' => true,
    ]);
    $theirs = loggedScan($other);

    scanWithLog('07:45:00', 'AM Time-In', $theirs)->assertOk();

    expect($theirs->fresh())->outcome->toBe(FingerprintScan::IDENTIFIED)->recorded->toBeNull();
});

it('does not change a scan that is already complete', function () {
    $scan = loggedScan();
    scanWithLog('07:45:00', 'AM Time-In', $scan);

    // The same scan id sent again (e.g. a replayed request).
    scanWithLog('11:30:00', 'AM Time-Out', $scan)->assertJson(['success' => true]);

    expect($scan->fresh())->outcome->toBe(FingerprintScan::RECORDED)->recorded->toBe('AM Time-In');
});

it('still records attendance without a scan id', function () {
    $this->travelTo(Carbon::parse('2026-11-17 07:45:00'));

    $this->postJson(route('attendance.scan'), [
        'employee_id' => $this->employee->id,
        'choice' => 'AM Time-In',
    ])->assertOk()->assertJson(['success' => true]);
});

it('rejects a scan id that is not a number', function () {
    $this->postJson(route('attendance.scan'), [
        'employee_id' => $this->employee->id,
        'scan_id' => 'abc',
    ])->assertStatus(422)->assertJsonValidationErrors('scan_id');
});
