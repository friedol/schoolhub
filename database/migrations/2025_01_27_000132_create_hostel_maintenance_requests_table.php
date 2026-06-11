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
        Schema::create('hostel_maintenance_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hostel_id')->constrained('hostels')->onDelete('cascade');
            $table->foreignId('room_id')->nullable()->constrained('hostel_rooms')->onDelete('cascade');
            $table->foreignId('bed_id')->nullable()->constrained('hostel_beds')->onDelete('cascade');
            $table->foreignId('requested_by')->constrained('users')->onDelete('cascade');
            $table->enum('request_type', ['plumbing', 'electrical', 'furniture', 'cleaning', 'safety', 'appliance', 'structural', 'other']);
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->string('title');
            $table->text('description');
            $table->date('request_date');
            $table->enum('status', ['pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'on_hold'])->default('pending');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->date('assigned_date')->nullable();
            $table->decimal('estimated_cost', 15, 2)->nullable();
            $table->decimal('actual_cost', 15, 2)->nullable();
            $table->date('completion_date')->nullable();
            $table->text('resolution_notes')->nullable();
            $table->json('attachments')->nullable();
            $table->boolean('is_urgent')->default(false);
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index(['hostel_id', 'status']);
            $table->index(['requested_by', 'status']);
            $table->index(['assigned_to', 'status']);
            $table->index(['request_date', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hostel_maintenance_requests');
    }
};



