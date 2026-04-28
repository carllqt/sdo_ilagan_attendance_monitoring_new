<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Administrator\Employee;

class EmployeeLeave extends Model
{
    use HasFactory;

    protected $table = 'employee_leaves';

    protected $fillable = [
        'employee_id',
        'date',
        'leave_type',
    ];

    /**
     * Relationship: EmployeeLeave belongs to an Employee
     */
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
