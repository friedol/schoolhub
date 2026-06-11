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
        Schema::create('dashboard_widgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dashboard_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('report_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('name');
            $table->enum('type', [
                'metric_card', 'chart', 'table', 'calendar', 'list',
                'gauge', 'progress', 'text', 'image'
            ]);
            $table->enum('size', [
                'small', 'medium', 'large', 'wide', 'tall', 'full'
            ])->default('medium');
            $table->json('position')->nullable(); // {x: 0, y: 0}
            $table->json('config')->nullable();
            $table->unsignedInteger('refresh_interval')->nullable(); // in seconds
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['dashboard_id']);
            $table->index(['report_id']);
            $table->index(['type']);
            $table->index(['is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dashboard_widgets');
    }
};



