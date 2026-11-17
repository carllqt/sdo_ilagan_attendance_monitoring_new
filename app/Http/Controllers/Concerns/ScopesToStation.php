<?php

namespace App\Http\Controllers\Concerns;

trait ScopesToStation
{
    /**
     * The station the current user is limited to when opening or changing
     * a record by ID. SDO admins (super admin) can work across every
     * station, so they get null (no limit).
     */
    protected function editableStationId(): ?int
    {
        $user = auth()->user();

        if ($user->hasRole('sdo_admin')) {
            return null;
        }

        $stationId = $user->employee?->station_id;

        if (! $stationId) {
            abort(403, 'Station not assigned to this user.');
        }

        return (int) $stationId;
    }
}
