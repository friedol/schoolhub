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
        Schema::create('report_card_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_card_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->decimal('marks', 8, 2);
            $table->string('grade', 2);
            $table->decimal('points', 3, 2);
            $table->integer('position');
            $table->integer('total_students');
            $table->text('teacher_comment')->nullable();
            $table->timestamps();

            $table->unique(['report_card_id', 'subject_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_card_subjects');
    }
};
