<?php

use App\Models\Administrator\Attendance;
use App\Models\Administrator\Employee;
use App\Models\Administrator\Station;
use App\Models\User;
use App\Repositories\Administrator\AttendanceManagementRepository;
use App\Repositories\Administrator\EmployeeManagementRepository;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

/*
| A school admin must only be able to read and change records that belong
| to their own station. These tests pin that rule for attendance and
| employee management.
*/

beforeEach(function () {
    Role::create(['name' => 'school_admin', 'guard_name' => 'web']);

    $this->ownStation = Station::create(['name' => 'Own School', 'code' => 'OWN']);
    $this->otherStation = Station::create(['name' => 'Other School', 'code' => 'OTHER']);

    $workTypeId = DB::table('work_types')->insertGetId(['name' => 'Fixed']);
    $this->workScheduleId = DB::table('work_schedules')->insertGetId([
        'work_type_id' => $workTypeId,
        'name' => '8-5',
        'time_in' => '08:00:00',
        'time_out' => '17:00:00',
    ]);

    $makeEmployee = fn (Station $station, string $lastName) => Employee::create([
        'first_name' => 'Test',
        'last_name' => $lastName,
        'position' => 'Teacher I',
        'station_id' => $station->id,
        'work_schedule_id' => $this->workScheduleId,
        'active_status' => true,
    ]);

    $adminEmployee = $makeEmployee($this->ownStation, 'Admin');
    $this->ownEmployee = $makeEmployee($this->ownStation, 'Own');
    $this->otherEmployee = $makeEmployee($this->otherStation, 'Other');

    $this->admin = User::create([
        'employee_id' => $adminEmployee->id,
        'email' => 'school-admin@example.test',
        'password' => 'password',
    ]);
    $this->admin->assignRole('school_admin');

    $this->otherAttendance = Attendance::create([
        'employee_id' => $this->otherEmployee->id,
        'date' => '2026-11-16',
    ]);
    $this->otherAttendance->am()->create(['am_time_in' => null, 'am_time_out' => null]);
    $this->otherAttendance->pm()->create(['pm_time_in' => null, 'pm_time_out' => null]);
});

function employeePayload(array $overrides = []): array
{
    return array_merge([
        'first_name' => 'Changed',
        'last_name' => 'Name',
        'position' => 'Teacher I',
        'work_schedule_id' => test()->workScheduleId,
        'station_id' => test()->ownStation->id,
        'active_status' => true,
        'password' => 'password',
    ], $overrides);
}

it('blocks updating attendance from another station', function () {
    $this->actingAs($this->admin)
        ->post(route('attendance-management.update', $this->otherAttendance->id), [
            'am_time_in' => '07:30',
        ])
        ->assertNotFound();

    expect($this->otherAttendance->am()->first()->am_time_in)->toBeNull();
});

it('blocks creating attendance for an employee in another station', function () {
    $this->actingAs($this->admin)
        ->post(route('attendance-management.create'), [
            'employee_id' => $this->otherEmployee->id,
            'date' => '2026-11-17',
            'am_time_in' => '07:30',
        ])
        ->assertForbidden();

    expect(Attendance::where('employee_id', $this->otherEmployee->id)->count())->toBe(1);
});

it('blocks updating an employee from another station', function () {
    $this->actingAs($this->admin)
        ->put(route('employees.update', $this->otherEmployee->id), employeePayload([
            'station_id' => $this->otherStation->id,
        ]))
        ->assertNotFound();

    expect($this->otherEmployee->fresh()->first_name)->toBe('Test');
});

it('blocks registering an employee into another station', function () {
    $this->actingAs($this->admin)
        ->post(route('employees.store'), array_merge(employeePayload([
            'station_id' => $this->otherStation->id,
        ]), ['id' => 99999]))
        ->assertForbidden();

    expect(Employee::find(99999))->toBeNull();
});

it('still lets an admin update an employee in their own station', function () {
    $this->actingAs($this->admin)
        ->put(route('employees.update', $this->ownEmployee->id), employeePayload())
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($this->ownEmployee->fresh()->first_name)->toBe('Changed');
});

it('hides other stations from the edit modals', function () {
    $ownStationId = $this->ownStation->id;

    expect(app(EmployeeManagementRepository::class)->editModalEmployee($this->otherEmployee->id, $ownStationId))
        ->toBeNull()
        ->and(app(EmployeeManagementRepository::class)->editModalEmployee($this->ownEmployee->id, $ownStationId))
        ->not->toBeNull()
        ->and(app(AttendanceManagementRepository::class)->editModalAttendance($this->otherAttendance->id, $ownStationId))
        ->toBeNull();
});
