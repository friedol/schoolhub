<?php

namespace Database\Factories;

use App\Models\AcademicTerm;
use App\Models\School;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AcademicTerm>
 */
class AcademicTermFactory extends Factory
{
    protected $model = AcademicTerm::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $terms = ['Term 1', 'Term 2', 'Term 3'];
        $term = $this->faker->randomElement($terms);
        $termNumber = array_search($term, $terms) + 1;
        
        $school = School::inRandomOrder()->first();
        if (!$school) {
            throw new \Exception('No schools found. Please run SchoolSeeder first.');
        }

        return [
            'school_id' => $school->id,
            'name' => $term,
            'term' => 'term_' . $termNumber,
            'academic_year' => '2024/2025',
            'start_date' => $this->faker->dateTimeBetween('-6 months', '+6 months'),
            'end_date' => $this->faker->dateTimeBetween('+1 month', '+12 months'),
            'is_current' => $this->faker->boolean(20), // 20% chance of being current
            'is_active' => true,
            'settings' => null
        ];
    }

    /**
     * Indicate that the term is Term 1.
     */
    public function term1(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Term 1',
            'term' => 'term_1',
            'start_date' => '2024-01-15',
            'end_date' => '2024-04-15',
        ]);
    }

    /**
     * Indicate that the term is Term 2.
     */
    public function term2(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Term 2',
            'term' => 'term_2',
            'start_date' => '2024-05-06',
            'end_date' => '2024-08-09',
        ]);
    }

    /**
     * Indicate that the term is Term 3.
     */
    public function term3(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Term 3',
            'term' => 'term_3',
            'start_date' => '2024-09-02',
            'end_date' => '2024-12-13',
        ]);
    }

    /**
     * Indicate that the term is current.
     */
    public function current(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_current' => true,
        ]);
    }

    /**
     * Indicate that the term is not current.
     */
    public function notCurrent(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_current' => false,
        ]);
    }
}
