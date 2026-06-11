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
        Schema::create('necta_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('necta_candidate_id')->constrained()->onDelete('cascade');
            $table->string('subject_code');
            $table->string('subject_name');
            $table->decimal('continuous_assessment_mark', 5, 2)->nullable();
            $table->decimal('final_exam_mark', 5, 2)->nullable();
            $table->decimal('total_mark', 5, 2)->nullable();
            $table->string('grade')->nullable();
            $table->decimal('points', 3, 2)->nullable();
            $table->boolean('is_principal')->default(false);
            $table->boolean('is_subsidiary')->default(false);
            $table->boolean('is_compulsory')->default(false);
            $table->timestamps();

            $table->index(['necta_candidate_id', 'subject_code']);
            $table->unique(['necta_candidate_id', 'subject_code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('necta_results');
    }
};



