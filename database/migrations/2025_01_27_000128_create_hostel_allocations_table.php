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
        Schema::create('hostel_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hostel_id')->constrained('hostels')->onDelete('cascade');
            $table->foreignId('floor_id')->constrained('hostel_floors')->onDelete('cascade');
            $table->foreignId('room_id')->constrained('hostel_rooms')->onDelete('cascade');
            $table->foreignId('bed_id')->constrained('hostel_beds')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->date('allocation_date');
            $table->enum('allocation_type', ['new', 'transfer', 'reallocation']);
            $table->string('academic_year');
            $table->string('term');
            $table->boolean('is_active')->default(true);
            $table->text('allocation_notes')->nullable();
            $table->foreignId('allocated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index(['student_id', 'is_active']);
            $table->index(['hostel_id', 'is_active']);
            $table->index(['academic_year', 'term']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hostel_allocations');
    }
};



