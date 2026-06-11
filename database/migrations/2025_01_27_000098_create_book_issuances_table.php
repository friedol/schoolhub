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
        Schema::create('book_issuances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained()->onDelete('cascade');
            $table->foreignId('book_copy_id')->constrained()->onDelete('cascade');
            $table->foreignId('borrower_id')->constrained('users')->onDelete('cascade');
            $table->string('borrower_type');
            $table->datetime('issue_date');
            $table->date('due_date');
            $table->datetime('return_date')->nullable();
            $table->string('status')->default('issued');
            $table->foreignId('issued_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('returned_by')->nullable()->constrained('users')->onDelete('set null');
            $table->integer('renewal_count')->default(0);
            $table->text('notes')->nullable();
            $table->decimal('fine_amount', 10, 2)->default(0);
            $table->decimal('fine_paid', 10, 2)->default(0);
            $table->datetime('fine_paid_date')->nullable();
            $table->timestamps();

            $table->index(['book_id']);
            $table->index(['book_copy_id']);
            $table->index(['borrower_id', 'borrower_type']);
            $table->index(['status']);
            $table->index(['due_date']);
            $table->index(['issue_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('book_issuances');
    }
};



