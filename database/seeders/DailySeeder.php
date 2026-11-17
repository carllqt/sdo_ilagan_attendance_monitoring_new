<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Administrator\Employee;
use App\Models\Administrator\Attendance;
use App\Models\Administrator\AttendanceAm;
use App\Models\Administrator\AttendancePm;
use Carbon\Carbon;

class DailySeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::where('id', '!=', 1)->take(5)->get(); // Exclude admin

        // Dates: today, yesterday, and two days ago
        $dates = [
            Carbon::today(),
        ];

        foreach ($dates as $date) {
            foreach ($employees as $employee) {
                // One attendance per employee per day (unique index), so
                // running this seeder twice on the same day skips them.
                $exists = Attendance::where('employee_id', $employee->id)
                    ->whereDate('date', $date->toDateString())
                    ->exists();

                if ($exists) {
                    continue;
                }

                $attendance = Attendance::create([
                    'employee_id' => $employee->id,
                    'date' => $date->toDateString(),
                ]);

                AttendanceAm::factory()->create([
                    'attendance_id' => $attendance->id,
                ]);

                AttendancePm::factory()->create([
                    'attendance_id' => $attendance->id,
                ]);
            }
        }
    }
}
