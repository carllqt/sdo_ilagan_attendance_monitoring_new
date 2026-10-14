<?php

namespace Database\Seeders;

use App\Models\Administrator\Attendance;
use App\Models\Administrator\AttendanceAm;
use App\Models\Administrator\AttendancePm;
use App\Models\Administrator\Employee;
use App\Models\Administrator\Station;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class MonthlySeeder extends Seeder
{
    public function run(): void
    {
        $sdoStation = Station::query()->where('code', 'SDO')->first();

        if (! $sdoStation) {
            Log::warning('MonthlySeeder skipped because the SDO station was not found.');

            return;
        }

        $employees = Employee::query()
            ->where('station_id', $sdoStation->id)
            ->get();

        // Seed the two most recently completed calendar months.
        $end = Carbon::today()->startOfMonth()->subDay();
        $start = $end->copy()->startOfMonth()->subMonthNoOverflow();

        foreach ($employees as $employee) {
            for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
                if ($date->isWeekend()) {
                    continue;
                }

                // Keep a small number of absent days for realistic sample data.
                if (random_int(1, 100) <= 5) {
                    continue;
                }

                $attendance = Attendance::firstOrCreate([
                    'employee_id' => $employee->id,
                    'date' => $date->toDateString(),
                ]);

                if (! $attendance->am()->exists()) {
                    AttendanceAm::factory()->create([
                        'attendance_id' => $attendance->id,
                    ]);
                }

                if (! $attendance->pm()->exists()) {
                    AttendancePm::factory()->create([
                        'attendance_id' => $attendance->id,
                    ]);
                }
            }
        }
    }
}