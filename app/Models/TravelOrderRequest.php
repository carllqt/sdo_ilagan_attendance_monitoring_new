<?php

namespace App\Models;

use App\Models\Administrator\Station;
use Illuminate\Database\Eloquent\Model;

class TravelOrderRequest extends Model
{
    protected $fillable = [
        'employee_id',
        'first_name',
        'middle_name',
        'last_name',
        'extension_name',
        'employee_name',
        'email',
        'position',
        'station_id',
        'purpose_of_travel',
        'destination',
        'host_of_activity',
        'inclusive_dates',
        'fund_source',
        'status',
    ];

    protected $casts = [
        'inclusive_dates' => 'date',
    ];

    public function station()
    {
        return $this->belongsTo(Station::class);
    }

    public function getPermanentStationAttribute(): string
    {
        return (string) ($this->station?->name ?? $this->attributes['permanent_station'] ?? '');
    }

    public function getEmployeeNameAttribute($value): string
    {
        if (filled($value)) {
            return (string) $value;
        }

        return collect([
            $this->first_name,
            $this->middle_name,
            $this->last_name,
            $this->extension_name,
        ])
            ->filter(fn ($part) => filled($part))
            ->implode(' ');
    }
}
