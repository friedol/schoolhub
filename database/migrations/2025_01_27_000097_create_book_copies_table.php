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
        Schema::create('book_copies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained()->onDelete('cascade');
            $table->integer('copy_number');
            $table->string('barcode')->unique();
            $table->string('qr_code')->unique();
            $table->string('status')->default('available');
            $table->string('condition')->default('good');
            $table->date('purchase_date')->nullable();
            $table->decimal('purchase_price', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->date('last_inspection_date')->nullable();
            $table->foreignId('last_inspection_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index(['book_id', 'status']);
            $table->index(['barcode']);
            $table->index(['qr_code']);
            $table->index(['status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('book_copies');
    }
};



