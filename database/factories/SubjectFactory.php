<?php

namespace Database\Factories;

use App\Models\Subject;
use App\Models\School;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Subject>
 */
class SubjectFactory extends Factory
{
    protected $model = Subject::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subjects = [
            'Mathematics' => ['MATH', '041'],
            'English Language' => ['ENG', '022'],
            'Kiswahili' => ['KIS', '024'],
            'Physics' => ['PHY', '031'],
            'Chemistry' => ['CHEM', '032'],
            'Biology' => ['BIO', '033'],
            'History' => ['HIST', '051'],
            'Geography' => ['GEO', '052'],
            'Civics' => ['CIV', '053'],
            'Religious Education' => ['RE', '054'],
            'Advanced Mathematics' => ['AMATH', '061'],
            'Economics' => ['ECON', '071'],
            'General Studies' => ['GS', '074']
        ];

        $subject = $this->faker->randomElement(array_keys($subjects));
        $code = $subjects[$subject][0];
        $nectaCode = $subjects[$subject][1];

        $school = School::inRandomOrder()->first();
        if (!$school) {
            throw new \Exception('No schools found. Please run SchoolSeeder first.');
        }

        return [
            'school_id' => $school->id,
            'name' => $subject,
            'code' => $school->code . '_' . $code, // Make code unique per school
            'description' => $this->faker->sentence(10),
            'necta_code' => $nectaCode,
            'category' => $this->faker->randomElement(['Science', 'Arts', 'Languages', 'Mathematics', 'Social Sciences']),
            'is_core' => $this->faker->boolean(60), // 60% chance of being core
            'is_elective' => $this->faker->boolean(40), // 40% chance of being elective
            'is_necta_subject' => $this->faker->boolean(80), // 80% chance of being NECTA subject
            'credits' => $this->faker->numberBetween(1, 4),
            'is_active' => true,
            'settings' => null
        ];
    }

    /**
     * Indicate that the subject is core.
     */
    public function core(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_core' => true,
            'is_elective' => false,
        ]);
    }

    /**
     * Indicate that the subject is elective.
     */
    public function elective(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_core' => false,
            'is_elective' => true,
        ]);
    }

    /**
     * Indicate that the subject is a NECTA subject.
     */
    public function necta(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_necta_subject' => true,
        ]);
    }

    /**
     * Indicate that the subject is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the subject is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
