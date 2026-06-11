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
        Schema::create('issue_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->onDelete('cascade');
            $table->string('issue_number')->unique();
            $table->morphs('issued_to'); // issued_to_id, issued_to_type
            $table->foreignId('issued_by')->nullable()->constrained('users')->onDelete('set null');
            $table->date('issue_date');
            $table->text('purpose');
            $table->enum('status', ['pending', 'issued', 'returned', 'partially_returned'])->default('pending');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index(['school_id', 'status']);
            $table->index(['issued_to_id', 'issued_to_type']);
            $table->index('issue_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('issue_notes');
    }
};



