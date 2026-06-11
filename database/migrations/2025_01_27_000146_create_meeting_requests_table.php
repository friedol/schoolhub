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
        Schema::create('meeting_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->foreignId('requester_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('requested_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('student_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('subject');
            $table->text('message');
            $table->date('preferred_date');
            $table->time('preferred_time');
            $table->integer('duration')->default(30); // in minutes
            $table->enum('meeting_type', ['in_person', 'video_call', 'phone_call', 'hybrid'])->default('in_person');
            $table->enum('status', [
                'pending', 'approved', 'scheduled', 'completed', 'cancelled', 'declined'
            ])->default('pending');
            $table->date('scheduled_date')->nullable();
            $table->time('scheduled_time')->nullable();
            $table->string('meeting_link')->nullable();
            $table->text('meeting_notes')->nullable();
            $table->text('cancelled_reason')->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('feedback')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['school_id', 'status']);
            $table->index(['requester_id']);
            $table->index(['requested_user_id']);
            $table->index(['student_id']);
            $table->index(['scheduled_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meeting_requests');
    }
};



