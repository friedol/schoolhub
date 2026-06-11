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
        Schema::create('performance_appraisals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appraisal_cycle_id')->constrained()->onDelete('cascade');
            $table->foreignId('staff_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('appraiser_id')->constrained('users')->onDelete('cascade');
            $table->json('goals')->nullable();
            $table->json('self_assessment')->nullable();
            $table->json('manager_assessment')->nullable();
            $table->decimal('overall_rating', 3, 2)->nullable();
            $table->text('strengths')->nullable();
            $table->text('areas_for_improvement')->nullable();
            $table->text('development_plan')->nullable();
            $table->text('meeting_notes')->nullable();
            $table->date('meeting_date')->nullable();
            $table->string('status')->default('not_started');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['appraisal_cycle_id', 'staff_id']);
            $table->index(['staff_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('performance_appraisals');
    }
};



