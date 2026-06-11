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
        Schema::create('curriculum_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('curriculum_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->boolean('is_core')->default(false);
            $table->boolean('is_elective')->default(false);
            $table->integer('credits')->nullable();
            $table->integer('weekly_periods')->nullable();
            $table->boolean('is_compulsory')->default(true);
            $table->integer('passing_grade')->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();

            $table->unique(['curriculum_id', 'subject_id']);
            $table->index(['curriculum_id', 'is_core']);
            $table->index(['curriculum_id', 'is_compulsory']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('curriculum_subjects');
    }
};