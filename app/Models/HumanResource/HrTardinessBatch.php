<?php

namespace App\Models\HumanResource;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrTardinessBatch extends Model
{
    use HasFactory;

    protected $table = 'hr_tardiness_batches';
    public $incrementing = false;
    protected $keyType = 'int';

    protected $fillable = [
        'id',
        'start_month',
        'end_month',
    ];

    public function tardinessConvertions()
    {
        return $this->hasMany(HrTardinessConvertion::class, 'batch_id');
    }
}
