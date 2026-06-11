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
        Schema::create('report_runs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained()->onDelete('cascade');
            $table->foreignId('run_by')->constrained('users')->onDelete('cascade');
            $table->enum('status', [
                'pending', 'running', 'completed', 'failed', 'cancelled'
            ])->default('pending');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->json('parameters')->nullable();
            $table->json('result_data')->nullable();
            $table->string('file_path')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->text('error_message')->nullable();
            $table->unsignedInteger('execution_time')->nullable(); // in seconds
            $table->timestamps();

            $table->index(['report_id', 'status']);
            $table->index(['run_by']);
            $table->index(['started_at']);
            $table->index(['status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_runs');
    }
};



