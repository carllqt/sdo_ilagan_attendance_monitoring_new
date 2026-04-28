<?php

namespace App\Models\Administrator;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Database\Factories\AttendanceAmFactory;
use App\Models\Administrator\Employee;

class AttendanceAm extends Model
{
    use HasFactory;

    protected $fillable = [
        'am_time_in',
        'am_time_out',
    ];

    protected static function newFactory()
    {
        return AttendanceAmFactory::new();
    }

    public function attendance()
    {
        return $this->belongsTo(Attendance::class);
    }
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
