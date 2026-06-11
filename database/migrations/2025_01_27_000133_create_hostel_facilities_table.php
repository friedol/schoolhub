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
        Schema::create('hostel_facilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hostel_id')->constrained('hostels')->onDelete('cascade');
            $table->string('facility_name');
            $table->enum('facility_type', ['common_room', 'washroom', 'study_area', 'laundry', 'kitchen', 'dining_hall', 'recreation', 'storage']);
            $table->string('location');
            $table->integer('capacity')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_available')->default(true);
            $table->json('maintenance_schedule')->nullable();
            $table->date('last_maintenance_date')->nullable();
            $table->date('next_maintenance_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['hostel_id', 'facility_type']);
            $table->index(['hostel_id', 'is_available']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hostel_facilities');
    }
};



