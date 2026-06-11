<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fees_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index(['school_id', 'is_active']);
        });

        Schema::create('fees_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->onDelete('cascade');
            $table->foreignId('fees_group_id')->constrained('fees_groups')->onDelete('cascade');
            $table->string('name');
            $table->string('code')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index(['school_id', 'is_active']);
        });

        Schema::create('fees_masters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->onDelete('cascade');
            $table->foreignId('fees_group_id')->constrained('fees_groups')->onDelete('cascade');
            $table->foreignId('fees_type_id')->constrained('fees_types')->onDelete('cascade');
            $table->date('due_date')->nullable();
            $table->decimal('amount', 10, 2)->default(0);
            $table->enum('fine_type', ['none', 'percentage', 'fixed'])->default('none');
            $table->decimal('fine_amount', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index(['school_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fees_masters');
        Schema::dropIfExists('fees_types');
        Schema::dropIfExists('fees_groups');
    }
};
