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
        Schema::create('hr_tardiness_convertions', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('batch_id');
            $table->foreign('batch_id')->references('id')->on('hr_tardiness_batches')->onDelete('cascade');
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade'); 
            $table->decimal('total_tardy', 5, 2)->default(0);
            $table->decimal('total_hours', 5, 3)->default(0);
            $table->decimal('total_minutes', 5, 3)->default(0);
            $table->decimal('total_equivalent', 5, 3)->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hr_tardiness_convertions');
    }
};
