<?php

namespace Database\Factories;

use App\Models\Timetable;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TimetableFactory extends Factory
{
    protected $model = Timetable::class;

    public function definition()
    {
        $school = School::inRandomOrder()->first() ?? School::factory()->create();
        $class = SchoolClass::where('school_id', $school->id)->inRandomOrder()->first() ?? SchoolClass::factory()->create(['school_id' => $school->id]);
        $subject = Subject::where('school_id', $school->id)->inRandomOrder()->first() ?? Subject::factory()->create(['school_id' => $school->id]);
        $teacher = User::where('school_id', $school->id)->where('role', 'teacher')->inRandomOrder()->first() ?? User::factory()->teacher($school)->create();

        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        $periods = ['period_1', 'period_2', 'period_3', 'period_4', 'period_5', 'period_6', 'period_7', 'period_8'];

        return [
            'school_id' => $school->id,
            'class_id' => $class->id,
            'subject_id' => $subject->id,
            'teacher_id' => $teacher->id,
            'day_of_week' => $this->faker->randomElement($days),
            'period' => $this->faker->randomElement($periods),
            'start_time' => $this->faker->time('H:i'),
            'end_time' => $this->faker->time('H:i'),
            'room' => 'Room ' . $this->faker->numberBetween(1, 20),
            'is_active' => $this->faker->boolean(90),
            'settings' => null,
        ];
    }
}
