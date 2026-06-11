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
        Schema::create('student_medical_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->string('record_type');
            $table->string('condition_name');
            $table->text('description')->nullable();
            $table->string('severity')->nullable();
            $table->date('diagnosis_date')->nullable();
            $table->text('treatment')->nullable();
            $table->json('medications')->nullable();
            $table->json('allergies')->nullable();
            $table->json('dietary_restrictions')->nullable();
            $table->text('emergency_instructions')->nullable();
            $table->string('doctor_name')->nullable();
            $table->string('doctor_contact')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'record_type']);
            $table->index(['student_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_medical_records');
    }
};



