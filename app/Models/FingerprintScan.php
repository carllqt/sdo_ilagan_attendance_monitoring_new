<?php

namespace App\Models;

use App\Models\Administrator\Employee;
use App\Models\Administrator\Station;
use Illuminate\Database\Eloquent\Model;

/**
 * One identified fingerprint and its match score. The fingerprint service
 * writes the row; Laravel adds what the scan recorded.
 */
class FingerprintScan extends Model
{
    // Set by the fingerprint service.
    public const IDENTIFIED = 'identified';
    public const REJECTED = 'rejected';

    // Set by Laravel once the scan is handled.
    public const RECORDED = 'recorded';
    public const PROMPT = 'prompt';
    public const COOLDOWN = 'cooldown';
    public const ALREADY_RECORDED = 'already_recorded';
    public const LOCKED = 'locked';
    public const NOT_RECORDED = 'not_recorded';

    protected $fillable = [
        'employee_id',
        'biometric_id',
        'station_id',
        'purpose',
        'score',
        'threshold',
        'outcome',
        'recorded',
    ];

    protected $casts = [
        'score' => 'integer',
        'threshold' => 'integer',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function biometric()
    {
        return $this->belongsTo(Biometric::class);
    }

    public function station()
    {
        return $this->belongsTo(Station::class);
    }
}
