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
        Schema::create('hostel_wardens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hostel_id')->constrained('hostels')->onDelete('cascade');
            $table->foreignId('warden_id')->constrained('users')->onDelete('cascade');
            $table->enum('position', ['chief_warden', 'senior_warden', 'warden', 'assistant_warden']);
            $table->json('responsibilities')->nullable();
            $table->json('shift_schedule')->nullable();
            $table->string('emergency_contact')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->boolean('is_active')->default(true);
            $table->date('assigned_date');
            $table->foreignId('assigned_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['hostel_id', 'warden_id']);
            $table->index(['hostel_id', 'is_active']);
            $table->index(['warden_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hostel_wardens');
    }
};



