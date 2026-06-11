<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\School;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        $schools = School::all();
        
        foreach ($schools as $school) {
            $this->createUsersForSchool($school);
        }
    }

    private function createUsersForSchool($school)
    {
        // Create roles for the school
        $this->createRolesForSchool($school);

        // Super Admin (Platform level)
        if ($school->id === 1) {
            User::factory()->superAdmin()->create([
                'name' => 'Super Admin',
                'email' => 'superadmin@edutz.com',
                'phone' => '+255 700 000 001',
            ]);
        }

        // School Admin / Headteacher
        User::factory()->headteacher($school)->create([
            'name' => 'Headteacher',
            'email' => "headteacher@{$school->code}.ac.tz",
            'phone' => '+255 700 000 ' . str_pad($school->id . '00', 3, '0', STR_PAD_LEFT),
        ]);

        // Bursar
        User::factory()->create([
            'name' => 'Finance Manager',
            'email' => "bursar@{$school->code}.ac.tz",
            'phone' => '+255 700 000 ' . str_pad($school->id . '01', 3, '0', STR_PAD_LEFT),
            'role' => 'bursar',
            'school_id' => $school->id,
            'platform_id' => $school->platform_id,
        ]);

        // Librarian
        User::factory()->create([
            'name' => 'Library Manager',
            'email' => "librarian@{$school->code}.ac.tz",
            'phone' => '+255 700 000 ' . str_pad($school->id . '02', 3, '0', STR_PAD_LEFT),
            'role' => 'librarian',
            'school_id' => $school->id,
            'platform_id' => $school->platform_id,
        ]);

        // Dormitory Manager (if boarding school)
        if ($school->school_level === 'secondary') {
            User::factory()->create([
                'name' => 'Dormitory Manager',
                'email' => "dormitory@{$school->code}.ac.tz",
                'phone' => '+255 700 000 ' . str_pad($school->id . '03', 3, '0', STR_PAD_LEFT),
                'role' => 'dormitory_manager',
                'school_id' => $school->id,
                'platform_id' => $school->platform_id,
            ]);
        }

        // Academic Master
        User::factory()->create([
            'name' => 'Academic Master',
            'email' => "academic@{$school->code}.ac.tz",
            'phone' => '+255 700 000 ' . str_pad($school->id . '04', 3, '0', STR_PAD_LEFT),
            'role' => 'academic_master',
            'school_id' => $school->id,
            'platform_id' => $school->platform_id,
        ]);

        // Teachers (5-8 teachers per school)
        $teacherCount = $school->id === 1 ? 8 : 6;
        User::factory()->count($teacherCount)->teacher($school)->create();

        // Students (20-30 students per school)
        $studentCount = $school->id === 1 ? 30 : 25;
        User::factory()->count($studentCount)->student($school)->create();

        // Parents (15-20 parents per school)
        $parentCount = $school->id === 1 ? 20 : 15;
        User::factory()->count($parentCount)->parent($school)->create();
    }

    private function createRolesForSchool($school)
    {
        $roles = [
            [
                'name' => 'headteacher',
                'display_name' => 'Headteacher',
                'description' => 'School headteacher with full administrative access',
                'is_system_role' => true,
                'permissions' => ['*']
            ],
            [
                'name' => 'bursar',
                'display_name' => 'Bursar',
                'description' => 'Financial management and fee collection',
                'is_system_role' => true,
                'permissions' => ['finance.*', 'students.view', 'reports.financial']
            ],
            [
                'name' => 'librarian',
                'display_name' => 'Librarian',
                'description' => 'Library management and book circulation',
                'is_system_role' => true,
                'permissions' => ['library.*', 'students.view']
            ],
            [
                'name' => 'dormitory_manager',
                'display_name' => 'Dormitory Manager',
                'description' => 'Hostel and dormitory management',
                'is_system_role' => true,
                'permissions' => ['hostel.*', 'students.view']
            ],
            [
                'name' => 'academic_master',
                'display_name' => 'Academic Master',
                'description' => 'Academic programs and student admissions',
                'is_system_role' => true,
                'permissions' => ['academic.*', 'students.*', 'reports.academic']
            ],
            [
                'name' => 'teacher',
                'display_name' => 'Teacher',
                'description' => 'Class management and student assessment',
                'is_system_role' => true,
                'permissions' => ['academic.classes.view', 'academic.assessments.*', 'students.view']
            ],
            [
                'name' => 'student',
                'display_name' => 'Student',
                'description' => 'Student portal access',
                'is_system_role' => true,
                'permissions' => ['student.portal.*']
            ],
            [
                'name' => 'parent',
                'display_name' => 'Parent',
                'description' => 'Parent portal access',
                'is_system_role' => true,
                'permissions' => ['parent.portal.*']
            ]
        ];

        foreach ($roles as $roleData) {
            Role::create([
                'school_id' => $school->id,
                'name' => $roleData['name'],
                'display_name' => $roleData['display_name'],
                'description' => $roleData['description'],
                'is_system_role' => $roleData['is_system_role'],
                'is_active' => true,
                'permissions' => $roleData['permissions'],
                'data_scope' => 'school',
                'approval_permissions' => [],
                'created_by' => null
            ]);
        }
    }
}
