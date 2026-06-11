<?php

namespace Tests\Feature;

use App\Models\Platform;
use App\Models\School;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class MultiTenantTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected Platform $platform;
    protected School $school1;
    protected School $school2;
    protected User $superAdmin;
    protected User $schoolAdmin1;
    protected User $schoolAdmin2;
    protected User $teacher1;
    protected User $student1;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->setupMultiTenantData();
    }

    private function setupMultiTenantData(): void
    {
        // Create platform
        $this->platform = Platform::create([
            'name' => 'EduTZ Group',
            'description' => 'Test platform',
            'domain' => 'test.edutz.com',
            'contact_email' => 'admin@test.com',
            'contact_phone' => '+255123456789',
            'address' => 'Test Address',
            'region' => 'Dar es Salaam',
            'district' => 'Kinondoni',
            'is_active' => true,
            'subscription_plan' => 'premium',
        ]);

        // Create schools
        $this->school1 = School::create([
            'platform_id' => $this->platform->id,
            'name' => 'Test School 1',
            'code' => 'TS1',
            'address' => 'School 1 Address',
            'region' => 'Dar es Salaam',
            'district' => 'Kinondoni',
            'contact_email' => 'school1@test.com',
            'contact_phone' => '+255123456789',
            'school_level' => 'primary',
            'is_active' => true,
        ]);

        $this->school2 = School::create([
            'platform_id' => $this->platform->id,
            'name' => 'Test School 2',
            'code' => 'TS2',
            'address' => 'School 2 Address',
            'region' => 'Arusha',
            'district' => 'Arusha',
            'contact_email' => 'school2@test.com',
            'contact_phone' => '+255123456790',
            'school_level' => 'secondary',
            'is_active' => true,
        ]);

        // Create users
        $this->superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@test.com',
            'password' => bcrypt('password'),
            'role' => 'super_admin',
            'platform_id' => $this->platform->id,
            'is_active' => true,
        ]);

        $this->schoolAdmin1 = User::create([
            'name' => 'School Admin 1',
            'email' => 'admin1@test.com',
            'password' => bcrypt('password'),
            'role' => 'school_admin',
            'school_id' => $this->school1->id,
            'platform_id' => $this->platform->id,
            'is_active' => true,
        ]);

        $this->schoolAdmin2 = User::create([
            'name' => 'School Admin 2',
            'email' => 'admin2@test.com',
            'password' => bcrypt('password'),
            'role' => 'school_admin',
            'school_id' => $this->school2->id,
            'platform_id' => $this->platform->id,
            'is_active' => true,
        ]);

        $this->teacher1 = User::create([
            'name' => 'Teacher 1',
            'email' => 'teacher1@test.com',
            'password' => bcrypt('password'),
            'role' => 'teacher',
            'school_id' => $this->school1->id,
            'platform_id' => $this->platform->id,
            'is_active' => true,
        ]);

        $this->student1 = User::create([
            'name' => 'Student 1',
            'email' => 'student1@test.com',
            'password' => bcrypt('password'),
            'role' => 'student',
            'school_id' => $this->school1->id,
            'platform_id' => $this->platform->id,
            'student_number' => '001',
            'is_active' => true,
        ]);
    }

    /** @test */
    public function super_admin_can_access_platform_dashboard()
    {
        $response = $this->actingAs($this->superAdmin)
            ->get('/super-admin/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('SuperAdmin/Dashboard')
                ->has('platforms')
                ->has('statistics')
        );
    }

    /** @test */
    public function super_admin_can_view_all_schools()
    {
        $response = $this->actingAs($this->superAdmin)
            ->get('/super-admin/schools');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('SuperAdmin/Schools')
                ->has('schools')
        );
    }

    /** @test */
    public function super_admin_can_create_new_school()
    {
        $schoolData = [
            'name' => 'New Test School',
            'description' => 'A new test school',
            'address' => 'New School Address',
            'region' => 'Mwanza',
            'district' => 'Nyamagana',
            'contact_email' => 'newschool@test.com',
            'contact_phone' => '+255123456791',
            'school_level' => 'combined',
            'admin_name' => 'New Admin',
            'admin_email' => 'newadmin@test.com',
            'admin_phone' => '+255123456792',
        ];

        $response = $this->actingAs($this->superAdmin)
            ->post('/super-admin/schools', $schoolData);

        $response->assertRedirect('/super-admin/schools');
        
        $this->assertDatabaseHas('schools', [
            'name' => 'New Test School',
            'platform_id' => $this->platform->id,
        ]);

        $this->assertDatabaseHas('users', [
            'name' => 'New Admin',
            'email' => 'newadmin@test.com',
            'role' => 'school_admin',
        ]);
    }

    /** @test */
    public function school_admin_can_access_school_dashboard()
    {
        $response = $this->actingAs($this->schoolAdmin1)
            ->get('/school-admin/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('SchoolAdmin/Dashboard')
                ->has('school')
                ->has('statistics')
        );
    }

    /** @test */
    public function school_admin_can_view_their_school_students()
    {
        $response = $this->actingAs($this->schoolAdmin1)
            ->get('/school-admin/students');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('SchoolAdmin/Students/Index')
                ->has('students')
        );
    }

    /** @test */
    public function school_admin_can_create_student()
    {
        $studentData = [
            'name' => 'New Student',
            'email' => 'newstudent@test.com',
            'date_of_birth' => '2010-01-01',
            'gender' => 'male',
            'address' => 'Student Address',
        ];

        $response = $this->actingAs($this->schoolAdmin1)
            ->post('/school-admin/students', $studentData);

        $response->assertRedirect('/school-admin/students');
        
        $this->assertDatabaseHas('users', [
            'name' => 'New Student',
            'email' => 'newstudent@test.com',
            'role' => 'student',
            'school_id' => $this->school1->id,
        ]);
    }

    /** @test */
    public function school_admin_cannot_access_other_school_data()
    {
        // School admin 1 tries to access school 2's students
        $response = $this->actingAs($this->schoolAdmin1)
            ->get('/school-admin/students');

        $response->assertStatus(200);
        
        // Verify they only see their own school's students
        $response->assertInertia(fn ($page) => 
            $page->where('students.data', function ($students) {
                return collect($students)->every(fn ($student) => 
                    $student['school_id'] === $this->school1->id
                );
            })
        );
    }

    /** @test */
    public function teacher_can_only_access_their_school_data()
    {
        $response = $this->actingAs($this->teacher1)
            ->get('/students/profiles');

        $response->assertStatus(200);
        
        // Teachers should only see students from their school
        $response->assertInertia(fn ($page) => 
            $page->where('students.data', fn ($students) => 
                collect($students)->every(fn ($student) => 
                    $student['school_id'] === $this->school1->id
                )
            )
        );
    }

    /** @test */
    public function student_cannot_access_admin_pages()
    {
        $response = $this->actingAs($this->student1)
            ->get('/school-admin/dashboard');

        $response->assertStatus(403);
    }

    /** @test */
    public function data_isolation_between_schools()
    {
        // Create a student in school 1
        $studentSchool1 = User::create([
            'name' => 'Student School 1',
            'email' => 'student1@school1.com',
            'password' => bcrypt('password'),
            'role' => 'student',
            'school_id' => $this->school1->id,
            'platform_id' => $this->platform->id,
            'student_number' => '002',
            'is_active' => true,
        ]);

        // Create a student in school 2
        $studentSchool2 = User::create([
            'name' => 'Student School 2',
            'email' => 'student1@school2.com',
            'password' => bcrypt('password'),
            'role' => 'student',
            'school_id' => $this->school2->id,
            'platform_id' => $this->platform->id,
            'student_number' => '001',
            'is_active' => true,
        ]);

        // School admin 1 should only see students from school 1
        $response = $this->actingAs($this->schoolAdmin1)
            ->get('/school-admin/students');

        $response->assertInertia(fn ($page) => 
            $page->where('students.data', fn ($students) => 
                collect($students)->pluck('id')->contains($studentSchool1->id) && 
                !collect($students)->pluck('id')->contains($studentSchool2->id)
            )
        );
    }

    /** @test */
    public function platform_statistics_include_all_schools()
    {
        // Create a student in school 2 so that total students is 2
        User::create([
            'name' => 'Student School 2',
            'email' => 'student1@school2.com',
            'password' => bcrypt('password'),
            'role' => 'student',
            'school_id' => $this->school2->id,
            'platform_id' => $this->platform->id,
            'student_number' => '002',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->get('/super-admin/dashboard');

        $response->assertInertia(fn ($page) => 
            $page->where('statistics.total_schools', 2)
                ->where('statistics.total_students', 2) // student1 + new student
        );
    }

    /** @test */
    public function school_statistics_include_only_their_data()
    {
        $response = $this->actingAs($this->schoolAdmin1)
            ->get('/school-admin/dashboard');

        $response->assertInertia(fn ($page) => 
            $page->where('statistics.total_students', 1) // Only student1
                ->where('statistics.total_teachers', 1) // Only teacher1
        );
    }

    /** @test */
    public function user_role_methods_work_correctly()
    {
        $this->assertTrue($this->superAdmin->isSuperAdmin());
        $this->assertFalse($this->superAdmin->isSchoolAdmin());
        $this->assertFalse($this->superAdmin->isTeacher());
        $this->assertFalse($this->superAdmin->isStudent());

        $this->assertTrue($this->schoolAdmin1->isSchoolAdmin());
        $this->assertFalse($this->schoolAdmin1->isSuperAdmin());
        $this->assertFalse($this->schoolAdmin1->isTeacher());
        $this->assertFalse($this->schoolAdmin1->isStudent());

        $this->assertTrue($this->teacher1->isTeacher());
        $this->assertFalse($this->teacher1->isSuperAdmin());
        $this->assertFalse($this->teacher1->isSchoolAdmin());
        $this->assertFalse($this->teacher1->isStudent());

        $this->assertTrue($this->student1->isStudent());
        $this->assertFalse($this->student1->isSuperAdmin());
        $this->assertFalse($this->student1->isSchoolAdmin());
        $this->assertFalse($this->student1->isTeacher());
    }

    /** @test */
    public function school_code_generation_is_unique()
    {
        $code1 = $this->platform->generateSchoolCode();
        $code2 = $this->platform->generateSchoolCode();
        $code3 = $this->platform->generateSchoolCode();

        $this->assertNotEquals($code1, $code2);
        $this->assertNotEquals($code2, $code3);
        $this->assertNotEquals($code1, $code3);
    }

    /** @test */
    public function platform_can_get_all_users_across_schools()
    {
        $allUsers = $this->platform->allUsers()->get();
        
        $this->assertCount(5, $allUsers); // superAdmin, schoolAdmin1, schoolAdmin2, teacher1, student1
        
        $studentCount = $this->platform->allUsers()->where('role', 'student')->count();
        $this->assertEquals(1, $studentCount);
        
        $teacherCount = $this->platform->allUsers()->where('role', 'teacher')->count();
        $this->assertEquals(1, $teacherCount);
    }
}
