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
        Schema::create('interviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_application_id')->constrained()->onDelete('cascade');
            $table->date('interview_date');
            $table->time('interview_time');
            $table->foreignId('interviewer_id')->constrained('users')->onDelete('cascade');
            $table->string('interview_type');
            $table->string('location')->nullable();
            $table->string('status')->default('scheduled');
            $table->decimal('score', 5, 2)->nullable();
            $table->decimal('max_score', 5, 2)->default(100);
            $table->text('comments')->nullable();
            $table->string('recommendation')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['student_application_id', 'interview_date']);
            $table->index(['interviewer_id', 'interview_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interviews');
    }
};



