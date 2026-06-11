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
        Schema::create('holidays', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('holiday_type')->index();
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_recurring')->default(false);
            $table->string('recurrence_pattern')->default('none');
            $table->boolean('is_public_holiday')->default(false);
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index(['school_id', 'holiday_type']);
            $table->index(['school_id', 'is_public_holiday']);
            $table->index(['school_id', 'is_recurring']);
            $table->index(['school_id', 'is_active']);
            $table->index(['school_id', 'start_date']);
            $table->index(['school_id', 'end_date']);
            $table->index(['start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('holidays');
    }
};