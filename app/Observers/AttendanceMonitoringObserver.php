<?php

namespace App\Observers;

use App\Models\Administrator\Attendance;
use App\Models\Administrator\AttendanceAm;
use App\Models\Administrator\AttendancePm;
use App\Models\EmployeeTravelOrder;
use App\Services\AttendanceMonitoringEventStore;

class AttendanceMonitoringObserver
{
    public function __construct(
        private readonly AttendanceMonitoringEventStore $events,
    ) {}

    public function attendanceSaved(Attendance $attendance): void
    {
        $this->events->touchAttendanceEmployee((int) $attendance->employee_id);
    }

    public function attendanceDeleted(Attendance $attendance): void
    {
        $this->events->touchAttendanceEmployee((int) $attendance->employee_id);
    }

    public function amSaved(AttendanceAm $attendanceAm): void
    {
        $this->events->touchAttendanceEmployee($this->employeeIdFromChild($attendanceAm));
    }

    public function amDeleted(AttendanceAm $attendanceAm): void
    {
        $this->events->touchAttendanceEmployee($this->employeeIdFromChild($attendanceAm));
    }

    public function pmSaved(AttendancePm $attendancePm): void
    {
        $this->events->touchAttendanceEmployee($this->employeeIdFromChild($attendancePm));
    }

    public function pmDeleted(AttendancePm $attendancePm): void
    {
        $this->events->touchAttendanceEmployee($this->employeeIdFromChild($attendancePm));
    }

    public function travelSaved(EmployeeTravelOrder $travelOrder): void
    {
        $this->events->touchTravelEmployee((int) $travelOrder->employee_id);
    }

    public function travelDeleted(EmployeeTravelOrder $travelOrder): void
    {
        $this->events->touchTravelEmployee((int) $travelOrder->employee_id);
    }

    private function employeeIdFromChild(AttendanceAm|AttendancePm $record): ?int
    {
        return $record->attendance()->value('employee_id');
    }
}
