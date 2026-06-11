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
        Schema::create('hostel_leave_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('allocation_id')->constrained('hostel_allocations')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('hostel_id')->constrained('hostels')->onDelete('cascade');
            $table->enum('leave_type', ['weekend', 'holiday', 'emergency', 'medical', 'family', 'academic']);
            $table->text('leave_reason');
            $table->date('departure_date');
            $table->time('departure_time');
            $table->date('expected_return_date');
            $table->time('expected_return_time');
            $table->date('actual_return_date')->nullable();
            $table->time('actual_return_time')->nullable();
            $table->string('destination');
            $table->string('emergency_contact');
            $table->string('parent_contact');
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled', 'active', 'completed', 'overdue'])->default('pending');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->boolean('check_in_verified')->default(false);
            $table->boolean('check_out_verified')->default(false);
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('application_notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index(['student_id', 'status']);
            $table->index(['hostel_id', 'status']);
            $table->index(['departure_date', 'expected_return_date'], 'leave_dates_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hostel_leave_applications');
    }
};
