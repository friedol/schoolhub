<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\FinancialTransaction;
use App\Models\Budget;

use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FinancialReportsController extends Controller
{
    public function dashboard()
    {
        $schoolId = Auth::user()->school_id;

        // Statistics
        $totalRevenue = Payment::where('school_id', $schoolId)->where('status', 'completed')->sum('amount');
        $totalExpenses = FinancialTransaction::where('school_id', $schoolId)->where('transaction_type', 'expense')->sum('amount');
        $netIncome = $totalRevenue - $totalExpenses;
        
        $totalInvoiced = Invoice::where('school_id', $schoolId)->sum('total_amount');
        $outstandingFees = Invoice::where('school_id', $schoolId)->sum('balance_amount');
        $feeCollectionRate = $totalInvoiced > 0 ? (($totalInvoiced - $outstandingFees) / $totalInvoiced) * 100 : 0;
        
        $totalStudents = User::where('school_id', $schoolId)->where('role', 'student')->count();
        $totalInvoices = Invoice::where('school_id', $schoolId)->count();
        $paidInvoices = Invoice::where('school_id', $schoolId)->where('balance_amount', '<=', 0)->count();
        $overdueInvoices = Invoice::where('school_id', $schoolId)->where('balance_amount', '>', 0)->where('due_date', '<', now()->toDateString())->count();
        $pendingPayments = Payment::where('school_id', $schoolId)->where('status', 'pending')->count();
        $reconciledPayments = Payment::where('school_id', $schoolId)->where('status', 'completed')->count();
        $activeBudgets = Budget::where('school_id', $schoolId)->where('status', 'approved')->count();
        
        $stats = [
            'total_revenue' => (float)$totalRevenue,
            'total_expenses' => (float)$totalExpenses,
            'net_income' => (float)$netIncome,
            'fee_collection_rate' => (float)$feeCollectionRate,
            'outstanding_fees' => (float)$outstandingFees,
            'total_students' => $totalStudents,
            'total_invoices' => $totalInvoices,
            'paid_invoices' => $paidInvoices,
            'overdue_invoices' => $overdueInvoices,
            'pending_payments' => $pendingPayments,
            'reconciled_payments' => $reconciledPayments,
            'active_budgets' => $activeBudgets,
            'budget_variance' => 0.0,
        ];

        // Recent Transactions
        $recentTransactions = Payment::with('student')
            ->where('school_id', $schoolId)
            ->orderBy('payment_date', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'type' => 'income',
                    'amount' => (float)$payment->amount,
                    'description' => "Fee payment from " . ($payment->student->name ?? 'Student'),
                    'date' => $payment->payment_date,
                    'status' => $payment->status,
                ];
            })
            ->toArray();

        // Top Fee Items (fallback if table doesn't exist or is empty)
        $topFeeItems = [];
        try {
            $topFeeItems = DB::table('fee_structures')
                ->where('school_id', $schoolId)
                ->limit(5)
                ->get()
                ->map(function ($fee) {
                    return [
                        'name' => $fee->name,
                        'category' => $fee->category ?? 'tuition',
                        'total_amount' => (float)$fee->amount,
                        'collection_rate' => 100.0,
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            // Table might not exist or be empty
        }

        // Payment Methods breakdown
        $paymentMethodsQuery = Payment::where('school_id', $schoolId)
            ->where('status', 'completed')
            ->select('payment_method', DB::raw('count(*) as count'), DB::raw('sum(amount) as amount'))
            ->groupBy('payment_method')
            ->get();

        $totalMethodsAmount = $paymentMethodsQuery->sum('amount');

        $paymentMethods = $paymentMethodsQuery->map(function ($method) use ($totalMethodsAmount) {
            return [
                'method' => $method->payment_method,
                'count' => $method->count,
                'amount' => (float)$method->amount,
                'percentage' => $totalMethodsAmount > 0 ? ($method->amount / $totalMethodsAmount) * 100 : 0.0,
            ];
        })->toArray();

        return Inertia::render('Finance/Dashboard', [
            'stats' => $stats,
            'recentTransactions' => $recentTransactions,
            'topFeeItems' => $topFeeItems,
            'paymentMethods' => $paymentMethods,
        ]);
    }

    public function index()
    {
        $currentYear = now()->year;
        $currentMonth = now()->month;

        // Get available academic years
        $academicYears = Invoice::where('school_id', Auth::user()->school_id)
            ->distinct()
            ->pluck('academic_term_id')
            ->map(function ($termId) {
                return \App\Models\AcademicTerm::find($termId);
            })
            ->filter()
            ->pluck('academic_year')
            ->unique()
            ->sort()
            ->values();

        return Inertia::render('Finance/Reports/Index', [
            'academicYears' => $academicYears,
            'currentYear' => $currentYear,
            'currentMonth' => $currentMonth,
        ]);
    }

    public function feeCollectionReport(Request $request)
    {
        $request->validate([
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
            'class_id' => 'nullable|exists:school_classes,id',
            'payment_method' => 'nullable|in:cash,bank,mpesa,tigopesa,airtelmoney,halopesa',
        ]);

        $query = Payment::with(['student', 'invoice'])
            ->where('school_id', Auth::user()->school_id)
            ->where('status', 'completed')
            ->whereBetween('payment_date', [$request->date_from, $request->date_to]);

        if ($request->filled('class_id')) {
            $query->whereHas('student.studentProfile', function ($q) use ($request) {
                $q->where('class_id', $request->class_id);
            });
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        $payments = $query->get();

        // Group by date
        $dailyPayments = $payments->groupBy(function ($payment) {
            return Carbon::parse($payment->payment_date)->format('Y-m-d');
        })->map(function ($dayPayments) {
            return [
                'date' => $dayPayments->first()->payment_date,
                'count' => $dayPayments->count(),
                'amount' => $dayPayments->sum('amount'),
                'payments' => $dayPayments,
            ];
        })->sortBy('date');

        // Group by payment method
        $paymentMethodBreakdown = $payments->groupBy('payment_method')->map(function ($methodPayments) {
            return [
                'method' => $methodPayments->first()->payment_method,
                'count' => $methodPayments->count(),
                'amount' => $methodPayments->sum('amount'),
            ];
        });

        // Group by class
        $classBreakdown = $payments->groupBy('student.current_class.name')->map(function ($classPayments) {
            return [
                'class' => $classPayments->first()->student->current_class->name ?? 'Unknown',
                'count' => $classPayments->count(),
                'amount' => $classPayments->sum('amount'),
            ];
        });

        $stats = [
            'total_payments' => $payments->count(),
            'total_amount' => $payments->sum('amount'),
            'average_payment' => $payments->count() > 0 ? $payments->sum('amount') / $payments->count() : 0,
            'date_range' => [
                'from' => $request->date_from,
                'to' => $request->date_to,
            ],
        ];

        return Inertia::render('Finance/Reports/FeeCollection', [
            'dailyPayments' => $dailyPayments->values(),
            'paymentMethodBreakdown' => $paymentMethodBreakdown->values(),
            'classBreakdown' => $classBreakdown->values(),
            'stats' => $stats,
            'filters' => $request->only(['date_from', 'date_to', 'class_id', 'payment_method']),
        ]);
    }

    public function arrearsReport(Request $request)
    {
        $request->validate([
            'class_id' => 'nullable|exists:school_classes,id',
            'overdue_only' => 'boolean',
        ]);

        $query = Invoice::with(['student.currentClass', 'academicTerm'])
            ->where('school_id', Auth::user()->school_id)
            ->where('balance_amount', '>', 0);

        if ($request->filled('class_id')) {
            $query->whereHas('student.studentProfile', function ($q) use ($request) {
                $q->where('class_id', $request->class_id);
            });
        }

        if ($request->overdue_only) {
            $query->where('due_date', '<', now()->toDateString());
        }

        $invoices = $query->orderBy('due_date')->get();

        // Group by class
        $classArrears = $invoices->groupBy('student.current_class.name')->map(function ($classInvoices) {
            return [
                'class' => $classInvoices->first()->student->current_class->name ?? 'Unknown',
                'count' => $classInvoices->count(),
                'total_amount' => $classInvoices->sum('balance_amount'),
                'invoices' => $classInvoices,
            ];
        });

        // Group by overdue status
        $overdueInvoices = $invoices->filter(function ($invoice) {
            return Carbon::parse($invoice->due_date)->isPast();
        });

        $stats = [
            'total_outstanding' => $invoices->sum('balance_amount'),
            'total_invoices' => $invoices->count(),
            'overdue_amount' => $overdueInvoices->sum('balance_amount'),
            'overdue_count' => $overdueInvoices->count(),
            'current_amount' => $invoices->filter(function ($invoice) {
                return Carbon::parse($invoice->due_date)->isFuture();
            })->sum('balance_amount'),
        ];

        return Inertia::render('Finance/Reports/Arrears', [
            'invoices' => $invoices,
            'classArrears' => $classArrears->values(),
            'overdueInvoices' => $overdueInvoices->values(),
            'stats' => $stats,
            'filters' => $request->only(['class_id', 'overdue_only']),
        ]);
    }

    public function incomeStatement(Request $request)
    {
        $request->validate([
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
        ]);

        // Get income from payments
        $income = Payment::where('school_id', Auth::user()->school_id)
            ->where('status', 'completed')
            ->whereBetween('payment_date', [$request->date_from, $request->date_to])
            ->sum('amount');

        // Get other income from financial transactions
        $otherIncome = FinancialTransaction::where('school_id', Auth::user()->school_id)
            ->where('transaction_type', 'income')
            ->whereBetween('transaction_date', [$request->date_from, $request->date_to])
            ->sum('amount');

        // Get expenses from financial transactions
        $expenses = FinancialTransaction::where('school_id', Auth::user()->school_id)
            ->where('transaction_type', 'expense')
            ->whereBetween('transaction_date', [$request->date_from, $request->date_to])
            ->get();

        // Group expenses by category
        $expenseBreakdown = $expenses->groupBy('category')->map(function ($categoryExpenses) {
            return [
                'category' => $categoryExpenses->first()->category,
                'amount' => $categoryExpenses->sum('amount'),
                'count' => $categoryExpenses->count(),
            ];
        });

        $totalExpenses = $expenses->sum('amount');
        $netIncome = ($income + $otherIncome) - $totalExpenses;

        $statement = [
            'period' => [
                'from' => $request->date_from,
                'to' => $request->date_to,
            ],
            'income' => [
                'fee_collection' => $income,
                'other_income' => $otherIncome,
                'total_income' => $income + $otherIncome,
            ],
            'expenses' => [
                'breakdown' => $expenseBreakdown->values(),
                'total_expenses' => $totalExpenses,
            ],
            'net_income' => $netIncome,
        ];

        return Inertia::render('Finance/Reports/IncomeStatement', [
            'statement' => $statement,
            'filters' => $request->only(['date_from', 'date_to']),
        ]);
    }

    public function balanceSheet(Request $request)
    {
        $request->validate([
            'as_of_date' => 'required|date',
        ]);

        $asOfDate = $request->as_of_date;

        // Assets
        $assets = [
            'current_assets' => [
                'cash_at_bank' => FinancialTransaction::where('school_id', Auth::user()->school_id)
                    ->where('transaction_type', 'income')
                    ->where('category', 'bank_deposit')
                    ->where('transaction_date', '<=', $asOfDate)
                    ->sum('amount'),
                'accounts_receivable' => Invoice::where('school_id', Auth::user()->school_id)
                    ->where('balance_amount', '>', 0)
                    ->where('due_date', '<=', $asOfDate)
                    ->sum('balance_amount'),
                'prepaid_expenses' => FinancialTransaction::where('school_id', Auth::user()->school_id)
                    ->where('transaction_type', 'expense')
                    ->where('category', 'prepaid')
                    ->where('transaction_date', '<=', $asOfDate)
                    ->sum('amount'),
            ],
            'fixed_assets' => [
                'equipment' => FinancialTransaction::where('school_id', Auth::user()->school_id)
                    ->where('transaction_type', 'expense')
                    ->where('category', 'equipment')
                    ->where('transaction_date', '<=', $asOfDate)
                    ->sum('amount'),
                'furniture' => FinancialTransaction::where('school_id', Auth::user()->school_id)
                    ->where('transaction_type', 'expense')
                    ->where('category', 'furniture')
                    ->where('transaction_date', '<=', $asOfDate)
                    ->sum('amount'),
                'buildings' => FinancialTransaction::where('school_id', Auth::user()->school_id)
                    ->where('transaction_type', 'expense')
                    ->where('category', 'buildings')
                    ->where('transaction_date', '<=', $asOfDate)
                    ->sum('amount'),
            ],
        ];

        // Liabilities
        $liabilities = [
            'current_liabilities' => [
                'accounts_payable' => FinancialTransaction::where('school_id', Auth::user()->school_id)
                    ->where('transaction_type', 'expense')
                    ->where('category', 'payable')
                    ->where('transaction_date', '<=', $asOfDate)
                    ->sum('amount'),
                'accrued_expenses' => FinancialTransaction::where('school_id', Auth::user()->school_id)
                    ->where('transaction_type', 'expense')
                    ->where('category', 'accrued')
                    ->where('transaction_date', '<=', $asOfDate)
                    ->sum('amount'),
            ],
            'long_term_liabilities' => [
                'loans' => FinancialTransaction::where('school_id', Auth::user()->school_id)
                    ->where('transaction_type', 'expense')
                    ->where('category', 'loan')
                    ->where('transaction_date', '<=', $asOfDate)
                    ->sum('amount'),
            ],
        ];

        // Calculate totals
        $totalCurrentAssets = array_sum($assets['current_assets']);
        $totalFixedAssets = array_sum($assets['fixed_assets']);
        $totalAssets = $totalCurrentAssets + $totalFixedAssets;

        $totalCurrentLiabilities = array_sum($liabilities['current_liabilities']);
        $totalLongTermLiabilities = array_sum($liabilities['long_term_liabilities']);
        $totalLiabilities = $totalCurrentLiabilities + $totalLongTermLiabilities;

        $equity = $totalAssets - $totalLiabilities;

        $balanceSheet = [
            'as_of_date' => $asOfDate,
            'assets' => [
                'current_assets' => $assets['current_assets'],
                'fixed_assets' => $assets['fixed_assets'],
                'total_current_assets' => $totalCurrentAssets,
                'total_fixed_assets' => $totalFixedAssets,
                'total_assets' => $totalAssets,
            ],
            'liabilities' => [
                'current_liabilities' => $liabilities['current_liabilities'],
                'long_term_liabilities' => $liabilities['long_term_liabilities'],
                'total_current_liabilities' => $totalCurrentLiabilities,
                'total_long_term_liabilities' => $totalLongTermLiabilities,
                'total_liabilities' => $totalLiabilities,
            ],
            'equity' => $equity,
        ];

        return Inertia::render('Finance/Reports/BalanceSheet', [
            'balanceSheet' => $balanceSheet,
            'filters' => $request->only(['as_of_date']),
        ]);
    }

    public function cashFlowStatement(Request $request)
    {
        $request->validate([
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
        ]);

        // Operating Activities
        $operatingCashInflows = Payment::where('school_id', Auth::user()->school_id)
            ->where('status', 'completed')
            ->whereBetween('payment_date', [$request->date_from, $request->date_to])
            ->sum('amount');

        $operatingCashOutflows = FinancialTransaction::where('school_id', Auth::user()->school_id)
            ->where('transaction_type', 'expense')
            ->whereIn('category', ['salaries', 'utilities', 'maintenance', 'supplies'])
            ->whereBetween('transaction_date', [$request->date_from, $request->date_to])
            ->sum('amount');

        // Investing Activities
        $investingCashOutflows = FinancialTransaction::where('school_id', Auth::user()->school_id)
            ->where('transaction_type', 'expense')
            ->whereIn('category', ['equipment', 'furniture', 'buildings'])
            ->whereBetween('transaction_date', [$request->date_from, $request->date_to])
            ->sum('amount');

        // Financing Activities
        $financingCashInflows = FinancialTransaction::where('school_id', Auth::user()->school_id)
            ->where('transaction_type', 'income')
            ->whereIn('category', ['loan', 'investment'])
            ->whereBetween('transaction_date', [$request->date_from, $request->date_to])
            ->sum('amount');

        $financingCashOutflows = FinancialTransaction::where('school_id', Auth::user()->school_id)
            ->where('transaction_type', 'expense')
            ->whereIn('category', ['loan_repayment', 'dividends'])
            ->whereBetween('transaction_date', [$request->date_from, $request->date_to])
            ->sum('amount');

        $netOperatingCashFlow = $operatingCashInflows - $operatingCashOutflows;
        $netInvestingCashFlow = -$investingCashOutflows;
        $netFinancingCashFlow = $financingCashInflows - $financingCashOutflows;
        $netCashFlow = $netOperatingCashFlow + $netInvestingCashFlow + $netFinancingCashFlow;

        $cashFlowStatement = [
            'period' => [
                'from' => $request->date_from,
                'to' => $request->date_to,
            ],
            'operating_activities' => [
                'cash_inflows' => $operatingCashInflows,
                'cash_outflows' => $operatingCashOutflows,
                'net_cash_flow' => $netOperatingCashFlow,
            ],
            'investing_activities' => [
                'cash_inflows' => 0,
                'cash_outflows' => $investingCashOutflows,
                'net_cash_flow' => $netInvestingCashFlow,
            ],
            'financing_activities' => [
                'cash_inflows' => $financingCashInflows,
                'cash_outflows' => $financingCashOutflows,
                'net_cash_flow' => $netFinancingCashFlow,
            ],
            'net_cash_flow' => $netCashFlow,
        ];

        return Inertia::render('Finance/Reports/CashFlow', [
            'cashFlowStatement' => $cashFlowStatement,
            'filters' => $request->only(['date_from', 'date_to']),
        ]);
    }

    public function budgetVsActual(Request $request)
    {
        $request->validate([
            'academic_year' => 'required|integer',
        ]);

        $budget = Budget::with('budgetItems')
            ->where('school_id', Auth::user()->school_id)
            ->where('academic_year', $request->academic_year)
            ->where('status', 'approved')
            ->first();

        if (!$budget) {
            return redirect()->back()
                ->with('error', 'No approved budget found for the specified academic year.');
        }

        $startDate = $request->academic_year . '-01-01';
        $endDate = $request->academic_year . '-12-31';

        // Update actual amounts
        foreach ($budget->budgetItems as $item) {
            $actualAmount = FinancialTransaction::where('school_id', Auth::user()->school_id)
                ->where('category', $item->category)
                ->where('transaction_type', $item->type)
                ->whereBetween('transaction_date', [$startDate, $endDate])
                ->sum('amount');

            $item->update(['actual_amount' => $actualAmount]);
        }

        $budget->load('budgetItems');

        $comparison = [
            'academic_year' => $request->academic_year,
            'budget_name' => $budget->name,
            'items' => $budget->budgetItems->map(function ($item) {
                $variance = $item->actual_amount - $item->budgeted_amount;
                $variance_percentage = $item->budgeted_amount > 0
                    ? ($variance / $item->budgeted_amount) * 100
                    : 0;

                return [
                    'id' => $item->id,
                    'category' => $item->category,
                    'description' => $item->description,
                    'planned_amount' => $item->budgeted_amount,
                    'actual_amount' => $item->actual_amount,
                    'variance' => $variance,
                    'variance_percentage' => $variance_percentage,
                ];
            }),
            'summary' => [
                'total_planned_income' => $budget->budgetItems->sum('budgeted_amount'),
                'total_actual_income' => $budget->budgetItems->sum('actual_amount'),
                'total_planned_expenses' => $budget->budgetItems->sum('budgeted_amount'),
                'total_actual_expenses' => $budget->budgetItems->sum('actual_amount'),
            ],
        ];

        $comparison['summary']['income_variance'] = 
            $comparison['summary']['total_actual_income'] - $comparison['summary']['total_planned_income'];
        $comparison['summary']['expense_variance'] = 
            $comparison['summary']['total_actual_expenses'] - $comparison['summary']['total_planned_expenses'];

        return Inertia::render('Finance/Reports/BudgetVsActual', [
            'comparison' => $comparison,
            'filters' => $request->only(['academic_year']),
        ]);
    }

    public function exportReport(Request $request)
    {
        $request->validate([
            'report_type' => 'required|in:fee_collection,arrears,income_statement,balance_sheet,cash_flow,budget_vs_actual',
            'format' => 'required|in:pdf,excel',
        ]);

        // TODO: Implement export functionality
        // This would generate PDF or Excel files based on the report type

        return redirect()->back()
            ->with('success', 'Report export functionality will be implemented.');
    }
}



