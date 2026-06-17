<?php

namespace App\Models\HumanResource;

use Illuminate\Database\Eloquent\Model;

class ConversionMinutes extends Model
{
    protected $table = 'convertion_minutes';

    protected $fillable = ['minutes', 'equivalent_days'];
}
