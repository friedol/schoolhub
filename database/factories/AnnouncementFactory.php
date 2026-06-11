<?php

namespace Database\Factories;

use App\Models\Announcement;
use App\Models\School;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Announcement>
 */
class AnnouncementFactory extends Factory
{
    protected $model = Announcement::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = ['academic', 'administrative', 'sports', 'cultural', 'emergency'];
        $priorities = ['urgent', 'high', 'normal', 'low'];
        $targetAudiences = ['all', 'students', 'parents', 'teachers', 'staff'];
        
        $category = $this->faker->randomElement($categories);
        $title = $this->generateTitle($category);

        return [
            'school_id' => School::factory(),
            'title' => $title,
            'content' => $this->generateContent($title, $category),
            'excerpt' => $this->faker->sentence(15),
            'category' => $category,
            'priority' => $this->faker->randomElement($priorities),
            'target_audience' => $this->faker->randomElement($targetAudiences),
            'author_id' => User::factory(),
            'is_published' => $this->faker->boolean(85), // 85% published
            'is_pinned' => $this->faker->boolean(10), // 10% pinned
            'published_at' => $this->faker->dateTimeBetween('-3 months', 'now'),
            'expires_at' => $this->faker->optional(0.3)->dateTimeBetween('now', '+1 month'),
            'views_count' => $this->faker->numberBetween(0, 500),
            'language' => $this->faker->randomElement(['en', 'sw']),
            'is_active' => true
        ];
    }

    private function generateTitle($category)
    {
        $titles = [
            'academic' => [
                'Examination Schedule Released',
                'New Academic Calendar Available',
                'Subject Selection Deadline',
                'Results Publication Notice',
                'Academic Awards Ceremony'
            ],
            'administrative' => [
                'School Fees Payment Reminder',
                'Parent-Teacher Meeting Schedule',
                'School Holiday Notice',
                'Transport Route Changes',
                'Library Hours Update'
            ],
            'sports' => [
                'Inter-School Sports Competition',
                'Sports Day Schedule',
                'Athletics Training Schedule',
                'Football Tournament Results',
                'Swimming Competition Notice'
            ],
            'cultural' => [
                'Cultural Day Celebration',
                'Drama Club Performance',
                'Music Festival Participation',
                'Art Exhibition Opening',
                'Traditional Dance Competition'
            ],
            'emergency' => [
                'Weather Alert - School Closure',
                'Emergency Contact Update',
                'Security Notice',
                'Health Advisory',
                'Transportation Delay Notice'
            ]
        ];

        return $this->faker->randomElement($titles[$category]);
    }

    private function generateContent($title, $category)
    {
        $contentTemplates = [
            'academic' => "This is to inform all students and parents about {$title}. Please take note of the following important details and ensure compliance with the requirements. For any questions, contact the academic office.",
            'administrative' => "Dear Parents and Students, {$title}. This announcement contains important information that requires your immediate attention. Please read carefully and take appropriate action.",
            'sports' => "Sports enthusiasts! {$title}. Join us for this exciting event and show your school spirit. Registration details and requirements are provided below.",
            'cultural' => "Cultural celebration alert! {$title}. This is a wonderful opportunity to showcase our diverse talents and traditions. All are welcome to participate.",
            'emergency' => "URGENT NOTICE: {$title}. Please read this announcement carefully and follow the instructions provided. Your safety and well-being are our priority."
        ];

        $baseContent = $contentTemplates[$category] ?? "Important announcement: {$title}. Please read for details.";
        
        return $baseContent . "\n\n" . $this->faker->paragraphs(2, true);
    }

    /**
     * Indicate that the announcement is academic.
     */
    public function academic(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'academic',
            'target_audience' => 'students',
        ]);
    }

    /**
     * Indicate that the announcement is administrative.
     */
    public function administrative(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'administrative',
            'target_audience' => 'all',
        ]);
    }

    /**
     * Indicate that the announcement is urgent.
     */
    public function urgent(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => 'urgent',
            'is_pinned' => true,
        ]);
    }

    /**
     * Indicate that the announcement is published.
     */
    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => true,
            'published_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ]);
    }

    /**
     * Indicate that the announcement is pinned.
     */
    public function pinned(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_pinned' => true,
        ]);
    }

    /**
     * Indicate that the announcement is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the announcement is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}



