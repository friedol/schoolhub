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
        Schema::create('receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('payment_id')->constrained()->onDelete('cascade');
            $table->string('receipt_number')->unique();
            $table->date('receipt_date');
            $table->decimal('amount', 10, 2);
            $table->string('payment_method');
            $table->string('transaction_reference')->nullable();
            $table->json('fee_breakdown');
            $table->decimal('balance_carried_forward', 10, 2)->default(0);
            $table->boolean('is_duplicate')->default(false);
            $table->foreignId('duplicate_of')->nullable()->constrained('receipts')->onDelete('set null');
            $table->foreignId('generated_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('printed_at')->nullable();
            $table->string('language')->default('english');
            $table->timestamps();

            $table->index(['school_id', 'student_id']);
            $table->index(['payment_id']);
            $table->index(['receipt_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('receipts');
    }
};



