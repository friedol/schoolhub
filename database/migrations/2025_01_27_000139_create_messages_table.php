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
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->foreignId('message_template_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->string('recipient_type');
            $table->unsignedBigInteger('recipient_id');
            $table->enum('type', ['sms', 'email', 'push'])->default('sms');
            $table->string('subject')->nullable();
            $table->text('content');
            $table->enum('status', [
                'draft', 'scheduled', 'sending', 'sent', 'delivered', 
                'failed', 'cancelled'
            ])->default('draft');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->foreignId('reply_to_message_id')->nullable()->constrained('messages')->onDelete('cascade');
            $table->unsignedBigInteger('thread_id')->nullable();
            $table->json('metadata')->nullable();
            $table->decimal('cost', 10, 2)->default(0);
            $table->string('currency', 3)->default('TZS');
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index(['school_id', 'type']);
            $table->index(['school_id', 'status']);
            $table->index(['recipient_type', 'recipient_id']);
            $table->index(['sender_id', 'created_at']);
            $table->index(['thread_id']);
            $table->index(['scheduled_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};



