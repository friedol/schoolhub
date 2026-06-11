<?php

namespace Database\Factories;

use App\Models\School;
use App\Models\Platform;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\School>
 */
class SchoolFactory extends Factory
{
    protected $model = School::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $schoolTypes = ['secondary', 'primary', 'combined'];
        $schoolType = $this->faker->randomElement($schoolTypes);
        
        return [
            'platform_id' => Platform::factory(),
            'name' => $this->faker->company() . ' ' . ucfirst($schoolType) . ' School',
            'code' => $this->faker->unique()->regexify('[A-Z]{4}'),
            'description' => $this->faker->sentence(15),
            'address' => $this->faker->address(),
            'region' => $this->faker->randomElement(['Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma', 'Tanga', 'Morogoro', 'Iringa']),
            'district' => $this->faker->city(),
            'ward' => $this->faker->streetName(),
            'contact_email' => $this->faker->companyEmail(),
            'contact_phone' => $this->faker->phoneNumber(),
            'school_level' => $schoolType,
            'registration_number' => 'REG/' . $this->faker->year() . '/' . $this->faker->numerify('###'),
            'necta_number' => 'NECTA/' . $this->faker->year() . '/' . $this->faker->numerify('###'),
            'is_active' => true,
            'settings' => [
                'academic_year' => '2024/2025',
                'current_term' => 'term_1',
                'term_start_date' => '2024-01-15',
                'term_end_date' => '2024-04-15',
                'school_hours_start' => '07:30',
                'school_hours_end' => '15:30',
                'lunch_break_start' => '12:00',
                'lunch_break_end' => '13:00',
                'max_students_per_class' => $this->faker->numberBetween(30, 50),
                'grading_system' => 'percentage',
                'passing_grade' => 50,
                'attendance_threshold' => $this->faker->numberBetween(70, 85)
            ]
        ];
    }

    /**
     * Indicate that the school is secondary level.
     */
    public function secondary(): static
    {
        return $this->state(fn (array $attributes) => [
            'school_level' => 'secondary',
            'name' => $this->faker->company() . ' Secondary School',
        ]);
    }

    /**
     * Indicate that the school is primary level.
     */
    public function primary(): static
    {
        return $this->state(fn (array $attributes) => [
            'school_level' => 'primary',
            'name' => $this->faker->company() . ' Primary School',
        ]);
    }

    /**
     * Indicate that the school is combined level.
     */
    public function combined(): static
    {
        return $this->state(fn (array $attributes) => [
            'school_level' => 'combined',
            'name' => $this->faker->company() . ' Combined School',
        ]);
    }

    /**
     * Indicate that the school is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the school is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}



