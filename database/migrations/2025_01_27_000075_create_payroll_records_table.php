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
        Schema::create('payroll_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_id')->constrained()->onDelete('cascade');
            $table->foreignId('staff_id')->constrained('users')->onDelete('cascade');
            $table->decimal('basic_salary', 10, 2);
            $table->decimal('house_allowance', 10, 2)->default(0);
            $table->decimal('transport_allowance', 10, 2)->default(0);
            $table->decimal('risk_allowance', 10, 2)->default(0);
            $table->decimal('medical_allowance', 10, 2)->default(0);
            $table->decimal('other_allowances', 10, 2)->default(0);
            $table->decimal('overtime_pay', 10, 2)->default(0);
            $table->decimal('bonus', 10, 2)->default(0);
            $table->decimal('advance_payment', 10, 2)->default(0);
            $table->decimal('gross_pay', 10, 2);
            $table->decimal('nssf_deduction', 10, 2)->default(0);
            $table->decimal('paye_deduction', 10, 2)->default(0);
            $table->decimal('sdl_deduction', 10, 2)->default(0);
            $table->decimal('loan_deduction', 10, 2)->default(0);
            $table->decimal('insurance_deduction', 10, 2)->default(0);
            $table->decimal('other_deductions', 10, 2)->default(0);
            $table->decimal('total_deductions', 10, 2);
            $table->decimal('net_pay', 10, 2);
            $table->integer('attendance_days')->default(0);
            $table->integer('working_days')->default(0);
            $table->integer('leave_days')->default(0);
            $table->integer('absent_days')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['payroll_id', 'staff_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payroll_records');
    }
};



