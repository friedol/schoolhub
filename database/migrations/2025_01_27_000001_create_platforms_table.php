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
        Schema::create('platforms', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('domain')->unique();
            $table->string('logo')->nullable();
            $table->string('contact_email');
            $table->string('contact_phone');
            $table->text('address');
            $table->string('region');
            $table->string('district');
            $table->boolean('is_active')->default(true);
            $table->string('subscription_plan')->default('basic');
            $table->timestamp('subscription_expires_at')->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('platforms');
    }
};
