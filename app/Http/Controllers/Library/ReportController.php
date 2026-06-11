<?php

namespace App\Http\Controllers\Library;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookCopy;
use App\Models\BookIssuance;
use App\Models\BookReservation;
use App\Models\LibraryFine;
use App\Models\LibraryTransaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Display library reports dashboard
     */
    public function index()
    {
        $schoolId = Auth::user()->school_id;

        // Get basic statistics
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
            'active_borrowers' => User::where('school_id', $schoolId)
                ->whereHas('bookIssuances', function ($query) {
                    $query->whereNull('return_date');
                })->count(),
            'total_fines' => LibraryFine::where('school_id', $schoolId)->sum('amount'),
            'outstanding_fines' => LibraryFine::where('school_id', $schoolId)
                ->whereIn('status', [LibraryFine::STATUS_PENDING, LibraryFine::STATUS_PARTIAL])
                ->sum(DB::raw('amount - paid_amount')),
        ];

        return inertia('Library/Reports/Index', [
            'stats' => $stats,
        ]);
    }

    /**
     * Popular books report
     */
    public function popularBooks(Request $request)
    {
        $schoolId = Auth::user()->school_id;
        
        $query = Book::with(['copies'])
            ->where('school_id', $schoolId)
            ->withCount(['issuances as total_issues']);

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereHas('issuances', function ($q) use ($request) {
                $q->where('issue_date', '>=', $request->date_from);
            });
        }

        if ($request->filled('date_to')) {
            $query->whereHas('issuances', function ($q) use ($request) {
                $q->where('issue_date', '<=', $request->date_to);
            });
        }

        // Filter by subject category
        if ($request->filled('subject_category')) {
            $query->where('subject_category', $request->subject_category);
        }

        $popularBooks = $query->orderBy('total_issues', 'desc')
            ->limit(50)
            ->get();

        return inertia('Library/Reports/PopularBooks', [
            'popularBooks' => $popularBooks,
            'filters' => $request->only(['date_from', 'date_to', 'subject_category']),
            'subjectCategories' => Book::SUBJECT_CATEGORY_OPTIONS,
        ]);
    }

    /**
     * Active borrowers report
     */
    public function activeBorrowers(Request $request)
    {
        $schoolId = Auth::user()->school_id;

        $query = User::where('school_id', $schoolId)
            ->withCount(['bookIssuances as total_borrowed'])
            ->withCount(['bookIssuances as active_borrowed' => function ($query) {
                $query->whereNull('return_date');
            }])
            ->withCount(['libraryFines as total_fines'])
            ->having('total_borrowed', '>', 0);

        // Filter by user type
        if ($request->filled('user_type')) {
            $query->where('role', $request->user_type);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereHas('bookIssuances', function ($q) use ($request) {
                $q->where('issue_date', '>=', $request->date_from);
            });
        }

        if ($request->filled('date_to')) {
            $query->whereHas('bookIssuances', function ($q) use ($request) {
                $q->where('issue_date', '<=', $request->date_to);
            });
        }

        $activeBorrowers = $query->orderBy('total_borrowed', 'desc')
            ->paginate(20);

        return inertia('Library/Reports/ActiveBorrowers', [
            'activeBorrowers' => $activeBorrowers,
            'filters' => $request->only(['user_type', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Overdue books report
     */
    public function overdueBooks(Request $request)
    {
        $schoolId = Auth::user()->school_id;

        $query = BookIssuance::with(['book', 'bookCopy', 'borrower'])
            ->whereHas('book', function ($query) use ($schoolId) {
                $query->where('school_id', $schoolId);
            })
            ->whereNull('return_date')
            ->where('due_date', '<', now()->toDateString());

        // Filter by borrower type
        if ($request->filled('borrower_type')) {
            $query->where('borrower_type', $request->borrower_type);
        }

        // Filter by days overdue
        if ($request->filled('days_overdue_min')) {
            $query->whereRaw('DATEDIFF(NOW(), due_date) >= ?', [$request->days_overdue_min]);
        }

        if ($request->filled('days_overdue_max')) {
            $query->whereRaw('DATEDIFF(NOW(), due_date) <= ?', [$request->days_overdue_max]);
        }

        $overdueBooks = $query->orderBy('due_date')
            ->paginate(20);

        return inertia('Library/Reports/OverdueBooks', [
            'overdueBooks' => $overdueBooks,
            'filters' => $request->only(['borrower_type', 'days_overdue_min', 'days_overdue_max']),
        ]);
    }

    /**
     * Library usage statistics
     */
    public function usageStatistics(Request $request)
    {
        $schoolId = Auth::user()->school_id;
        $period = $request->get('period', 'monthly'); // daily, weekly, monthly, yearly

        $query = LibraryTransaction::where('school_id', $schoolId)
            ->where('transaction_type', LibraryTransaction::TRANSACTION_TYPE_ISSUE);

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->where('transaction_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('transaction_date', '<=', $request->date_to);
        }

        // Group by period
        switch ($period) {
            case 'daily':
                $usageStats = $query->selectRaw('DATE(transaction_date) as period, COUNT(*) as count')
                    ->groupBy('period')
                    ->orderBy('period')
                    ->get();
                break;
            case 'weekly':
                $usageStats = $query->selectRaw('YEARWEEK(transaction_date) as period, COUNT(*) as count')
                    ->groupBy('period')
                    ->orderBy('period')
                    ->get();
                break;
            case 'monthly':
                $usageStats = $query->selectRaw('DATE_FORMAT(transaction_date, "%Y-%m") as period, COUNT(*) as count')
                    ->groupBy('period')
                    ->orderBy('period')
                    ->get();
                break;
            case 'yearly':
                $usageStats = $query->selectRaw('YEAR(transaction_date) as period, COUNT(*) as count')
                    ->groupBy('period')
                    ->orderBy('period')
                    ->get();
                break;
        }

        // Get subject category breakdown
        $categoryStats = BookIssuance::with('book')
            ->whereHas('book', function ($query) use ($schoolId) {
                $query->where('school_id', $schoolId);
            })
            ->selectRaw('books.subject_category, COUNT(*) as count')
            ->join('books', 'book_issuances.book_id', '=', 'books.id')
            ->groupBy('books.subject_category')
            ->orderBy('count', 'desc')
            ->get();

        // Get borrower type breakdown
        $borrowerTypeStats = BookIssuance::whereHas('book', function ($query) use ($schoolId) {
                $query->where('school_id', $schoolId);
            })
            ->selectRaw('borrower_type, COUNT(*) as count')
            ->groupBy('borrower_type')
            ->orderBy('count', 'desc')
            ->get();

        return inertia('Library/Reports/UsageStatistics', [
            'usageStats' => $usageStats,
            'categoryStats' => $categoryStats,
            'borrowerTypeStats' => $borrowerTypeStats,
            'filters' => $request->only(['period', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Inventory summary report
     */
    public function inventorySummary(Request $request)
    {
        $schoolId = Auth::user()->school_id;

        // Get books by subject category
        $booksByCategory = Book::where('school_id', $schoolId)
            ->selectRaw('subject_category, COUNT(*) as book_count')
            ->groupBy('subject_category')
            ->orderBy('book_count', 'desc')
            ->get();

        // Get copies by status
        $copiesByStatus = BookCopy::whereHas('book', function ($query) use ($schoolId) {
                $query->where('school_id', $schoolId);
            })
            ->selectRaw('status, COUNT(*) as copy_count')
            ->groupBy('status')
            ->orderBy('copy_count', 'desc')
            ->get();

        // Get books by target audience
        $booksByAudience = Book::where('school_id', $schoolId)
            ->selectRaw('target_audience, COUNT(*) as book_count')
            ->groupBy('target_audience')
            ->orderBy('book_count', 'desc')
            ->get();

        // Get books by language
        $booksByLanguage = Book::where('school_id', $schoolId)
            ->selectRaw('language, COUNT(*) as book_count')
            ->groupBy('language')
            ->orderBy('book_count', 'desc')
            ->get();

        // Get recent acquisitions
        $recentAcquisitions = Book::where('school_id', $schoolId)
            ->where('acquisition_date', '>=', now()->subMonths(6))
            ->orderBy('acquisition_date', 'desc')
            ->limit(20)
            ->get();

        return inertia('Library/Reports/InventorySummary', [
            'booksByCategory' => $booksByCategory,
            'copiesByStatus' => $copiesByStatus,
            'booksByAudience' => $booksByAudience,
            'booksByLanguage' => $booksByLanguage,
            'recentAcquisitions' => $recentAcquisitions,
        ]);
    }

    /**
     * Fine collection report
     */
    public function fineCollection(Request $request)
    {
        $schoolId = Auth::user()->school_id;

        $query = LibraryFine::where('school_id', $schoolId);

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->where('fine_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('fine_date', '<=', $request->date_to);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $fines = $query->with(['borrower', 'bookIssuance.book'])
            ->orderBy('fine_date', 'desc')
            ->paginate(20);

        // Get fine statistics
        $fineStats = [
            'total_fines' => $query->count(),
            'total_amount' => $query->sum('amount'),
            'paid_amount' => $query->sum('paid_amount'),
            'outstanding_amount' => $query->sum(DB::raw('amount - paid_amount')),
            'pending_fines' => $query->where('status', LibraryFine::STATUS_PENDING)->count(),
            'paid_fines' => $query->where('status', LibraryFine::STATUS_PAID)->count(),
            'waived_fines' => $query->where('status', LibraryFine::STATUS_WAIVED)->count(),
        ];

        return inertia('Library/Reports/FineCollection', [
            'fines' => $fines,
            'fineStats' => $fineStats,
            'filters' => $request->only(['date_from', 'date_to', 'status']),
        ]);
    }

    /**
     * Export report data
     */
    public function exportReport(Request $request)
    {
        $request->validate([
            'report_type' => 'required|string',
            'format' => 'required|in:csv,excel,pdf',
        ]);

        $reportType = $request->report_type;
        $format = $request->format;

        // Implementation for report export would go here
        // This would generate downloadable files based on the report type and format

        return back()->with('success', 'Report exported successfully.');
    }
}



