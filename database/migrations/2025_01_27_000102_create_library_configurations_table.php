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
        Schema::create('library_configurations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->integer('student_loan_limit')->default(2);
            $table->integer('teacher_loan_limit')->default(5);
            $table->integer('staff_loan_limit')->default(3);
            $table->integer('student_loan_period_days')->default(14);
            $table->integer('teacher_loan_period_days')->default(30);
            $table->integer('staff_loan_period_days')->default(21);
            $table->integer('grace_period_days')->default(1);
            $table->decimal('daily_fine_rate', 8, 2)->default(100.00);
            $table->decimal('max_fine_amount', 10, 2)->default(5000.00);
            $table->integer('reservation_expiry_days')->default(7);
            $table->integer('max_renewals')->default(2);
            $table->integer('renewal_period_days')->default(14);
            $table->boolean('auto_calculate_fines')->default(true);
            $table->boolean('send_overdue_notifications')->default(true);
            $table->integer('notification_days_before_due')->default(1);
            $table->boolean('is_active')->default(true);
            $table->foreignId('updated_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index(['school_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('library_configurations');
    }
};



