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
        Schema::create('library_fines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_issuance_id')->constrained()->onDelete('cascade');
            $table->foreignId('borrower_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('reason');
            $table->date('fine_date');
            $table->date('due_date')->nullable();
            $table->decimal('paid_amount', 10, 2)->default(0);
            $table->datetime('paid_date')->nullable();
            $table->string('status')->default('pending');
            $table->foreignId('waived_by')->nullable()->constrained('users')->onDelete('set null');
            $table->datetime('waived_date')->nullable();
            $table->text('waiver_reason')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index(['book_issuance_id']);
            $table->index(['borrower_id']);
            $table->index(['school_id']);
            $table->index(['status']);
            $table->index(['fine_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('library_fines');
    }
};



