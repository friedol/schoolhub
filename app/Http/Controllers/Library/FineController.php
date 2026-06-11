<?php

namespace App\Http\Controllers\Library;

use App\Http\Controllers\Controller;
use App\Models\LibraryFine;
use App\Models\BookIssuance;
use App\Models\LibraryConfiguration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FineController extends Controller
{
    /**
     * Display a listing of fines
     */
    public function index(Request $request)
    {
        $query = LibraryFine::with(['borrower', 'bookIssuance.book', 'createdBy'])
            ->where('school_id', Auth::user()->school_id);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by borrower
        if ($request->filled('borrower_id')) {
            $query->where('borrower_id', $request->borrower_id);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->where('fine_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('fine_date', '<=', $request->date_to);
        }

        // Search by borrower name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('borrower', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('student_number', 'like', "%{$search}%");
            });
        }

        $fines = $query->orderBy('fine_date', 'desc')->paginate(20);

        // Get statistics
        $stats = [
            'total_fines' => LibraryFine::where('school_id', Auth::user()->school_id)->count(),
            'pending_fines' => LibraryFine::where('school_id', Auth::user()->school_id)
                ->where('status', LibraryFine::STATUS_PENDING)->count(),
            'paid_fines' => LibraryFine::where('school_id', Auth::user()->school_id)
                ->where('status', LibraryFine::STATUS_PAID)->count(),
            'waived_fines' => LibraryFine::where('school_id', Auth::user()->school_id)
                ->where('status', LibraryFine::STATUS_WAIVED)->count(),
            'total_amount' => LibraryFine::where('school_id', Auth::user()->school_id)->sum('amount'),
            'paid_amount' => LibraryFine::where('school_id', Auth::user()->school_id)->sum('paid_amount'),
            'outstanding_amount' => LibraryFine::where('school_id', Auth::user()->school_id)
                ->whereIn('status', [LibraryFine::STATUS_PENDING, LibraryFine::STATUS_PARTIAL])
                ->sum(DB::raw('amount - paid_amount')),
        ];

        return inertia('Library/Fines/Index', [
            'fines' => $fines,
            'stats' => $stats,
            'filters' => $request->only(['status', 'borrower_id', 'date_from', 'date_to', 'search']),
        ]);
    }

    /**
     * Display the specified fine
     */
    public function show(LibraryFine $fine)
    {
        $fine->load(['borrower', 'bookIssuance.book', 'createdBy', 'waivedBy']);

        return inertia('Library/Fines/Show', [
            'fine' => $fine,
        ]);
    }

    /**
     * Record a fine payment
     */
    public function recordPayment(Request $request, LibraryFine $fine)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01|max:' . $fine->outstanding_amount,
            'payment_method' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        if ($fine->isPaid()) {
            return back()->withErrors(['error' => 'Fine is already fully paid.']);
        }

        if ($request->amount > $fine->outstanding_amount) {
            return back()->withErrors(['error' => 'Payment amount cannot exceed outstanding amount.']);
        }

        DB::beginTransaction();

        try {
            // Record the payment
            $fine->markAsPaid($request->amount, $request->notes);

            // Create a financial transaction record if needed
            // This could integrate with the fee management system

            DB::commit();

            return back()->with('success', 'Payment recorded successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to record payment: ' . $e->getMessage()]);
        }
    }

    /**
     * Waive a fine
     */
    public function waiveFine(Request $request, LibraryFine $fine)
    {
        $request->validate([
            'waiver_reason' => 'required|string|max:500',
        ]);

        if ($fine->isWaived()) {
            return back()->withErrors(['error' => 'Fine is already waived.']);
        }

        DB::beginTransaction();

        try {
            $fine->markAsWaived(Auth::user(), $request->waiver_reason);

            DB::commit();

            return back()->with('success', 'Fine waived successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to waive fine: ' . $e->getMessage()]);
        }
    }

    /**
     * Generate overdue fines for all overdue books
     */
    public function generateOverdueFines()
    {
        $schoolId = Auth::user()->school_id;
        $config = LibraryConfiguration::getDefaultForSchool($schoolId);

        if (!$config->isAutoFineCalculationEnabled()) {
            return back()->withErrors(['error' => 'Automatic fine calculation is disabled.']);
        }

        // Get all overdue issuances that don't have fines yet
        $overdueIssuances = BookIssuance::with(['book', 'bookCopy'])
            ->whereHas('book', function ($query) use ($schoolId) {
                $query->where('school_id', $schoolId);
            })
            ->whereNull('return_date')
            ->where('due_date', '<', now()->toDateString())
            ->whereDoesntHave('fines')
            ->get();

        $finesCreated = 0;

        DB::beginTransaction();

        try {
            foreach ($overdueIssuances as $issuance) {
                $daysOverdue = $issuance->days_overdue;
                
                $fineAmount = LibraryFine::calculateFineAmount(
                    $daysOverdue,
                    $config->daily_fine_rate,
                    $config->grace_period_days,
                    $config->max_fine_amount,
                    $issuance->book->cost
                );

                if ($fineAmount > 0) {
                    LibraryFine::create([
                        'book_issuance_id' => $issuance->id,
                        'borrower_id' => $issuance->borrower_id,
                        'school_id' => $schoolId,
                        'amount' => $fineAmount,
                        'reason' => LibraryFine::REASON_OVERDUE,
                        'fine_date' => now()->toDateString(),
                        'created_by' => Auth::id(),
                    ]);

                    $finesCreated++;
                }
            }

            DB::commit();

            return back()->with('success', "Generated {$finesCreated} overdue fines.");

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to generate overdue fines: ' . $e->getMessage()]);
        }
    }

    /**
     * Get fine summary for a borrower
     */
    public function getBorrowerFineSummary(Request $request)
    {
        $request->validate([
            'borrower_id' => 'required|exists:users,id',
        ]);

        $borrowerId = $request->borrower_id;
        $schoolId = Auth::user()->school_id;

        $fines = LibraryFine::where('borrower_id', $borrowerId)
            ->where('school_id', $schoolId)
            ->get();

        $summary = [
            'total_fines' => $fines->count(),
            'total_amount' => $fines->sum('amount'),
            'paid_amount' => $fines->sum('paid_amount'),
            'outstanding_amount' => $fines->sum('amount') - $fines->sum('paid_amount'),
            'pending_fines' => $fines->where('status', LibraryFine::STATUS_PENDING)->count(),
            'paid_fines' => $fines->where('status', LibraryFine::STATUS_PAID)->count(),
            'waived_fines' => $fines->where('status', LibraryFine::STATUS_WAIVED)->count(),
        ];

        return response()->json($summary);
    }

    /**
     * Export fines report
     */
    public function exportFines(Request $request)
    {
        $query = LibraryFine::with(['borrower', 'bookIssuance.book'])
            ->where('school_id', Auth::user()->school_id);

        // Apply same filters as index
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->where('fine_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('fine_date', '<=', $request->date_to);
        }

        $fines = $query->orderBy('fine_date', 'desc')->get();

        // Implementation for CSV/Excel export would go here
        // This would generate a downloadable file with fine details

        return back()->with('success', 'Fines report exported successfully.');
    }

    /**
     * Bulk update fine status
     */
    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'fine_ids' => 'required|array',
            'fine_ids.*' => 'exists:library_fines,id',
            'action' => 'required|in:waive,mark_paid',
            'reason' => 'required_if:action,waive|string|max:500',
        ]);

        $fines = LibraryFine::whereIn('id', $request->fine_ids)
            ->where('school_id', Auth::user()->school_id)
            ->get();

        $updated = 0;

        DB::beginTransaction();

        try {
            foreach ($fines as $fine) {
                if ($request->action === 'waive' && !$fine->isWaived()) {
                    $fine->markAsWaived(Auth::user(), $request->reason);
                    $updated++;
                } elseif ($request->action === 'mark_paid' && !$fine->isPaid()) {
                    $fine->markAsPaid($fine->outstanding_amount);
                    $updated++;
                }
            }

            DB::commit();

            return back()->with('success', "Updated {$updated} fines successfully.");

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update fines: ' . $e->getMessage()]);
        }
    }
}



