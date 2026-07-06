<?php

namespace App\Models;

use App\Models\Administrator\Station;
use Illuminate\Database\Eloquent\Model;

class LocatorSlipRequest extends Model
{
    protected $fillable = [
        'employee_name',
        'email',
        'position',
        'station_id',
        'purpose_of_travel',
        'destination',
        'travel_datetime',
        'travel_type',
        'status',
    ];

    protected $casts = [
        'travel_datetime' => 'datetime',
    ];

    public function station()
    {
        return $this->belongsTo(Station::class);
    }

    public function getPermanentStationAttribute(): string
    {
        return (string) ($this->station?->name ?? $this->attributes['permanent_station'] ?? '');
    }
}
