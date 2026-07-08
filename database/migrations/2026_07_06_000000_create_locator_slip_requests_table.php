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
        Schema::create('locator_slip_requests', function (Blueprint $table) {
            $table->id();
            $table->string('employee_id');
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('extension_name')->nullable();
            $table->string('employee_name');
            $table->string('email');
            $table->string('position');
            $table->foreignId('station_id')->constrained('stations')->cascadeOnUpdate()->restrictOnDelete();
            $table->text('purpose_of_travel');
            $table->string('destination');
            $table->dateTime('travel_datetime');
            $table->string('travel_type');
            $table->string('status')->default('pending');
            $table->timestamps();

            $table->index(['travel_datetime', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('locator_slip_requests');
    }
};
