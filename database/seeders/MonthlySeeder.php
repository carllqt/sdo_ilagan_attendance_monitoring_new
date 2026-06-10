<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Administrator\Employee;
use App\Models\Administrator\Attendance;
use App\Models\Administrator\AttendanceAm;
use App\Models\Administrator\AttendancePm;
use Carbon\Carbon;

class MonthlySeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::all();

        $year = now()->year;
        $start = Carbon::create($year, 7, 1); // July 1
        $end = Carbon::create($year, 8, 31);  // August 31

        foreach ($employees as $employee) {

            for ($date = $start->copy(); $date->lte($end); $date->addDay()) {

                // Skip weekends
                if ($date->isWeekend()) {
                    continue;
                }

                // 5% chance of no attendance
                if (rand(1, 100) <= 5) {
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