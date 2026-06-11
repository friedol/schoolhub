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
        Schema::create('fee_structures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->foreignId('fee_item_id')->constrained()->onDelete('cascade');
            $table->foreignId('school_class_id')->constrained()->onDelete('cascade');
            $table->string('academic_year');
            $table->string('term');
            $table->decimal('amount', 10, 2);
            $table->decimal('day_student_amount', 10, 2)->nullable();
            $table->decimal('boarding_student_amount', 10, 2)->nullable();
            $table->decimal('stream_specific_amount', 10, 2)->nullable();
            $table->decimal('transport_route_specific_amount', 10, 2)->nullable();
            $table->date('effective_date');
            $table->date('expiry_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index(['school_id', 'academic_year', 'term']);
            $table->index(['fee_item_id', 'school_class_id']);
            $table->index(['effective_date', 'expiry_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fee_structures');
    }
};



