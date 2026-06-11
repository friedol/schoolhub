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
        Schema::create('curricula', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('code');
            $table->text('description')->nullable();
            $table->enum('level', ['nursery', 'primary', 'secondary', 'advanced']);
            $table->boolean('is_necta_curriculum')->default(false);
            $table->boolean('is_active')->default(true);
            $table->string('academic_year');
            $table->json('settings')->nullable();
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
        Schema::dropIfExists('curricula');
    }
};
