<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
| Match scores, to spot bad fingerprint registrations early.
|
| fingerprint_scans: one row per identified finger, written by the
| fingerprint service with the score, then completed by Laravel with what the
| scan recorded. Low scores for one registered finger mean it should be
| registered again.
|
| biometrics.registration_score: how well the 3 scans of a registration
| matched each other (the lowest of the 3 pairs).
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fingerprint_scans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            // The registered finger that matched.
            $table->foreignId('biometric_id')->nullable()->constrained('biometrics')->nullOnDelete();
            // The station of the page that scanned (none for the fingerprint test).
            $table->foreignId('station_id')->nullable()->constrained('stations')->nullOnDelete();
            // attendance | test
            $table->string('purpose', 20)->default('attendance');
            $table->unsignedSmallInteger('score');
            // The match threshold in effect, so old scores stay readable
            // after the setting changes.
            $table->unsignedSmallInteger('threshold');
            // From the fingerprint service: identified | rejected (below the
            // threshold). Then from Laravel: recorded | prompt | cooldown |
            // already_recorded | locked | not_recorded.
            $table->string('outcome', 20);
            // What was recorded, e.g. "AM Time-In".
            $table->string('recorded', 20)->nullable();
            $table->timestamps();

            $table->index(['employee_id', 'created_at']);
            $table->index(['biometric_id', 'created_at']);
        });

        Schema::table('biometrics', function (Blueprint $table) {
            $table->unsignedSmallInteger('registration_score')->nullable()->after('fingerprint_template');
        });
    }

    public function down(): void
    {
        Schema::table('biometrics', function (Blueprint $table) {
            $table->dropColumn('registration_score');
        });

        Schema::dropIfExists('fingerprint_scans');
    }
};
