<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
| One attendance row per employee per day, and one AM / PM row per
| attendance. Backstop for the per-employee scan lock in AttendanceService:
| a double scan can no longer create duplicate records.
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->unique(['employee_id', 'date'], 'attendances_employee_id_date_unique');
        });

        Schema::table('attendance_ams', function (Blueprint $table) {
            $table->unique('attendance_id', 'attendance_ams_attendance_id_unique');
        });

        Schema::table('attendance_pms', function (Blueprint $table) {
            $table->unique('attendance_id', 'attendance_pms_attendance_id_unique');
        });
    }

    public function down(): void
    {
        Schema::table('attendance_pms', function (Blueprint $table) {
            $table->dropUnique('attendance_pms_attendance_id_unique');
        });

        Schema::table('attendance_ams', function (Blueprint $table) {
            $table->dropUnique('attendance_ams_attendance_id_unique');
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->dropUnique('attendances_employee_id_date_unique');
        });
    }
};
