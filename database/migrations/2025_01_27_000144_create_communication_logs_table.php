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
        Schema::create('communication_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->string('communication_type');
            $table->unsignedBigInteger('communication_id');
            $table->string('sender_type');
            $table->unsignedBigInteger('sender_id');
            $table->string('recipient_type');
            $table->unsignedBigInteger('recipient_id');
            $table->string('action');
            $table->json('details')->nullable();
            $table->json('metadata')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->index(['school_id', 'communication_type']);
            $table->index(['communication_type', 'communication_id']);
            $table->index(['sender_type', 'sender_id']);
            $table->index(['recipient_type', 'recipient_id']);
            $table->index(['action']);
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('communication_logs');
    }
};



