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
        Schema::create('report_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('academic_term_id')->constrained()->onDelete('cascade');
            $table->foreignId('school_class_id')->constrained('school_classes')->onDelete('cascade');
            $table->decimal('total_marks', 8, 2);
            $table->decimal('average_marks', 5, 2);
            $table->string('grade');
            $table->integer('ranking');
            $table->text('teacher_comment')->nullable();
            $table->text('headteacher_comment')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamps();

            $table->index(['school_id', 'academic_term_id']);
            $table->index(['student_id', 'academic_term_id']);
            $table->unique(['student_id', 'academic_term_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_cards');
    }
};



