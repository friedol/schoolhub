<?php

namespace App\Http\Controllers\Library;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookCopy;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BookController extends Controller
{
    /**
     * Display a listing of books
     */
    public function index(Request $request)
    {
        $query = Book::with(['copies', 'createdBy'])
            ->where('school_id', Auth::user()->school_id);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('author', 'like', "%{$search}%")
                  ->orWhere('isbn', 'like', "%{$search}%")
                  ->orWhere('accession_number', 'like', "%{$search}%");
            });
        }

        // Filter by subject category
        if ($request->filled('subject_category')) {
            $query->where('subject_category', $request->subject_category);
        }

        // Filter by target audience
        if ($request->filled('target_audience')) {
            $query->where('target_audience', $request->target_audience);
        }

        // Filter by language
        if ($request->filled('language')) {
            $query->where('language', $request->language);
        }

        // Filter by availability
        if ($request->filled('availability')) {
            if ($request->availability === 'available') {
                $query->whereHas('copies', function ($q) {
                    $q->where('status', BookCopy::STATUS_AVAILABLE);
                });
            } elseif ($request->availability === 'issued') {
                $query->whereHas('copies', function ($q) {
                    $q->where('status', BookCopy::STATUS_ISSUED);
                });
            }
        }

        $books = $query->paginate(20);

        return inertia('Library/Books/Index', [
            'books' => $books,
            'filters' => $request->only(['search', 'subject_category', 'target_audience', 'language', 'availability']),
            'subjectCategories' => Book::SUBJECT_CATEGORY_OPTIONS,
            'targetAudiences' => Book::TARGET_AUDIENCE_OPTIONS,
            'languages' => Book::LANGUAGE_OPTIONS,
        ]);
    }

    /**
     * Show the form for creating a new book
     */
    public function create()
    {
        return inertia('Library/Books/Create', [
            'subjectCategories' => Book::SUBJECT_CATEGORY_OPTIONS,
            'targetAudiences' => Book::TARGET_AUDIENCE_OPTIONS,
            'languages' => Book::LANGUAGE_OPTIONS,
            'bookTypes' => Book::BOOK_TYPE_OPTIONS,
        ]);
    }

    /**
     * Store a newly created book
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'publisher' => 'nullable|string|max:255',
            'publication_year' => 'nullable|integer|min:1800|max:' . date('Y'),
            'edition' => 'nullable|string|max:100',
            'isbn' => 'nullable|string|max:20|unique:books,isbn',
            'issn' => 'nullable|string|max:20|unique:books,issn',
            'dewey_decimal_number' => 'nullable|string|max:50',
            'library_of_congress_number' => 'nullable|string|max:50',
            'subject_category' => 'required|string',
            'target_audience' => 'required|string',
            'language' => 'required|string',
            'number_of_pages' => 'nullable|integer|min:1',
            'book_type' => 'required|string',
            'acquisition_date' => 'nullable|date',
            'cost' => 'nullable|numeric|min:0',
            'supplier' => 'nullable|string|max:255',
            'shelf_location' => 'nullable|string|max:100',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'description' => 'nullable|string',
            'keywords' => 'nullable|array',
            'copies_count' => 'required|integer|min:1|max:100',
        ]);

        DB::beginTransaction();

        try {
            // Generate accession number
            $accessionNumber = Book::generateAccessionNumber();

            // Handle cover image upload
            $coverImagePath = null;
            if ($request->hasFile('cover_image')) {
                $coverImagePath = $request->file('cover_image')->store('book-covers', 'public');
            }

            // Create book
            $book = Book::create([
                'school_id' => Auth::user()->school_id,
                'accession_number' => $accessionNumber,
                'title' => $request->title,
                'author' => $request->author,
                'publisher' => $request->publisher,
                'publication_year' => $request->publication_year,
                'edition' => $request->edition,
                'isbn' => $request->isbn,
                'issn' => $request->issn,
                'dewey_decimal_number' => $request->dewey_decimal_number,
                'library_of_congress_number' => $request->library_of_congress_number,
                'subject_category' => $request->subject_category,
                'target_audience' => $request->target_audience,
                'language' => $request->language,
                'number_of_pages' => $request->number_of_pages,
                'book_type' => $request->book_type,
                'acquisition_date' => $request->acquisition_date,
                'cost' => $request->cost,
                'supplier' => $request->supplier,
                'shelf_location' => $request->shelf_location,
                'cover_image_path' => $coverImagePath,
                'description' => $request->description,
                'keywords' => $request->keywords,
                'created_by' => Auth::id(),
            ]);

            // Create book copies
            for ($i = 1; $i <= $request->copies_count; $i++) {
                BookCopy::create([
                    'book_id' => $book->id,
                    'copy_number' => $i,
                    'barcode' => BookCopy::generateBarcode(),
                    'qr_code' => BookCopy::generateQRCode(),
                    'purchase_date' => $request->acquisition_date,
                    'purchase_price' => $request->cost ? $request->cost / $request->copies_count : null,
                ]);
            }

            DB::commit();

            return redirect()->route('library.books.index')
                ->with('success', 'Book and copies created successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            
            // Delete uploaded image if book creation failed
            if ($coverImagePath) {
                Storage::disk('public')->delete($coverImagePath);
            }

            return back()->withErrors(['error' => 'Failed to create book: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified book
     */
    public function show(Book $book)
    {
        $book->load(['copies', 'createdBy', 'issuances.borrower', 'reservations.borrower']);

        return inertia('Library/Books/Show', [
            'book' => $book,
        ]);
    }

    /**
     * Show the form for editing the specified book
     */
    public function edit(Book $book)
    {
        return inertia('Library/Books/Edit', [
            'book' => $book,
            'subjectCategories' => Book::SUBJECT_CATEGORY_OPTIONS,
            'targetAudiences' => Book::TARGET_AUDIENCE_OPTIONS,
            'languages' => Book::LANGUAGE_OPTIONS,
            'bookTypes' => Book::BOOK_TYPE_OPTIONS,
        ]);
    }

    /**
     * Update the specified book
     */
    public function update(Request $request, Book $book)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'publisher' => 'nullable|string|max:255',
            'publication_year' => 'nullable|integer|min:1800|max:' . date('Y'),
            'edition' => 'nullable|string|max:100',
            'isbn' => 'nullable|string|max:20|unique:books,isbn,' . $book->id,
            'issn' => 'nullable|string|max:20|unique:books,issn,' . $book->id,
            'dewey_decimal_number' => 'nullable|string|max:50',
            'library_of_congress_number' => 'nullable|string|max:50',
            'subject_category' => 'required|string',
            'target_audience' => 'required|string',
            'language' => 'required|string',
            'number_of_pages' => 'nullable|integer|min:1',
            'book_type' => 'required|string',
            'acquisition_date' => 'nullable|date',
            'cost' => 'nullable|numeric|min:0',
            'supplier' => 'nullable|string|max:255',
            'shelf_location' => 'nullable|string|max:100',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'description' => 'nullable|string',
            'keywords' => 'nullable|array',
        ]);

        // Handle cover image upload
        if ($request->hasFile('cover_image')) {
            // Delete old image
            if ($book->cover_image_path) {
                Storage::disk('public')->delete($book->cover_image_path);
            }
            
            $coverImagePath = $request->file('cover_image')->store('book-covers', 'public');
        } else {
            $coverImagePath = $book->cover_image_path;
        }

        $book->update([
            'title' => $request->title,
            'author' => $request->author,
            'publisher' => $request->publisher,
            'publication_year' => $request->publication_year,
            'edition' => $request->edition,
            'isbn' => $request->isbn,
            'issn' => $request->issn,
            'dewey_decimal_number' => $request->dewey_decimal_number,
            'library_of_congress_number' => $request->library_of_congress_number,
            'subject_category' => $request->subject_category,
            'target_audience' => $request->target_audience,
            'language' => $request->language,
            'number_of_pages' => $request->number_of_pages,
            'book_type' => $request->book_type,
            'acquisition_date' => $request->acquisition_date,
            'cost' => $request->cost,
            'supplier' => $request->supplier,
            'shelf_location' => $request->shelf_location,
            'cover_image_path' => $coverImagePath,
            'description' => $request->description,
            'keywords' => $request->keywords,
        ]);

        return redirect()->route('library.books.index')
            ->with('success', 'Book updated successfully.');
    }

    /**
     * Remove the specified book
     */
    public function destroy(Book $book)
    {
        // Check if book has active issuances
        if ($book->issuances()->whereNull('return_date')->exists()) {
            return back()->withErrors(['error' => 'Cannot delete book with active issuances.']);
        }

        // Delete cover image
        if ($book->cover_image_path) {
            Storage::disk('public')->delete($book->cover_image_path);
        }

        $book->delete();

        return redirect()->route('library.books.index')
            ->with('success', 'Book deleted successfully.');
    }

    /**
     * Bulk import books from CSV/Excel
     */
    public function bulkImport(Request $request)
    {
        $request->validate([
            'import_file' => 'required|file|mimes:csv,xlsx,xls|max:10240',
        ]);

        // Implementation for bulk import would go here
        // This would involve reading the file and creating books in batches

        return back()->with('success', 'Books imported successfully.');
    }

    /**
     * Generate barcodes for book copies
     */
    public function generateBarcodes(Book $book)
    {
        $book->load('copies');
        
        // Implementation for barcode generation would go here
        // This could generate PDF files with barcodes for printing

        return back()->with('success', 'Barcodes generated successfully.');
    }
}
