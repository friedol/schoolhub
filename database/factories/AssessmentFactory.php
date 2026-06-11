<?php

namespace Database\Factories;

use App\Models\Assessment;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;
use App\Models\AcademicTerm;
use Illuminate\Database\Eloquent\Factories\Factory;

class AssessmentFactory extends Factory
{
    protected $model = Assessment::class;

    public function definition()
    {
        $school = School::inRandomOrder()->first();
        if (!$school) {
            throw new \Exception('No schools found. Please run SchoolSeeder first.');
        }
        
        $class = SchoolClass::where('school_id', $school->id)->inRandomOrder()->first();
        $subject = Subject::where('school_id', $school->id)->inRandomOrder()->first();
        $teacher = User::where('school_id', $school->id)->where('role', 'teacher')->inRandomOrder()->first();
        
        if (!$class || !$subject || !$teacher) {
            throw new \Exception('Missing required data. Please run AcademicSeeder first.');
        }

        $types = ['quiz', 'assignment', 'midterm', 'final', 'other'];
        $type = $this->faker->randomElement($types);

        return [
            'school_id' => $school->id,
            'subject_id' => $subject->id,
            'class_id' => $class->id,
            'teacher_id' => $teacher->id,
            'title' => ucfirst($type) . ' - ' . $subject->name,
            'type' => $type,
            'total_marks' => $this->getMaxMarks($type),
            'weight' => $this->getWeightage($type),
            'description' => 'Assessment for ' . $subject->name,
            'due_date' => $this->faker->dateTimeBetween('now', '+2 months'),
            'is_published' => $this->faker->boolean(80),
            'is_active' => true,
            'settings' => null
        ];
    }

    private function getMaxMarks($type)
    {
        return match($type) {
            'quiz' => 20,
            'assignment' => 30,
            'midterm' => 50,
            'final' => 100,
            default => 50
        };
    }

    private function getWeightage($type)
    {
        return match($type) {
            'quiz' => 10,
            'assignment' => 20,
            'midterm' => 30,
            'final' => 40,
            default => 20
        };
    }
}
