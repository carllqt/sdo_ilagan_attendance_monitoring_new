<?php

namespace App\Data\Administrator\Attendance;

use Illuminate\Http\Request;

class AttendanceFilter
{
    private const PM_LOGS_START_MINUTES = 12 * 60 + 15;

    public function __construct(
        public readonly string $search,
        public readonly ?int $employeeId,
        public readonly string $session,
    ) {}

    public static function fromRequest(Request $request): self
    {
        $now = now();
        $defaultSession = ($now->hour * 60) + $now->minute < self::PM_LOGS_START_MINUTES
            ? 'AM'
            : 'PM';
        $session = strtoupper((string) $request->query(
            'logs',
            $defaultSession,
        ));

        if (! in_array($session, ['AM', 'PM'], true)) {
            $session = $defaultSession;
        }

        return new self(
            search: trim((string) $request->query('search', '')),
            employeeId: self::employeeIdFromRequest($request),
            session: $session,
        );
    }

    public function toArray(): array
    {
        return [
            'search' => $this->search,
            'employee_id' => $this->employeeId,
            'session' => $this->session,
        ];
    }

    private static function employeeIdFromRequest(Request $request): ?int
    {
        $employeeId = (int) $request->header(
            'X-Attendance-Employee-Id',
            $request->query('employee_id', 0),
        );

        return $employeeId > 0 ? $employeeId : null;
    }
}
