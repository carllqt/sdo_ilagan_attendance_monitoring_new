<?php

namespace App\Models\Administrator;

use App\Models\Administrator\AttendanceAm;
use App\Models\Administrator\AttendancePm;
use App\Models\Administrator\Employee;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Database\Factories\AttendanceFactory;

class Attendance extends Model
{
    /** @use HasFactory<\Database\Factories\AttendanceFactory> */
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'date',
    ];
    //old
    // public function am()
    // {
    //     return $this->hasOne(AttendanceAm::class);
    // }

    // public function pm()
    // {
    //     return $this->hasOne(AttendancePm::class);
    // }
    public function am()
    {
        return $this->hasOne(AttendanceAm::class, 'attendance_id');
    }

    public function pm()
    {
        return $this->hasOne(AttendancePm::class, 'attendance_id');
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function tardinessRecord()
    {
        return $this->hasOne(TardinessRecord::class);
    }

    protected static function newFactory()
    {
        return AttendanceFactory::new();
    }

}