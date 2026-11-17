<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Administrator\Employee;

class Biometric extends Model
{
    protected $fillable = [
        'employee_id',
        'fingerprint_template',
        'finger_index',
        'registration_score',
    ];

    protected $hidden = ['fingerprint_template'];

    // How well the 3 registration scans matched each other (set by the
    // fingerprint service; null for fingers registered before it existed).
    protected $casts = [
        'registration_score' => 'integer',
    ];

    public function scans()
    {
        return $this->hasMany(FingerprintScan::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }
}

