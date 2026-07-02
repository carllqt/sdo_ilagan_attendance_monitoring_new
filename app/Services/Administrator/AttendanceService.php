<?php

namespace App\Services\Administrator;

use App\Data\Administrator\Attendance\AttendanceFilter;
use App\Models\Administrator\Employee;
use App\Models\AttendanceDevice;
use App\Models\User;
use App\Repositories\Administrator\AttendanceRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AttendanceService
{
    public const DEVICE_COOKIE = 'attendance_device_token';
    public const UNLOCK_SESSION = 'attendance_unlocked';
    public const UNLOCK_MINUTES = 30;

    public function __construct(
        private readonly AttendanceRepository $repository,
    ) {}

    public function pageData(Request $request): array
    {
        $user = $request->user();
        $stationId = $this->stationId($user);
        $device = $this->registeredDevice($request);
        $deviceRegistered = $device && (int) $device->station_id === $stationId;
        $unlocked = $deviceRegistered && $this->isUnlocked($request, $device);
        $filter = AttendanceFilter::fromRequest($request);

        if ($deviceRegistered) {
            $this->repository->touchDevice($device);
        }

        return [
            'attendances' => $unlocked
                ? $this->repository->todayAttendancesForStation($stationId, $filter)
                : [],
            'attendanceFilters' => $filter->toArray(),
            'fingerprintServiceUrl' => $this->fingerprintServiceUrl($request),
            'attendanceAccess' => [
                'device_registered' => $deviceRegistered,
                'unlocked' => $unlocked,
                'unlock_expires_at' => session(self::UNLOCK_SESSION . '.expires_at'),
                'station' => [
                    'id' => $user->employee?->station?->id,
                    'name' => $user->employee?->station?->name,
                ],
                'admin' => [
                    'id' => $user->employee?->id,
                    'name' => $user->employee?->full_name,
                ],
            ],
        ];
    }

    public function registerDevice(Request $request): array
    {
        $user = $request->user();
        $stationId = $this->stationId($user);
        $token = Str::random(64);

        $this->repository->createDevice(
            $stationId,
            $user->id,
            $token,
            $request->input('name') ?: $request->userAgent(),
        );

        return [
            'token' => $token,
            'minutes' => 60 * 24 * 365,
        ];
    }

    public function suggestions(Request $request): array
    {
        return $this->repository
            ->attendanceEmployeeSuggestions(
                $this->stationId($request->user()),
                trim((string) $request->query('search', '')),
            )
            ->map(fn (Employee $employee) => $this->formatSuggestion($employee))
            ->all();
    }

    public function unlock(Request $request, int $scannedEmployeeId): void
    {
        $user = $request->user();
        $stationId = $this->stationId($user);
        $device = $this->registeredDevice($request);

        if (! $device || (int) $device->station_id !== $stationId) {
            abort(403, 'This device is not registered for your station.');
        }

        if ((int) $user->employee_id !== $scannedEmployeeId) {
            abort(403, 'Fingerprint does not match the logged-in station admin.');
        }

        $this->repository->touchDevice($device);

        session()->put(self::UNLOCK_SESSION, [
            'device_id' => $device->id,
            'station_id' => $stationId,
            'employee_id' => $scannedEmployeeId,
            'expires_at' => now()->addMinutes(self::UNLOCK_MINUTES)->toIso8601String(),
        ]);
    }

    public function lock(): void
    {
        session()->forget(self::UNLOCK_SESSION);
    }

    public function stationId(User $user): int
    {
        $employee = $user->employee;

        if (! $employee?->station_id) {
            abort(403, 'Station not assigned to this user.');
        }

        if (
            ! $user->hasAnyRole(['school_admin', 'sdo_admin', 'sdo_hr']) &&
            ! $employee->stationRoles()->where('type', 'school_admin')->exists()
        ) {
            abort(403, 'Only station admins can access attendance.');
        }

        return (int) $employee->station_id;
    }

    private function registeredDevice(Request $request): ?AttendanceDevice
    {
        return $this->repository->deviceByToken(
            (string) $request->cookie(self::DEVICE_COOKIE, ''),
        );
    }

    private function isUnlocked(Request $request, AttendanceDevice $device): bool
    {
        $unlock = session(self::UNLOCK_SESSION);

        if (! is_array($unlock)) {
            return false;
        }

        return (int) ($unlock['device_id'] ?? 0) === (int) $device->id
            && (int) ($unlock['station_id'] ?? 0) === (int) $device->station_id
            && now()->lessThan($unlock['expires_at'] ?? now()->subSecond());
    }

    private function fingerprintServiceUrl(Request $request): string
    {
        return rtrim(
            env('BIOMETRIC_SERVICE_URL') ?: $request->getScheme() . '://' . $request->getHost() . ':5000',
            '/',
        );
    }

    private function formatSuggestion(Employee $employee): array
    {
        $fullName = $employee->full_name ?: 'Employee';

        return [
            'id' => $employee->id,
            'label' => $fullName,
            'full_name' => $fullName,
            'meta' => collect([
                $employee->position,
                $employee->office?->name,
            ])->filter()->join(' - '),
            'search' => $fullName,
            'profile_img' => $employee->profile_img,
        ];
    }
}
