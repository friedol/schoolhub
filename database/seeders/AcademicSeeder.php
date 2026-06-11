<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\AcademicTerm;
use App\Models\Timetable;
use App\Models\Assessment;
use App\Models\AssessmentResult;
use App\Models\User;

class AcademicSeeder extends Seeder
{
    public function run()
    {
        $schools = School::all();
        
        foreach ($schools as $school) {
            $this->createAcademicDataForSchool($school);
        }
    }

    private function createAcademicDataForSchool($school)
    {
        // Create academic terms
        $terms = [
            [
                'name' => 'Term 1',
                'start_date' => '2024-01-15',
                'end_date' => '2024-04-15',
                'is_current' => true
            ],
            [
                'name' => 'Term 2',
                'start_date' => '2024-05-06',
                'end_date' => '2024-08-09',
                'is_current' => false
            ],
            [
                'name' => 'Term 3',
                'start_date' => '2024-09-02',
                'end_date' => '2024-12-13',
                'is_current' => false
            ]
        ];

        foreach ($terms as $index => $termData) {
            AcademicTerm::factory()->create([
                'school_id' => $school->id,
                'name' => $termData['name'],
                'term' => 'term_' . ($index + 1),
                'academic_year' => '2024/2025',
                'start_date' => $termData['start_date'],
                'end_date' => $termData['end_date'],
                'is_current' => $termData['is_current']
            ]);
        }

        // Create subjects based on school level
        $subjects = $this->getSubjectsForLevel($school->level);
        
        foreach ($subjects as $subjectData) {
            Subject::factory()->create([
                'school_id' => $school->id,
                'name' => $subjectData['name'],
                'code' => $subjectData['code'],
                'description' => $subjectData['description'],
                'necta_code' => $subjectData['necta_code'] ?? null,
                'is_core' => $subjectData['is_core'],
                'is_elective' => $subjectData['is_elective'],
                'is_active' => true
            ]);
        }

        // Create classes
        $classes = $this->getClassesForLevel($school->level);
        
        foreach ($classes as $classData) {
            SchoolClass::factory()->create([
                'school_id' => $school->id,
                'name' => $classData['name'],
                'level' => $classData['level'],
                'stream' => $classData['stream'] ?? null,
                'capacity' => $classData['capacity'],
                'class_teacher_id' => $this->getRandomTeacherId($school->id),
                'is_active' => true
            ]);
        }

        // Create timetables
        $this->createTimetables($school);

        // Create assessments and grades
        $this->createAssessmentsAndGrades($school);
    }

    private function getSubjectsForLevel($level)
    {
        if ($level === 'o_level') {
            return [
                ['name' => 'Mathematics', 'code' => 'MATH', 'necta_code' => '041', 'description' => 'Core Mathematics', 'is_core' => true, 'is_elective' => false],
                ['name' => 'English Language', 'code' => 'ENG', 'necta_code' => '022', 'description' => 'English Language', 'is_core' => true, 'is_elective' => false],
                ['name' => 'Kiswahili', 'code' => 'KIS', 'necta_code' => '024', 'description' => 'Kiswahili Language', 'is_core' => true, 'is_elective' => false],
                ['name' => 'Physics', 'code' => 'PHY', 'necta_code' => '031', 'description' => 'Physics', 'is_core' => true, 'is_elective' => false],
                ['name' => 'Chemistry', 'code' => 'CHEM', 'necta_code' => '032', 'description' => 'Chemistry', 'is_core' => true, 'is_elective' => false],
                ['name' => 'Biology', 'code' => 'BIO', 'necta_code' => '033', 'description' => 'Biology', 'is_core' => true, 'is_elective' => false],
                ['name' => 'History', 'code' => 'HIST', 'necta_code' => '051', 'description' => 'History', 'is_core' => false, 'is_elective' => true],
                ['name' => 'Geography', 'code' => 'GEO', 'necta_code' => '052', 'description' => 'Geography', 'is_core' => false, 'is_elective' => true],
                ['name' => 'Civics', 'code' => 'CIV', 'necta_code' => '053', 'description' => 'Civics', 'is_core' => true, 'is_elective' => false],
                ['name' => 'Religious Education', 'code' => 'RE', 'necta_code' => '054', 'description' => 'Religious Education', 'is_core' => false, 'is_elective' => true]
            ];
        } else { // A-Level
            return [
                ['name' => 'Advanced Mathematics', 'code' => 'AMATH', 'necta_code' => '061', 'description' => 'Advanced Mathematics', 'is_core' => true, 'is_elective' => false],
                ['name' => 'Physics', 'code' => 'PHY', 'necta_code' => '062', 'description' => 'Physics', 'is_core' => true, 'is_elective' => false],
                ['name' => 'Chemistry', 'code' => 'CHEM', 'necta_code' => '063', 'description' => 'Chemistry', 'is_core' => true, 'is_elective' => false],
                ['name' => 'Biology', 'code' => 'BIO', 'necta_code' => '064', 'description' => 'Biology', 'is_core' => true, 'is_elective' => false],
                ['name' => 'Economics', 'code' => 'ECON', 'necta_code' => '071', 'description' => 'Economics', 'is_core' => false, 'is_elective' => true],
                ['name' => 'History', 'code' => 'HIST', 'necta_code' => '072', 'description' => 'History', 'is_core' => false, 'is_elective' => true],
                ['name' => 'Geography', 'code' => 'GEO', 'necta_code' => '073', 'description' => 'Geography', 'is_core' => false, 'is_elective' => true],
                ['name' => 'General Studies', 'code' => 'GS', 'necta_code' => '074', 'description' => 'General Studies', 'is_core' => true, 'is_elective' => false]
            ];
        }
    }

    private function getClassesForLevel($level)
    {
        if ($level === 'o_level') {
            return [
                ['name' => 'Form 1', 'level' => 'form_1', 'capacity' => 40],
                ['name' => 'Form 2', 'level' => 'form_2', 'capacity' => 40],
                ['name' => 'Form 3', 'level' => 'form_3', 'capacity' => 40],
                ['name' => 'Form 4', 'level' => 'form_4', 'capacity' => 40]
            ];
        } else { // A-Level
            return [
                ['name' => 'Form 5', 'level' => 'form_5', 'capacity' => 35],
                ['name' => 'Form 6', 'level' => 'form_6', 'capacity' => 35]
            ];
        }
    }

    private function getRandomTeacherId($schoolId)
    {
        $teachers = User::where('school_id', $schoolId)
                      ->where('role', 'teacher')
                      ->pluck('id');
        
        return $teachers->random();
    }

    private function createTimetables($school)
    {
        $classes = SchoolClass::where('school_id', $school->id)->get();
        $subjects = Subject::where('school_id', $school->id)->get();
        $teachers = User::where('school_id', $school->id)->where('role', 'teacher')->get();

        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        $periods = ['period_1', 'period_2', 'period_3', 'period_4', 'period_5', 'period_6', 'period_7', 'period_8'];

        foreach ($classes as $class) {
            foreach ($days as $day) {
                foreach ($periods as $period) {
                    if (fake()->boolean(70)) { // 70% chance of having a class
                        Timetable::factory()->create([
                            'school_id' => $school->id,
                            'class_id' => $class->id,
                            'subject_id' => $subjects->random()->id,
                            'teacher_id' => $teachers->random()->id,
                            'day_of_week' => $day,
                            'period' => $period,
                            'start_time' => $this->getPeriodStartTime($period),
                            'end_time' => $this->getPeriodEndTime($period),
                            'room' => 'Room ' . fake()->numberBetween(1, 20),
                            'is_active' => true
                        ]);
                    }
                }
            }
        }
    }

    private function getPeriodStartTime($period)
    {
        $times = [
            'period_1' => '07:30',
            'period_2' => '08:20',
            'period_3' => '09:10',
            'period_4' => '10:00',
            'period_5' => '11:00',
            'period_6' => '11:50',
            'period_7' => '13:30',
            'period_8' => '14:20'
        ];
        
        return $times[$period] ?? '07:30';
    }

    private function getPeriodEndTime($period)
    {
        $times = [
            'period_1' => '08:10',
            'period_2' => '09:00',
            'period_3' => '09:50',
            'period_4' => '10:40',
            'period_5' => '11:40',
            'period_6' => '12:30',
            'period_7' => '14:10',
            'period_8' => '15:00'
        ];
        
        return $times[$period] ?? '08:10';
    }

    private function createAssessmentsAndGrades($school)
    {
        $classes = SchoolClass::where('school_id', $school->id)->get();
        $subjects = Subject::where('school_id', $school->id)->get();
        $students = User::where('school_id', $school->id)->where('role', 'student')->get();
        $teachers = User::where('school_id', $school->id)->where('role', 'teacher')->get();

        $assessmentTypes = ['homework', 'class_test', 'midterm', 'final_exam'];

        foreach ($classes as $class) {
            foreach ($subjects as $subject) {
                foreach ($assessmentTypes as $type) {
                    $assessment = Assessment::factory()->create([
                        'school_id' => $school->id,
                        'class_id' => $class->id,
                        'subject_id' => $subject->id,
                        'teacher_id' => $teachers->random()->id,
                        'title' => ucfirst($type) . ' - ' . $subject->name,
                        'description' => 'Assessment for ' . $subject->name,
                        'type' => $type,
                        'total_marks' => $this->getTotalMarks($type),
                        'weight' => $this->getWeight($type),
                        'due_date' => fake()->dateTimeBetween('now', '+2 months'),
                        'is_published' => true
                    ]);

                    // Create assessment results for students
                    $classStudents = $students->take(fake()->numberBetween(15, 25));
                    foreach ($classStudents as $student) {
                        AssessmentResult::factory()->create([
                            'assessment_id' => $assessment->id,
                            'student_id' => $student->id,
                            'marks' => fake()->numberBetween(0, $assessment->total_marks),
                            'grade' => $this->calculateGrade(fake()->numberBetween(0, $assessment->total_marks), $assessment->total_marks),
                            'comment' => fake()->randomElement(['Good', 'Excellent', 'Needs Improvement', 'Satisfactory']),
                            'is_submitted' => true,
                            'submitted_at' => now(),
                            'graded_by' => $teachers->random()->id,
                            'graded_at' => now()
                        ]);
                    }
                }
            }
        }
    }

    private function getTotalMarks($type)
    {
        return match($type) {
            'homework' => 20,
            'class_test' => 30,
            'midterm' => 50,
            'final_exam' => 100,
            default => 50
        };
    }

    private function getWeight($type)
    {
        return match($type) {
            'homework' => 10,
            'class_test' => 20,
            'midterm' => 30,
            'final_exam' => 40,
            default => 20
        };
    }

    private function calculateGrade($marks, $totalMarks)
    {
        $percentage = ($marks / $totalMarks) * 100;
        
        return match(true) {
            $percentage >= 80 => 'A',
            $percentage >= 70 => 'B',
            $percentage >= 60 => 'C',
            $percentage >= 50 => 'D',
            default => 'F'
        };
    }
}
