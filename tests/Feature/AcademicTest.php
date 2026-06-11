<?php

namespace Tests\Feature;

use App\Models\Platform;
use App\Models\School;
use App\Models\User;
use App\Models\AcademicTerm;
use App\Models\Examination;
use App\Models\ExamSession;
use App\Models\SchoolClass;
use App\Models\Subject;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AcademicTest extends TestCase
{
    use RefreshDatabase;

    protected Platform $platform;
    protected School $school;
    protected User $schoolAdmin;
    protected AcademicTerm $academicTerm;
    protected SchoolClass $schoolClass;
    protected Subject $subject;

    protected function setUp(): void
    {
        parent::setUp();

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

        $this->school = School::create([
            'platform_id' => $this->platform->id,
            'name' => 'Test School',
            'code' => 'TS1',
            'address' => 'School Address',
            'region' => 'Dar es Salaam',
            'district' => 'Kinondoni',
            'contact_email' => 'school@test.com',
            'contact_phone' => '+255123456789',
            'school_level' => 'secondary',
            'is_active' => true,
        ]);

        $this->schoolAdmin = User::create([
            'name' => 'School Admin',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role' => 'school_admin',
            'school_id' => $this->school->id,
            'platform_id' => $this->platform->id,
            'is_active' => true,
        ]);

        $this->academicTerm = AcademicTerm::create([
            'school_id' => $this->school->id,
            'academic_year' => '2024 / 2025',
            'term' => 'term_1',
            'name' => 'Term 1',
            'start_date' => now()->startOfYear(),
            'end_date' => now()->endOfYear(),
            'is_active' => true,
        ]);

        $this->schoolClass = SchoolClass::create([
            'school_id' => $this->school->id,
            'name' => 'Class 1A',
            'level' => 'form_1',
            'stream' => 'A',
            'is_active' => true,
        ]);

        $this->subject = Subject::create([
            'school_id' => $this->school->id,
            'name' => 'Mathematics',
            'code' => 'MATH101',
            'is_active' => true,
        ]);
    }

    public function test_examinations_index_page_loads_successfully()
    {
        $this->actingAs($this->schoolAdmin);

        $examination = Examination::create([
            'school_id' => $this->school->id,
            'academic_term_id' => $this->academicTerm->id,
            'name' => 'Midterm Exams',
            'exam_type' => 'midterm',
            'start_date' => now()->addDays(5),
            'end_date' => now()->addDays(10),
            'is_published' => false,
            'created_by' => $this->schoolAdmin->id,
        ]);

        $session = ExamSession::create([
            'exam_id' => $examination->id,
            'subject_id' => $this->subject->id,
            'school_class_id' => $this->schoolClass->id,
            'date' => now()->addDays(6),
            'start_time' => '09:00',
            'end_time' => '12:00',
            'max_marks' => 100,
            'is_published' => false,
        ]);

        $response = $this->get(route('academic.examinations'));
        $response->assertStatus(200);

        // Verify that the inertia page contains examinations matching the database structure
        $response->assertInertia(fn ($page) => $page
            ->component('Academic/Examinations/Index')
            ->has('examinations.data', 1)
            ->where('examinations.data.0.name', 'Midterm Exams')
            ->where('examinations.data.0.classes', ['Class 1A'])
            ->where('examinations.data.0.status', 'Scheduled')
        );
    }
}
