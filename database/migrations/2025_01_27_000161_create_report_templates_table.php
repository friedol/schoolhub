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
        Schema::create('report_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('category', [
                'academic', 'financial', 'operational', 'regulatory'
            ]);
            $table->enum('data_source', [
                'students', 'teachers', 'attendance', 'academic_records', 'fees',
                'payments', 'inventory', 'transport', 'hostel', 'library',
                'events', 'communications'
            ]);
            $table->json('query_template')->nullable();
            $table->json('filter_template')->nullable();
            $table->json('output_template')->nullable();
            $table->boolean('is_system')->default(false);
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index(['school_id', 'category']);
            $table->index(['school_id', 'data_source']);
            $table->index(['is_system']);
            $table->index(['created_by']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_templates');
    }
};



