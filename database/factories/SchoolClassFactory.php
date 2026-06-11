<?php

namespace Database\Factories;

use App\Models\SchoolClass;
use App\Models\School;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SchoolClass>
 */
class SchoolClassFactory extends Factory
{
    protected $model = SchoolClass::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $levels = ['form_1', 'form_2', 'form_3', 'form_4', 'form_5', 'form_6'];
        $level = $this->faker->randomElement($levels);
        
        $school = School::inRandomOrder()->first();
        if (!$school) {
            throw new \Exception('No schools found. Please run SchoolSeeder first.');
        }

        return [
            'school_id' => $school->id,
            'name' => 'Form ' . substr($level, -1),
            'level' => $level,
            'stream' => $this->faker->optional(0.3)->randomElement(['A', 'B', 'C', 'Science', 'Arts', 'Commerce']),
            'section' => $this->faker->optional(0.2)->randomElement(['Morning', 'Afternoon', 'Evening']),
            'capacity' => $this->faker->numberBetween(30, 50),
            'class_teacher_id' => null, // Will be set later
            'room_number' => 'Room ' . $this->faker->numberBetween(1, 50),
            'is_active' => true,
            'settings' => null
        ];
    }

    /**
     * Indicate that the class is Form 1.
     */
    public function form1(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Form 1',
            'level' => 'form_1',
        ]);
    }

    /**
     * Indicate that the class is Form 2.
     */
    public function form2(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Form 2',
            'level' => 'form_2',
        ]);
    }

    /**
     * Indicate that the class is Form 3.
     */
    public function form3(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Form 3',
            'level' => 'form_3',
        ]);
    }

    /**
     * Indicate that the class is Form 4.
     */
    public function form4(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Form 4',
            'level' => 'form_4',
        ]);
    }

    /**
     * Indicate that the class is Form 5.
     */
    public function form5(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Form 5',
            'level' => 'form_5',
        ]);
    }

    /**
     * Indicate that the class is Form 6.
     */
    public function form6(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Form 6',
            'level' => 'form_6',
        ]);
    }

    /**
     * Indicate that the class has a stream.
     */
    public function withStream(): static
    {
        return $this->state(fn (array $attributes) => [
            'stream' => $this->faker->randomElement(['A', 'B', 'C', 'Science', 'Arts', 'Commerce']),
        ]);
    }

    /**
     * Indicate that the class is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the class is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
