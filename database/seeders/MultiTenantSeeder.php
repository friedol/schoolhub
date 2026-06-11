<?php

namespace Database\Seeders;

use App\Models\Platform;
use App\Models\School;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class MultiTenantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create permissions first
        $this->createPermissions();
        
        // Create roles
        $this->createRoles();
        
        // Create platform
        $platform = $this->createPlatform();
        
        // Create super admin
        $this->createSuperAdmin($platform);
        
        // Create sample schools
        $this->createSampleSchools($platform);
    }

    private function createPermissions(): void
    {
        $permissions = Permission::getSystemPermissions();
        
        foreach ($permissions as $name => $data) {
            Permission::create([
                'name' => $name,
                'display_name' => $data['display_name'],
                'description' => $data['description'],
                'category' => $data['category'],
                'is_system_permission' => true,
            ]);
        }
    }

    private function createRoles(): void
    {
        $roles = Role::getSystemRoles();
        
        foreach ($roles as $name => $data) {
            Role::create([
                'name' => $name,
                'display_name' => $data['display_name'],
                'description' => $data['description'],
                'is_system_role' => true,
                'permissions' => $data['permissions'],
            ]);
        }
    }

    private function createPlatform(): Platform
    {
        return Platform::create([
            'name' => 'EduTZ Group',
            'description' => 'Leading educational platform for Tanzania schools',
            'domain' => 'edutz-group.com',
            'contact_email' => 'admin@edutz-group.com',
            'contact_phone' => '+255 22 123 4567',
            'address' => 'Dar es Salaam, Tanzania',
            'region' => 'Dar es Salaam',
            'district' => 'Kinondoni',
            'is_active' => true,
            'subscription_plan' => 'premium',
            'subscription_expires_at' => now()->addYear(),
            'settings' => [
                'currency' => 'TZS',
                'language' => 'en',
                'timezone' => 'Africa/Dar_es_Salaam',
                'date_format' => 'd/m/Y',
            ],
        ]);
    }

    private function createSuperAdmin(Platform $platform): void
    {
        User::create([
            'name' => 'Platform Administrator',
            'email' => 'admin@edutz-group.com',
            'phone' => '+255 22 123 4567',
            'password' => Hash::make('password'),
            'role' => 'super_admin',
            'platform_id' => $platform->id,
            'is_active' => true,
            'email_verified_at' => now(),
            'language_preference' => 'en',
        ]);
    }

    private function createSampleSchools(Platform $platform): void
    {
        $schools = [
            [
                'name' => 'EduTZ Academy - Dar es Salaam',
                'description' => 'Premier educational institution in Dar es Salaam',
                'address' => 'Msasani Peninsula, Dar es Salaam',
                'region' => 'Dar es Salaam',
                'district' => 'Kinondoni',
                'ward' => 'Msasani',
                'contact_email' => 'info@edutz-dar.ac.tz',
                'contact_phone' => '+255 22 234 5678',
                'school_level' => 'combined',
                'registration_number' => 'REG-001-2024',
                'necta_number' => 'NECTA-001-2024',
                'motto' => 'Excellence Through Knowledge',
                'admin_name' => 'Dr. John Mwalimu',
                'admin_email' => 'headmaster@edutz-dar.ac.tz',
                'admin_phone' => '+255 22 234 5679',
            ],
            [
                'name' => 'EduTZ Academy - Arusha',
                'description' => 'Quality education in the heart of Arusha',
                'address' => 'Njiro, Arusha',
                'region' => 'Arusha',
                'district' => 'Arusha',
                'ward' => 'Njiro',
                'contact_email' => 'info@edutz-arusha.ac.tz',
                'contact_phone' => '+255 27 345 6789',
                'school_level' => 'secondary',
                'registration_number' => 'REG-002-2024',
                'necta_number' => 'NECTA-002-2024',
                'motto' => 'Knowledge is Power',
                'admin_name' => 'Mrs. Sarah Kimaro',
                'admin_email' => 'headmaster@edutz-arusha.ac.tz',
                'admin_phone' => '+255 27 345 6790',
            ],
            [
                'name' => 'EduTZ Academy - Mwanza',
                'description' => 'Excellence in education on the shores of Lake Victoria',
                'address' => 'Nyamagana, Mwanza',
                'region' => 'Mwanza',
                'district' => 'Nyamagana',
                'ward' => 'Nyamagana',
                'contact_email' => 'info@edutz-mwanza.ac.tz',
                'contact_phone' => '+255 28 456 7890',
                'school_level' => 'primary',
                'registration_number' => 'REG-003-2024',
                'necta_number' => null,
                'motto' => 'Building Tomorrow Today',
                'admin_name' => 'Mr. Peter Mwita',
                'admin_email' => 'headmaster@edutz-mwanza.ac.tz',
                'admin_phone' => '+255 28 456 7891',
            ],
        ];

        foreach ($schools as $schoolData) {
            // Create the school
            $school = $platform->schools()->create([
                'name' => $schoolData['name'],
                'code' => $platform->generateSchoolCode(),
                'description' => $schoolData['description'],
                'address' => $schoolData['address'],
                'region' => $schoolData['region'],
                'district' => $schoolData['district'],
                'ward' => $schoolData['ward'],
                'contact_email' => $schoolData['contact_email'],
                'contact_phone' => $schoolData['contact_phone'],
                'school_level' => $schoolData['school_level'],
                'registration_number' => $schoolData['registration_number'],
                'necta_number' => $schoolData['necta_number'],
                'motto' => $schoolData['motto'],
                'is_active' => true,
                'settings' => [
                    'currency' => 'TZS',
                    'language' => 'en',
                    'timezone' => 'Africa/Dar_es_Salaam',
                ],
            ]);

            // Create the school admin
            User::create([
                'name' => $schoolData['admin_name'],
                'email' => $schoolData['admin_email'],
                'phone' => $schoolData['admin_phone'],
                'password' => Hash::make('password'),
                'role' => 'school_admin',
                'school_id' => $school->id,
                'platform_id' => $platform->id,
                'is_active' => true,
                'email_verified_at' => now(),
                'language_preference' => 'en',
            ]);

            // Create sample teachers
            $this->createSampleTeachers($school, $platform);
            
            // Create sample students
            $this->createSampleStudents($school, $platform);
        }
    }

    private function createSampleTeachers(School $school, Platform $platform): void
    {
        $teachers = [
            ['name' => 'Ms. Grace Mwalimu', 'email' => 'grace@' . strtolower(str_replace(' ', '', $school->name)) . '.ac.tz'],
            ['name' => 'Mr. David Kipanga', 'email' => 'david@' . strtolower(str_replace(' ', '', $school->name)) . '.ac.tz'],
            ['name' => 'Mrs. Mary Mwamba', 'email' => 'mary@' . strtolower(str_replace(' ', '', $school->name)) . '.ac.tz'],
        ];

        foreach ($teachers as $teacher) {
            User::create([
                'name' => $teacher['name'],
                'email' => $teacher['email'],
                'phone' => '+255 ' . rand(100, 999) . ' ' . rand(100, 999) . ' ' . rand(100, 999),
                'password' => Hash::make('password'),
                'role' => 'teacher',
                'school_id' => $school->id,
                'platform_id' => $platform->id,
                'date_of_birth' => now()->subYears(rand(25, 45)),
                'gender' => ['male', 'female'][rand(0, 1)],
                'address' => $school->address,
                'is_active' => true,
                'email_verified_at' => now(),
                'language_preference' => 'en',
            ]);
        }
    }

    private function createSampleStudents(School $school, Platform $platform): void
    {
        $students = [
            ['name' => 'John Mwalimu', 'gender' => 'male'],
            ['name' => 'Sarah Kimaro', 'gender' => 'female'],
            ['name' => 'Peter Mwita', 'gender' => 'male'],
            ['name' => 'Grace Mwamba', 'gender' => 'female'],
            ['name' => 'David Kipanga', 'gender' => 'male'],
        ];

        foreach ($students as $index => $student) {
            User::create([
                'name' => $student['name'],
                'email' => strtolower(str_replace(' ', '.', $student['name'])) . '@' . strtolower(str_replace(' ', '', $school->name)) . '.ac.tz',
                'phone' => '+255 ' . rand(100, 999) . ' ' . rand(100, 999) . ' ' . rand(100, 999),
                'password' => Hash::make('password'),
                'role' => 'student',
                'school_id' => $school->id,
                'platform_id' => $platform->id,
                'student_number' => str_pad($index + 1, 4, '0', STR_PAD_LEFT),
                'date_of_birth' => now()->subYears(rand(6, 18)),
                'gender' => $student['gender'],
                'address' => $school->address,
                'is_active' => true,
                'email_verified_at' => now(),
                'language_preference' => 'en',
            ]);
        }
    }
}
