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
        Schema::create('school_configurations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->string('configuration_key')->index();
            $table->longText('configuration_value');
            $table->string('data_type')->default('string');
            $table->text('description')->nullable();
            $table->boolean('is_encrypted')->default(false);
            $table->boolean('is_public')->default(false);
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->unique(['school_id', 'configuration_key']);
            $table->index(['school_id', 'data_type']);
            $table->index(['school_id', 'is_public']);
            $table->index(['school_id', 'is_encrypted']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('school_configurations');
    }
};