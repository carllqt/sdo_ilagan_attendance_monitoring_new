<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('hr_tardiness_batches', function (Blueprint $table) {
            $table->id();
            $table->string('batch_code')->unique(); 
            $table->date('start_month');
            $table->date('end_month');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hr_tardiness_batches');
    }
};