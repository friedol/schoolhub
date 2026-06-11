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
        Schema::create('book_renewals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_issuance_id')->constrained()->onDelete('cascade');
            $table->datetime('renewal_date');
            $table->date('new_due_date');
            $table->string('renewal_reason')->nullable();
            $table->foreignId('renewed_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['book_issuance_id']);
            $table->index(['renewal_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('book_renewals');
    }
};



