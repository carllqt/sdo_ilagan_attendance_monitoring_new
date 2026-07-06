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
        Schema::create('travel_order_requests', function (Blueprint $table) {
            $table->id();
            $table->string('employee_name');
            $table->string('email');
            $table->string('position');
            $table->foreignId('station_id')->constrained('stations')->cascadeOnUpdate()->restrictOnDelete();
            $table->text('purpose_of_travel');
            $table->string('destination');
            $table->string('host_of_activity');
            $table->date('inclusive_dates');
            $table->string('fund_source');
            $table->string('status')->default('pending');
            $table->timestamps();

            $table->index(['inclusive_dates', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('travel_order_requests');
    }
};
