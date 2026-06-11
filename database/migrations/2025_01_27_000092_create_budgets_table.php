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
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->string('academic_year');
            $table->string('budget_name');
            $table->string('department');
            $table->string('budget_type');
            $table->decimal('total_budgeted_amount', 12, 2);
            $table->decimal('total_actual_amount', 12, 2)->default(0);
            $table->date('start_date');
            $table->date('end_date');
            $table->string('status')->default('draft');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            $table->index(['school_id', 'academic_year']);
            $table->index(['department']);
            $table->index(['budget_type']);
            $table->index(['status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};



