<?php

namespace App\Http\Controllers\Concerns\HandleModalConcerns;

use App\Models\Administrator\Employee;

trait EmployeeModals
{
    public function isEmployeeModal(string $modal): bool
    {
        return request('modal') === $modal;
    }

    public function resolveEmployeeActionModal(string $modal): ?array
    {
        if (! $this->isEmployeeModal($modal)) {
            return null;
        }

        $employee = Employee::with('office:id,name')
            ->select(
                'id',
                'first_name',
                'middle_name',
                'last_name',
                'profile_img',
                'position',
                'office_id',
                'station_id',
                'work_type',
                'active_status',
            )
            ->find(request('employee_id'));

        if (! $employee) {
            return null;
        }

        return [
            'id' => $employee->id,
            'full_name' => $this->formatEmployeeName($employee),
            'first_name' => $employee->first_name,
            'middle_name' => $employee->middle_name,
            'last_name' => $employee->last_name,
            'profile_img' => $employee->profile_img,
            'position' => $employee->position,
            'office_id' => $employee->office_id,
            'office' => $employee->office,
            'station_id' => $employee->station_id,
            'work_type' => $employee->work_type,
            'active_status' => $employee->active_status,
            'is_department_head' => $employee->is_department_head,
            'is_unit_head' => $employee->is_unit_head,
            'is_division_head' => $employee->is_division_head,
            'is_school_admin' => $employee->is_school_admin,
        ];
    }

    public function resolveTestFingerprintModal(): bool
    {
        return $this->isEmployeeModal('test-fingerprint');
    }

    public function resolveFingerprintEmployee(int $stationId): ?array
    {
        $fingerprintEmployee = request('fingerprint_registration', request('fingerprint_employee_id'));
        $employeeId = (int) preg_replace('/\D.*/', '', (string) $fingerprintEmployee);

        if (! $employeeId) {
            return null;
        }

        $employee = Employee::with('office.division:id,code,name')
            ->select(
                'id',
                'first_name',
                'middle_name',
                'last_name',
                'profile_img',
                'position',
                'office_id',
            )
            ->withCount(['biometrics'])
            ->where('station_id', $stationId)
            ->having('biometrics_count', '<', 3)
            ->find($employeeId);

        return $employee ? $this->formatFingerprintEmployee($employee) : null;
    }

    public function formatEmployeeName(?Employee $employee): string
    {
        if (! $employee) {
            return 'Employee';
        }

        $name = preg_replace(
            '/\s+/',
            ' ',
            trim("{$employee->first_name} {$employee->middle_name} {$employee->last_name}"),
        );

        return $name !== '' ? $name : 'Employee';
    }

    public function formatFingerprintEmployee(Employee $employee): array
    {
        $fullName = $this->formatEmployeeName($employee);
        $availableFingers = max(3 - (int) $employee->biometrics_count, 0);

        return [
            'id' => $employee->id,
            'label' => $fullName,
            'full_name' => $fullName,
            'meta' => collect([
                $employee->office?->name,
                $employee->office?->division?->code,
            ])->filter()->join(' - '),
            'search' => $fullName,
            'profile_img' => $employee->profile_img,
            'position' => $employee->position,
            'office' => $employee->office,
            'available_fingers' => $availableFingers,
        ];
    }
}
