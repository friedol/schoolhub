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
        Schema::create('subject_combination_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_combination_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->boolean('is_principal')->default(false);
            $table->boolean('is_subsidiary')->default(false);
            $table->boolean('is_compulsory')->default(true);
            $table->timestamps();

            $table->unique(['subject_combination_id', 'subject_id'], 'subject_combination_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subject_combination_subjects');
    }
};
