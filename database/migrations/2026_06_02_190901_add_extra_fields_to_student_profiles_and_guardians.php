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
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->string('father_name')->nullable()->after('notes');
            $table->string('mother_name')->nullable()->after('father_name');
            $table->string('father_occupation')->nullable()->after('mother_name');
            $table->string('mother_occupation')->nullable()->after('father_occupation');
            $table->string('father_income_range')->nullable()->after('mother_occupation');
            $table->string('blood_group')->nullable()->after('father_income_range');
            $table->string('religion')->nullable()->after('blood_group');
            $table->string('nationality')->nullable()->after('religion');
            $table->string('country')->nullable()->after('nationality');
            $table->string('region')->nullable()->after('country');
            $table->string('district')->nullable()->after('region');
            $table->string('ward')->nullable()->after('district');
            $table->string('village')->nullable()->after('ward');
            $table->text('address_details')->nullable()->after('village');
            $table->json('submitted_documents')->nullable()->after('address_details');
            $table->json('uploaded_documents')->nullable()->after('submitted_documents');
        });

        Schema::table('student_guardians', function (Blueprint $table) {
            $table->string('photo')->nullable()->after('notes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'father_name',
                'mother_name',
                'father_occupation',
                'mother_occupation',
                'father_income_range',
                'blood_group',
                'religion',
                'nationality',
                'country',
                'region',
                'district',
                'ward',
                'village',
                'address_details',
                'submitted_documents',
                'uploaded_documents',
            ]);
        });

        Schema::table('student_guardians', function (Blueprint $table) {
            $table->dropColumn('photo');
        });
    }
};
