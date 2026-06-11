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
        Schema::create('seating_arrangements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_session_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->string('seat_number');
            $table->integer('row_number');
            $table->integer('column_number');
            $table->foreignId('room_id')->constrained()->onDelete('cascade');
            $table->boolean('is_absent')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['exam_session_id', 'student_id']);
            $table->index(['room_id']);
            $table->unique(['exam_session_id', 'seat_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seating_arrangements');
    }
};



