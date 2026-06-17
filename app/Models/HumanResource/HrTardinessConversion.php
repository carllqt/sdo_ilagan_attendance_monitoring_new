<?php

namespace App\Models\HumanResource;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Administrator\Employee;
use App\Models\Administrator\TardinessRecord;

class HrTardinessConversion extends Model
{
    use HasFactory;

    protected $table = 'hr_tardiness_convertions';
    
    protected $fillable = [
        'employee_id',
        'batch_id',
        'total_tardy',
        'total_hours',
        'total_minutes',
        'total_equivalent',
    ];

    public function tardinessRecords()
    {
        return $this->belongsToMany(
            TardinessRecord::class,
            'hr_converted_tardiness_records',
            'hr_tardiness_convertions_id',
            'tardiness_record_id',
        )->withTimestamps();
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function batch()
    {
        return $this->belongsTo(HrTardinessBatch::class, 'batch_id');
    }
}
