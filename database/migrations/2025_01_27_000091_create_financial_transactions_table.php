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
        Schema::create('financial_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->string('transaction_type');
            $table->string('category');
            $table->string('subcategory')->nullable();
            $table->decimal('amount', 12, 2);
            $table->text('description');
            $table->string('reference_number')->nullable();
            $table->date('transaction_date');
            $table->string('payment_method')->nullable();
            $table->string('account_type');
            $table->string('account_id')->nullable();
            $table->string('related_model')->nullable();
            $table->unsignedBigInteger('related_id')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->boolean('is_reconciled')->default(false);
            $table->timestamp('reconciled_at')->nullable();
            $table->foreignId('reconciled_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['school_id', 'transaction_type']);
            $table->index(['category']);
            $table->index(['transaction_date']);
            $table->index(['related_model', 'related_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_transactions');
    }
};



