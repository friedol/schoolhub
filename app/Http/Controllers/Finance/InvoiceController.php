<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\User;
use App\Models\FeeStructure;
use App\Models\AcademicTerm;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Invoice::with(['student', 'invoiceItems.feeItem'])
            ->where('school_id', auth()->user()->school_id);

        // Apply filters
        if ($request->filled('academic_term_id')) {
            $term = \App\Models\AcademicTerm::find($request->academic_term_id);
            if ($term) {
                $query->where('academic_year', $term->academic_year)
                      ->where('term', $term->term);
            }
        }

        if ($request->filled('school_class_id')) {
            $query->whereHas('student.studentProfile', function ($q) use ($request) {
                $q->where('class_id', $request->school_class_id);
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhereHas('student', function ($studentQuery) use ($search) {
                      $studentQuery->where('name', 'like', "%{$search}%")
                                  ->orWhere('student_number', 'like', "%{$search}%");
                  });
            });
        }

        $invoices = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $academicTerms = AcademicTerm::where('school_id', auth()->user()->school_id)
            ->where('is_active', true)
            ->orderBy('start_date', 'desc')
            ->get();

        $schoolClasses = SchoolClass::where('school_id', auth()->user()->school_id)
            ->orderBy('name')
            ->get();

        // Statistics
        $stats = [
            'total_invoices' => Invoice::where('school_id', auth()->user()->school_id)->count(),
            'pending_invoices' => Invoice::where('school_id', auth()->user()->school_id)
                ->where('status', 'pending')->count(),
            'paid_invoices' => Invoice::where('school_id', auth()->user()->school_id)
                ->where('status', 'paid')->count(),
            'overdue_invoices' => Invoice::where('school_id', auth()->user()->school_id)
                ->where('status', 'overdue')->count(),
            'total_amount' => Invoice::where('school_id', auth()->user()->school_id)->sum('total_amount'),
            'paid_amount' => Invoice::where('school_id', auth()->user()->school_id)->sum('paid_amount'),
            'outstanding_amount' => Invoice::where('school_id', auth()->user()->school_id)->sum('balance_amount'),
        ];

        return Inertia::render('Finance/Invoice/Index', [
            'invoices' => $invoices,
            'academicTerms' => $academicTerms,
            'schoolClasses' => $schoolClasses,
            'stats' => $stats,
            'filters' => $request->only(['academic_term_id', 'school_class_id', 'status', 'search']),
        ]);
    }

    public function create()
    {
        $academicTerms = AcademicTerm::where('school_id', auth()->user()->school_id)
            ->where('is_active', true)
            ->orderBy('start_date', 'desc')
            ->get();

        $schoolClasses = SchoolClass::where('school_id', auth()->user()->school_id)
            ->orderBy('name')
            ->get();

        $students = User::where('role', 'student')
            ->with('currentClass')
            ->where('school_id', auth()->user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Finance/Invoice/Create', [
            'academicTerms' => $academicTerms,
            'schoolClasses' => $schoolClasses,
            'students' => $students,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:users,id',
            'academic_term_id' => 'required|exists:academic_terms,id',
            'issue_date' => 'required|date',
            'due_date' => 'required|date|after:issue_date',
            'invoice_items' => 'required|array|min:1',
            'invoice_items.*.fee_item_id' => 'required|exists:fee_items,id',
            'invoice_items.*.description' => 'required|string|max:255',
            'invoice_items.*.amount' => 'required|numeric|min:0',
            'invoice_items.*.quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:1000',
        ]);

        $academicTerm = AcademicTerm::findOrFail($request->academic_term_id);

        DB::transaction(function () use ($request, $academicTerm) {
            // Generate invoice number
            $invoiceNumber = $this->generateInvoiceNumber();

            // Calculate totals
            $totalAmount = 0;
            foreach ($request->invoice_items as $item) {
                $totalAmount += $item['amount'] * $item['quantity'];
            }

            $invoice = Invoice::create([
                'school_id' => auth()->user()->school_id,
                'student_id' => $request->student_id,
                'invoice_number' => $invoiceNumber,
                'academic_year' => $academicTerm->academic_year,
                'term' => $academicTerm->term,
                'issue_date' => $request->issue_date,
                'due_date' => $request->due_date,
                'total_amount' => $totalAmount,
                'paid_amount' => 0,
                'balance_amount' => $totalAmount,
                'status' => 'draft',
                'notes' => $request->notes,
                'created_by' => auth()->id(),
            ]);

            // Create invoice items
            foreach ($request->invoice_items as $item) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'fee_item_id' => $item['fee_item_id'],
                    'description' => $item['description'],
                    'amount' => $item['amount'],
                    'quantity' => $item['quantity'],
                    'total' => $item['amount'] * $item['quantity'],
                ]);
            }
        });

        return redirect()->route('finance.invoices.index')
            ->with('success', 'Invoice created successfully.');
    }

    public function show(Invoice $invoice)
    {
        $this->authorize('view', $invoice);

        $invoice->load([
            'student',
            'invoiceItems.feeItem',
            'payments' => function ($query) {
                $query->orderBy('payment_date', 'desc');
            }
        ]);

        return Inertia::render('Finance/Invoice/Show', [
            'invoice' => $invoice,
        ]);
    }

    public function edit(Invoice $invoice)
    {
        $this->authorize('update', $invoice);

        $invoice->load(['student', 'invoiceItems.feeItem']);

        $academicTerms = AcademicTerm::where('school_id', auth()->user()->school_id)
            ->where('is_active', true)
            ->orderBy('start_date', 'desc')
            ->get();

        $students = User::where('role', 'student')
            ->with('currentClass')
            ->where('school_id', auth()->user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Finance/Invoice/Edit', [
            'invoice' => $invoice,
            'academicTerms' => $academicTerms,
            'students' => $students,
        ]);
    }

    public function update(Request $request, Invoice $invoice)
    {
        $this->authorize('update', $invoice);

        // Only allow editing if no payments have been made
        if ($invoice->paid_amount > 0) {
            return redirect()->back()
                ->with('error', 'Cannot edit invoice that has payments.');
        }

        $request->validate([
            'student_id' => 'required|exists:users,id',
            'academic_term_id' => 'required|exists:academic_terms,id',
            'issue_date' => 'required|date',
            'due_date' => 'required|date|after:issue_date',
            'invoice_items' => 'required|array|min:1',
            'invoice_items.*.fee_item_id' => 'required|exists:fee_items,id',
            'invoice_items.*.description' => 'required|string|max:255',
            'invoice_items.*.amount' => 'required|numeric|min:0',
            'invoice_items.*.quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($request, $invoice) {
            // Calculate new totals
            $totalAmount = 0;
            foreach ($request->invoice_items as $item) {
                $totalAmount += $item['amount'] * $item['quantity'];
            }

            $academicTerm = AcademicTerm::findOrFail($request->academic_term_id);

            $invoice->update([
                'student_id' => $request->student_id,
                'academic_year' => $academicTerm->academic_year,
                'term' => $academicTerm->term,
                'issue_date' => $request->issue_date,
                'due_date' => $request->due_date,
                'total_amount' => $totalAmount,
                'balance_amount' => $totalAmount,
                'notes' => $request->notes,
            ]);

            // Delete existing invoice items
            $invoice->invoiceItems()->delete();

            // Create new invoice items
            foreach ($request->invoice_items as $item) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'fee_item_id' => $item['fee_item_id'],
                    'description' => $item['description'],
                    'amount' => $item['amount'],
                    'quantity' => $item['quantity'],
                    'total' => $item['amount'] * $item['quantity'],
                ]);
            }
        });

        return redirect()->route('finance.invoices.index')
            ->with('success', 'Invoice updated successfully.');
    }

    public function destroy(Invoice $invoice)
    {
        $this->authorize('delete', $invoice);

        // Only allow deletion if no payments have been made
        if ($invoice->paid_amount > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete invoice that has payments.');
        }

        $invoice->delete();

        return redirect()->route('finance.invoices.index')
            ->with('success', 'Invoice deleted successfully.');
    }

    public function bulkGenerate(Request $request)
    {
        $request->validate([
            'academic_term_id' => 'required|exists:academic_terms,id',
            'school_class_id' => 'required|exists:school_classes,id',
            'fee_structure_id' => 'required|exists:fee_structures,id',
            'due_date' => 'required|date|after:today',
        ]);

        $feeStructure = FeeStructure::with('feeItems')
            ->where('school_id', auth()->user()->school_id)
            ->findOrFail($request->fee_structure_id);

        $students = User::where('role', 'student')
            ->where('school_id', auth()->user()->school_id)
            ->whereHas('studentProfile', function ($q) use ($request) {
                $q->where('class_id', $request->school_class_id);
            })
            ->where('is_active', true)
            ->get();

        $bulkTerm = AcademicTerm::findOrFail($request->academic_term_id);
        $generatedCount = 0;

        DB::transaction(function () use ($request, $feeStructure, $students, $bulkTerm, &$generatedCount) {
            foreach ($students as $student) {
                // Check if invoice already exists for this student and term
                $existingInvoice = Invoice::where('school_id', auth()->user()->school_id)
                    ->where('student_id', $student->id)
                    ->where('academic_year', $bulkTerm->academic_year)
                    ->where('term', $bulkTerm->term)
                    ->first();

                if ($existingInvoice) {
                    continue; // Skip if invoice already exists
                }

                // Generate invoice number
                $invoiceNumber = $this->generateInvoiceNumber();

                // Calculate total amount
                $totalAmount = $feeStructure->feeItem ? $feeStructure->amount : 0;

                $invoice = Invoice::create([
                    'school_id' => auth()->user()->school_id,
                    'student_id' => $student->id,
                    'invoice_number' => $invoiceNumber,
                    'academic_year' => $bulkTerm->academic_year,
                    'term' => $bulkTerm->term,
                    'issue_date' => now()->toDateString(),
                    'due_date' => $request->due_date,
                    'total_amount' => $totalAmount,
                    'paid_amount' => 0,
                    'balance_amount' => $totalAmount,
                    'status' => 'draft',
                    'created_by' => auth()->id(),
                ]);

                // Create invoice items
                foreach ($feeStructure->feeItems as $feeItem) {
                    InvoiceItem::create([
                        'invoice_id' => $invoice->id,
                        'fee_item_id' => $feeItem->id,
                        'description' => $feeItem->name,
                        'amount' => $feeItem->pivot->amount,
                        'quantity' => 1,
                        'total' => $feeItem->pivot->amount,
                    ]);
                }

                $generatedCount++;
            }
        });

        return redirect()->route('finance.invoices.index')
            ->with('success', "Successfully generated {$generatedCount} invoices.");
    }

    public function sendReminder(Invoice $invoice)
    {
        $this->authorize('view', $invoice);

        // TODO: Implement SMS/Email reminder logic
        // This would integrate with the communication module

        return redirect()->back()
            ->with('success', 'Payment reminder sent successfully.');
    }

    public function markAsOverdue()
    {
        $overdueInvoices = Invoice::where('school_id', auth()->user()->school_id)
            ->where('status', 'pending')
            ->where('due_date', '<', now()->toDateString())
            ->get();

        foreach ($overdueInvoices as $invoice) {
            $invoice->update(['status' => 'overdue']);
        }

        return redirect()->back()
            ->with('success', "Marked {$overdueInvoices->count()} invoices as overdue.");
    }

    public function print(Invoice $invoice)
    {
        $this->authorize('view', $invoice);

        $invoice->load([
            'student',
            'invoiceItems.feeItem',
            'payments'
        ]);

        return Inertia::render('Finance/Invoice/Print', [
            'invoice' => $invoice,
        ]);
    }

    private function generateInvoiceNumber()
    {
        $schoolId = auth()->user()->school_id;
        $year = now()->year;
        $month = now()->format('m');
        
        $prefix = "INV-{$schoolId}-{$year}{$month}";
        
        $lastInvoice = Invoice::where('school_id', $schoolId)
            ->where('invoice_number', 'like', "{$prefix}%")
            ->orderBy('invoice_number', 'desc')
            ->first();

        if ($lastInvoice) {
            $lastNumber = (int) substr($lastInvoice->invoice_number, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }
}
