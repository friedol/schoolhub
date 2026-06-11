<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\PerformanceAppraisal;
use App\Models\AppraisalCycle;
use App\Models\AppraisalGoal;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PerformanceController extends Controller
{
    public function index(Request $request)
    {
        $query = PerformanceAppraisal::with(['staff.staffProfile', 'appraiser', 'appraisalCycle'])
            ->where('school_id', Auth::user()->school_id);

        // Apply filters
        if ($request->filled('appraisal_cycle_id')) {
            $query->where('appraisal_cycle_id', $request->appraisal_cycle_id);
        }

        if ($request->filled('staff_id')) {
            $query->where('staff_id', $request->staff_id);
        }

        if ($request->filled('appraiser_id')) {
            $query->where('appraiser_id', $request->appraiser_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('staff', function ($staffQuery) use ($search) {
                    $staffQuery->where('name', 'like', "%{$search}%")
                              ->orWhereHas('staffProfile', function ($profileQuery) use ($search) {
                                  $profileQuery->where('employee_id', 'like', "%{$search}%");
                              });
                });
            });
        }

        $appraisals = $query->orderBy('appraisal_date', 'desc')
            ->paginate(15)
            ->withQueryString();

        $appraisalCycles = AppraisalCycle::where('school_id', Auth::user()->school_id)
            ->orderBy('start_date', 'desc')
            ->get();

        $staff = User::with('staffProfile')
            ->where('school_id', Auth::user()->school_id)
            ->whereIn('role', ['teacher', 'headteacher', 'bursar', 'librarian', 'dormitory_manager', 'academic_master'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Statistics
        $stats = [
            'total_appraisals' => PerformanceAppraisal::where('school_id', Auth::user()->school_id)->count(),
            'pending_appraisals' => PerformanceAppraisal::where('school_id', Auth::user()->school_id)
                ->where('status', 'pending')->count(),
            'completed_appraisals' => PerformanceAppraisal::where('school_id', Auth::user()->school_id)
                ->where('status', 'completed')->count(),
            'average_rating' => PerformanceAppraisal::where('school_id', Auth::user()->school_id)
                ->where('status', 'completed')
                ->avg('overall_rating'),
        ];

        return Inertia::render('HR/Performance/Index', [
            'appraisals' => $appraisals,
            'appraisalCycles' => $appraisalCycles,
            'staff' => $staff,
            'stats' => $stats,
            'filters' => $request->only(['appraisal_cycle_id', 'staff_id', 'appraiser_id', 'status', 'search']),
        ]);
    }

    public function create(Request $request)
    {
        $appraisalCycles = AppraisalCycle::where('school_id', Auth::user()->school_id)
            ->where('status', 'active')
            ->orderBy('start_date', 'desc')
            ->get();

        $staff = User::with('staffProfile')
            ->where('school_id', Auth::user()->school_id)
            ->whereIn('role', ['teacher', 'headteacher', 'bursar', 'librarian', 'dormitory_manager', 'academic_master'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $appraisers = User::with('staffProfile')
            ->where('school_id', Auth::user()->school_id)
            ->whereIn('role', ['headteacher', 'academic_master'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('HR/Performance/Create', [
            'appraisalCycles' => $appraisalCycles,
            'staff' => $staff,
            'appraisers' => $appraisers,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'appraisal_cycle_id' => 'required|exists:appraisal_cycles,id',
            'staff_id' => 'required|exists:users,id',
            'appraiser_id' => 'required|exists:users,id',
            'appraisal_date' => 'required|date',
            'self_assessment_score' => 'nullable|integer|min:1|max:5',
            'supervisor_assessment_score' => 'nullable|integer|min:1|max:5',
            'overall_rating' => 'nullable|integer|min:1|max:5',
            'feedback' => 'nullable|string|max:2000',
            'development_plan' => 'nullable|string|max:2000',
            'goals' => 'nullable|array',
            'goals.*.goal_description' => 'required_with:goals|string|max:500',
            'goals.*.target_date' => 'required_with:goals|date|after:today',
            'goals.*.progress' => 'nullable|integer|min:0|max:100',
        ]);

        // Check if appraisal already exists for this staff and cycle
        $existingAppraisal = PerformanceAppraisal::where('school_id', Auth::user()->school_id)
            ->where('appraisal_cycle_id', $request->appraisal_cycle_id)
            ->where('staff_id', $request->staff_id)
            ->first();

        if ($existingAppraisal) {
            return redirect()->back()
                ->with('error', 'Performance appraisal already exists for this staff member in the selected cycle.');
        }

        DB::transaction(function () use ($request) {
            $appraisal = PerformanceAppraisal::create([
                'appraisal_cycle_id' => $request->appraisal_cycle_id,
                'staff_id' => $request->staff_id,
                'appraiser_id' => $request->appraiser_id,
                'appraisal_date' => $request->appraisal_date,
                'self_assessment_score' => $request->self_assessment_score,
                'supervisor_assessment_score' => $request->supervisor_assessment_score,
                'overall_rating' => $request->overall_rating,
                'feedback' => $request->feedback,
                'development_plan' => $request->development_plan,
                'status' => 'pending',
            ]);

            // Create goals if provided
            if ($request->goals) {
                foreach ($request->goals as $goalData) {
                    AppraisalGoal::create([
                        'performance_appraisal_id' => $appraisal->id,
                        'goal_description' => $goalData['goal_description'],
                        'target_date' => $goalData['target_date'],
                        'progress' => $goalData['progress'] ?? 0,
                        'status' => 'pending',
                    ]);
                }
            }
        });

        return redirect()->route('hr.performance.index')
            ->with('success', 'Performance appraisal created successfully.');
    }

    public function show(PerformanceAppraisal $performanceAppraisal)
    {
        $this->authorize('view', $performanceAppraisal);

        $performanceAppraisal->load([
            'staff.staffProfile',
            'appraiser',
            'appraisalCycle',
            'goals'
        ]);

        return Inertia::render('HR/Performance/Show', [
            'performanceAppraisal' => $performanceAppraisal,
        ]);
    }

    public function edit(PerformanceAppraisal $performanceAppraisal)
    {
        $this->authorize('update', $performanceAppraisal);

        if ($performanceAppraisal->status === 'completed') {
            return redirect()->back()
                ->with('error', 'Cannot edit completed performance appraisal.');
        }

        $performanceAppraisal->load(['goals']);

        $appraisalCycles = AppraisalCycle::where('school_id', Auth::user()->school_id)
            ->where('status', 'active')
            ->orderBy('start_date', 'desc')
            ->get();

        $staff = User::with('staffProfile')
            ->where('school_id', Auth::user()->school_id)
            ->whereIn('role', ['teacher', 'headteacher', 'bursar', 'librarian', 'dormitory_manager', 'academic_master'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $appraisers = User::with('staffProfile')
            ->where('school_id', Auth::user()->school_id)
            ->whereIn('role', ['headteacher', 'academic_master'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('HR/Performance/Edit', [
            'performanceAppraisal' => $performanceAppraisal,
            'appraisalCycles' => $appraisalCycles,
            'staff' => $staff,
            'appraisers' => $appraisers,
        ]);
    }

    public function update(Request $request, PerformanceAppraisal $performanceAppraisal)
    {
        $this->authorize('update', $performanceAppraisal);

        if ($performanceAppraisal->status === 'completed') {
            return redirect()->back()
                ->with('error', 'Cannot edit completed performance appraisal.');
        }

        $request->validate([
            'appraisal_cycle_id' => 'required|exists:appraisal_cycles,id',
            'staff_id' => 'required|exists:users,id',
            'appraiser_id' => 'required|exists:users,id',
            'appraisal_date' => 'required|date',
            'self_assessment_score' => 'nullable|integer|min:1|max:5',
            'supervisor_assessment_score' => 'nullable|integer|min:1|max:5',
            'overall_rating' => 'nullable|integer|min:1|max:5',
            'feedback' => 'nullable|string|max:2000',
            'development_plan' => 'nullable|string|max:2000',
            'goals' => 'nullable|array',
            'goals.*.id' => 'nullable|exists:appraisal_goals,id',
            'goals.*.goal_description' => 'required_with:goals|string|max:500',
            'goals.*.target_date' => 'required_with:goals|date',
            'goals.*.progress' => 'nullable|integer|min:0|max:100',
        ]);

        DB::transaction(function () use ($request, $performanceAppraisal) {
            $performanceAppraisal->update([
                'appraisal_cycle_id' => $request->appraisal_cycle_id,
                'staff_id' => $request->staff_id,
                'appraiser_id' => $request->appraiser_id,
                'appraisal_date' => $request->appraisal_date,
                'self_assessment_score' => $request->self_assessment_score,
                'supervisor_assessment_score' => $request->supervisor_assessment_score,
                'overall_rating' => $request->overall_rating,
                'feedback' => $request->feedback,
                'development_plan' => $request->development_plan,
            ]);

            // Update or create goals
            if ($request->goals) {
                $existingGoalIds = [];
                foreach ($request->goals as $goalData) {
                    if (isset($goalData['id'])) {
                        // Update existing goal
                        AppraisalGoal::where('id', $goalData['id'])
                            ->where('performance_appraisal_id', $performanceAppraisal->id)
                            ->update([
                                'goal_description' => $goalData['goal_description'],
                                'target_date' => $goalData['target_date'],
                                'progress' => $goalData['progress'] ?? 0,
                            ]);
                        $existingGoalIds[] = $goalData['id'];
                    } else {
                        // Create new goal
                        $newGoal = AppraisalGoal::create([
                            'performance_appraisal_id' => $performanceAppraisal->id,
                            'goal_description' => $goalData['goal_description'],
                            'target_date' => $goalData['target_date'],
                            'progress' => $goalData['progress'] ?? 0,
                            'status' => 'pending',
                        ]);
                        $existingGoalIds[] = $newGoal->id;
                    }
                }

                // Delete removed goals
                AppraisalGoal::where('performance_appraisal_id', $performanceAppraisal->id)
                    ->whereNotIn('id', $existingGoalIds)
                    ->delete();
            }
        });

        return redirect()->route('hr.performance.index')
            ->with('success', 'Performance appraisal updated successfully.');
    }

    public function destroy(PerformanceAppraisal $performanceAppraisal)
    {
        $this->authorize('delete', $performanceAppraisal);

        if ($performanceAppraisal->status === 'completed') {
            return redirect()->back()
                ->with('error', 'Cannot delete completed performance appraisal.');
        }

        $performanceAppraisal->delete();

        return redirect()->route('hr.performance.index')
            ->with('success', 'Performance appraisal deleted successfully.');
    }

    public function complete(PerformanceAppraisal $performanceAppraisal)
    {
        $this->authorize('update', $performanceAppraisal);

        if ($performanceAppraisal->status === 'completed') {
            return redirect()->back()
                ->with('error', 'Performance appraisal is already completed.');
        }

        // Validate that all required fields are filled
        if (!$performanceAppraisal->supervisor_assessment_score || !$performanceAppraisal->overall_rating) {
            return redirect()->back()
                ->with('error', 'Cannot complete appraisal without supervisor assessment score and overall rating.');
        }

        $performanceAppraisal->update([
            'status' => 'completed',
        ]);

        return redirect()->back()
            ->with('success', 'Performance appraisal completed successfully.');
    }

    public function updateGoalProgress(Request $request, AppraisalGoal $goal)
    {
        $this->authorize('update', $goal->performanceAppraisal);

        $request->validate([
            'progress' => 'required|integer|min:0|max:100',
            'status' => 'required|in:pending,in_progress,completed,overdue',
        ]);

        $goal->update([
            'progress' => $request->progress,
            'status' => $request->status,
        ]);

        return redirect()->back()
            ->with('success', 'Goal progress updated successfully.');
    }

    public function getPerformanceSummary(Request $request)
    {
        $request->validate([
            'staff_id' => 'required|exists:users,id',
            'year' => 'nullable|integer|min:2020|max:2030',
        ]);

        $year = $request->year ?? now()->year;

        $appraisals = PerformanceAppraisal::with(['appraisalCycle'])
            ->where('school_id', Auth::user()->school_id)
            ->where('staff_id', $request->staff_id)
            ->where('status', 'completed')
            ->whereYear('appraisal_date', $year)
            ->get();

        $summary = [
            'total_appraisals' => $appraisals->count(),
            'average_rating' => $appraisals->avg('overall_rating'),
            'highest_rating' => $appraisals->max('overall_rating'),
            'lowest_rating' => $appraisals->min('overall_rating'),
            'rating_distribution' => [
                'excellent' => $appraisals->where('overall_rating', 5)->count(),
                'good' => $appraisals->where('overall_rating', 4)->count(),
                'satisfactory' => $appraisals->where('overall_rating', 3)->count(),
                'needs_improvement' => $appraisals->where('overall_rating', 2)->count(),
                'unsatisfactory' => $appraisals->where('overall_rating', 1)->count(),
            ],
            'appraisals' => $appraisals,
        ];

        return response()->json($summary);
    }

    public function getDepartmentPerformance(Request $request)
    {
        $request->validate([
            'department' => 'required|string',
            'year' => 'nullable|integer|min:2020|max:2030',
        ]);

        $year = $request->year ?? now()->year;

        $appraisals = PerformanceAppraisal::with(['staff.staffProfile'])
            ->where('school_id', Auth::user()->school_id)
            ->where('status', 'completed')
            ->whereYear('appraisal_date', $year)
            ->whereHas('staff.staffProfile', function ($query) use ($request) {
                $query->where('department', $request->department);
            })
            ->get();

        $summary = [
            'department' => $request->department,
            'total_staff' => $appraisals->count(),
            'average_rating' => $appraisals->avg('overall_rating'),
            'top_performers' => $appraisals->where('overall_rating', '>=', 4)->count(),
            'needs_improvement' => $appraisals->where('overall_rating', '<=', 2)->count(),
            'rating_distribution' => [
                'excellent' => $appraisals->where('overall_rating', 5)->count(),
                'good' => $appraisals->where('overall_rating', 4)->count(),
                'satisfactory' => $appraisals->where('overall_rating', 3)->count(),
                'needs_improvement' => $appraisals->where('overall_rating', 2)->count(),
                'unsatisfactory' => $appraisals->where('overall_rating', 1)->count(),
            ],
        ];

        return response()->json($summary);
    }

    public function getPendingAppraisals()
    {
        $pendingAppraisals = PerformanceAppraisal::with(['staff.staffProfile', 'appraiser'])
            ->where('school_id', Auth::user()->school_id)
            ->where('status', 'pending')
            ->orderBy('appraisal_date')
            ->get();

        return response()->json($pendingAppraisals);
    }

    public function getOverdueGoals()
    {
        $overdueGoals = AppraisalGoal::with(['performanceAppraisal.staff.staffProfile'])
            ->whereHas('performanceAppraisal', function ($query) {
                $query->where('school_id', Auth::user()->school_id);
            })
            ->where('status', '!=', 'completed')
            ->where('target_date', '<', now()->toDateString())
            ->get();

        return response()->json($overdueGoals);
    }
}



