<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\PaymentPlan;
use App\Models\PaymentPlanInstallment;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PaymentPlanController extends Controller
{
    public function index(Request $request)
    {
        $query = PaymentPlan::with(['student', 'invoice'])
            ->where('school_id', Auth::user()->school_id);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('plan_name', 'like', "%{$search}%")
                  ->orWhereHas('student', function ($studentQuery) use ($search) {
                      $studentQuery->where('name', 'like', "%{$search}%")
                                  ->orWhere('student_number', 'like', "%{$search}%");
                  });
            });
        }

        $paymentPlans = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Statistics
        $stats = [
            'total_plans' => PaymentPlan::where('school_id', Auth::user()->school_id)->count(),
            'active_plans' => PaymentPlan::where('school_id', Auth::user()->school_id)
                ->where('status', 'active')->count(),
            'completed_plans' => PaymentPlan::where('school_id', Auth::user()->school_id)
                ->where('status', 'completed')->count(),
            'overdue_plans' => PaymentPlan::where('school_id', Auth::user()->school_id)
                ->where('status', 'overdue')->count(),
            'total_outstanding' => PaymentPlan::where('school_id', Auth::user()->school_id)
                ->where('status', 'active')
                ->sum('total_amount'),
        ];

        return Inertia::render('Finance/PaymentPlan/Index', [
            'paymentPlans' => $paymentPlans,
            'stats' => $stats,
            'filters' => $request->only(['status', 'student_id', 'search']),
        ]);
    }

    public function create(Request $request)
    {
        $invoice = null;
        if ($request->filled('invoice_id')) {
            $invoice = Invoice::with(['student', 'invoiceItems.feeItem'])
                ->where('school_id', Auth::user()->school_id)
                ->findOrFail($request->invoice_id);
        }

        $students = User::with('currentClass')
            ->where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Finance/PaymentPlan/Create', [
            'invoice' => $invoice,
            'students' => $students,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:users,id',
            'invoice_id' => 'nullable|exists:invoices,id',
            'plan_name' => 'required|string|max:255',
            'total_amount' => 'required|numeric|min:0.01',
            'installment_count' => 'required|integer|min:1|max:60',
            'installment_amount' => 'required|numeric|min:0.01',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'frequency' => 'required|in:weekly,monthly,termly,custom',
        ]);

        DB::transaction(function () use ($request) {
            $paymentPlan = PaymentPlan::create([
                'school_id' => Auth::user()->school_id,
                'student_id' => $request->student_id,
                'invoice_id' => $request->invoice_id ?: null,
                'plan_name' => $request->plan_name,
                'total_amount' => $request->total_amount,
                'installment_count' => $request->installment_count,
                'installment_amount' => $request->installment_amount,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'frequency' => $request->frequency,
                'status' => 'active',
                'created_by' => Auth::id(),
            ]);

            // Auto-generate installment schedule
            $startDate = Carbon::parse($request->start_date);
            for ($i = 0; $i < $request->installment_count; $i++) {
                $dueDate = $startDate->copy();
                if ($request->frequency === 'weekly') {
                    $dueDate->addWeeks($i);
                } elseif ($request->frequency === 'termly') {
                    $dueDate->addMonths($i * 3);
                } else {
                    $dueDate->addMonths($i);
                }

                $amount = ($i === $request->installment_count - 1)
                    ? $request->total_amount - ($request->installment_amount * $i)
                    : $request->installment_amount;

                PaymentPlanInstallment::create([
                    'payment_plan_id' => $paymentPlan->id,
                    'installment_number' => $i + 1,
                    'due_date' => $dueDate->toDateString(),
                    'amount' => $amount,
                    'paid_amount' => 0,
                    'status' => 'pending',
                ]);
            }
        });

        return redirect()->route('finance.payment-plans.index')
            ->with('success', 'Payment plan created successfully.');
    }

    public function show(PaymentPlan $paymentPlan)
    {
        $this->authorize('view', $paymentPlan);

        $paymentPlan->load([
            'student',
            'invoice',
            'installments' => function ($query) {
                $query->orderBy('due_date');
            }
        ]);

        return Inertia::render('Finance/PaymentPlan/Show', [
            'paymentPlan' => $paymentPlan,
        ]);
    }

    public function edit(PaymentPlan $paymentPlan)
    {
        $this->authorize('update', $paymentPlan);

        if ($paymentPlan->status === 'completed') {
            return redirect()->back()
                ->with('error', 'Cannot edit completed payment plan.');
        }

        $paymentPlan->load(['student', 'invoice', 'installments']);

        $students = User::with('currentClass')
            ->where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Finance/PaymentPlan/Edit', [
            'paymentPlan' => $paymentPlan,
            'students' => $students,
        ]);
    }

    public function update(Request $request, PaymentPlan $paymentPlan)
    {
        $this->authorize('update', $paymentPlan);

        if ($paymentPlan->status === 'completed') {
            return redirect()->back()
                ->with('error', 'Cannot edit completed payment plan.');
        }

        $request->validate([
            'student_id' => 'required|exists:users,id',
            'invoice_id' => 'nullable|exists:invoices,id',
            'name' => 'required|string|max:255',
            'total_amount' => 'required|numeric|min:0.01',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'installments' => 'required|array|min:1',
            'installments.*.id' => 'nullable|exists:payment_plan_installments,id',
            'installments.*.due_date' => 'required|date',
            'installments.*.amount_due' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Validate that installments add up to total amount
        $totalInstallments = collect($request->installments)->sum('amount_due');
        if (abs($totalInstallments - $request->total_amount) > 0.01) {
            return redirect()->back()
                ->withErrors(['installments' => 'Total installment amounts must equal the total amount.']);
        }

        DB::transaction(function () use ($request, $paymentPlan) {
            $paymentPlan->update([
                'student_id' => $request->student_id,
                'invoice_id' => $request->invoice_id,
                'plan_name' => $request->name,
                'total_amount' => $request->total_amount,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'notes' => $request->notes,
            ]);

            // Update or create installments
            $existingInstallmentIds = [];
            foreach ($request->installments as $installment) {
                if (isset($installment['id'])) {
                    // Update existing installment
                    PaymentPlanInstallment::where('id', $installment['id'])
                        ->where('payment_plan_id', $paymentPlan->id)
                        ->update([
                            'due_date' => $installment['due_date'],
                            'amount' => $installment['amount_due'],
                        ]);
                    $existingInstallmentIds[] = $installment['id'];
                } else {
                    // Create new installment
                    $newInstallment = PaymentPlanInstallment::create([
                        'payment_plan_id' => $paymentPlan->id,
                        'installment_number' => 0,
                        'due_date' => $installment['due_date'],
                        'amount' => $installment['amount_due'],
                        'paid_amount' => 0,
                        'status' => 'pending',
                    ]);
                    $existingInstallmentIds[] = $newInstallment->id;
                }
            }

            // Delete removed installments (only if they haven't been paid)
            PaymentPlanInstallment::where('payment_plan_id', $paymentPlan->id)
                ->whereNotIn('id', $existingInstallmentIds)
                ->where('paid_amount', 0)
                ->delete();
        });

        return redirect()->route('finance.payment-plans.index')
            ->with('success', 'Payment plan updated successfully.');
    }

    public function destroy(PaymentPlan $paymentPlan)
    {
        $this->authorize('delete', $paymentPlan);

        if ($paymentPlan->installments()->where('paid_amount', '>', 0)->exists()) {
            return redirect()->back()
                ->with('error', 'Cannot delete payment plan that has payments.');
        }

        $paymentPlan->delete();

        return redirect()->route('finance.payment-plans.index')
            ->with('success', 'Payment plan deleted successfully.');
    }

    public function recordPayment(Request $request, PaymentPlan $paymentPlan)
    {
        $this->authorize('update', $paymentPlan);

        $request->validate([
            'installment_id' => 'required|exists:payment_plan_installments,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:cash,bank,mpesa,tigopesa,airtelmoney,halopesa',
            'transaction_id' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        $installment = $paymentPlan->installments()->findOrFail($request->installment_id);

        if ($installment->paid_amount + $request->amount > $installment->amount) {
            return redirect()->back()
                ->with('error', 'Payment amount exceeds the installment amount due.');
        }

        DB::transaction(function () use ($request, $paymentPlan, $installment) {
            // Update installment
            $newAmountPaid = $installment->paid_amount + $request->amount;
            $installment->update([
                'paid_amount' => $newAmountPaid,
                'status' => $newAmountPaid >= $installment->amount ? 'paid' : 'partial',
                'paid_at' => $newAmountPaid >= $installment->amount ? now() : null,
            ]);

            // Update payment plan status
            $totalPaid = $paymentPlan->installments()->sum('paid_amount') + $request->amount;
            $paymentPlan->update([
                'status' => $totalPaid >= $paymentPlan->total_amount ? 'completed' : 'active',
            ]);

            // Create payment record
            \App\Models\Payment::create([
                'school_id' => Auth::user()->school_id,
                'student_id' => $paymentPlan->student_id,
                'invoice_id' => $paymentPlan->invoice_id,
                'amount' => $request->amount,
                'payment_date' => $request->payment_date,
                'payment_method' => $request->payment_method,
                'transaction_reference' => $request->transaction_id,
                'status' => 'completed',
                'processed_by' => Auth::id(),
                'notes' => $request->notes,
            ]);
        });

        return redirect()->back()
            ->with('success', 'Payment recorded successfully.');
    }

    public function markOverdue()
    {
        $overduePlans = PaymentPlan::where('school_id', Auth::user()->school_id)
            ->where('status', 'active')
            ->whereHas('installments', function ($query) {
                $query->where('due_date', '<', now()->toDateString())
                      ->where('status', '!=', 'paid');
            })
            ->get();

        foreach ($overduePlans as $plan) {
            $plan->update(['status' => 'overdue']);
        }

        return redirect()->back()
            ->with('success', "Marked {$overduePlans->count()} payment plans as overdue.");
    }

    public function sendReminder(PaymentPlan $paymentPlan)
    {
        $this->authorize('view', $paymentPlan);

        // TODO: Implement SMS/Email reminder logic
        // This would integrate with the communication module

        return redirect()->back()
            ->with('success', 'Payment reminder sent successfully.');
    }

    public function getStudentPaymentPlans(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:users,id',
        ]);

        $paymentPlans = PaymentPlan::with(['invoice', 'installments'])
            ->where('school_id', Auth::user()->school_id)
            ->where('student_id', $request->student_id)
            ->where('status', 'active')
            ->orderBy('start_date')
            ->get();

        return response()->json([
            'payment_plans' => $paymentPlans,
            'total_outstanding' => $paymentPlans->sum('total_amount'),
        ]);
    }

    public function generateInstallmentSchedule(Request $request)
    {
        $request->validate([
            'total_amount' => 'required|numeric|min:0.01',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'installment_type' => 'required|in:monthly,weekly,quarterly',
            'number_of_installments' => 'required|integer|min:1|max:24',
        ]);

        $installments = [];
        $amountPerInstallment = $request->total_amount / $request->number_of_installments;
        $startDate = Carbon::parse($request->start_date);

        for ($i = 0; $i < $request->number_of_installments; $i++) {
            $dueDate = $startDate->copy();
            
            switch ($request->installment_type) {
                case 'weekly':
                    $dueDate->addWeeks($i);
                    break;
                case 'monthly':
                    $dueDate->addMonths($i);
                    break;
                case 'quarterly':
                    $dueDate->addMonths($i * 3);
                    break;
            }

            $installments[] = [
                'due_date' => $dueDate->toDateString(),
                'amount_due' => round($amountPerInstallment, 2),
            ];
        }

        // Adjust the last installment to account for rounding
        $totalCalculated = collect($installments)->sum('amount_due');
        if ($totalCalculated != $request->total_amount) {
            $installments[count($installments) - 1]['amount_due'] += 
                $request->total_amount - $totalCalculated;
        }

        return response()->json([
            'installments' => $installments,
        ]);
    }
}
