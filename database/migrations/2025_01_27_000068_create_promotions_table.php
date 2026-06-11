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
        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('from_class_id')->constrained('school_classes')->onDelete('cascade');
            $table->foreignId('to_class_id')->constrained('school_classes')->onDelete('cascade');
            $table->string('from_academic_year');
            $table->string('to_academic_year');
            $table->date('promotion_date');
            $table->string('promotion_type');
            $table->text('reason')->nullable();
            $table->foreignId('promoted_by')->constrained('users')->onDelete('cascade');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'promotion_date']);
            $table->index(['from_class_id', 'to_class_id']);
            $table->index(['promotion_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};



