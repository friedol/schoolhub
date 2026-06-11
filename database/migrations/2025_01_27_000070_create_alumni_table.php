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
        Schema::create('alumni', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('graduation_id')->nullable()->constrained()->onDelete('set null');
            $table->integer('graduation_year');
            $table->string('final_class');
            $table->string('current_name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('country')->nullable();
            $table->string('occupation')->nullable();
            $table->string('employer')->nullable();
            $table->string('industry')->nullable();
            $table->string('higher_education_institution')->nullable();
            $table->string('higher_education_degree')->nullable();
            $table->integer('higher_education_year')->nullable();
            $table->string('social_media_linkedin')->nullable();
            $table->string('social_media_facebook')->nullable();
            $table->string('social_media_twitter')->nullable();
            $table->string('social_media_instagram')->nullable();
            $table->boolean('is_mentor')->default(false);
            $table->json('mentor_areas')->nullable();
            $table->boolean('is_volunteer')->default(false);
            $table->json('volunteer_areas')->nullable();
            $table->boolean('newsletter_subscription')->default(true);
            $table->boolean('event_notifications')->default(true);
            $table->string('privacy_level')->default('alumni_only');
            $table->date('last_contact_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['graduation_year']);
            $table->index(['final_class']);
            $table->index(['is_mentor']);
            $table->index(['is_volunteer']);
            $table->index(['privacy_level']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alumni');
    }
};



