<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            SchoolSeeder::class,
            UserSeeder::class,
            GradeLevelSeeder::class,
            AcademicSeeder::class,
            HRSeeder::class,
            // FinanceSeeder::class, // Temporarily disabled - missing student_fees table
            LibrarySeeder::class,
            CommunicationSeeder::class,
        ]);
    }
}