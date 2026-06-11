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
        Schema::create('issue_note_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('issue_note_id')->constrained('issue_notes')->onDelete('cascade');
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->onDelete('cascade');
            $table->integer('quantity_issued');
            $table->decimal('unit_price', 15, 2);
            $table->decimal('total_value', 15, 2);
            $table->enum('condition', ['good', 'fair', 'poor'])->default('good');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['issue_note_id', 'inventory_item_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('issue_note_items');
    }
};



