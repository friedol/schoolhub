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
        Schema::create('leave_application_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('leave_application_id')->constrained()->onDelete('cascade');
            $table->string('action');
            $table->foreignId('performed_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('performed_at');
            $table->text('comments')->nullable();
            $table->string('old_status')->nullable();
            $table->string('new_status')->nullable();
            $table->timestamps();

            $table->index(['leave_application_id', 'performed_at'], 'leave_app_history_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_application_histories');
    }
};
