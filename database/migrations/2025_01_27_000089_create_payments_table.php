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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('invoice_id')->constrained()->onDelete('cascade');
            $table->string('payment_number')->unique();
            $table->decimal('amount', 10, 2);
            $table->string('payment_method');
            $table->datetime('payment_date');
            $table->string('transaction_reference')->nullable();
            $table->string('mobile_money_provider')->nullable();
            $table->string('mobile_money_number')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('bank_reference')->nullable();
            $table->string('receipt_number')->nullable();
            $table->string('status')->default('pending');
            $table->foreignId('processed_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('verified_at')->nullable();
            $table->text('notes')->nullable();
            $table->string('reconciliation_status')->default('pending');
            $table->timestamp('reconciled_at')->nullable();
            $table->foreignId('reconciled_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index(['school_id', 'student_id']);
            $table->index(['invoice_id']);
            $table->index(['payment_method']);
            $table->index(['status']);
            $table->index(['payment_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};



