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
        Schema::create('student_disciplinary_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->date('incident_date');
            $table->string('incident_type');
            $table->text('description');
            $table->string('severity');
            $table->string('action_taken');
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
            $table->json('witnesses')->nullable();
            $table->boolean('parent_notified')->default(false);
            $table->date('parent_notification_date')->nullable();
            $table->boolean('follow_up_required')->default(false);
            $table->date('follow_up_date')->nullable();
            $table->boolean('resolved')->default(false);
            $table->date('resolved_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'incident_date']);
            $table->index(['teacher_id', 'incident_date']);
            $table->index(['incident_type', 'severity']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_disciplinary_records');
    }
};



