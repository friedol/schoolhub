<?php

namespace Tests\Feature;

use App\Models\Platform;
use App\Models\School;
use App\Models\User;
use App\Models\Room;
use App\Models\AcademicTerm;
use App\Models\Examination;
use App\Models\ExamSession;
use App\Models\SeatingArrangement;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\StudentProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SittingPlanTest extends TestCase
{
    use RefreshDatabase;

    protected Platform $platform;
    protected School $school;
    protected User $schoolAdmin;
    protected AcademicTerm $academicTerm;
    protected SchoolClass $classA;
    protected SchoolClass $classB;
    protected Subject $subject;
    protected Room $room;
    protected Examination $examination;

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

        $this->classA = SchoolClass::create([
            'school_id' => $this->school->id,
            'name' => 'Grade A',
            'level' => 'form_1',
            'stream' => 'A',
            'is_active' => true,
        ]);

        $this->classB = SchoolClass::create([
            'school_id' => $this->school->id,
            'name' => 'Grade B',
            'level' => 'form_1',
            'stream' => 'B',
            'is_active' => true,
        ]);

        $this->subject = Subject::create([
            'school_id' => $this->school->id,
            'name' => 'Mathematics',
            'code' => 'MATH101',
            'is_active' => true,
        ]);

        $this->room = Room::create([
            'school_id' => $this->school->id,
            'room_number' => 'R101',
            'room_name' => 'Main Hall',
            'room_type' => 'hall',
            'capacity' => 20,
            'rows' => 4,
            'columns' => 5,
            'floor' => 1,
            'building' => 'Building A',
            'is_active' => true,
        ]);

        $this->examination = Examination::create([
            'school_id' => $this->school->id,
            'academic_term_id' => $this->academicTerm->id,
            'name' => 'Midterm Exams',
            'exam_type' => 'midterm',
            'start_date' => now()->addDays(5),
            'end_date' => now()->addDays(10),
            'is_published' => false,
            'created_by' => $this->schoolAdmin->id,
        ]);
    }

    public function test_room_management_validates_capacity_against_grid()
    {
        $this->actingAs($this->schoolAdmin);

        // Attempting to create a room where capacity exceeds row * column dimensions
        $response = $this->post(route('academic.rooms.store'), [
            'room_number' => 'R102',
            'room_type' => 'classroom',
            'capacity' => 50,
            'rows' => 5,
            'columns' => 5, // 25 capacity max grid
            'floor' => 1,
            'building' => 'Building B',
        ]);

        $response->assertSessionHasErrors('capacity');
    }

    public function test_sitting_plan_generator_correctly_interleaves_students()
    {
        $this->actingAs($this->schoolAdmin);

        // Create 2 students in class A and 2 students in class B
        for ($i = 1; $i <= 2; $i++) {
            $studentA = User::create([
                'name' => "Student A{$i}",
                'email' => "studentA{$i}@test.com",
                'password' => bcrypt('password'),
                'role' => 'student',
                'school_id' => $this->school->id,
                'platform_id' => $this->platform->id,
                'is_active' => true,
            ]);
            StudentProfile::create([
                'student_id' => $studentA->id,
                'class_id' => $this->classA->id,
                'stream' => 'A',
                'admission_number' => "ADM-A{$i}",
                'admission_date' => now(),
            ]);

            $studentB = User::create([
                'name' => "Student B{$i}",
                'email' => "studentB{$i}@test.com",
                'password' => bcrypt('password'),
                'role' => 'student',
                'school_id' => $this->school->id,
                'platform_id' => $this->platform->id,
                'is_active' => true,
            ]);
            StudentProfile::create([
                'student_id' => $studentB->id,
                'class_id' => $this->classB->id,
                'stream' => 'B',
                'admission_number' => "ADM-B{$i}",
                'admission_date' => now(),
            ]);
        }

        $response = $this->post(route('academic.sitting-plans.generate'), [
            'exam_id' => $this->examination->id,
            'subject_id' => $this->subject->id,
            'academic_term_id' => $this->academicTerm->id,
            'date' => now()->addDays(6)->format('Y-m-d'),
            'start_time' => '09:00',
            'end_time' => '12:00',
            'class_ids' => [$this->classA->id, $this->classB->id],
            'room_ids' => [$this->room->id],
        ]);

        $response->assertRedirect();
        
        // Assert seating arrangements are created and interleaved (A1 -> B1 -> A2 -> B2)
        $arrangements = SeatingArrangement::orderBy('row_number')->orderBy('column_number')->get();
        $this->assertCount(4, $arrangements);

        // Grid seats should alternate streams/classes
        $this->assertEquals($this->classA->id, $arrangements[0]->student->studentProfile->class_id);
        $this->assertEquals($this->classB->id, $arrangements[1]->student->studentProfile->class_id);
        $this->assertEquals($this->classA->id, $arrangements[2]->student->studentProfile->class_id);
        $this->assertEquals($this->classB->id, $arrangements[3]->student->studentProfile->class_id);
    }

    public function test_prevent_double_booking_of_invigilator()
    {
        $this->actingAs($this->schoolAdmin);

        $teacher = User::create([
            'name' => 'Teacher X',
            'email' => 'teacher@test.com',
            'password' => bcrypt('password'),
            'role' => 'teacher',
            'school_id' => $this->school->id,
            'platform_id' => $this->platform->id,
            'is_active' => true,
        ]);

        // Create a scheduled session with invigilator assigned
        $session = ExamSession::create([
            'exam_id' => $this->examination->id,
            'subject_id' => $this->subject->id,
            'school_class_id' => $this->classA->id,
            'date' => now()->addDays(6)->format('Y-m-d'),
            'start_time' => '09:00',
            'end_time' => '12:00',
            'invigilator_id' => $teacher->id,
        ]);

        // Attempting to store another invigilator duty for the same teacher during overlap
        $response = $this->post(route('academic.sitting-plans.invigilators.store'), [
            'exam_id' => $this->examination->id,
            'room_id' => $this->room->id,
            'invigilator_id' => $teacher->id,
            'date' => now()->addDays(6)->format('Y-m-d'),
            'start_time' => '10:00',
            'end_time' => '11:00',
        ]);

        $response->assertSessionHasErrors('invigilator_id');
    }
}
