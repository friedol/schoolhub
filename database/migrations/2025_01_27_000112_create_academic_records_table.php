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
        Schema::create('academic_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->foreignId('academic_term_id')->constrained('academic_terms')->onDelete('cascade');
            $table->foreignId('school_class_id')->constrained('school_classes')->onDelete('cascade');
            $table->decimal('marks_obtained', 8, 2)->default(0);
            $table->decimal('total_marks', 8, 2)->default(100);
            $table->string('grade', 2)->nullable();
            $table->integer('position')->nullable();
            $table->text('teacher_comment')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamps();

            $table->unique(['student_id', 'subject_id', 'academic_term_id'], 'academic_record_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('academic_records');
    }
};



