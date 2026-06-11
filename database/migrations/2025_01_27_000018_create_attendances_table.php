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
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('class_id')->nullable()->constrained('school_classes')->onDelete('cascade');
            $table->date('date');
            $table->enum('status', ['present', 'absent', 'late', 'excused']);
            $table->time('time_in')->nullable();
            $table->time('time_out')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('marked_by')->constrained('users')->onDelete('cascade');
            $table->boolean('is_late')->default(false);
            $table->text('late_reason')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'date']);
            $table->index(['school_id', 'date']);
            $table->index(['class_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
