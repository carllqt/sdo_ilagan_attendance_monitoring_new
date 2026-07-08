<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('attendance-monitoring.station.{stationId}', function ($user, int $stationId) {
    return (int) $user->employee?->station_id === $stationId
        || $user->hasAnyRole(['sdo_admin', 'sdo_hr']);
});
