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
        Schema::create('graduations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->integer('graduation_year');
            $table->date('graduation_date');
            $table->foreignId('final_class_id')->constrained('school_classes')->onDelete('cascade');
            $table->string('certificate_number')->unique();
            $table->date('certificate_issued_date');
            $table->string('necta_certificate_number')->nullable();
            $table->integer('necta_certificate_year')->nullable();
            $table->date('graduation_ceremony_date')->nullable();
            $table->boolean('graduation_ceremony_attended')->default(false);
            $table->text('graduation_speech')->nullable();
            $table->json('awards_received')->nullable();
            $table->string('higher_education_institution')->nullable();
            $table->string('higher_education_program')->nullable();
            $table->string('current_occupation')->nullable();
            $table->string('current_employer')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->text('address')->nullable();
            $table->boolean('is_alumni')->default(false);
            $table->date('alumni_member_since')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['student_id']);
            $table->index(['graduation_year']);
            $table->index(['final_class_id']);
            $table->index(['is_alumni']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('graduations');
    }
};



