<?php

namespace App\Models\HumanResource;

use Illuminate\Database\Eloquent\Model;

class ConversionHours extends Model
{
    protected $table = 'convertion_hours';

    protected $fillable = ['hours', 'equivalent_days'];
}
