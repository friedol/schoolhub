<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\School;
use App\Models\Platform;

class SchoolSeeder extends Seeder
{
    public function run()
    {
        // Create platform
        $platform = Platform::create([
            'name' => 'EduTZ Platform',
            'description' => 'Multi-tenant educational management platform for Tanzania',
            'domain' => 'edutz-platform.com',
            'contact_email' => 'admin@edutz-platform.com',
            'contact_phone' => '+255 22 123 4567',
            'address' => 'Dar es Salaam, Tanzania',
            'region' => 'Dar es Salaam',
            'district' => 'Kinondoni',
            'is_active' => true,
            'subscription_plan' => 'enterprise',
            'subscription_expires_at' => now()->addYear(),
            'settings' => [
                'currency' => 'TZS',
                'language' => 'en',
                'timezone' => 'Africa/Dar_es_Salaam',
                'date_format' => 'd/m/Y',
                'time_format' => 'H:i'
            ]
        ]);

        // School 1: St. Mary's Secondary School
        $school1 = School::create([
            'platform_id' => $platform->id,
            'name' => 'St. Mary\'s Secondary School',
            'code' => 'SMSS',
            'description' => 'A leading secondary school in Dar es Salaam',
            'address' => 'P.O. Box 1234, Dar es Salaam',
            'region' => 'Dar es Salaam',
            'district' => 'Kinondoni',
            'ward' => 'Msasani',
            'contact_email' => 'info@stmarys.ac.tz',
            'contact_phone' => '+255 22 123 4567',
            'school_level' => 'secondary',
            'registration_number' => 'REG/2023/001',
            'necta_number' => 'NECTA/2023/001',
            'is_active' => true,
            'settings' => [
                'academic_year' => '2024/2025',
                'current_term' => 'term_1',
                'term_start_date' => '2024-01-15',
                'term_end_date' => '2024-04-15',
                'school_hours_start' => '07:30',
                'school_hours_end' => '15:30',
                'lunch_break_start' => '12:00',
                'lunch_break_end' => '13:00',
                'max_students_per_class' => 40,
                'grading_system' => 'percentage',
                'passing_grade' => 50,
                'attendance_threshold' => 75
            ]
        ]);

        // School 2: Kilimanjaro International School
        $school2 = School::create([
            'platform_id' => $platform->id,
            'name' => 'Kilimanjaro International School',
            'code' => 'KIS',
            'description' => 'An international secondary school in Arusha',
            'address' => 'P.O. Box 5678, Arusha',
            'region' => 'Arusha',
            'district' => 'Arusha City',
            'ward' => 'Central',
            'contact_email' => 'info@kilimanjaro-intl.ac.tz',
            'contact_phone' => '+255 27 987 6543',
            'school_level' => 'secondary',
            'registration_number' => 'REG/2023/002',
            'necta_number' => 'NECTA/2023/002',
            'is_active' => true,
            'settings' => [
                'academic_year' => '2024/2025',
                'current_term' => 'term_1',
                'term_start_date' => '2024-01-15',
                'term_end_date' => '2024-04-15',
                'school_hours_start' => '08:00',
                'school_hours_end' => '16:00',
                'lunch_break_start' => '12:30',
                'lunch_break_end' => '13:30',
                'max_students_per_class' => 35,
                'grading_system' => 'percentage',
                'passing_grade' => 50,
                'attendance_threshold' => 80
            ]
        ]);

        $this->command->info('Created 2 schools with platform');
    }
}
