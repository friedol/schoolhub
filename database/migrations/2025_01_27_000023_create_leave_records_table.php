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
        Schema::create('leave_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained('users')->onDelete('cascade');
            $table->enum('leave_type', ['annual', 'sick', 'maternity', 'paternity', 'study', 'emergency', 'unpaid']);
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('total_days');
            $table->text('reason');
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled'])->default('pending');
            $table->date('applied_date');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->date('approved_date')->nullable();
            $table->text('rejected_reason')->nullable();
            $table->foreignId('rejected_by')->nullable()->constrained('users')->onDelete('set null');
            $table->date('rejected_date')->nullable();
            $table->string('emergency_contact')->nullable();
            $table->text('handover_notes')->nullable();
            $table->date('return_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['staff_id', 'status']);
            $table->index(['leave_type', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_records');
    }
};
