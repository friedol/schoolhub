<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Invoice;
use App\Models\User;
use App\Models\Receipt;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with(['student', 'invoice'])
            ->where('school_id', auth()->user()->school_id);

        // Apply filters
        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('payment_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('payment_date', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('transaction_id', 'like', "%{$search}%")
                  ->orWhereHas('student', function ($studentQuery) use ($search) {
                      $studentQuery->where('name', 'like', "%{$search}%")
                                  ->orWhere('student_number', 'like', "%{$search}%");
                  });
            });
        }

        $payments = $query->orderBy('payment_date', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Statistics
        $stats = [
            'total_payments' => Payment::where('school_id', auth()->user()->school_id)->count(),
            'completed_payments' => Payment::where('school_id', auth()->user()->school_id)
                ->where('status', 'completed')->count(),
            'pending_payments' => Payment::where('school_id', auth()->user()->school_id)
                ->where('status', 'pending')->count(),
            'failed_payments' => Payment::where('school_id', auth()->user()->school_id)
                ->where('status', 'failed')->count(),
            'total_amount' => Payment::where('school_id', auth()->user()->school_id)
                ->where('status', 'completed')->sum('amount'),
            'today_amount' => Payment::where('school_id', auth()->user()->school_id)
                ->where('status', 'completed')
                ->whereDate('payment_date', today())->sum('amount'),
        ];

        return Inertia::render('Finance/Payment/Index', [
            'payments' => $payments,
            'stats' => $stats,
            'filters' => $request->only(['payment_method', 'status', 'date_from', 'date_to', 'search']),
        ]);
    }

    public function create(Request $request)
    {
        $invoice = null;
        if ($request->filled('invoice_id')) {
            $invoice = Invoice::with(['student', 'invoiceItems.feeItem'])
                ->where('school_id', auth()->user()->school_id)
                ->findOrFail($request->invoice_id);
        }

        $students = User::with('currentClass')
            ->where('school_id', auth()->user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Finance/Payment/Create', [
            'invoice' => $invoice,
            'students' => $students,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:users,id',
            'invoice_id' => 'nullable|exists:invoices,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:cash,bank,mpesa,tigopesa,airtelmoney,halopesa',
            'transaction_id' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($request) {
            $payment = Payment::create([
                'school_id' => auth()->user()->school_id,
                'student_id' => $request->student_id,
                'invoice_id' => $request->invoice_id,
                'amount' => $request->amount,
                'payment_date' => $request->payment_date,
                'payment_method' => $request->payment_method,
                'transaction_id' => $request->transaction_id,
                'status' => 'completed',
                'received_by' => Auth::id(),
                'notes' => $request->notes,
            ]);

            // Update invoice if specified
            if ($request->invoice_id) {
                $invoice = Invoice::findOrFail($request->invoice_id);
                $newAmountPaid = $invoice->paid_amount + $request->amount;
                $newBalance = $invoice->total_amount - $newAmountPaid;
                
                $invoice->update([
                    'paid_amount' => $newAmountPaid,
                    'balance_amount' => max(0, $newBalance),
                    'status' => $newBalance <= 0 ? 'paid' : ($newAmountPaid > 0 ? 'partial' : 'pending'),
                ]);
            }

            // Generate receipt
            $this->generateReceipt($payment);
        });

        return redirect()->route('finance.payments.index')
            ->with('success', 'Payment recorded successfully.');
    }

    public function show(Payment $payment)
    {
        $this->authorize('view', $payment);

        $payment->load(['student', 'invoice', 'receipt']);

        return Inertia::render('Finance/Payment/Show', [
            'payment' => $payment,
        ]);
    }

    public function edit(Payment $payment)
    {
        $this->authorize('update', $payment);

        $payment->load(['student', 'invoice']);

        $students = User::with('currentClass')
            ->where('school_id', auth()->user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Finance/Payment/Edit', [
            'payment' => $payment,
            'students' => $students,
        ]);
    }

    public function update(Request $request, Payment $payment)
    {
        $this->authorize('update', $payment);

        $request->validate([
            'student_id' => 'required|exists:users,id',
            'invoice_id' => 'nullable|exists:invoices,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:cash,bank,mpesa,tigopesa,airtelmoney,halopesa',
            'transaction_id' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($request, $payment) {
            $oldAmount = $payment->amount;
            $oldInvoiceId = $payment->invoice_id;

            $payment->update([
                'student_id' => $request->student_id,
                'invoice_id' => $request->invoice_id,
                'amount' => $request->amount,
                'payment_date' => $request->payment_date,
                'payment_method' => $request->payment_method,
                'transaction_id' => $request->transaction_id,
                'notes' => $request->notes,
            ]);

            // Update old invoice if it changed
            if ($oldInvoiceId && $oldInvoiceId != $request->invoice_id) {
                $oldInvoice = Invoice::find($oldInvoiceId);
                if ($oldInvoice) {
                    $newAmountPaid = max(0, $oldInvoice->paid_amount - $oldAmount);
                    $newBalance = $oldInvoice->total_amount - $newAmountPaid;
                    
                    $oldInvoice->update([
                        'paid_amount' => $newAmountPaid,
                        'balance_amount' => $newBalance,
                        'status' => $newAmountPaid <= 0 ? 'pending' : ($newAmountPaid >= $oldInvoice->total_amount ? 'paid' : 'partial'),
                    ]);
                }
            }

            // Update new invoice
            if ($request->invoice_id) {
                $invoice = Invoice::findOrFail($request->invoice_id);
                $newAmountPaid = $invoice->paid_amount + $request->amount;
                $newBalance = $invoice->total_amount - $newAmountPaid;
                
                $invoice->update([
                    'paid_amount' => $newAmountPaid,
                    'balance_amount' => max(0, $newBalance),
                    'status' => $newBalance <= 0 ? 'paid' : ($newAmountPaid > 0 ? 'partial' : 'pending'),
                ]);
            }

            // Update receipt
            if ($payment->receipt) {
                $payment->receipt->update([
                    'amount' => $request->amount,
                    'payment_date' => $request->payment_date,
                ]);
            }
        });

        return redirect()->route('finance.payments.index')
            ->with('success', 'Payment updated successfully.');
    }

    public function destroy(Payment $payment)
    {
        $this->authorize('delete', $payment);

        DB::transaction(function () use ($payment) {
            // Update invoice if it exists
            if ($payment->invoice_id) {
                $invoice = Invoice::find($payment->invoice_id);
                if ($invoice) {
                    $newAmountPaid = max(0, $invoice->paid_amount - $payment->amount);
                    $newBalance = $invoice->total_amount - $newAmountPaid;
                    
                    $invoice->update([
                        'paid_amount' => $newAmountPaid,
                        'balance_amount' => $newBalance,
                        'status' => $newAmountPaid <= 0 ? 'pending' : ($newAmountPaid >= $invoice->total_amount ? 'paid' : 'partial'),
                    ]);
                }
            }

            // Delete receipt if it exists
            if ($payment->receipt) {
                $payment->receipt->delete();
            }

            $payment->delete();
        });

        return redirect()->route('finance.payments.index')
            ->with('success', 'Payment deleted successfully.');
    }

    public function processMobileMoney(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:users,id',
            'invoice_id' => 'nullable|exists:invoices,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:mpesa,tigopesa,airtelmoney,halopesa',
            'phone_number' => 'required|string|max:15',
            'transaction_id' => 'nullable|string|max:255',
        ]);

        // TODO: Integrate with actual mobile money APIs
        // For now, we'll simulate the payment processing

        DB::transaction(function () use ($request) {
            $payment = Payment::create([
                'school_id' => auth()->user()->school_id,
                'student_id' => $request->student_id,
                'invoice_id' => $request->invoice_id,
                'amount' => $request->amount,
                'payment_date' => now()->toDateString(),
                'payment_method' => $request->payment_method,
                'transaction_id' => $request->transaction_id ?: 'MM-' . Str::random(10),
                'status' => 'completed',
                'received_by' => Auth::id(),
                'notes' => "Mobile money payment via {$request->payment_method} - {$request->phone_number}",
            ]);

            // Update invoice if specified
            if ($request->invoice_id) {
                $invoice = Invoice::findOrFail($request->invoice_id);
                $newAmountPaid = $invoice->paid_amount + $request->amount;
                $newBalance = $invoice->total_amount - $newAmountPaid;
                
                $invoice->update([
                    'paid_amount' => $newAmountPaid,
                    'balance_amount' => max(0, $newBalance),
                    'status' => $newBalance <= 0 ? 'paid' : ($newAmountPaid > 0 ? 'partial' : 'pending'),
                ]);
            }

            // Generate receipt
            $this->generateReceipt($payment);
        });

        return response()->json([
            'success' => true,
            'message' => 'Mobile money payment processed successfully.',
            'payment_id' => $payment->id,
        ]);
    }

    public function reconcile(Request $request)
    {
        $request->validate([
            'payment_id' => 'required|exists:payments,id',
            'reconciliation_notes' => 'nullable|string|max:1000',
        ]);

        $payment = Payment::where('school_id', auth()->user()->school_id)
            ->findOrFail($request->payment_id);

        $payment->update([
            'reconciled_at' => now(),
            'reconciled_by' => Auth::id(),
            'reconciliation_notes' => $request->reconciliation_notes,
        ]);

        return redirect()->back()
            ->with('success', 'Payment reconciled successfully.');
    }

    public function printReceipt(Payment $payment)
    {
        $this->authorize('view', $payment);

        $payment->load(['student', 'invoice', 'receipt']);

        return Inertia::render('Finance/Payment/PrintReceipt', [
            'payment' => $payment,
        ]);
    }

    public function getStudentInvoices(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:users,id',
        ]);

        $invoices = Invoice::with(['academicTerm', 'invoiceItems.feeItem'])
            ->where('school_id', auth()->user()->school_id)
            ->where('student_id', $request->student_id)
            ->where('balance_amount', '>', 0)
            ->orderBy('due_date')
            ->get();

        return response()->json([
            'invoices' => $invoices,
            'total_outstanding' => $invoices->sum('balance_amount'),
        ]);
    }

    private function generateReceipt(Payment $payment)
    {
        $receiptNumber = $this->generateReceiptNumber();

        Receipt::create([
            'school_id' => auth()->user()->school_id,
            'payment_id' => $payment->id,
            'receipt_number' => $receiptNumber,
            'student_id' => $payment->student_id,
            'amount' => $payment->amount,
            'payment_date' => $payment->payment_date,
            'balance_forward' => $payment->invoice ? $payment->invoice->balance_amount : 0,
            'generated_by' => Auth::id(),
        ]);
    }

    private function generateReceiptNumber()
    {
        $schoolId = auth()->user()->school_id;
        $year = now()->year;
        $month = now()->format('m');
        
        $prefix = "RCP-{$schoolId}-{$year}{$month}";
        
        $lastReceipt = Receipt::where('school_id', $schoolId)
            ->where('receipt_number', 'like', "{$prefix}%")
            ->orderBy('receipt_number', 'desc')
            ->first();

        if ($lastReceipt) {
            $lastNumber = (int) substr($lastReceipt->receipt_number, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }
}
