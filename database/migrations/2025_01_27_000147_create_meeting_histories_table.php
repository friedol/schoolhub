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
        Schema::create('meeting_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meeting_request_id')->constrained()->onDelete('cascade');
            $table->string('action');
            $table->text('notes')->nullable();
            $table->foreignId('performed_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('performed_at');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['meeting_request_id', 'performed_at']);
            $table->index(['performed_by']);
            $table->index(['action']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meeting_histories');
    }
};



