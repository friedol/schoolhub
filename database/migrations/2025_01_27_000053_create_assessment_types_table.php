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
        Schema::create('assessment_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('code');
            $table->text('description')->nullable();
            $table->decimal('weight', 5, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_necta_assessment')->default(false);
            $table->integer('max_marks')->default(100);
            $table->json('grading_scale')->nullable();
            $table->timestamps();

            $table->index(['school_id', 'is_active']);
            $table->unique(['school_id', 'code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assessment_types');
    }
};



