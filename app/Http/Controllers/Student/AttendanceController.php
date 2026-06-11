<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\User;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    /**
     * Display the Attendance Dashboard with filterable records
     */
    public function index(Request $request)
    {
        $schoolId = Auth::user()->school_id;

        $classes = SchoolClass::where('school_id', $schoolId)
            ->where('is_active', true)
            ->orderBy('level')
            ->orderBy('name')
            ->get(['id', 'name', 'level']);

        $classId = ($request->input('class_id') && $request->input('class_id') !== 'all')
            ? $request->input('class_id')
            : null;
        $date   = $request->input('date', date('Y-m-d'));
        $status = ($request->input('status') && $request->input('status') !== 'all')
            ? $request->input('status')
            : null;

        $query = Attendance::where('school_id', $schoolId)
            ->whereDate('date', $date)
            ->with(['user.studentProfile.schoolClass', 'markedBy']);

        if ($classId) {
            $query->where('class_id', $classId);
        }
        if ($status) {
            $query->where('status', $status);
        }

        $records = $query->orderBy('created_at', 'asc')->get()->map(function ($att) {
            return [
                'id'               => $att->id,
                'student_id'       => $att->user_id,
                'student_name'     => $att->user->name ?? 'Unknown',
                'admission_number' => $att->user->studentProfile->admission_number ?? 'N/A',
                'class_name'       => $att->user->studentProfile->schoolClass->name ?? 'N/A',
                'date'             => $att->date->format('Y-m-d'),
                'status'           => $att->status,
                'notes'            => $att->notes,
                'marked_by'        => $att->markedBy->name ?? 'System',
            ];
        });

        // Stats across whole day (ignore status filter for cards)
        $allToday = Attendance::where('school_id', $schoolId)->whereDate('date', $date);
        if ($classId) {
            $allToday->where('class_id', $classId);
        }
        $allTodayRows = $allToday->get();

        $stats = [
            'total'      => $allTodayRows->count(),
            'present'    => $allTodayRows->where('status', 'present')->count(),
            'absent'     => $allTodayRows->where('status', 'absent')->count(),
            'late'       => $allTodayRows->where('status', 'late')->count(),
            'excused'    => $allTodayRows->whereIn('status', ['excused', 'sick', 'leave'])->count(),
            'percentage' => $allTodayRows->count() > 0
                ? round($allTodayRows->whereIn('status', ['present', 'late'])->count() / $allTodayRows->count() * 100, 1)
                : 0,
        ];

        return Inertia::render('Academic/Attendance/Dashboard', [
            'classes' => $classes,
            'records' => $records,
            'stats'   => $stats,
            'filters' => [
                'class_id' => $classId ?? '',
                'date'     => $date,
                'status'   => $status ?? '',
            ],
        ]);
    }

    /**
     * Export filtered attendance as CSV (Excel-compatible)
     */
    public function export(Request $request)
    {
        $schoolId = Auth::user()->school_id;

        $classId = ($request->input('class_id') && $request->input('class_id') !== 'all')
            ? $request->input('class_id')
            : null;
        $date   = $request->input('date', date('Y-m-d'));
        $status = ($request->input('status') && $request->input('status') !== 'all')
            ? $request->input('status')
            : null;

        $query = Attendance::where('school_id', $schoolId)
            ->whereDate('date', $date)
            ->with(['user.studentProfile.schoolClass', 'markedBy']);

        if ($classId) {
            $query->where('class_id', $classId);
        }
        if ($status) {
            $query->where('status', $status);
        }

        $rows = $query->orderBy('created_at', 'asc')->get();

        $filename = 'attendance_' . $date . ($classId ? '_class' . $classId : '') . '.csv';

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Pragma'              => 'no-cache',
            'Cache-Control'       => 'must-revalidate',
        ];

        $callback = function () use ($rows) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['#', 'Admission No', 'Student Name', 'Class', 'Date', 'Status', 'Notes', 'Marked By']);
            $i = 1;
            foreach ($rows as $att) {
                fputcsv($file, [
                    $i++,
                    $att->user->studentProfile->admission_number ?? 'N/A',
                    $att->user->name ?? 'Unknown',
                    $att->user->studentProfile->schoolClass->name ?? 'N/A',
                    $att->date->format('Y-m-d'),
                    ucfirst($att->status),
                    $att->notes ?? '',
                    $att->markedBy->name ?? 'System',
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Display daily attendance management page
     */
    public function mark(Request $request)
    {
        $schoolId = Auth::user()->school_id;

        $classes = SchoolClass::where('school_id', $schoolId)
            ->where('is_active', true)
            ->get()
            ->map(function ($cls) {
                return [
                    'id' => $cls->id,
                    'name' => $cls->name,
                    'level' => $cls->level,
                    'students_count' => User::where('school_id', Auth::user()->school_id)
                        ->where('role', 'student')
                        ->whereHas('studentProfile', function ($q) use ($cls) {
                            $q->where('class_id', $cls->id);
                        })->count()
                ];
            });

        $selectedClassId = $request->input('class_id') ? (int) $request->input('class_id') : ($classes->first()->id ?? 0);
        $selectedDate = $request->input('date') ?? date('Y-m-d');

        $students = [];
        $attendances = [];

        if ($selectedClassId > 0) {
            $students = User::where('school_id', $schoolId)
                ->where('role', 'student')
                ->where('is_active', true)
                ->whereHas('studentProfile', function ($query) use ($selectedClassId) {
                    $query->where('class_id', $selectedClassId);
                })
                ->orderBy('name', 'asc')
                ->get()
                ->map(function ($student) {
                    return [
                        'id' => $student->id,
                        'name' => $student->name,
                        'student_number' => $student->student_number ?? 'N/A',
                        'profile_photo' => $student->profile_photo ? asset('storage/' . $student->profile_photo) : null,
                    ];
                });

            $dbAttendances = Attendance::where('school_id', $schoolId)
                ->where('class_id', $selectedClassId)
                ->whereDate('date', $selectedDate)
                ->get();

            $attendances = $dbAttendances->map(function ($att) {
                return [
                    'id' => $att->id,
                    'student_id' => $att->user_id,
                    'date' => $att->date->format('Y-m-d'),
                    'status' => $att->status,
                    'remarks' => $att->notes ?? '',
                ];
            });
        }

        return Inertia::render('Academic/Attendance/Mark', [
            'classes' => $classes,
            'students' => $students,
            'attendances' => $attendances,
            'selectedClass' => $selectedClassId,
            'selectedDate' => $selectedDate,
        ]);
    }

    /**
     * Store daily attendance records
     */
    public function store(Request $request)
    {
        $request->validate([
            'class_id' => 'required|exists:school_classes,id',
            'date' => 'required|date',
            'attendances' => 'required|array',
            'attendances.*.student_id' => 'required|exists:users,id',
            'attendances.*.status' => 'required|in:present,absent,late,excused,sick,leave',
            'attendances.*.remarks' => 'nullable|string|max:500',
        ]);

        $schoolId = Auth::user()->school_id;
        $markedBy = Auth::id();

        foreach ($request->attendances as $record) {
            Attendance::updateOrCreate(
                [
                    'school_id' => $schoolId,
                    'user_id' => $record['student_id'],
                    'class_id' => $request->class_id,
                    'date' => $request->date,
                ],
                [
                    'status' => $record['status'],
                    'notes' => $record['remarks'] ?? null,
                    'marked_by' => $markedBy,
                    'is_late' => $record['status'] === 'late',
                ]
            );
        }

        return redirect()->back()->with('success', 'Daily attendance marked successfully.');
    }

    /**
     * View class attendance reports
     */
    public function classReport()
    {
        return Inertia::render('Academic/Attendance/ClassReport');
    }

    /**
     * View individual student attendance profile
     */
    public function studentProfile(int $id)
    {
        return Inertia::render('Academic/Attendance/StudentProfile', [
            'studentId' => $id
        ]);
    }

    /**
     * View advanced analytics and reports
     */
    public function reports()
    {
        return Inertia::render('Academic/Attendance/Reports');
    }
}
