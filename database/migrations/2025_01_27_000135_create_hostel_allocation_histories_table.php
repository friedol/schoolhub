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
        Schema::create('hostel_allocation_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('allocation_id')->constrained('hostel_allocations')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('hostel_id')->constrained('hostels')->onDelete('cascade');
            $table->foreignId('floor_id')->constrained('hostel_floors')->onDelete('cascade');
            $table->foreignId('room_id')->constrained('hostel_rooms')->onDelete('cascade');
            $table->foreignId('bed_id')->constrained('hostel_beds')->onDelete('cascade');
            $table->enum('action', ['allocated', 'transferred', 'deallocated', 'reallocated']);
            $table->datetime('action_date');
            $table->foreignId('previous_allocation_id')->nullable()->constrained('hostel_allocations')->onDelete('set null');
            $table->text('notes')->nullable();
            $table->foreignId('performed_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index(['student_id', 'action_date']);
            $table->index(['hostel_id', 'action_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hostel_allocation_histories');
    }
};



