<?php

namespace App\Services\Administrator;

use App\Data\Administrator\AttendanceManagement\AttendanceManagementFilter;
use App\Models\Administrator\Attendance;
use App\Repositories\Administrator\AttendanceManagementRepository;
use App\Services\AttendanceMonitoringRealtimeService;
use App\Services\Administrator\DailyTimeRecord\FixedTardinessService;
use App\Services\Administrator\DailyTimeRecord\FullTardinessService;
use Illuminate\Http\Request;

class AttendanceManagementService
{
    public function __construct(
        private readonly AttendanceManagementRepository $repository,
        private readonly FixedTardinessService $fixedService,
        private readonly FullTardinessService $fullService,
        private readonly AttendanceMonitoringRealtimeService $realtime,
    ) {}

    public function pageData(Request $request, int $stationId): array
    {
        $filter = AttendanceManagementFilter::fromRequest($request, $stationId);
        $offices = $this->repository->offices();

        $filter = $this->resolveOfficeId($filter, $offices);

        return [
            'incomplete_attendances' => fn () => $this->repository->incompleteAttendances($filter),
            'offices' => $offices,
            'years' => fn () => $this->repository->attendanceYears($stationId),
            'filters' => $filter->toArray(),
            'editAttendanceModal' => fn () => $this->editModal($request),
        ];
    }

    private function resolveOfficeId(AttendanceManagementFilter $filter, $offices): AttendanceManagementFilter
    {
        if ($filter->officeName === '' || $filter->officeName === 'all') {
            return $filter;
        }

        $officeId = $offices
            ->firstWhere('name', $filter->officeName)
            ?->id ?? 'all';

        return $filter->withOfficeId($officeId);
    }

    public function editModal(Request $request): ?array
    {
        if ($request->query('modal') !== 'edit') {
            return null;
        }

        $attendance = $this->repository->editModalAttendance((int) $request->query('attendance_id'));

        if (! $attendance) {
            return null;
        }

        return [
            'id' => $attendance->id,
            'employee_id' => $attendance->employee_id,
            'date' => $attendance->date,
            'employee' => $attendance->employee,
            'am' => $attendance->am,
            'pm' => $attendance->pm,
        ];
    }

    public function updateAttendance(int $attendanceId, array $data): void
    {
        $attendance = $this->repository->attendanceForUpdate($attendanceId);

        $this->updateMissingAttendanceTimes($attendance, $data);
        $this->repository->loadForTardiness($attendance);
        $this->computeTardiness(collect([$attendance]));
        $this->realtime->broadcastForAttendance($attendance);
    }

    public function storeAttendance(array $data): void
    {
        $attendance = $this->repository->createAttendance($data);
        $this->repository->loadForTardiness($attendance);
        $this->computeTardiness(collect([$attendance]));
        $this->realtime->broadcastForAttendance($attendance);
    }

    public function storeTravelOrder(array $data, int $stationId): void
    {
        if (! $this->repository->employeeBelongsToStation((int) $data['employee_id'], $stationId)) {
            abort(422, 'Selected employee does not belong to your station.');
        }

        $travelOrder = $this->repository->createEmployeeTravelOrder($data);

        $this->realtime->broadcastForTravelOrder($travelOrder);
    }

    private function updateMissingAttendanceTimes(Attendance $attendance, array $data): void
    {
        if (! empty($data['am_time_in']) && ! $attendance->am?->am_time_in) {
            $attendance->am()->updateOrCreate(
                ['attendance_id' => $attendance->id],
                ['am_time_in' => $data['am_time_in']],
            );
        }

        if (! empty($data['am_time_out']) && ! $attendance->am?->am_time_out) {
            $attendance->am()->updateOrCreate(
                ['attendance_id' => $attendance->id],
                ['am_time_out' => $data['am_time_out']],
            );
        }

        if (! empty($data['pm_time_in']) && ! $attendance->pm?->pm_time_in) {
            $attendance->pm()->updateOrCreate(
                ['attendance_id' => $attendance->id],
                ['pm_time_in' => $data['pm_time_in']],
            );
        }

        if (! empty($data['pm_time_out']) && ! $attendance->pm?->pm_time_out) {
            $attendance->pm()->updateOrCreate(
                ['attendance_id' => $attendance->id],
                ['pm_time_out' => $data['pm_time_out']],
            );
        }
    }

    private function computeTardiness($attendances): void
    {
        $fixed = $attendances->filter(
            fn ($attendance) => in_array(
                strtolower((string) $attendance->employee?->work_type),
                ['fixed', 'work from home'],
                true,
            ),
        );
        $full = $attendances->filter(
            fn ($attendance) => strtolower((string) $attendance->employee?->work_type) === 'full',
        );

        if ($fixed->isNotEmpty()) {
            $this->fixedService->computeForAttendances($fixed);
        }

        if ($full->isNotEmpty()) {
            $this->fullService->computeForAttendances($full);
        }
    }
}
