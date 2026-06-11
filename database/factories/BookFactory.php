<?php

namespace Database\Factories;

use App\Models\Book;
use App\Models\School;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Book>
 */
class BookFactory extends Factory
{
    protected $model = Book::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = [
            'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Kiswahili',
            'History', 'Geography', 'Economics', 'Literature', 'Reference', 'Fiction'
        ];

        $publishers = [
            'Oxford University Press', 'Cambridge University Press', 'Longman',
            'Macmillan', 'Heinemann', 'Pearson', 'McGraw-Hill', 'Wiley'
        ];

        $category = $this->faker->randomElement($categories);
        $publisher = $this->faker->randomElement($publishers);

        return [
            'school_id' => School::factory(),
            'title' => $this->generateBookTitle($category),
            'author' => $this->faker->name(),
            'isbn' => $this->faker->isbn13(),
            'publisher' => $publisher,
            'publication_year' => $this->faker->numberBetween(2010, 2024),
            'category' => $category,
            'subject' => $this->getSubjectForCategory($category),
            'level' => $this->faker->randomElement(['form_1', 'form_2', 'form_3', 'form_4', 'form_5', 'form_6']),
            'language' => $this->faker->randomElement(['English', 'Kiswahili']),
            'pages' => $this->faker->numberBetween(100, 500),
            'price' => $this->faker->numberBetween(15000, 50000), // 15,000 to 50,000 TZS
            'shelf_location' => 'Shelf ' . $this->faker->numberBetween(1, 20) . '-' . $this->faker->numberBetween(1, 10),
            'accession_number' => 'ACC' . $this->faker->numerify('########'),
            'barcode' => $this->faker->numerify('##########'),
            'status' => $this->faker->randomElement(['available', 'issued', 'lost', 'damaged']),
            'condition' => $this->faker->randomElement(['excellent', 'good', 'fair', 'poor']),
            'is_reference' => $this->faker->boolean(20), // 20% are reference books
            'is_active' => true,
            'acquired_date' => $this->faker->dateTimeBetween('-2 years', 'now'),
            'notes' => $this->faker->optional()->sentence()
        ];
    }

    private function generateBookTitle($category)
    {
        $titles = [
            'Mathematics' => [
                'Basic Mathematics for Secondary Schools',
                'Advanced Mathematics Concepts',
                'Mathematical Problem Solving',
                'Algebra and Geometry'
            ],
            'Physics' => [
                'Introduction to Physics',
                'Mechanics and Motion',
                'Electricity and Magnetism',
                'Modern Physics'
            ],
            'Chemistry' => [
                'General Chemistry',
                'Organic Chemistry',
                'Inorganic Chemistry',
                'Physical Chemistry'
            ],
            'Biology' => [
                'General Biology',
                'Cell Biology',
                'Human Anatomy',
                'Plant Biology'
            ],
            'English' => [
                'English Grammar',
                'Literature and Poetry',
                'Creative Writing',
                'Communication Skills'
            ],
            'Kiswahili' => [
                'Sarufi ya Kiswahili',
                'Ushairi na Fasihi',
                'Kusoma na Kuandika',
                'Mazungumzo ya Kiswahili'
            ],
            'History' => [
                'World History',
                'African History',
                'Tanzania History',
                'Modern History'
            ],
            'Geography' => [
                'Physical Geography',
                'Human Geography',
                'World Geography',
                'Tanzania Geography'
            ],
            'Economics' => [
                'Basic Economics',
                'Microeconomics',
                'Macroeconomics',
                'Development Economics'
            ],
            'Literature' => [
                'English Literature',
                'African Literature',
                'Poetry Collection',
                'Short Stories'
            ],
            'Reference' => [
                'Dictionary',
                'Encyclopedia',
                'Atlas',
                'Thesaurus'
            ],
            'Fiction' => [
                'Novel Collection',
                'Science Fiction',
                'Adventure Stories',
                'Mystery Novels'
            ]
        ];

        $categoryTitles = $titles[$category] ?? ['General Book'];
        return $this->faker->randomElement($categoryTitles) . ' - ' . $this->faker->numberBetween(1, 10);
    }

    private function getSubjectForCategory($category)
    {
        $subjectMap = [
            'Mathematics' => 'Mathematics',
            'Physics' => 'Physics',
            'Chemistry' => 'Chemistry',
            'Biology' => 'Biology',
            'English' => 'English Language',
            'Kiswahili' => 'Kiswahili',
            'History' => 'History',
            'Geography' => 'Geography',
            'Economics' => 'Economics',
            'Literature' => 'Literature',
            'Reference' => 'Reference',
            'Fiction' => 'Fiction'
        ];

        return $subjectMap[$category] ?? 'General';
    }

    /**
     * Indicate that the book is available.
     */
    public function available(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'available',
        ]);
    }

    /**
     * Indicate that the book is issued.
     */
    public function issued(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'issued',
        ]);
    }

    /**
     * Indicate that the book is a reference book.
     */
    public function reference(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_reference' => true,
        ]);
    }

    /**
     * Indicate that the book is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the book is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}



