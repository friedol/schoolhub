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
        Schema::create('dashboard_shares', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dashboard_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('permission', ['view', 'edit', 'admin'])->default('view');
            $table->foreignId('shared_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('shared_at');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->unique(['dashboard_id', 'user_id']);
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
        Schema::dropIfExists('dashboard_shares');
    }
};



