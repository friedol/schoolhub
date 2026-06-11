<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE attendances MODIFY COLUMN status ENUM('present','absent','late','excused','sick','leave') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("UPDATE attendances SET status = 'excused' WHERE status IN ('sick','leave')");
        DB::statement("ALTER TABLE attendances MODIFY COLUMN status ENUM('present','absent','late','excused') NOT NULL");
    }
};
