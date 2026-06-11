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
        Schema::create('hostel_inventories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hostel_id')->constrained('hostels')->onDelete('cascade');
            $table->foreignId('room_id')->nullable()->constrained('hostel_rooms')->onDelete('cascade');
            $table->foreignId('bed_id')->nullable()->constrained('hostel_beds')->onDelete('cascade');
            $table->string('item_name');
            $table->enum('item_type', ['bedding', 'furniture', 'electronics', 'appliances', 'maintenance', 'safety']);
            $table->string('item_code')->unique();
            $table->integer('quantity');
            $table->enum('condition', ['excellent', 'good', 'fair', 'poor', 'damaged', 'beyond_repair'])->default('good');
            $table->date('purchase_date')->nullable();
            $table->decimal('purchase_cost', 15, 2)->default(0);
            $table->string('supplier')->nullable();
            $table->date('warranty_expiry')->nullable();
            $table->date('last_maintenance_date')->nullable();
            $table->date('next_maintenance_date')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index(['hostel_id', 'item_type']);
            $table->index(['hostel_id', 'condition']);
            $table->index(['hostel_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hostel_inventories');
    }
};



