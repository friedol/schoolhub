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
        Schema::create('library_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->string('transaction_type');
            $table->foreignId('book_id')->constrained()->onDelete('cascade');
            $table->foreignId('book_copy_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('borrower_id')->constrained('users')->onDelete('cascade');
            $table->string('borrower_type');
            $table->datetime('transaction_date');
            $table->date('due_date')->nullable();
            $table->datetime('return_date')->nullable();
            $table->decimal('fine_amount', 10, 2)->default(0);
            $table->string('status')->default('completed');
            $table->foreignId('processed_by')->constrained('users')->onDelete('cascade');
            $table->text('notes')->nullable();
            $table->foreignId('related_transaction_id')->nullable()->constrained('library_transactions')->onDelete('set null');
            $table->timestamps();

            $table->index(['school_id', 'transaction_type']);
            $table->index(['book_id']);
            $table->index(['borrower_id', 'borrower_type']);
            $table->index(['transaction_date']);
            $table->index(['status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('library_transactions');
    }
};



