<?php

namespace App\Models\HumanResource;

use App\Models\Administrator\TardinessRecord;
use Illuminate\Database\Eloquent\Model;

class HrConvertedTardinessRecord extends Model
{
    protected $table = 'hr_converted_tardiness_records';

    protected $fillable = [
        'hr_tardiness_convertions_id',
        'tardiness_record_id',
    ];

    public function tardinessConversion()
    {
        return $this->belongsTo(
            HrTardinessConversion::class,
            'hr_tardiness_convertions_id',
        );
    }

    public function tardinessRecord()
    {
        return $this->belongsTo(TardinessRecord::class);
    }
}
