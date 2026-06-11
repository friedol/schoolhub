<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\BudgetItem;
use App\Models\FinancialTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class BudgetController extends Controller
{
    public function index(Request $request)
    {
        $query = Budget::with(['budgetItems', 'approvedBy'])
            ->where('school_id', Auth::user()->school_id);

        // Apply filters
        if ($request->filled('academic_year')) {
            $query->where('academic_year', $request->academic_year);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        $budgets = $query->orderBy('academic_year', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Get available academic years
        $academicYears = Budget::where('school_id', Auth::user()->school_id)
            ->distinct()
            ->pluck('academic_year')
            ->sort()
            ->values();

        // Statistics
        $currentYear = now()->year;
        $currentBudget = Budget::where('school_id', Auth::user()->school_id)
            ->where('academic_year', $currentYear)
            ->where('status', 'approved')
            ->first();

        $stats = [
            'total_budgets' => Budget::where('school_id', Auth::user()->school_id)->count(),
            'approved_budgets' => Budget::where('school_id', Auth::user()->school_id)
                ->where('status', 'approved')->count(),
            'draft_budgets' => Budget::where('school_id', Auth::user()->school_id)
                ->where('status', 'draft')->count(),
            'current_year_budget' => $currentBudget ? $currentBudget->total_income : 0,
            'current_year_expenses' => $currentBudget ? $currentBudget->total_expenses : 0,
        ];

        return Inertia::render('Finance/Budget/Index', [
            'budgets' => $budgets,
            'academicYears' => $academicYears,
            'stats' => $stats,
            'filters' => $request->only(['academic_year', 'status', 'search']),
        ]);
    }

    public function create()
    {
        $currentYear = now()->year;
        $existingBudget = Budget::where('school_id', Auth::user()->school_id)
            ->where('academic_year', $currentYear)
            ->first();

        if ($existingBudget) {
            return redirect()->route('finance.budgets.index')
                ->with('error', 'Budget for the current year already exists.');
        }

        return Inertia::render('Finance/Budget/Create', [
            'academicYear' => $currentYear,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'academic_year' => 'required|integer|min:2020|max:2030',
            'name' => 'required|string|max:255',
            'budget_items' => 'required|array|min:1',
            'budget_items.*.category' => 'required|string|max:255',
            'budget_items.*.description' => 'required|string|max:500',
            'budget_items.*.type' => 'required|in:income,expense',
            'budget_items.*.planned_amount' => 'required|numeric|min:0',
            'budget_items.*.notes' => 'nullable|string|max:1000',
        ]);

        // Check if budget already exists for this year
        $existingBudget = Budget::where('school_id', Auth::user()->school_id)
            ->where('academic_year', $request->academic_year)
            ->first();

        if ($existingBudget) {
            return redirect()->back()
                ->with('error', 'Budget for this academic year already exists.');
        }

        DB::transaction(function () use ($request) {
            // Calculate totals
            $totalIncome = collect($request->budget_items)
                ->where('type', 'income')
                ->sum('planned_amount');

            $totalExpenses = collect($request->budget_items)
                ->where('type', 'expense')
                ->sum('planned_amount');

            $budget = Budget::create([
                'school_id' => Auth::user()->school_id,
                'academic_year' => $request->academic_year,
                'name' => $request->name,
                'total_income' => $totalIncome,
                'total_expenses' => $totalExpenses,
                'status' => 'draft',
            ]);

            // Create budget items
            foreach ($request->budget_items as $item) {
                BudgetItem::create([
                    'budget_id' => $budget->id,
                    'category' => $item['category'],
                    'description' => $item['description'],
                    'type' => $item['type'],
                    'planned_amount' => $item['planned_amount'],
                    'actual_amount' => 0,
                    'notes' => $item['notes'] ?? null,
                ]);
            }
        });

        return redirect()->route('finance.budgets.index')
            ->with('success', 'Budget created successfully.');
    }

    public function show(Budget $budget)
    {
        $this->authorize('view', $budget);

        $budget->load([
            'budgetItems' => function ($query) {
                $query->orderBy('type')->orderBy('category');
            },
            'approvedBy'
        ]);

        // Get actual amounts from financial transactions
        $this->updateActualAmounts($budget);

        return Inertia::render('Finance/Budget/Show', [
            'budget' => $budget,
        ]);
    }

    public function edit(Budget $budget)
    {
        $this->authorize('update', $budget);

        if ($budget->status === 'approved') {
            return redirect()->back()
                ->with('error', 'Cannot edit approved budget.');
        }

        $budget->load('budgetItems');

        return Inertia::render('Finance/Budget/Edit', [
            'budget' => $budget,
        ]);
    }

    public function update(Request $request, Budget $budget)
    {
        $this->authorize('update', $budget);

        if ($budget->status === 'approved') {
            return redirect()->back()
                ->with('error', 'Cannot edit approved budget.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'budget_items' => 'required|array|min:1',
            'budget_items.*.id' => 'nullable|exists:budget_items,id',
            'budget_items.*.category' => 'required|string|max:255',
            'budget_items.*.description' => 'required|string|max:500',
            'budget_items.*.type' => 'required|in:income,expense',
            'budget_items.*.planned_amount' => 'required|numeric|min:0',
            'budget_items.*.notes' => 'nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($request, $budget) {
            // Calculate new totals
            $totalIncome = collect($request->budget_items)
                ->where('type', 'income')
                ->sum('planned_amount');

            $totalExpenses = collect($request->budget_items)
                ->where('type', 'expense')
                ->sum('planned_amount');

            $budget->update([
                'name' => $request->name,
                'total_income' => $totalIncome,
                'total_expenses' => $totalExpenses,
            ]);

            // Update or create budget items
            $existingItemIds = [];
            foreach ($request->budget_items as $item) {
                if (isset($item['id'])) {
                    // Update existing item
                    BudgetItem::where('id', $item['id'])
                        ->where('budget_id', $budget->id)
                        ->update([
                            'category' => $item['category'],
                            'description' => $item['description'],
                            'type' => $item['type'],
                            'planned_amount' => $item['planned_amount'],
                            'notes' => $item['notes'] ?? null,
                        ]);
                    $existingItemIds[] = $item['id'];
                } else {
                    // Create new item
                    $newItem = BudgetItem::create([
                        'budget_id' => $budget->id,
                        'category' => $item['category'],
                        'description' => $item['description'],
                        'type' => $item['type'],
                        'planned_amount' => $item['planned_amount'],
                        'actual_amount' => 0,
                        'notes' => $item['notes'] ?? null,
                    ]);
                    $existingItemIds[] = $newItem->id;
                }
            }

            // Delete removed items
            BudgetItem::where('budget_id', $budget->id)
                ->whereNotIn('id', $existingItemIds)
                ->delete();
        });

        return redirect()->route('finance.budgets.index')
            ->with('success', 'Budget updated successfully.');
    }

    public function destroy(Budget $budget)
    {
        $this->authorize('delete', $budget);

        if ($budget->status === 'approved') {
            return redirect()->back()
                ->with('error', 'Cannot delete approved budget.');
        }

        $budget->delete();

        return redirect()->route('finance.budgets.index')
            ->with('success', 'Budget deleted successfully.');
    }

    public function approve(Budget $budget)
    {
        $this->authorize('approve', $budget);

        if ($budget->status !== 'draft') {
            return redirect()->back()
                ->with('error', 'Only draft budgets can be approved.');
        }

        $budget->update([
            'status' => 'approved',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        return redirect()->back()
            ->with('success', 'Budget approved successfully.');
    }

    public function close(Budget $budget)
    {
        $this->authorize('approve', $budget);

        if ($budget->status !== 'approved') {
            return redirect()->back()
                ->with('error', 'Only approved budgets can be closed.');
        }

        $budget->update([
            'status' => 'closed',
        ]);

        return redirect()->back()
            ->with('success', 'Budget closed successfully.');
    }

    public function duplicate(Budget $budget)
    {
        $this->authorize('view', $budget);

        $newAcademicYear = $budget->academic_year + 1;

        // Check if budget already exists for next year
        $existingBudget = Budget::where('school_id', Auth::user()->school_id)
            ->where('academic_year', $newAcademicYear)
            ->first();

        if ($existingBudget) {
            return redirect()->back()
                ->with('error', 'Budget for the next academic year already exists.');
        }

        DB::transaction(function () use ($budget, $newAcademicYear) {
            $newBudget = $budget->replicate();
            $newBudget->academic_year = $newAcademicYear;
            $newBudget->name = $budget->name . ' (Copy)';
            $newBudget->status = 'draft';
            $newBudget->approved_by = null;
            $newBudget->approved_at = null;
            $newBudget->save();

            // Copy budget items
            foreach ($budget->budgetItems as $item) {
                $newItem = $item->replicate();
                $newItem->budget_id = $newBudget->id;
                $newItem->actual_amount = 0;
                $newItem->save();
            }
        });

        return redirect()->route('finance.budgets.index')
            ->with('success', 'Budget duplicated successfully.');
    }

    public function getBudgetPerformance(Budget $budget)
    {
        $this->authorize('view', $budget);

        $budget->load('budgetItems');
        $this->updateActualAmounts($budget);

        $performance = [
            'total_planned_income' => $budget->budgetItems->where('type', 'income')->sum('planned_amount'),
            'total_actual_income' => $budget->budgetItems->where('type', 'income')->sum('actual_amount'),
            'total_planned_expenses' => $budget->budgetItems->where('type', 'expense')->sum('planned_amount'),
            'total_actual_expenses' => $budget->budgetItems->where('type', 'expense')->sum('actual_amount'),
            'income_variance' => 0,
            'expense_variance' => 0,
            'items' => $budget->budgetItems->map(function ($item) {
                $variance = $item->actual_amount - $item->planned_amount;
                $variance_percentage = $item->planned_amount > 0 
                    ? ($variance / $item->planned_amount) * 100 
                    : 0;

                return [
                    'id' => $item->id,
                    'category' => $item->category,
                    'description' => $item->description,
                    'type' => $item->type,
                    'planned_amount' => $item->planned_amount,
                    'actual_amount' => $item->actual_amount,
                    'variance' => $variance,
                    'variance_percentage' => $variance_percentage,
                ];
            }),
        ];

        $performance['income_variance'] = $performance['total_actual_income'] - $performance['total_planned_income'];
        $performance['expense_variance'] = $performance['total_actual_expenses'] - $performance['total_planned_expenses'];

        return response()->json($performance);
    }

    private function updateActualAmounts(Budget $budget)
    {
        $startDate = $budget->academic_year . '-01-01';
        $endDate = $budget->academic_year . '-12-31';

        foreach ($budget->budgetItems as $item) {
            $actualAmount = FinancialTransaction::where('school_id', Auth::user()->school_id)
                ->where('category', $item->category)
                ->where('type', $item->type)
                ->whereBetween('transaction_date', [$startDate, $endDate])
                ->sum('amount');

            $item->update(['actual_amount' => $actualAmount]);
        }
    }
}



