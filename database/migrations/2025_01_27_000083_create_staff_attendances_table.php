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
        Schema::create('staff_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained('users')->onDelete('cascade');
            $table->date('date');
            $table->datetime('clock_in_time')->nullable();
            $table->datetime('clock_out_time')->nullable();
            $table->datetime('break_start_time')->nullable();
            $table->datetime('break_end_time')->nullable();
            $table->decimal('total_working_hours', 5, 2)->default(0);
            $table->decimal('overtime_hours', 5, 2)->default(0);
            $table->string('attendance_status')->default('absent');
            $table->string('clock_in_method')->nullable();
            $table->string('clock_out_method')->nullable();
            $table->string('clock_in_location')->nullable();
            $table->string('clock_out_location')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_late')->default(false);
            $table->boolean('is_early_departure')->default(false);
            $table->timestamps();

            $table->unique(['staff_id', 'date']);
            $table->index(['date', 'attendance_status']);
            $table->index(['staff_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_attendances');
    }
};



