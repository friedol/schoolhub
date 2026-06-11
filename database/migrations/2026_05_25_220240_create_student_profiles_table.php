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
        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->string('admission_number')->unique();
            $table->date('admission_date');
            $table->foreignId('class_id')->constrained('school_classes')->onDelete('cascade');
            $table->string('stream')->nullable();
            $table->string('boarding_status')->default('day');
            $table->string('transport_route')->nullable();
            $table->json('medical_info')->nullable();
            $table->text('allergies')->nullable();
            $table->text('medications')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->string('emergency_contact_relationship')->nullable();
            $table->string('previous_school')->nullable();
            $table->string('previous_class')->nullable();
            $table->text('transfer_reason')->nullable();
            $table->json('disciplinary_records')->nullable();
            $table->json('achievements')->nullable();
            $table->json('extracurricular_activities')->nullable();
            $table->json('special_needs')->nullable();
            $table->json('learning_disabilities')->nullable();
            $table->string('parent_marital_status')->nullable();
            $table->json('siblings_in_school')->nullable();
            $table->string('family_income_range')->nullable();
            $table->string('scholarship_status')->nullable();
            $table->decimal('scholarship_amount', 10, 2)->default(0.00);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_profiles');
    }
};
