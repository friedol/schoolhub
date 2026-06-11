<?php

namespace Database\Factories;

use App\Models\Grade;
use App\Models\School;
use App\Models\Assessment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class GradeFactory extends Factory
{
    protected $model = Grade::class;

    public function definition()
    {
        $school = School::inRandomOrder()->first();
        if (!$school) {
            throw new \Exception('No schools found. Please run SchoolSeeder first.');
        }
        
        $assessment = Assessment::where('school_id', $school->id)->inRandomOrder()->first();
        $student = User::where('school_id', $school->id)->where('role', 'student')->inRandomOrder()->first();
        
        if (!$assessment || !$student) {
            throw new \Exception('Missing required data. Please run AcademicSeeder first.');
        }

        $marksObtained = $this->faker->numberBetween(0, $assessment->total_marks);
        $grade = $this->calculateGrade($marksObtained, $assessment->total_marks);

        return [
            'school_id' => $school->id,
            'assessment_id' => $assessment->id,
            'student_id' => $student->id,
            'marks_obtained' => $marksObtained,
            'grade' => $grade,
            'remarks' => $this->faker->randomElement(['Good', 'Excellent', 'Needs Improvement', 'Satisfactory']),
            'is_published' => $this->faker->boolean(80),
        ];
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
