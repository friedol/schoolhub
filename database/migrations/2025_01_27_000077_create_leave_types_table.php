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
        Schema::create('leave_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('max_days_per_year')->default(0);
            $table->integer('max_days_per_request')->default(0);
            $table->boolean('requires_approval')->default(true);
            $table->boolean('requires_documentation')->default(false);
            $table->boolean('is_paid')->default(true);
            $table->string('accrual_type')->default('none');
            $table->decimal('accrual_rate', 5, 2)->default(0);
            $table->boolean('carry_forward')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['school_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_types');
    }
};



