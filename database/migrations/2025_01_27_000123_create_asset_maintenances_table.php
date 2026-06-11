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
        Schema::create('asset_maintenances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->onDelete('cascade');
            $table->foreignId('school_id')->constrained('schools')->onDelete('cascade');
            $table->enum('maintenance_type', ['preventive', 'corrective', 'emergency', 'upgrade']);
            $table->date('maintenance_date');
            $table->date('next_maintenance_date')->nullable();
            $table->text('description');
            $table->decimal('cost', 15, 2)->default(0);
            $table->foreignId('performed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'cancelled'])->default('scheduled');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index(['inventory_item_id', 'status']);
            $table->index(['school_id', 'status']);
            $table->index('maintenance_date');
            $table->index('next_maintenance_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_maintenances');
    }
};



