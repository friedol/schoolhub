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
        Schema::create('hostel_leave_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('leave_application_id')->constrained('hostel_leave_applications')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->enum('action', ['applied', 'approved', 'rejected', 'cancelled', 'checked_out', 'checked_in', 'overdue']);
            $table->datetime('action_date');
            $table->string('previous_status')->nullable();
            $table->string('new_status')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('performed_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index(['leave_application_id', 'action_date']);
            $table->index(['student_id', 'action_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hostel_leave_histories');
    }
};



