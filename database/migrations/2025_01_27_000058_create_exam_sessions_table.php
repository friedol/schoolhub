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
        Schema::create('exam_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->foreignId('school_class_id')->constrained('school_classes')->onDelete('cascade');
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->foreignId('room_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('invigilator_id')->nullable()->constrained('users')->onDelete('set null');
            $table->integer('max_marks')->default(100);
            $table->text('instructions')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamps();

            $table->index(['exam_id', 'date']);
            $table->index(['subject_id']);
            $table->index(['school_class_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_sessions');
    }
};



