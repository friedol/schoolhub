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
        Schema::create('hostel_rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hostel_id')->constrained('hostels')->onDelete('cascade');
            $table->foreignId('floor_id')->constrained('hostel_floors')->onDelete('cascade');
            $table->string('room_number');
            $table->string('room_name')->nullable();
            $table->enum('room_type', ['single', 'double', 'dormitory']);
            $table->integer('capacity');
            $table->integer('current_occupancy')->default(0);
            $table->json('amenities')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['hostel_id', 'room_number']);
            $table->index(['hostel_id', 'floor_id']);
            $table->index(['hostel_id', 'room_type']);
            $table->index(['hostel_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hostel_rooms');
    }
};



