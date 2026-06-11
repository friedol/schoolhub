<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\School;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the schools
        $stMarys = School::where('code', 'SMSS')->first();
        $kilimanjaro = School::where('code', 'KIS')->first();

        // Create Super Admin with documented credentials
        User::updateOrCreate(
            ['email' => 'admin@edutz.com'],
            [
                'name' => 'Super Admin',
                'email' => 'admin@edutz.com',
                'password' => Hash::make('password'),
                'role' => 'super_admin',
                'school_id' => null,
                'platform_id' => 1,
                'is_active' => true,
            ]
        );

        // Create School Admin for St. Mary's with documented credentials
        if ($stMarys) {
            User::updateOrCreate(
                ['email' => 'admin@stmarys.ac.tz'],
                [
                    'name' => 'St. Mary\'s Admin',
                    'email' => 'admin@stmarys.ac.tz',
                    'password' => Hash::make('password'),
                    'role' => 'school_admin',
                    'school_id' => $stMarys->id,
                    'platform_id' => 1,
                    'is_active' => true,
                ]
            );
        }
        
        // Create School Admin for Kilimanjaro with documented credentials
        if ($kilimanjaro) {
            User::updateOrCreate(
                ['email' => 'admin@kilimanjaro-intl.ac.tz'],
                [
                    'name' => 'Kilimanjaro Admin',
                    'email' => 'admin@kilimanjaro-intl.ac.tz',
                    'password' => Hash::make('password'),
                    'role' => 'school_admin',
                    'school_id' => $kilimanjaro->id,
                    'platform_id' => 1,
                    'is_active' => true,
                ]
            );
        }

        $this->command->info('Test users created successfully!');
        $this->command->info('Super Admin: admin@edutz.com / password');
        $this->command->info('St. Mary\'s Admin: admin@stmarys.ac.tz / password');
        $this->command->info('Kilimanjaro Admin: admin@kilimanjaro-intl.ac.tz / password');
    }
}



