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
        Schema::table('users', function (Blueprint $table) {
            // Add multi-tenant fields
            $table->string('phone')->nullable()->after('email');
            $table->enum('role', [
                'super_admin', 
                'school_admin', 
                'headteacher', 
                'bursar', 
                'librarian',
                'dormitory_manager',
                'academic_master',
                'teacher', 
                'student', 
                'parent'
            ])->default('student')->after('phone');
            
            $table->foreignId('school_id')->nullable()->constrained()->onDelete('cascade')->after('role');
            $table->foreignId('platform_id')->nullable()->constrained()->onDelete('cascade')->after('school_id');
            
            // Student-specific fields
            $table->string('student_number')->nullable()->after('platform_id');
            $table->foreignId('parent_id')->nullable()->constrained('users')->onDelete('set null')->after('student_number');
            
            // Personal information
            $table->date('date_of_birth')->nullable()->after('parent_id');
            $table->enum('gender', ['male', 'female', 'other'])->nullable()->after('date_of_birth');
            $table->text('address')->nullable()->after('gender');
            $table->string('profile_photo')->nullable()->after('address');
            
            // Status and preferences
            $table->boolean('is_active')->default(true)->after('profile_photo');
            $table->timestamp('last_login_at')->nullable()->after('is_active');
            $table->enum('language_preference', ['en', 'sw'])->default('en')->after('last_login_at');
            $table->json('settings')->nullable()->after('language_preference');
            
            // Add indexes
            $table->index(['school_id', 'role']);
            $table->index(['platform_id', 'role']);
            $table->index(['role', 'is_active']);
            $table->unique(['school_id', 'student_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['school_id']);
            $table->dropForeign(['platform_id']);
            $table->dropForeign(['parent_id']);
            
            $table->dropIndex(['school_id', 'role']);
            $table->dropIndex(['platform_id', 'role']);
            $table->dropIndex(['role', 'is_active']);
            $table->dropUnique(['school_id', 'student_number']);
            
            $table->dropColumn([
                'phone',
                'role',
                'school_id',
                'platform_id',
                'student_number',
                'parent_id',
                'date_of_birth',
                'gender',
                'address',
                'profile_photo',
                'is_active',
                'last_login_at',
                'language_preference',
                'settings',
            ]);
        });
    }
};
