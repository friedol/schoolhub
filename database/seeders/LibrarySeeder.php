<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\School;
use App\Models\Book;
use App\Models\BookIssuance;
use App\Models\LibraryFine;
use App\Models\User;

class LibrarySeeder extends Seeder
{
    public function run()
    {
        $schools = School::all();
        
        foreach ($schools as $school) {
            $this->createLibraryDataForSchool($school);
        }
    }

    private function createLibraryDataForSchool($school)
    {
        // Create books
        $this->createBooks($school);

        // Create book issuances
        $this->createBookIssuances($school);

        // Create library fines
        $this->createLibraryFines($school);
    }

    private function createBooks($school)
    {
        $bookCategories = [
            'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Kiswahili',
            'History', 'Geography', 'Economics', 'Literature', 'Reference', 'Fiction'
        ];

        $publishers = [
            'Oxford University Press', 'Cambridge University Press', 'Longman',
            'Macmillan', 'Heinemann', 'Pearson', 'McGraw-Hill', 'Wiley'
        ];

        for ($i = 0; $i < 200; $i++) {
            $category = fake()->randomElement($bookCategories);
            $publisher = fake()->randomElement($publishers);
            
            $createdBy = User::where('school_id', $school->id)->where('role', 'librarian')->first();
            if (!$createdBy) {
                $createdBy = User::where('school_id', $school->id)->first();
            }

            Book::create([
                'school_id' => $school->id,
                'accession_number' => $this->generateAccessionNumber($school->id, $i + 1),
                'title' => $this->generateBookTitle($category),
                'author' => fake()->name(),
                'publisher' => $publisher,
                'publication_year' => fake()->numberBetween(2010, 2024),
                'edition' => fake()->optional(0.3)->randomElement(['1st Edition', '2nd Edition', '3rd Edition']),
                'isbn' => fake()->isbn13(),
                'issn' => fake()->optional(0.1)->numerify('####-####'),
                'dewey_decimal_number' => fake()->optional(0.5)->numerify('###.##'),
                'library_of_congress_number' => fake()->optional(0.3)->bothify('??###'),
                'subject_category' => $category,
                'target_audience' => fake()->randomElement(['form_1', 'form_2', 'form_3', 'form_4', 'form_5', 'form_6']),
                'language' => fake()->randomElement(['english', 'kiswahili']),
                'number_of_pages' => fake()->numberBetween(100, 500),
                'book_type' => fake()->randomElement(['paperback', 'hardcover', 'ebook']),
                'acquisition_date' => fake()->dateTimeBetween('-2 years', 'now'),
                'cost' => fake()->numberBetween(15000, 50000), // 15,000 to 50,000 TZS
                'supplier' => fake()->randomElement(['Oxford Bookstore', 'Cambridge Books', 'Local Supplier']),
                'shelf_location' => 'Shelf ' . fake()->numberBetween(1, 20) . '-' . fake()->numberBetween(1, 10),
                'cover_image_path' => null,
                'description' => fake()->optional(0.7)->paragraph(),
                'keywords' => json_encode([fake()->word(), fake()->word(), fake()->word()]),
                'is_active' => true,
                'created_by' => $createdBy->id
            ]);
        }
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
        return fake()->randomElement($categoryTitles) . ' - ' . fake()->numberBetween(1, 10);
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

    private function generateAccessionNumber($schoolId, $bookNumber)
    {
        return 'ACC' . str_pad($schoolId, 2, '0', STR_PAD_LEFT) . str_pad($bookNumber, 4, '0', STR_PAD_LEFT);
    }

    private function createBookIssuances($school)
    {
        $books = Book::where('school_id', $school->id)->get();
        $students = User::where('school_id', $school->id)->where('role', 'student')->get();
        $librarian = User::where('school_id', $school->id)->where('role', 'librarian')->first();

        // Create 100-150 book issuances
        $issuanceCount = fake()->numberBetween(100, 150);
        
        for ($i = 0; $i < $issuanceCount; $i++) {
            $book = $books->random();
            $student = $students->random();
            
            $issueDate = fake()->dateTimeBetween('-6 months', 'now');
            $dueDate = fake()->dateTimeBetween($issueDate, '+30 days');
            $returnDate = fake()->boolean(80) ? fake()->dateTimeBetween($issueDate, $dueDate) : null;
            
            $isOverdue = $returnDate === null && $dueDate < now();
            $status = $returnDate ? 'returned' : ($isOverdue ? 'overdue' : 'issued');

            // Get a book copy for this book
            $bookCopy = \App\Models\BookCopy::where('book_id', $book->id)->first();
            if (!$bookCopy) {
                // Create a book copy if none exists
                $bookCopy = \App\Models\BookCopy::create([
                    'book_id' => $book->id,
                    'copy_number' => 1,
                    'barcode' => fake()->numerify('##########'),
                    'qr_code' => fake()->unique()->numerify('QR##########'),
                    'status' => 'available',
                    'condition' => 'good',
                    'purchase_date' => fake()->dateTimeBetween('-2 years', 'now'),
                    'purchase_price' => fake()->numberBetween(15000, 50000),
                    'notes' => null,
                    'last_inspection_date' => fake()->optional(0.3)->dateTimeBetween('-1 year', 'now'),
                    'last_inspection_by' => null
                ]);
            }

            BookIssuance::create([
                'book_id' => $book->id,
                'book_copy_id' => $bookCopy->id,
                'borrower_id' => $student->id,
                'borrower_type' => 'student',
                'issue_date' => $issueDate,
                'due_date' => $dueDate,
                'return_date' => $returnDate,
                'status' => $status,
                'issued_by' => $librarian->id,
                'returned_by' => $returnDate ? $librarian->id : null,
                'renewal_count' => 0,
                'notes' => fake()->optional()->sentence(),
                'fine_amount' => $isOverdue ? fake()->numberBetween(500, 2000) : 0,
                'fine_paid' => 0,
                'fine_paid_date' => null
            ]);

            // Update book copy status
            if ($status === 'issued' || $status === 'overdue') {
                $bookCopy->update(['status' => 'issued']);
            } elseif ($status === 'returned') {
                $bookCopy->update(['status' => 'available']);
            }
        }
    }

    private function createLibraryFines($school)
    {
        $overdueIssuances = BookIssuance::whereHas('book', function($query) use ($school) {
                                           $query->where('school_id', $school->id);
                                       })
                                       ->where('status', 'overdue')
                                       ->get();

        foreach ($overdueIssuances as $issuance) {
            if ($issuance->fine_amount > 0) {
                LibraryFine::create([
                    'book_issuance_id' => $issuance->id,
                    'borrower_id' => $issuance->borrower_id,
                    'school_id' => $school->id,
                    'amount' => $issuance->fine_amount,
                    'reason' => 'overdue',
                    'fine_date' => $issuance->due_date,
                    'due_date' => fake()->dateTimeBetween($issuance->due_date, '+30 days'),
                    'paid_amount' => 0,
                    'paid_date' => null,
                    'status' => fake()->randomElement(['pending', 'paid', 'waived']),
                    'waived_by' => null,
                    'waived_date' => null,
                    'waiver_reason' => null,
                    'created_by' => $issuance->issued_by
                ]);
            }
        }

        // Create some additional fines for lost/damaged books
        $lostBookCopies = \App\Models\BookCopy::whereHas('book', function($query) use ($school) {
                                $query->where('school_id', $school->id);
                            })
                            ->where('status', 'lost')
                            ->get()
                            ->take(5);

        foreach ($lostBookCopies as $bookCopy) {
            $student = User::where('school_id', $school->id)
                          ->where('role', 'student')
                          ->inRandomOrder()
                          ->first();

            LibraryFine::create([
                'book_issuance_id' => null, // No specific issuance for lost books
                'borrower_id' => $student->id,
                'school_id' => $school->id,
                'amount' => $bookCopy->purchase_price * 2, // Double the book price
                'reason' => 'lost_book',
                'fine_date' => fake()->dateTimeBetween('-30 days', 'now'),
                'due_date' => fake()->dateTimeBetween('now', '+30 days'),
                'paid_amount' => 0,
                'paid_date' => null,
                'status' => fake()->randomElement(['pending', 'paid']),
                'waived_by' => null,
                'waived_date' => null,
                'waiver_reason' => null,
                'created_by' => User::where('school_id', $school->id)->where('role', 'librarian')->first()->id
            ]);
        }
    }
}
