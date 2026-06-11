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
        Schema::create('goods_received_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grn_id')->constrained('goods_received_notes')->onDelete('cascade');
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->onDelete('cascade');
            $table->integer('quantity_ordered');
            $table->integer('quantity_received');
            $table->integer('quantity_accepted');
            $table->integer('quantity_rejected')->default(0);
            $table->decimal('unit_price', 15, 2);
            $table->decimal('total_value', 15, 2);
            $table->enum('condition', ['good', 'damaged', 'defective'])->default('good');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['grn_id', 'inventory_item_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('goods_received_items');
    }
};



