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
        Schema::create('appraisal_goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('performance_appraisal_id')->constrained()->onDelete('cascade');
            $table->string('goal_title');
            $table->text('goal_description');
            $table->date('target_date');
            $table->text('success_criteria');
            $table->decimal('weight', 5, 2)->default(0);
            $table->string('status')->default('not_started');
            $table->text('progress_notes')->nullable();
            $table->decimal('achievement_rating', 3, 2)->nullable();
            $table->text('achievement_notes')->nullable();
            $table->timestamps();

            $table->index(['performance_appraisal_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appraisal_goals');
    }
};



