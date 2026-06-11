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
        Schema::create('data_backups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->string('backup_name');
            $table->string('backup_type')->index();
            $table->bigInteger('backup_size')->default(0);
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->string('backup_status')->default('pending')->index();
            $table->string('backup_method')->default('manual');
            $table->string('compression_type')->default('gzip');
            $table->boolean('encryption_enabled')->default(false);
            $table->timestamp('retention_until')->nullable();
            $table->json('metadata')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('completed_at')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index(['school_id', 'backup_type']);
            $table->index(['school_id', 'backup_status']);
            $table->index(['school_id', 'backup_method']);
            $table->index(['school_id', 'created_at']);
            $table->index(['retention_until']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_backups');
    }
};