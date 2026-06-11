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
        Schema::create('message_recipients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained()->onDelete('cascade');
            $table->string('recipient_type');
            $table->unsignedBigInteger('recipient_id');
            $table->string('recipient_contact');
            $table->enum('status', [
                'pending', 'sent', 'delivered', 'failed', 'bounced', 'blocked'
            ])->default('pending');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->text('error_message')->nullable();
            $table->decimal('cost', 10, 2)->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['message_id', 'status']);
            $table->index(['recipient_type', 'recipient_id']);
            $table->index(['status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('message_recipients');
    }
};



