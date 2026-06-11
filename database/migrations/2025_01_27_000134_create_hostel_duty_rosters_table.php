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
        Schema::create('hostel_duty_rosters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hostel_id')->constrained('hostels')->onDelete('cascade');
            $table->foreignId('warden_id')->constrained('users')->onDelete('cascade');
            $table->date('duty_date');
            $table->datetime('shift_start_time');
            $table->datetime('shift_end_time');
            $table->enum('duty_type', ['day_shift', 'night_shift', 'weekend_duty', 'emergency_duty']);
            $table->json('responsibilities')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['hostel_id', 'duty_date']);
            $table->index(['warden_id', 'duty_date']);
            $table->index(['duty_date', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hostel_duty_rosters');
    }
};



