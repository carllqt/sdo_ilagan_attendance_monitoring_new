<?php

namespace App\Services;

use App\Models\Administrator\Employee;
use Illuminate\Support\Facades\Cache;

class AttendanceMonitoringEventStore
{
    private const STORE = 'file';

    public function touchAttendanceEmployee(?int $employeeId): void
    {
        $stationId = $this->stationIdForEmployee($employeeId);

        if (! $stationId || ! $employeeId) {
            return;
        }

        $this->put($stationId, 'employee', [
            'employee_id' => $employeeId,
        ]);
        $this->put($stationId, 'recent_logs');
        $this->put($stationId, 'ranking');
    }

    public function touchTravelEmployee(?int $employeeId): void
    {
        $stationId = $this->stationIdForEmployee($employeeId);

        if (! $stationId) {
            return;
        }

        $this->put($stationId, 'travel');
    }

    public function version(int $stationId, string $type): ?array
    {
        return Cache::store(self::STORE)->get($this->key($stationId, $type));
    }

    private function stationIdForEmployee(?int $employeeId): ?int
    {
        if (! $employeeId) {
            return null;
        }

        return Employee::query()
            ->whereKey($employeeId)
            ->value('station_id');
    }

    private function put(int $stationId, string $type, array $payload = []): void
    {
        Cache::store(self::STORE)->forever($this->key($stationId, $type), [
            ...$payload,
            'version' => (string) hrtime(true),
            'station_id' => $stationId,
        ]);
    }

    private function key(int $stationId, string $type): string
    {
        return "attendance-monitoring:{$stationId}:{$type}";
    }
}
