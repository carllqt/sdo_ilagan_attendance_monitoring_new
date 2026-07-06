<?php

namespace App\Providers;

use App\Models\Administrator\Attendance;
use App\Models\Administrator\AttendanceAm;
use App\Models\Administrator\AttendancePm;
use App\Models\EmployeeTravelOrder;
use App\Observers\AttendanceMonitoringObserver;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Attendance::saved(fn (Attendance $attendance) => app(AttendanceMonitoringObserver::class)->attendanceSaved($attendance));
        Attendance::deleted(fn (Attendance $attendance) => app(AttendanceMonitoringObserver::class)->attendanceDeleted($attendance));
        AttendanceAm::saved(fn (AttendanceAm $attendanceAm) => app(AttendanceMonitoringObserver::class)->amSaved($attendanceAm));
        AttendanceAm::deleted(fn (AttendanceAm $attendanceAm) => app(AttendanceMonitoringObserver::class)->amDeleted($attendanceAm));
        AttendancePm::saved(fn (AttendancePm $attendancePm) => app(AttendanceMonitoringObserver::class)->pmSaved($attendancePm));
        AttendancePm::deleted(fn (AttendancePm $attendancePm) => app(AttendanceMonitoringObserver::class)->pmDeleted($attendancePm));
        EmployeeTravelOrder::saved(fn (EmployeeTravelOrder $travelOrder) => app(AttendanceMonitoringObserver::class)->travelSaved($travelOrder));
        EmployeeTravelOrder::deleted(fn (EmployeeTravelOrder $travelOrder) => app(AttendanceMonitoringObserver::class)->travelDeleted($travelOrder));
    }
}
