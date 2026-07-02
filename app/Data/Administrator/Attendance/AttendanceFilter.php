<?php

namespace App\Data\Administrator\Attendance;

use Illuminate\Http\Request;

class AttendanceFilter
{
    public const LIMIT = 6;

    public function __construct(
        public readonly string $search,
        public readonly ?int $employeeId,
        public readonly string $session,
        public readonly int $page,
    ) {}

    public static function fromRequest(Request $request): self
    {
        $session = strtoupper((string) $request->query(
            'session',
            now()->hour < 12 ? 'AM' : 'PM',
        ));

        if (! in_array($session, ['AM', 'PM'], true)) {
            $session = now()->hour < 12 ? 'AM' : 'PM';
        }

        return new self(
            search: trim((string) $request->query('search', '')),
            employeeId: self::employeeIdFromRequest($request),
            session: $session,
            page: max((int) $request->query('page', 1), 1),
        );
    }

    public function toArray(): array
    {
        return [
            'search' => $this->search,
            'employee_id' => $this->employeeId,
            'session' => $this->session,
            'page' => $this->page,
            'limit' => self::LIMIT,
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
