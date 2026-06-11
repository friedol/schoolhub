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
        Schema::create('student_guardians', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->string('guardian_name');
            $table->string('relationship');
            $table->string('phone_number');
            $table->string('email')->nullable();
            $table->string('occupation')->nullable();
            $table->string('employer')->nullable();
            $table->text('address')->nullable();
            $table->boolean('is_primary_contact')->default(false);
            $table->boolean('is_emergency_contact')->default(false);
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'is_primary_contact']);
            $table->index(['student_id', 'is_emergency_contact']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_guardians');
    }
};



