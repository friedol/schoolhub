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
        Schema::create('event_rsvps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('response', ['attending', 'not_attending', 'maybe', 'no_response'])->default('no_response');
            $table->integer('guests_count')->default(0);
            $table->text('dietary_requirements')->nullable();
            $table->text('special_needs')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['event_id', 'user_id']);
            $table->index(['school_id', 'response']);
            $table->index(['event_id', 'response']);
            $table->index(['user_id']);
            $table->index(['responded_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_rsvps');
    }
};



