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
        Schema::table('rooms', function (Blueprint $table) {
            if (!Schema::hasColumn('rooms', 'rows')) {
                $table->integer('rows')->nullable()->after('capacity');
            }
            if (!Schema::hasColumn('rooms', 'columns')) {
                $table->integer('columns')->nullable()->after('rows');
            }
        });

        Schema::table('seating_arrangements', function (Blueprint $table) {
            if (!Schema::hasColumn('seating_arrangements', 'is_reserved')) {
                $table->boolean('is_reserved')->default(false)->after('is_absent');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->dropColumn(['rows', 'columns']);
        });

        Schema::table('seating_arrangements', function (Blueprint $table) {
            $table->dropColumn(['is_reserved']);
        });
    }
};
