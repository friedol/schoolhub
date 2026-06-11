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
        Schema::create('schools', function (Blueprint $table) {
            $table->id();
            $table->foreignId('platform_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->string('logo')->nullable();
            $table->string('motto')->nullable();
            $table->text('address');
            $table->string('region');
            $table->string('district');
            $table->string('ward')->nullable();
            $table->string('contact_email');
            $table->string('contact_phone');
            $table->enum('school_level', ['nursery', 'primary', 'secondary', 'combined']);
            $table->string('registration_number')->nullable();
            $table->string('necta_number')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('settings')->nullable();
            $table->json('academic_calendar')->nullable();
            $table->json('fee_structure')->nullable();
            $table->timestamps();

            $table->index(['platform_id', 'is_active']);
            $table->index(['region', 'district']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schools');
    }
};
