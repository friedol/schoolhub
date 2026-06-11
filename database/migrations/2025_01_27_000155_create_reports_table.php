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
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('category', [
                'academic', 'financial', 'operational', 'regulatory', 'custom'
            ])->default('custom');
            $table->enum('type', ['pre_built', 'custom', 'dashboard'])->default('custom');
            $table->enum('data_source', [
                'students', 'teachers', 'attendance', 'academic_records', 'fees',
                'payments', 'inventory', 'transport', 'hostel', 'library',
                'events', 'communications'
            ]);
            $table->json('query_config')->nullable();
            $table->json('filter_config')->nullable();
            $table->json('output_config')->nullable();
            $table->boolean('is_public')->default(false);
            $table->boolean('is_scheduled')->default(false);
            $table->json('schedule_config')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('last_run_at')->nullable();
            $table->unsignedInteger('run_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['school_id', 'category']);
            $table->index(['school_id', 'type']);
            $table->index(['school_id', 'data_source']);
            $table->index(['created_by']);
            $table->index(['is_public']);
            $table->index(['is_scheduled']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};



