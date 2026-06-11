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
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->string('vehicle_number')->unique();
            $table->string('registration_number')->unique();
            $table->string('make');
            $table->string('model');
            $table->integer('year');
            $table->string('color');
            $table->integer('capacity');
            $table->enum('vehicle_type', ['bus', 'van', 'car', 'truck']);
            $table->enum('fuel_type', ['petrol', 'diesel', 'electric', 'hybrid']);
            $table->string('insurance_company')->nullable();
            $table->string('insurance_policy_number')->nullable();
            $table->date('insurance_expiry')->nullable();
            $table->string('license_plate')->unique();
            $table->string('chassis_number')->nullable();
            $table->string('engine_number')->nullable();
            $table->date('purchase_date')->nullable();
            $table->decimal('purchase_price', 10, 2)->nullable();
            $table->decimal('current_value', 10, 2)->nullable();
            $table->foreignId('driver_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('route_id')->nullable();
            $table->enum('status', ['active', 'maintenance', 'out_of_service', 'sold'])->default('active');
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['school_id', 'is_active']);
            $table->index(['status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};



