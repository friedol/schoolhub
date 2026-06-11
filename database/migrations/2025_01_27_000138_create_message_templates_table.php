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
        Schema::create('message_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('subject')->nullable();
            $table->text('content');
            $table->enum('type', ['sms', 'email', 'push'])->default('sms');
            $table->enum('category', [
                'fee_reminder', 'absence_alert', 'event_notification', 
                'exam_notice', 'holiday_notice', 'emergency', 'general', 
                'academic', 'transport', 'hostel'
            ])->default('general');
            $table->enum('language', ['en', 'sw'])->default('en');
            $table->json('variables')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index(['school_id', 'type']);
            $table->index(['school_id', 'category']);
            $table->index(['school_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('message_templates');
    }
};



