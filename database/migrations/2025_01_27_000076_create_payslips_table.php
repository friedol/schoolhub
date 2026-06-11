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
        Schema::create('payslips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_record_id')->constrained()->onDelete('cascade');
            $table->foreignId('staff_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('payroll_id')->constrained()->onDelete('cascade');
            $table->string('payslip_number')->unique();
            $table->timestamp('generated_at');
            $table->boolean('is_downloaded')->default(false);
            $table->timestamp('downloaded_at')->nullable();
            $table->string('language')->default('english');
            $table->timestamps();

            $table->index(['staff_id', 'payroll_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payslips');
    }
};



