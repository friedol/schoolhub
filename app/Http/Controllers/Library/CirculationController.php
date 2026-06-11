<?php

namespace App\Http\Controllers\Library;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookCopy;
use App\Models\BookIssuance;
use App\Models\BookReservation;
use App\Models\LibraryConfiguration;
use App\Models\LibraryFine;
use App\Models\LibraryTransaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CirculationController extends Controller
{
    /**
     * Display circulation dashboard
     */
    public function index(Request $request)
    {
        $schoolId = Auth::user()->school_id;
        
        // Get active issuances
        $activeIssuances = BookIssuance::with(['book', 'bookCopy', 'borrower'])
            ->whereHas('book', function ($query) use ($schoolId) {
                $query->where('school_id', $schoolId);
            })
            ->whereNull('return_date')
            ->orderBy('due_date')
            ->paginate(20);

        // Get overdue books
        $overdueBooks = BookIssuance::with(['book', 'bookCopy', 'borrower'])
            ->whereHas('book', function ($query) use ($schoolId) {
                $query->where('school_id', $schoolId);
            })
            ->whereNull('return_date')
            ->where('due_date', '<', now()->toDateString())
            ->get();

        // Get pending reservations
        $pendingReservations = BookReservation::with(['book', 'borrower'])
            ->whereHas('book', function ($query) use ($schoolId) {
                $query->where('school_id', $schoolId);
            })
            ->whereIn('status', ['pending', 'notified'])
            ->orderBy('reservation_date')
            ->get();

        // Get statistics
        $stats = [
            'total_books' => Book::where('school_id', $schoolId)->count(),
            'total_copies' => BookCopy::whereHas('book', function ($query) use ($schoolId) {
                $query->where('school_id', $schoolId);
            })->count(),
            'available_copies' => BookCopy::whereHas('book', function ($query) use ($schoolId) {
                $query->where('school_id', $schoolId);
            })->where('status', BookCopy::STATUS_AVAILABLE)->count(),
            'issued_copies' => BookCopy::whereHas('book', function ($query) use ($schoolId) {
                $query->where('school_id', $schoolId);
            })->where('status', BookCopy::STATUS_ISSUED)->count(),
            'active_issuances' => BookIssuance::whereHas('book', function ($query) use ($schoolId) {
                $query->where('school_id', $schoolId);
            })->whereNull('return_date')->count(),
            'overdue_books' => $overdueBooks->count(),
            'pending_reservations' => $pendingReservations->count(),
        ];

        return inertia('Library/Circulation/Index', [
            'activeIssuances' => $activeIssuances,
            'overdueBooks' => $overdueBooks,
            'pendingReservations' => $pendingReservations,
            'stats' => $stats,
        ]);
    }

    /**
     * Issue a book to a borrower
     */
    public function issueBook(Request $request)
    {
        $request->validate([
            'borrower_id' => 'required|exists:users,id',
            'book_copy_id' => 'required|exists:book_copies,id',
            'notes' => 'nullable|string',
        ]);

        $borrower = User::findOrFail($request->borrower_id);
        $bookCopy = BookCopy::with('book')->findOrFail($request->book_copy_id);

        // Check if book copy is available
        if (!$bookCopy->isAvailable()) {
            return back()->withErrors(['error' => 'Book copy is not available for issue.']);
        }

        // Get library configuration
        $config = LibraryConfiguration::getDefaultForSchool(Auth::user()->school_id);

        // Check borrower eligibility
        $borrowerType = $this->getBorrowerType($borrower);
        $loanLimit = $config->getLoanLimit($borrowerType);
        $loanPeriod = $config->getLoanPeriod($borrowerType);

        // Check if borrower has reached loan limit
        $activeIssuances = BookIssuance::where('borrower_id', $borrower->id)
            ->whereNull('return_date')
            ->count();

        if ($activeIssuances >= $loanLimit) {
            return back()->withErrors(['error' => "Borrower has reached the maximum loan limit of {$loanLimit} books."]);
        }

        // Check for outstanding fines
        $outstandingFines = LibraryFine::where('borrower_id', $borrower->id)
            ->whereIn('status', ['pending', 'overdue'])
            ->sum('amount');

        if ($outstandingFines > 0) {
            return back()->withErrors(['error' => "Borrower has outstanding fines of TZS " . number_format($outstandingFines) . ". Please clear fines before issuing books."]);
        }

        DB::beginTransaction();

        try {
            // Create book issuance
            $issuance = BookIssuance::create([
                'book_id' => $bookCopy->book_id,
                'book_copy_id' => $bookCopy->id,
                'borrower_id' => $borrower->id,
                'borrower_type' => $borrowerType,
                'issue_date' => now(),
                'due_date' => now()->addDays($loanPeriod),
                'status' => BookIssuance::STATUS_ISSUED,
                'issued_by' => Auth::id(),
                'notes' => $request->notes,
            ]);

            // Update book copy status
            $bookCopy->markAsIssued();

            // Create library transaction
            LibraryTransaction::create([
                'school_id' => Auth::user()->school_id,
                'transaction_type' => LibraryTransaction::TRANSACTION_TYPE_ISSUE,
                'book_id' => $bookCopy->book_id,
                'book_copy_id' => $bookCopy->id,
                'borrower_id' => $borrower->id,
                'borrower_type' => $borrowerType,
                'transaction_date' => now(),
                'due_date' => $issuance->due_date,
                'processed_by' => Auth::id(),
                'notes' => $request->notes,
            ]);

            // Check if there are pending reservations for this book
            $reservation = BookReservation::where('book_id', $bookCopy->book_id)
                ->where('borrower_id', $borrower->id)
                ->whereIn('status', ['pending', 'notified'])
                ->first();

            if ($reservation) {
                $reservation->markAsFulfilled();
            }

            DB::commit();

            return back()->with('success', 'Book issued successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to issue book: ' . $e->getMessage()]);
        }
    }

    /**
     * Return a book
     */
    public function returnBook(Request $request)
    {
        $request->validate([
            'book_copy_id' => 'required|exists:book_copies,id',
            'condition' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $bookCopy = BookCopy::with(['book', 'currentIssuance.borrower'])->findOrFail($request->book_copy_id);

        // Check if book copy is issued
        if (!$bookCopy->isIssued()) {
            return back()->withErrors(['error' => 'Book copy is not currently issued.']);
        }

        $issuance = $bookCopy->currentIssuance->first();
        if (!$issuance) {
            return back()->withErrors(['error' => 'No active issuance found for this book copy.']);
        }

        DB::beginTransaction();

        try {
            // Calculate fine if overdue
            $fineAmount = 0;
            if ($issuance->isOverdue()) {
                $config = LibraryConfiguration::getDefaultForSchool(Auth::user()->school_id);
                $daysOverdue = $issuance->days_overdue;
                
                $fineAmount = LibraryFine::calculateFineAmount(
                    $daysOverdue,
                    $config->daily_fine_rate,
                    $config->grace_period_days,
                    $config->max_fine_amount,
                    $bookCopy->book->cost
                );

                if ($fineAmount > 0) {
                    LibraryFine::create([
                        'book_issuance_id' => $issuance->id,
                        'borrower_id' => $issuance->borrower_id,
                        'school_id' => Auth::user()->school_id,
                        'amount' => $fineAmount,
                        'reason' => LibraryFine::REASON_OVERDUE,
                        'fine_date' => now()->toDateString(),
                        'created_by' => Auth::id(),
                    ]);
                }
            }

            // Mark issuance as returned
            $issuance->markAsReturned(Auth::user(), $request->notes);

            // Update book copy condition if provided
            if ($request->condition) {
                $bookCopy->update(['condition' => $request->condition]);
            }

            // Create library transaction
            LibraryTransaction::create([
                'school_id' => Auth::user()->school_id,
                'transaction_type' => LibraryTransaction::TRANSACTION_TYPE_RETURN,
                'book_id' => $bookCopy->book_id,
                'book_copy_id' => $bookCopy->id,
                'borrower_id' => $issuance->borrower_id,
                'borrower_type' => $issuance->borrower_type,
                'transaction_date' => now(),
                'return_date' => now(),
                'fine_amount' => $fineAmount,
                'processed_by' => Auth::id(),
                'notes' => $request->notes,
            ]);

            DB::commit();

            $message = 'Book returned successfully.';
            if ($fineAmount > 0) {
                $message .= " Fine of TZS " . number_format($fineAmount) . " has been applied.";
            }

            return back()->with('success', $message);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to return book: ' . $e->getMessage()]);
        }
    }

    /**
     * Renew a book
     */
    public function renewBook(Request $request)
    {
        $request->validate([
            'book_issuance_id' => 'required|exists:book_issuances,id',
            'renewal_reason' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $issuance = BookIssuance::with(['book', 'bookCopy', 'borrower'])->findOrFail($request->book_issuance_id);

        // Check if issuance is active
        if (!$issuance->isActive()) {
            return back()->withErrors(['error' => 'Book is not currently issued.']);
        }

        // Get library configuration
        $config = LibraryConfiguration::getDefaultForSchool(Auth::user()->school_id);

        // Check renewal limit
        if ($issuance->renewal_count >= $config->max_renewals) {
            return back()->withErrors(['error' => 'Maximum renewal limit reached.']);
        }

        DB::beginTransaction();

        try {
            // Renew the issuance
            $issuance->renew(Auth::user(), $config->renewal_period_days);

            // Create library transaction
            LibraryTransaction::create([
                'school_id' => Auth::user()->school_id,
                'transaction_type' => LibraryTransaction::TRANSACTION_TYPE_RENEWAL,
                'book_id' => $issuance->book_id,
                'book_copy_id' => $issuance->book_copy_id,
                'borrower_id' => $issuance->borrower_id,
                'borrower_type' => $issuance->borrower_type,
                'transaction_date' => now(),
                'due_date' => $issuance->due_date,
                'processed_by' => Auth::id(),
                'notes' => $request->notes,
            ]);

            DB::commit();

            return back()->with('success', 'Book renewed successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to renew book: ' . $e->getMessage()]);
        }
    }

    /**
     * Reserve a book
     */
    public function reserveBook(Request $request)
    {
        $request->validate([
            'book_id' => 'required|exists:books,id',
            'borrower_id' => 'required|exists:users,id',
            'notes' => 'nullable|string',
        ]);

        $book = Book::findOrFail($request->book_id);
        $borrower = User::findOrFail($request->borrower_id);

        // Check if book can be reserved
        if (!BookReservation::canReserve($book->id, $borrower->id)) {
            return back()->withErrors(['error' => 'Book cannot be reserved. User may already have a reservation or reached the limit.']);
        }

        // Get library configuration
        $config = LibraryConfiguration::getDefaultForSchool(Auth::user()->school_id);

        DB::beginTransaction();

        try {
            // Create reservation
            $reservation = BookReservation::create([
                'book_id' => $book->id,
                'borrower_id' => $borrower->id,
                'borrower_type' => $this->getBorrowerType($borrower),
                'reservation_date' => now(),
                'expiry_date' => now()->addDays($config->reservation_expiry_days),
                'notes' => $request->notes,
            ]);

            // Create library transaction
            LibraryTransaction::create([
                'school_id' => Auth::user()->school_id,
                'transaction_type' => LibraryTransaction::TRANSACTION_TYPE_RESERVATION,
                'book_id' => $book->id,
                'borrower_id' => $borrower->id,
                'borrower_type' => $this->getBorrowerType($borrower),
                'transaction_date' => now(),
                'processed_by' => Auth::id(),
                'notes' => $request->notes,
            ]);

            DB::commit();

            return back()->with('success', 'Book reserved successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to reserve book: ' . $e->getMessage()]);
        }
    }

    /**
     * Search for books by barcode/QR code
     */
    public function searchByBarcode(Request $request)
    {
        $request->validate([
            'barcode' => 'required|string',
        ]);

        $bookCopy = BookCopy::with(['book', 'currentIssuance.borrower'])
            ->where('barcode', $request->barcode)
            ->orWhere('qr_code', $request->barcode)
            ->first();

        if (!$bookCopy) {
            return response()->json(['error' => 'Book copy not found.'], 404);
        }

        return response()->json([
            'book_copy' => $bookCopy,
            'book' => $bookCopy->book,
            'current_issuance' => $bookCopy->currentIssuance->first(),
        ]);
    }

    /**
     * Search for borrowers by ID or name
     */
    public function searchBorrower(Request $request)
    {
        $request->validate([
            'search' => 'required|string|min:2',
        ]);

        $borrowers = User::where('school_id', Auth::user()->school_id)
            ->where(function ($query) use ($request) {
                $query->where('name', 'like', "%{$request->search}%")
                      ->orWhere('student_number', 'like', "%{$request->search}%")
                      ->orWhere('email', 'like', "%{$request->search}%");
            })
            ->limit(10)
            ->get();

        return response()->json(['borrowers' => $borrowers]);
    }

    /**
     * Get borrower type based on user role
     */
    private function getBorrowerType(User $user): string
    {
        if ($user->isStudent()) {
            return BookIssuance::BORROWER_TYPE_STUDENT;
        } elseif ($user->isTeacher()) {
            return BookIssuance::BORROWER_TYPE_TEACHER;
        } else {
            return BookIssuance::BORROWER_TYPE_STAFF;
        }
    }
}



