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
        Schema::create('necta_candidates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->string('exam_type');
            $table->string('candidate_number')->unique();
            $table->string('index_number')->nullable();
            $table->string('registration_number')->nullable();
            $table->integer('exam_year');
            $table->string('exam_center')->nullable();
            $table->json('subjects')->nullable();
            $table->json('continuous_assessment_marks')->nullable();
            $table->json('final_marks')->nullable();
            $table->json('grades')->nullable();
            $table->json('points')->nullable();
            $table->string('division')->nullable();
            $table->boolean('is_registered')->default(false);
            $table->date('registration_date')->nullable();
            $table->string('submission_status')->default('pending');
            $table->timestamp('submitted_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['school_id', 'exam_type']);
            $table->index(['exam_year']);
            $table->index(['submission_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('necta_candidates');
    }
};



