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
        Schema::create('fee_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('student_fee_id')->nullable()->constrained('student_fees')->onDelete('set null');
            $table->foreignId('fee_category_id')->nullable()->constrained('fee_categories')->onDelete('set null');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('TZS');
            $table->string('payment_method'); // cash, bank_transfer, mobile_money, cheque
            $table->string('payment_reference')->nullable();
            $table->string('transaction_id')->nullable();
            $table->date('payment_date');
            $table->string('status')->default('pending'); // pending, processing, completed, failed, cancelled
            $table->foreignId('processed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('processed_at')->nullable();
            $table->text('notes')->nullable();
            $table->string('receipt_number')->nullable();
            $table->string('bank_reference')->nullable();
            $table->string('mobile_money_provider')->nullable();
            $table->string('mobile_money_phone')->nullable();
            $table->string('mobile_money_transaction_id')->nullable();
            $table->timestamps();

            $table->index(['school_id', 'student_id']);
            $table->index(['student_fee_id']);
            $table->index(['fee_category_id']);
            $table->index(['status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fee_payments');
    }
};
