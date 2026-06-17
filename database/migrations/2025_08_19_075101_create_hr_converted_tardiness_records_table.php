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
        Schema::create('hr_converted_tardiness_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_tardiness_convertions_id');
            $table->foreignId('tardiness_record_id')->constrained('tardiness_records')->onDelete('cascade');
            $table->timestamps();

            $table->foreign('hr_tardiness_convertions_id', 'hr_ctr_convertion_fk')
                ->references('id')
                ->on('hr_tardiness_convertions')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hr_converted_tardiness_records');
    }
};
