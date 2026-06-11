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
        Schema::create('report_shares', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('permission', ['view', 'run', 'edit', 'admin'])->default('view');
            $table->foreignId('shared_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('shared_at');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->unique(['report_id', 'user_id']);
            $table->index(['user_id']);
            $table->index(['shared_by']);
            $table->index(['expires_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_shares');
    }
};



