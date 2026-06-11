<?php

namespace Database\Factories;

use App\Models\AssessmentResult;
use App\Models\Assessment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AssessmentResultFactory extends Factory
{
    protected $model = AssessmentResult::class;

    public function definition()
    {
        $assessment = Assessment::inRandomOrder()->first();
        if (!$assessment) {
            throw new \Exception('No assessments found. Please run AcademicSeeder first.');
        }
        
        $student = User::where('school_id', $assessment->school_id)->where('role', 'student')->inRandomOrder()->first();
        $teacher = User::where('school_id', $assessment->school_id)->where('role', 'teacher')->inRandomOrder()->first();
        
        if (!$student || !$teacher) {
            throw new \Exception('Missing required data. Please run UserSeeder first.');
        }

        $marks = $this->faker->numberBetween(0, $assessment->total_marks);
        $grade = $this->calculateGrade($marks, $assessment->total_marks);

        return [
            'assessment_id' => $assessment->id,
            'student_id' => $student->id,
            'marks' => $marks,
            'grade' => $grade,
            'points' => $this->calculatePoints($grade),
            'comment' => $this->faker->randomElement(['Good', 'Excellent', 'Needs Improvement', 'Satisfactory']),
            'is_submitted' => $this->faker->boolean(90),
            'submitted_at' => $this->faker->optional(0.9)->dateTimeThisMonth,
            'graded_by' => $teacher->id,
            'graded_at' => $this->faker->optional(0.8)->dateTimeThisMonth,
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

    private function calculatePoints($grade)
    {
        return match($grade) {
            'A' => 4.0,
            'B' => 3.0,
            'C' => 2.0,
            'D' => 1.0,
            'F' => 0.0,
            default => 0.0
        };
    }
}



