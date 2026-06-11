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
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->longText('description');
            $table->enum('event_type', [
                'academic', 'sports', 'cultural', 'social', 'parent_meeting',
                'graduation', 'orientation', 'workshop', 'seminar', 'conference',
                'exhibition', 'fundraising', 'holiday', 'emergency', 'general'
            ])->default('general');
            $table->date('start_date');
            $table->date('end_date');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->string('location')->nullable();
            $table->boolean('is_all_day')->default(false);
            $table->boolean('is_public')->default(true);
            $table->boolean('requires_rsvp')->default(false);
            $table->integer('max_attendees')->nullable();
            $table->timestamp('registration_deadline')->nullable();
            $table->foreignId('organizer_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['draft', 'published', 'cancelled', 'completed'])->default('draft');
            $table->string('featured_image')->nullable();
            $table->json('attachments')->nullable();
            $table->json('metadata')->nullable();
            $table->unsignedInteger('views_count')->default(0);
            $table->timestamps();

            $table->index(['school_id', 'status']);
            $table->index(['school_id', 'event_type']);
            $table->index(['start_date']);
            $table->index(['end_date']);
            $table->index(['organizer_id']);
            $table->index(['requires_rsvp']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};



