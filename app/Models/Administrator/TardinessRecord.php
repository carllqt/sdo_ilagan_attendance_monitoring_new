<?php

namespace App\Models\Administrator;

use App\Models\HumanResource\HrTardinessConversion;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TardinessRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'attendance_id',
        'date',
        'am_tardy',
        'pm_tardy',
        'undertime',
        'total_tardy',
        'converted_tardy',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function attendance()
    {
        return $this->belongsTo(Attendance::class);
    }

    public function tardinessConversions()
    {
        return $this->belongsToMany(
            HrTardinessConversion::class,
            'hr_converted_tardiness_records',
            'tardiness_record_id',
            'hr_tardiness_convertions_id',
        )->withTimestamps();
    }
}
