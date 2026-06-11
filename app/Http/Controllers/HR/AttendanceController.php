<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\StaffAttendance;
use App\Models\WorkingHours;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $query = StaffAttendance::with(['staff.staffProfile'])
            ->where('school_id', Auth::user()->school_id);

        // Apply filters
        if ($request->filled('staff_id')) {
            $query->where('staff_id', $request->staff_id);
        }

        if ($request->filled('status')) {
            $query->where('attendance_status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->where('date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('date', '<=', $request->date_to);
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

        $attendance = $query->orderBy('date', 'desc')
            ->orderBy('staff_id')
            ->paginate(15)
            ->withQueryString();

        $staff = User::with('staffProfile')
            ->where('school_id', Auth::user()->school_id)
            ->whereIn('role', ['teacher', 'headteacher', 'bursar', 'librarian', 'dormitory_manager', 'academic_master'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Statistics
        $currentMonth = now()->format('Y-m');
        $stats = [
            'total_attendance_records' => StaffAttendance::where('school_id', Auth::user()->school_id)->count(),
            'present_today' => StaffAttendance::where('school_id', Auth::user()->school_id)
                ->where('date', today()->toDateString())
                ->where('attendance_status', 'present')
                ->count(),
            'absent_today' => StaffAttendance::where('school_id', Auth::user()->school_id)
                ->where('date', today()->toDateString())
                ->where('attendance_status', 'absent')
                ->count(),
            'late_today' => StaffAttendance::where('school_id', Auth::user()->school_id)
                ->where('date', today()->toDateString())
                ->where('attendance_status', 'late')
                ->count(),
            'monthly_attendance_rate' => $this->calculateMonthlyAttendanceRate($currentMonth),
        ];

        return Inertia::render('HR/Attendance/Index', [
            'attendances' => $attendance,
            'staff' => $staff,
            'stats' => $stats,
            'currentDate' => today()->toDateString(),
            'filters' => $request->only(['staff_id', 'status', 'date_from', 'date_to', 'search']),
        ]);
    }

    public function mark(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'attendance_records' => 'required|array',
            'attendance_records.*.staff_id' => 'required|exists:users,id',
            'attendance_records.*.status' => 'required|in:present,absent,late,on_leave',
            'attendance_records.*.clock_in_time' => 'nullable|date_format:H:i',
            'attendance_records.*.clock_out_time' => 'nullable|date_format:H:i',
            'attendance_records.*.remarks' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->attendance_records as $record) {
                // Check if attendance already exists for this staff and date
                $existingAttendance = StaffAttendance::where('school_id', Auth::user()->school_id)
                    ->where('staff_id', $record['staff_id'])
                    ->where('date', $request->date)
                    ->first();

                if ($existingAttendance) {
                    // Update existing record
                    $existingAttendance->update([
                        'attendance_status' => $record['status'],
                        'clock_in_time' => $record['clock_in_time'],
                        'clock_out_time' => $record['clock_out_time'],
                        'remarks' => $record['remarks'],
                    ]);
                } else {
                    // Create new record
                    StaffAttendance::create([
                        'staff_id' => $record['staff_id'],
                        'school_id' => Auth::user()->school_id,
                        'date' => $request->date,
                        'attendance_status' => $record['status'],
                        'clock_in_time' => $record['clock_in_time'],
                        'clock_out_time' => $record['clock_out_time'],
                        'remarks' => $record['remarks'],
                    ]);
                }
            }
        });

        return redirect()->route('hr.attendance.index')
            ->with('success', 'Attendance marked successfully.');
    }

    public function markIndividual(Request $request)
    {
        $request->validate([
            'staff_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'status' => 'required|in:present,absent,late,on_leave',
            'clock_in_time' => 'nullable|date_format:H:i',
            'clock_out_time' => 'nullable|date_format:H:i',
            'remarks' => 'nullable|string|max:500',
        ]);

        // Check if attendance already exists
        $existingAttendance = StaffAttendance::where('school_id', Auth::user()->school_id)
            ->where('staff_id', $request->staff_id)
            ->where('date', $request->date)
            ->first();

        if ($existingAttendance) {
            $existingAttendance->update([
                'attendance_status' => $request->status,
                'clock_in_time' => $request->clock_in_time,
                'clock_out_time' => $request->clock_out_time,
                'remarks' => $request->remarks,
            ]);
        } else {
            StaffAttendance::create([
                'staff_id' => $request->staff_id,
                'school_id' => Auth::user()->school_id,
                'date' => $request->date,
                'attendance_status' => $request->status,
                'clock_in_time' => $request->clock_in_time,
                'clock_out_time' => $request->clock_out_time,
                'remarks' => $request->remarks,
            ]);
        }

        return redirect()->back()
            ->with('success', 'Attendance marked successfully.');
    }

    public function clockIn(Request $request)
    {
        $request->validate([
            'staff_id' => 'required|exists:users,id',
            'clock_in_time' => 'nullable|date_format:H:i',
            'location' => 'nullable|string|max:255',
        ]);

        $today = now()->toDateString();
        $clockInTime = $request->clock_in_time ?? now()->format('H:i');

        // Check if already clocked in today
        $existingAttendance = StaffAttendance::where('school_id', Auth::user()->school_id)
            ->where('staff_id', $request->staff_id)
            ->where('date', $today)
            ->first();

        if ($existingAttendance && $existingAttendance->clock_in_time) {
            return redirect()->back()
                ->with('error', 'Already clocked in today.');
        }

        // Determine status based on clock-in time
        $workingHours = WorkingHours::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->first();

        $status = 'present';
        $dayName = strtolower(now()->format('l'));
        if ($workingHours && in_array($dayName, $workingHours->working_days ?? [])) {
            $expectedStartTime = Carbon::createFromFormat('H:i:s', $workingHours->start_time);
            $actualStartTime = Carbon::createFromFormat('H:i', $clockInTime);
            
            if ($actualStartTime->gt($expectedStartTime->addMinutes(15))) {
                $status = 'late';
            }
        }

        if ($existingAttendance) {
            $existingAttendance->update([
                'attendance_status' => $status,
                'clock_in_time' => $clockInTime,
                'clock_in_location' => $request->location,
            ]);
        } else {
            StaffAttendance::create([
                'staff_id' => $request->staff_id,
                'school_id' => Auth::user()->school_id,
                'date' => $today,
                'attendance_status' => $status,
                'clock_in_time' => $clockInTime,
                'clock_in_location' => $request->location,
            ]);
        }

        return redirect()->back()
            ->with('success', 'Clocked in successfully.');
    }

    public function clockOut(Request $request)
    {
        $request->validate([
            'staff_id' => 'required|exists:users,id',
            'clock_out_time' => 'nullable|date_format:H:i',
            'location' => 'nullable|string|max:255',
        ]);

        $today = now()->toDateString();
        $clockOutTime = $request->clock_out_time ?? now()->format('H:i');

        $attendance = StaffAttendance::where('school_id', Auth::user()->school_id)
            ->where('staff_id', $request->staff_id)
            ->where('date', $today)
            ->first();

        if (!$attendance) {
            return redirect()->back()
                ->with('error', 'No clock-in record found for today.');
        }

        if ($attendance->clock_out_time) {
            return redirect()->back()
                ->with('error', 'Already clocked out today.');
        }

        $attendance->update([
            'clock_out_time' => $clockOutTime,
            'clock_out_location' => $request->location,
        ]);

        return redirect()->back()
            ->with('success', 'Clocked out successfully.');
    }

    public function getAttendanceReport(Request $request)
    {
        $request->validate([
            'staff_id' => 'required|exists:users,id',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2030',
        ]);

        $startDate = Carbon::create($request->year, $request->month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        $attendance = StaffAttendance::where('school_id', Auth::user()->school_id)
            ->where('staff_id', $request->staff_id)
            ->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])
            ->orderBy('date')
            ->get();

        $workingDays = $this->getWorkingDaysInMonth($startDate, $endDate);
        $presentDays = $attendance->where('status', 'present')->count();
        $absentDays = $attendance->where('status', 'absent')->count();
        $lateDays = $attendance->where('status', 'late')->count();
        $leaveDays = $attendance->where('status', 'on_leave')->count();

        $report = [
            'staff' => User::with('staffProfile')->find($request->staff_id),
            'month' => $request->month,
            'year' => $request->year,
            'working_days' => $workingDays,
            'present_days' => $presentDays,
            'absent_days' => $absentDays,
            'late_days' => $lateDays,
            'leave_days' => $leaveDays,
            'attendance_rate' => $workingDays > 0 ? round(($presentDays / $workingDays) * 100, 2) : 0,
            'attendance_records' => $attendance,
        ];

        return response()->json($report);
    }

    public function getMonthlySummary(Request $request)
    {
        $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2030',
        ]);

        $startDate = Carbon::create($request->year, $request->month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        $attendance = StaffAttendance::with(['staff.staffProfile'])
            ->where('school_id', Auth::user()->school_id)
            ->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])
            ->get();

        $workingDays = $this->getWorkingDaysInMonth($startDate, $endDate);
        $totalStaff = User::where('school_id', Auth::user()->school_id)
            ->whereIn('role', ['teacher', 'headteacher', 'bursar', 'librarian', 'dormitory_manager', 'academic_master'])
            ->where('is_active', true)
            ->count();

        $summary = [
            'month' => $request->month,
            'year' => $request->year,
            'working_days' => $workingDays,
            'total_staff' => $totalStaff,
            'total_attendance_records' => $attendance->count(),
            'present_records' => $attendance->where('status', 'present')->count(),
            'absent_records' => $attendance->where('status', 'absent')->count(),
            'late_records' => $attendance->where('status', 'late')->count(),
            'leave_records' => $attendance->where('status', 'on_leave')->count(),
            'attendance_rate' => $totalStaff > 0 ? round(($attendance->where('status', 'present')->count() / ($totalStaff * $workingDays)) * 100, 2) : 0,
            'staff_breakdown' => $this->getStaffAttendanceBreakdown($attendance, $workingDays),
        ];

        return response()->json($summary);
    }

    public function getTodayAttendance()
    {
        $today = now()->toDateString();

        $attendance = StaffAttendance::with(['staff.staffProfile'])
            ->where('school_id', Auth::user()->school_id)
            ->where('date', $today)
            ->get();

        $totalStaff = User::where('school_id', Auth::user()->school_id)
            ->whereIn('role', ['teacher', 'headteacher', 'bursar', 'librarian', 'dormitory_manager', 'academic_master'])
            ->where('is_active', true)
            ->count();

        $markedStaff = $attendance->count();
        $unmarkedStaff = $totalStaff - $markedStaff;

        return response()->json([
            'date' => $today,
            'total_staff' => $totalStaff,
            'marked_staff' => $markedStaff,
            'unmarked_staff' => $unmarkedStaff,
            'present' => $attendance->where('status', 'present')->count(),
            'absent' => $attendance->where('status', 'absent')->count(),
            'late' => $attendance->where('status', 'late')->count(),
            'on_leave' => $attendance->where('status', 'on_leave')->count(),
            'attendance_records' => $attendance,
        ]);
    }

    public function getUnmarkedStaff(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
        ]);

        $markedStaffIds = StaffAttendance::where('school_id', Auth::user()->school_id)
            ->where('date', $request->date)
            ->pluck('staff_id');

        $unmarkedStaff = User::with('staffProfile')
            ->where('school_id', Auth::user()->school_id)
            ->whereIn('role', ['teacher', 'headteacher', 'bursar', 'librarian', 'dormitory_manager', 'academic_master'])
            ->where('is_active', true)
            ->whereNotIn('id', $markedStaffIds)
            ->orderBy('name')
            ->get();

        return response()->json($unmarkedStaff);
    }

    private function calculateMonthlyAttendanceRate($month)
    {
        $startDate = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        $workingDays = $this->getWorkingDaysInMonth($startDate, $endDate);
        $totalStaff = User::where('school_id', Auth::user()->school_id)
            ->whereIn('role', ['teacher', 'headteacher', 'bursar', 'librarian', 'dormitory_manager', 'academic_master'])
            ->where('is_active', true)
            ->count();

        $presentRecords = StaffAttendance::where('school_id', Auth::user()->school_id)
            ->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])
            ->where('attendance_status', 'present')
            ->count();

        return $totalStaff > 0 && $workingDays > 0 ? round(($presentRecords / ($totalStaff * $workingDays)) * 100, 2) : 0;
    }

    private function getWorkingDaysInMonth($startDate, $endDate)
    {
        $workingDays = 0;
        $currentDate = $startDate->copy();

        $workingHours = WorkingHours::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->first();

        while ($currentDate->lte($endDate)) {
            $dayName = strtolower($currentDate->format('l'));
            
            if ($workingHours) {
                if (in_array($dayName, $workingHours->working_days ?? [])) {
                    $workingDays++;
                }
            } else {
                if ($currentDate->isWeekday()) {
                    $workingDays++;
                }
            }

            $currentDate->addDay();
        }

        return $workingDays;
    }

    private function getStaffAttendanceBreakdown($attendance, $workingDays)
    {
        $staffBreakdown = [];

        foreach ($attendance->groupBy('staff_id') as $staffId => $staffAttendance) {
            $staff = $staffAttendance->first()->staff;
            $presentDays = $staffAttendance->where('status', 'present')->count();
            $attendanceRate = $workingDays > 0 ? round(($presentDays / $workingDays) * 100, 2) : 0;

            $staffBreakdown[] = [
                'staff_id' => $staffId,
                'staff_name' => $staff->first_name . ' ' . $staff->last_name,
                'employee_id' => $staff->staffProfile->employee_id ?? 'N/A',
                'present_days' => $presentDays,
                'absent_days' => $staffAttendance->where('status', 'absent')->count(),
                'late_days' => $staffAttendance->where('status', 'late')->count(),
                'leave_days' => $staffAttendance->where('status', 'on_leave')->count(),
                'attendance_rate' => $attendanceRate,
            ];
        }

        return collect($staffBreakdown)->sortByDesc('attendance_rate')->values();
    }
}



