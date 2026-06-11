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
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->onDelete('cascade');
            $table->foreignId('category_id')->nullable()->constrained('inventory_categories')->onDelete('set null');
            $table->string('item_code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('item_type', ['consumable', 'asset'])->default('consumable');
            $table->string('manufacturer')->nullable();
            $table->string('model')->nullable();
            $table->string('serial_number')->nullable();
            $table->string('unit_of_measure')->default('each');
            $table->decimal('cost_price', 15, 2)->default(0);
            $table->decimal('replacement_value', 15, 2)->default(0);
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->onDelete('set null');
            $table->integer('current_stock')->default(0);
            $table->integer('min_stock_level')->default(0);
            $table->integer('reorder_level')->default(0);
            $table->integer('max_stock_level')->default(0);
            $table->string('location')->nullable();
            $table->string('shelf_location')->nullable();
            $table->string('barcode')->nullable();
            $table->string('qr_code')->nullable();
            $table->string('batch_number')->nullable();
            $table->date('expiry_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index(['school_id', 'item_type']);
            $table->index(['school_id', 'category_id']);
            $table->index(['supplier_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
