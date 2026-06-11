<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\Holiday;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class HolidayController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('role:super_admin,school_admin,headteacher');
    }

    /**
     * Display holidays
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $school = $user->school;

        $query = Holiday::where('school_id', $school->id);

        // Apply filters
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('year')) {
            $query->whereYear('start_date', $request->year);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->is_active === 'true');
        }

        if ($request->filled('is_recurring')) {
            $query->where('is_recurring', $request->is_recurring === 'true');
        }

        $holidays = $query->orderBy('start_date')
            ->paginate(20);

        $statistics = $this->getHolidayStatistics($school->id);

        return Inertia::render('System/Holidays/Index', [
            'holidays' => $holidays,
            'statistics' => $statistics,
            'filters' => $request->only(['type', 'year', 'is_active', 'is_recurring']),
            'holidayTypes' => Holiday::HOLIDAY_TYPES,
            'years' => $this->getAvailableYears($school->id),
        ]);
    }

    /**
     * Show the form for creating a new holiday
     */
    public function create(): Response
    {
        return Inertia::render('System/Holidays/Create', [
            'holidayTypes' => Holiday::HOLIDAY_TYPES,
        ]);
    }

    /**
     * Store a newly created holiday
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $school = $user->school;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'type' => 'required|string|in:' . implode(',', array_keys(Holiday::HOLIDAY_TYPES)),
            'description' => 'nullable|string|max:1000',
            'is_recurring' => 'boolean',
            'is_active' => 'boolean',
        ]);

        try {
            $holiday = Holiday::create([
                'school_id' => $school->id,
                'name' => $validated['name'],
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'type' => $validated['type'],
                'description' => $validated['description'],
                'is_recurring' => $validated['is_recurring'] ?? false,
                'is_active' => $validated['is_active'] ?? true,
            ]);

            return redirect()->route('holidays.index')
                ->with('success', 'Holiday created successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create holiday: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified holiday
     */
    public function show(Holiday $holiday): Response
    {
        $user = Auth::user();

        // Check if user can view this holiday
        if ($holiday->school_id !== $user->school_id) {
            abort(403, 'Unauthorized access to holiday.');
        }

        return Inertia::render('System/Holidays/Show', [
            'holiday' => $holiday,
        ]);
    }

    /**
     * Show the form for editing the specified holiday
     */
    public function edit(Holiday $holiday): Response
    {
        $user = Auth::user();

        // Check if user can edit this holiday
        if ($holiday->school_id !== $user->school_id) {
            abort(403, 'Unauthorized access to holiday.');
        }

        return Inertia::render('System/Holidays/Edit', [
            'holiday' => $holiday,
            'holidayTypes' => Holiday::HOLIDAY_TYPES,
        ]);
    }

    /**
     * Update the specified holiday
     */
    public function update(Request $request, Holiday $holiday)
    {
        $user = Auth::user();

        // Check if user can update this holiday
        if ($holiday->school_id !== $user->school_id) {
            abort(403, 'Unauthorized access to holiday.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'type' => 'required|string|in:' . implode(',', array_keys(Holiday::HOLIDAY_TYPES)),
            'description' => 'nullable|string|max:1000',
            'is_recurring' => 'boolean',
            'is_active' => 'boolean',
        ]);

        try {
            $holiday->update($validated);

            return redirect()->route('holidays.index')
                ->with('success', 'Holiday updated successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update holiday: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified holiday
     */
    public function destroy(Holiday $holiday)
    {
        $user = Auth::user();

        // Check if user can delete this holiday
        if ($holiday->school_id !== $user->school_id) {
            abort(403, 'Unauthorized access to holiday.');
        }

        try {
            $holiday->delete();

            return response()->json([
                'success' => true,
                'message' => 'Holiday deleted successfully.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete holiday: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get holidays for calendar view
     */
    public function calendar(Request $request)
    {
        $user = Auth::user();
        $school = $user->school;

        $request->validate([
            'start' => 'required|date',
            'end' => 'required|date|after:start',
        ]);

        $holidays = Holiday::where('school_id', $school->id)
            ->where('is_active', true)
            ->whereBetween('start_date', [$request->start, $request->end])
            ->orWhereBetween('end_date', [$request->start, $request->end])
            ->orderBy('start_date')
            ->get()
            ->map(function ($holiday) {
                return [
                    'id' => $holiday->id,
                    'title' => $holiday->name,
                    'start' => $holiday->start_date->format('Y-m-d'),
                    'end' => $holiday->end_date->addDay()->format('Y-m-d'), // Add day for full calendar
                    'type' => $holiday->type,
                    'description' => $holiday->description,
                    'is_recurring' => $holiday->is_recurring,
                    'color' => $this->getHolidayColor($holiday->type),
                ];
            });

        return response()->json($holidays);
    }

    /**
     * Import Tanzanian public holidays
     */
    public function importPublicHolidays(Request $request)
    {
        $user = Auth::user();
        $school = $user->school;

        $request->validate([
            'year' => 'required|integer|min:2020|max:2030',
            'overwrite_existing' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            $publicHolidays = $this->getTanzanianPublicHolidays($request->year);
            $importedCount = 0;
            $skippedCount = 0;

            foreach ($publicHolidays as $holidayData) {
                $existing = Holiday::where('school_id', $school->id)
                    ->where('name', $holidayData['name'])
                    ->whereYear('start_date', $request->year)
                    ->first();

                if ($existing && !$request->overwrite_existing) {
                    $skippedCount++;
                    continue;
                }

                if ($existing && $request->overwrite_existing) {
                    $existing->update($holidayData);
                } else {
                    Holiday::create(array_merge($holidayData, [
                        'school_id' => $school->id,
                    ]));
                }

                $importedCount++;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Public holidays imported successfully. {$importedCount} imported, {$skippedCount} skipped.",
                'imported_count' => $importedCount,
                'skipped_count' => $skippedCount,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to import public holidays: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate recurring holidays
     */
    public function generateRecurring(Request $request)
    {
        $user = Auth::user();
        $school = $user->school;

        $request->validate([
            'year' => 'required|integer|min:2020|max:2030',
            'confirm' => 'required|boolean|accepted',
        ]);

        if (!$request->confirm) {
            return response()->json([
                'success' => false,
                'message' => 'Please confirm the generation operation.',
            ], 400);
        }

        try {
            DB::beginTransaction();

            $recurringHolidays = Holiday::where('school_id', $school->id)
                ->where('is_recurring', true)
                ->where('is_active', true)
                ->get();

            $generatedCount = 0;

            foreach ($recurringHolidays as $holiday) {
                // Check if holiday already exists for the year
                $existing = Holiday::where('school_id', $school->id)
                    ->where('name', $holiday->name)
                    ->whereYear('start_date', $request->year)
                    ->first();

                if ($existing) {
                    continue;
                }

                // Generate new holiday for the year
                $newStartDate = $holiday->start_date->copy()->year($request->year);
                $newEndDate = $holiday->end_date->copy()->year($request->year);

                Holiday::create([
                    'school_id' => $school->id,
                    'name' => $holiday->name,
                    'start_date' => $newStartDate,
                    'end_date' => $newEndDate,
                    'type' => $holiday->type,
                    'description' => $holiday->description,
                    'is_recurring' => $holiday->is_recurring,
                    'is_active' => $holiday->is_active,
                ]);

                $generatedCount++;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Generated {$generatedCount} recurring holidays for {$request->year}.",
                'generated_count' => $generatedCount,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate recurring holidays: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get holiday statistics
     */
    public function statistics(Request $request)
    {
        $user = Auth::user();
        $school = $user->school;

        $year = $request->get('year', now()->year);

        $query = Holiday::where('school_id', $school->id)
            ->whereYear('start_date', $year);

        $statistics = [
            'total_holidays' => $query->count(),
            'active_holidays' => $query->where('is_active', true)->count(),
            'recurring_holidays' => $query->where('is_recurring', true)->count(),
            'holidays_by_type' => $query->select('type', DB::raw('count(*) as count'))
                ->groupBy('type')
                ->get(),
            'total_holiday_days' => $query->where('is_active', true)
                ->get()
                ->sum(function ($holiday) {
                    return $holiday->start_date->diffInDays($holiday->end_date) + 1;
                }),
            'upcoming_holidays' => $query->where('is_active', true)
                ->where('start_date', '>=', now())
                ->orderBy('start_date')
                ->limit(5)
                ->get(),
        ];

        return response()->json($statistics);
    }

    /**
     * Toggle holiday status
     */
    public function toggleStatus(Holiday $holiday)
    {
        $user = Auth::user();

        // Check if user can update this holiday
        if ($holiday->school_id !== $user->school_id) {
            abort(403, 'Unauthorized access to holiday.');
        }

        try {
            $holiday->update([
                'is_active' => !$holiday->is_active,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Holiday status updated successfully.',
                'is_active' => $holiday->is_active,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update holiday status: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get holidays for a specific date range
     */
    public function getByDateRange(Request $request)
    {
        $user = Auth::user();
        $school = $user->school;

        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $holidays = Holiday::where('school_id', $school->id)
            ->where('is_active', true)
            ->where(function ($query) use ($request) {
                $query->whereBetween('start_date', [$request->start_date, $request->end_date])
                    ->orWhereBetween('end_date', [$request->start_date, $request->end_date])
                    ->orWhere(function ($q) use ($request) {
                        $q->where('start_date', '<=', $request->start_date)
                            ->where('end_date', '>=', $request->end_date);
                    });
            })
            ->orderBy('start_date')
            ->get();

        return response()->json($holidays);
    }

    /**
     * Check if a date is a holiday
     */
    public function isHoliday(Request $request)
    {
        $user = Auth::user();
        $school = $user->school;

        $request->validate([
            'date' => 'required|date',
        ]);

        $holiday = Holiday::where('school_id', $school->id)
            ->where('is_active', true)
            ->where('start_date', '<=', $request->date)
            ->where('end_date', '>=', $request->date)
            ->first();

        return response()->json([
            'is_holiday' => $holiday !== null,
            'holiday' => $holiday,
        ]);
    }

    /**
     * Get holiday statistics for dashboard
     */
    private function getHolidayStatistics($schoolId)
    {
        $currentYear = now()->year;

        return [
            'total_holidays' => Holiday::where('school_id', $schoolId)->count(),
            'current_year_holidays' => Holiday::where('school_id', $schoolId)
                ->whereYear('start_date', $currentYear)
                ->count(),
            'active_holidays' => Holiday::where('school_id', $schoolId)
                ->where('is_active', true)
                ->count(),
            'upcoming_holidays' => Holiday::where('school_id', $schoolId)
                ->where('is_active', true)
                ->where('start_date', '>=', now())
                ->orderBy('start_date')
                ->limit(3)
                ->get(),
        ];
    }

    /**
     * Get available years for filtering
     */
    private function getAvailableYears($schoolId)
    {
        $years = Holiday::where('school_id', $schoolId)
            ->selectRaw('YEAR(start_date) as year')
            ->distinct()
            ->orderBy('year')
            ->pluck('year');

        return $years->isEmpty() ? [now()->year] : $years->toArray();
    }

    /**
     * Get holiday color for calendar
     */
    private function getHolidayColor($type)
    {
        $colors = [
            'public_holiday' => '#dc3545', // Red
            'school_holiday' => '#28a745', // Green
            'academic_break' => '#007bff', // Blue
            'religious_holiday' => '#6f42c1', // Purple
            'national_holiday' => '#fd7e14', // Orange
        ];

        return $colors[$type] ?? '#6c757d'; // Gray default
    }

    /**
     * Get Tanzanian public holidays for a year
     */
    private function getTanzanianPublicHolidays($year)
    {
        return [
            [
                'name' => 'New Year\'s Day',
                'start_date' => "{$year}-01-01",
                'end_date' => "{$year}-01-01",
                'type' => 'public_holiday',
                'description' => 'New Year\'s Day',
                'is_recurring' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Zanzibar Revolution Day',
                'start_date' => "{$year}-01-12",
                'end_date' => "{$year}-01-12",
                'type' => 'public_holiday',
                'description' => 'Zanzibar Revolution Day',
                'is_recurring' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Good Friday',
                'start_date' => $this->getEasterDate($year, 'good_friday'),
                'end_date' => $this->getEasterDate($year, 'good_friday'),
                'type' => 'religious_holiday',
                'description' => 'Good Friday',
                'is_recurring' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Easter Monday',
                'start_date' => $this->getEasterDate($year, 'easter_monday'),
                'end_date' => $this->getEasterDate($year, 'easter_monday'),
                'type' => 'religious_holiday',
                'description' => 'Easter Monday',
                'is_recurring' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Union Day',
                'start_date' => "{$year}-04-26",
                'end_date' => "{$year}-04-26",
                'type' => 'public_holiday',
                'description' => 'Union Day',
                'is_recurring' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Labour Day',
                'start_date' => "{$year}-05-01",
                'end_date' => "{$year}-05-01",
                'type' => 'public_holiday',
                'description' => 'Labour Day',
                'is_recurring' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Independence Day',
                'start_date' => "{$year}-12-09",
                'end_date' => "{$year}-12-09",
                'type' => 'public_holiday',
                'description' => 'Independence Day',
                'is_recurring' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Christmas Day',
                'start_date' => "{$year}-12-25",
                'end_date' => "{$year}-12-25",
                'type' => 'religious_holiday',
                'description' => 'Christmas Day',
                'is_recurring' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Boxing Day',
                'start_date' => "{$year}-12-26",
                'end_date' => "{$year}-12-26",
                'type' => 'public_holiday',
                'description' => 'Boxing Day',
                'is_recurring' => true,
                'is_active' => true,
            ],
        ];
    }

    /**
     * Calculate Easter date for a given year
     */
    private function getEasterDate($year, $type = 'easter')
    {
        // Simplified Easter calculation (you might want to use a more accurate method)
        $a = $year % 19;
        $b = intval($year / 100);
        $c = $year % 100;
        $d = intval($b / 4);
        $e = $b % 4;
        $f = intval(($b + 8) / 25);
        $g = intval(($b - $f + 1) / 3);
        $h = (19 * $a + $b - $d - $g + 15) % 30;
        $i = intval($c / 4);
        $k = $c % 4;
        $l = (32 + 2 * $e + 2 * $i - $h - $k) % 7;
        $m = intval(($a + 11 * $h + 22 * $l) / 451);
        $n = intval(($h + $l - 7 * $m + 114) / 31);
        $p = ($h + $l - 7 * $m + 114) % 31;

        $easter = "{$year}-" . str_pad($n, 2, '0', STR_PAD_LEFT) . "-" . str_pad($p + 1, 2, '0', STR_PAD_LEFT);

        if ($type === 'good_friday') {
            return date('Y-m-d', strtotime($easter . ' -2 days'));
        } elseif ($type === 'easter_monday') {
            return date('Y-m-d', strtotime($easter . ' +1 day'));
        }

        return $easter;
    }
}
