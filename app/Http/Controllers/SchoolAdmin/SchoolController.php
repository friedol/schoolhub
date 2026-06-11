<?php

namespace App\Http\Controllers\SchoolAdmin;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\User;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\AcademicTerm;
use App\Models\FeeCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SchoolController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('role:school_admin,headteacher,bursar');
    }

    /**
     * Display the school admin dashboard
     */
    public function dashboard(): Response
    {
        $user = Auth::user();
        
        // Get school from multi-tenant context or user's school
        $school = User::getCurrentSchool() ?? $user->school;
        
        $schoolId = $school ? $school->id : ($user->school_id ?? 1);

        // 1. Stats for Top Cards
        $studentStats = [
            'active' => \App\Models\User::where('school_id', $schoolId)->where('role', 'student')->where('is_active', true)->count(),
            'inactive' => \App\Models\User::where('school_id', $schoolId)->where('role', 'student')->where('is_active', false)->count(),
        ];
        $studentStats['total'] = $studentStats['active'] + $studentStats['inactive'];

        $teacherStats = [
            'active' => \App\Models\User::where('school_id', $schoolId)->where('role', 'teacher')->where('is_active', true)->count(),
            'inactive' => \App\Models\User::where('school_id', $schoolId)->where('role', 'teacher')->where('is_active', false)->count(),
        ];
        $teacherStats['total'] = $teacherStats['active'] + $teacherStats['inactive'];

        $staffRoles = ['school_admin', 'headteacher', 'bursar', 'librarian', 'dormitory_manager'];
        $staffStats = [
            'active' => \App\Models\User::where('school_id', $schoolId)->whereIn('role', $staffRoles)->where('is_active', true)->count(),
            'inactive' => \App\Models\User::where('school_id', $schoolId)->whereIn('role', $staffRoles)->where('is_active', false)->count(),
        ];
        $staffStats['total'] = $staffStats['active'] + $staffStats['inactive'];

        $subjectStats = [
            'active' => \App\Models\Subject::where('school_id', $schoolId)->where('is_active', true)->count(),
            'inactive' => \App\Models\Subject::where('school_id', $schoolId)->where('is_active', false)->count(),
        ];
        $subjectStats['total'] = $subjectStats['active'] + $subjectStats['inactive'];

        // 2. Fees Collection - Group student fees by category, sum amount and paid_amount
        $feesCollection = \App\Models\StudentFee::where('school_id', $schoolId)
            ->with('feeCategory')
            ->get()
            ->groupBy('fee_category_id')
            ->take(8)
            ->map(function ($group) {
                $first = $group->first();
                $name = $first && $first->feeCategory ? $first->feeCategory->name : 'Other Fee';
                return [
                    'name' => $name,
                    'total' => (float) $group->sum('amount'),
                    'collected' => (float) $group->sum('paid_amount'),
                ];
            })
            ->values();

        // 3. Leave Requests (Recent)
        $leaveRequests = \App\Models\LeaveApplication::with('staff')
            ->whereHas('staff', function($q) use ($schoolId) {
                $q->where('school_id', $schoolId);
            })
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get()
            ->map(function ($leave) {
                return [
                    'id' => $leave->id,
                    'name' => $leave->staff ? $leave->staff->name : 'Unknown Staff',
                    'role' => $leave->staff ? ucfirst(str_replace('_', ' ', $leave->staff->role)) : '',
                    'type' => $leave->leaveType ? $leave->leaveType->name : 'General Leave',
                    'start_date' => $leave->start_date ? $leave->start_date->format('d M') : '',
                    'end_date' => $leave->end_date ? $leave->end_date->format('d M') : '',
                    'applied_on' => $leave->created_at->format('d M'),
                    'status' => strtolower($leave->status),
                ];
            })
            ->toArray();

        // 4. Attendance Today
        $today = now()->format('Y-m-d');
        $attendanceRecords = \App\Models\Attendance::where('date', $today)
            ->whereHas('student', function($q) use ($schoolId) {
                $q->where('school_id', $schoolId);
            })->get();
            
        $present = $attendanceRecords->where('status', 'present')->count();
        $absent = $attendanceRecords->where('status', 'absent')->count();
        $late = $attendanceRecords->where('status', 'late')->count();
        $excused = $attendanceRecords->where('status', 'excused')->count();

        $attendanceStats = [
            'present' => $present,
            'absent' => $absent,
            'late' => $late,
            'excused' => $excused,
        ];

        // 5. Schedules / Upcoming Events
        $upcomingEvents = \App\Models\Event::where('school_id', $schoolId)
            ->where('start_date', '>=', now())
            ->orderBy('start_date', 'asc')
            ->take(3)
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'date' => $event->start_date ? $event->start_date->format('d F Y') : '',
                    'type' => $event->type ?? 'Event',
                ];
            })
            ->toArray();

        // 6. Class Routine (Based on capacity utilization of active classes)
        $classRoutine = \App\Models\SchoolClass::where('school_id', $schoolId)
            ->where('is_active', true)
            ->take(2)
            ->get()
            ->map(function ($class) {
                $studentCount = $class->students()->count();
                $capacity = $class->capacity > 0 ? $class->capacity : 40;
                $progress = round(($studentCount / $capacity) * 100);
                return [
                    'id' => $class->id,
                    'month' => $class->full_name ?? $class->name,
                    'progress' => $progress > 0 ? min($progress, 100) : 0,
                ];
            })
            ->values()
            ->toArray();

        return Inertia::render('SchoolAdmin/Dashboard', [
            'school' => $school,
            'stats' => [
                'students' => $studentStats,
                'teachers' => $teacherStats,
                'staff' => $staffStats,
                'subjects' => $subjectStats,
            ],
            'statistics' => [
                'total_students' => $studentStats['total'],
                'total_teachers' => $teacherStats['total'],
                'total_staff' => $staffStats['total'],
                'total_subjects' => $subjectStats['total'],
            ],
            'feesCollection' => $feesCollection,
            'leaveRequests' => $leaveRequests,
            'attendanceStats' => $attendanceStats,
            'upcomingEvents' => $upcomingEvents,
            'classRoutine' => $classRoutine,
            'user' => $user,
            'currentSchool' => $school,
        ]);
    }

    /**
     * Display all students
     */
    public function students(Request $request): Response
    {
        $user = Auth::user();
        $school = $user->school;

        $query = $school->students()->with(['class', 'parent']);

        // Apply filters
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('student_number', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        if ($request->filled('gender')) {
            $query->where('gender', $request->gender);
        }

        $students = $query->latest()->paginate(15);

        // Get classes for filter
        $classes = $school->classes()->where('is_active', true)->get();

        return Inertia::render('SchoolAdmin/Students/Index', [
            'students' => $students,
            'classes' => $classes,
            'filters' => $request->only(['search', 'class_id', 'gender']),
        ]);
    }

    /**
     * Show the form for creating a new student
     */
    public function createStudent(): Response
    {
        $user = Auth::user();
        $school = $user->school;

        $classes = $school->classes()->where('is_active', true)->get();
        $parents = $school->parents()->get();

        return Inertia::render('SchoolAdmin/Students/Create', [
            'classes' => $classes,
            'parents' => $parents,
        ]);
    }

    /**
     * Store a newly created student
     */
    public function storeStudent(Request $request)
    {
        $user = Auth::user();
        $school = $user->school;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'address' => 'required|string',
            'class_id' => 'nullable|exists:school_classes,id',
            'parent_id' => 'nullable|exists:users,id',
            'student_number' => 'nullable|string|max:50',
        ]);

        // Generate student number if not provided
        if (empty($validated['student_number'])) {
            $lastStudent = $school->students()->latest()->first();
            $nextNumber = $lastStudent ? (intval($lastStudent->student_number) + 1) : 1;
            $validated['student_number'] = str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
        }

        $student = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make(Str::random(12)), // Temporary password
            'role' => 'student',
            'school_id' => $school->id,
            'platform_id' => $school->platform_id,
            'student_number' => $validated['student_number'] ?? null,
            'parent_id' => $validated['parent_id'] ?? null,
            'date_of_birth' => $validated['date_of_birth'],
            'gender' => $validated['gender'],
            'address' => $validated['address'],
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        return redirect()->route('school-admin.students')
            ->with('success', "Student '{$student->name}' has been registered successfully.");
    }

    /**
     * Display all teachers
     */
    public function teachers(Request $request): Response
    {
        $user = Auth::user();
        $school = $user->school;

        $query = $school->teachers()->with(['assignedClass']);

        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('phone', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('gender')) {
            $query->where('gender', $request->gender);
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $teachers = $query->latest()->paginate(20);
        $classes  = $school->classes()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'level', 'stream']);

        return Inertia::render('SchoolAdmin/Teachers/Index', [
            'teachers' => $teachers,
            'classes'  => $classes,
            'filters'  => $request->only(['search', 'gender', 'status']),
        ]);
    }

    /**
     * Show a single teacher
     */
    public function showTeacher(User $teacher): Response
    {
        $teacher->load(['assignedClass', 'qualifications']);

        return Inertia::render('SchoolAdmin/Teachers/Show', [
            'teacher' => $teacher,
        ]);
    }

    /**
     * Update an existing teacher
     */
    public function updateTeacher(Request $request, User $teacher)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|email|max:255|unique:users,email,' . $teacher->id,
            'phone'         => 'required|string|max:20',
            'date_of_birth' => 'required|date',
            'gender'        => 'required|in:male,female,other',
            'address'       => 'required|string',
            'class_id'      => 'nullable|exists:school_classes,id',
            'is_active'     => 'boolean',
            'position'      => 'nullable|string|max:100',
            'subject'       => 'nullable|string|max:100',
            'working_hour'  => 'nullable|in:Full time,Part time',
        ]);

        $settings = $teacher->settings ?? [];
        $settings['position']     = $validated['position'] ?? null;
        $settings['subject']      = $validated['subject'] ?? null;
        $settings['working_hour'] = $validated['working_hour'] ?? null;

        $teacher->update([
            'name'          => $validated['name'],
            'email'         => $validated['email'],
            'phone'         => $validated['phone'],
            'date_of_birth' => $validated['date_of_birth'],
            'gender'        => $validated['gender'],
            'address'       => $validated['address'],
            'is_active'     => $validated['is_active'] ?? $teacher->is_active,
            'settings'      => $settings,
        ]);

        // Reassign class teacher
        if ($teacher->assignedClass) {
            $teacher->assignedClass->update(['class_teacher_id' => null]);
        }
        if (!empty($validated['class_id'])) {
            SchoolClass::find($validated['class_id'])->update(['class_teacher_id' => $teacher->id]);
        }

        return redirect()->route('school-admin.teachers')
            ->with('success', "Teacher '{$teacher->name}' updated successfully.");
    }

    /**
     * Delete a teacher
     */
    public function destroyTeacher(User $teacher)
    {
        $name = $teacher->name;

        // Unassign from class
        if ($teacher->assignedClass) {
            $teacher->assignedClass->update(['class_teacher_id' => null]);
        }

        $teacher->delete();

        return redirect()->route('school-admin.teachers')
            ->with('success', "Teacher '{$name}' has been deleted.");
    }

    /**
     * Show the form for creating a new teacher
     */
    public function createTeacher(): Response
    {
        $user = Auth::user();
        $school = $user->school;

        $classes = $school->classes()->where('is_active', true)->get();

        return Inertia::render('SchoolAdmin/Teachers/Create', [
            'classes' => $classes,
        ]);
    }

    /**
     * Store a newly created teacher
     */
    public function storeTeacher(Request $request)
    {
        $user = Auth::user();
        $school = $user->school;

        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|email|max:255|unique:users,email',
            'phone'         => 'required|string|max:20',
            'date_of_birth' => 'required|date',
            'gender'        => 'required|in:male,female,other',
            'address'       => 'required|string',
            'class_id'      => 'nullable|exists:school_classes,id',
            'position'      => 'nullable|string|max:100',
            'subject'       => 'nullable|string|max:100',
            'working_hour'  => 'nullable|in:Full time,Part time',
        ]);

        $teacher = User::create([
            'name'             => $validated['name'],
            'email'            => $validated['email'],
            'phone'            => $validated['phone'],
            'password'         => Hash::make(Str::random(12)),
            'role'             => 'teacher',
            'school_id'        => $school->id,
            'platform_id'      => $school->platform_id,
            'date_of_birth'    => $validated['date_of_birth'],
            'gender'           => $validated['gender'],
            'address'          => $validated['address'],
            'is_active'        => true,
            'email_verified_at'=> now(),
            'settings'         => [
                'position'     => $validated['position'] ?? null,
                'subject'      => $validated['subject'] ?? null,
                'working_hour' => $validated['working_hour'] ?? null,
            ],
        ]);

        // Assign as class teacher if specified
        if (!empty($validated['class_id'])) {
            SchoolClass::find($validated['class_id'])->update([
                'class_teacher_id' => $teacher->id
            ]);
        }

        return redirect()->route('school-admin.teachers')
            ->with('success', "Teacher '{$teacher->name}' has been registered successfully.");
    }

    /**
     * Display all classes
     */
    public function classes(): Response
    {
        $user = Auth::user();
        $school = $user->school;

        $classes = $school->classes()
            ->with(['classTeacher', 'students'])
            ->withCount('students')
            ->latest()
            ->get();

        return Inertia::render('SchoolAdmin/Classes/Index', [
            'classes' => $classes,
        ]);
    }

    /**
     * Show the form for creating a new class
     */
    public function createClass(): Response
    {
        $user = Auth::user();
        $school = $user->school;

        $teachers = $school->teachers()->get();

        return Inertia::render('SchoolAdmin/Classes/Create', [
            'teachers' => $teachers,
        ]);
    }

    /**
     * Store a newly created class
     */
    public function storeClass(Request $request)
    {
        $user = Auth::user();
        $school = $user->school;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50',
            'level' => 'required|string|max:50',
            'stream' => 'nullable|string|max:50',
            'capacity' => 'required|integer|min:1|max:100',
            'class_teacher_id' => 'nullable|exists:users,id',
            'academic_year' => 'required|string|max:10',
        ]);

        $class = $school->classes()->create([
            'name' => $validated['name'],
            'code' => $validated['code'],
            'level' => $validated['level'],
            'stream' => $validated['stream'] ?? null,
            'capacity' => $validated['capacity'],
            'class_teacher_id' => $validated['class_teacher_id'] ?? null,
            'academic_year' => $validated['academic_year'],
            'is_active' => true,
        ]);

        return redirect()->route('school-admin.classes')
            ->with('success', "Class '{$class->name}' has been created successfully.");
    }

    /**
     * Display all subjects
     */
    public function subjects(): Response
    {
        $user = Auth::user();
        $school = $user->school;

        $subjects = $school->subjects()
            ->where('is_active', true)
            ->latest()
            ->get();

        return Inertia::render('SchoolAdmin/Subjects/Index', [
            'subjects' => $subjects,
        ]);
    }

    /**
     * Show the form for creating a new subject
     */
    public function createSubject(): Response
    {
        return Inertia::render('SchoolAdmin/Subjects/Create');
    }

    /**
     * Store a newly created subject
     */
    public function storeSubject(Request $request)
    {
        $user = Auth::user();
        $school = $user->school;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50',
            'description' => 'nullable|string',
            'category' => 'required|string|max:100',
            'is_core' => 'boolean',
            'is_elective' => 'boolean',
            'is_necta_subject' => 'boolean',
            'credits' => 'nullable|integer|min:1',
        ]);

        $subject = $school->subjects()->create([
            'name' => $validated['name'],
            'code' => $validated['code'],
            'description' => $validated['description'] ?? null,
            'category' => $validated['category'],
            'is_core' => $validated['is_core'] ?? false,
            'is_elective' => $validated['is_elective'] ?? false,
            'is_necta_subject' => $validated['is_necta_subject'] ?? false,
            'credits' => $validated['credits'] ?? null,
            'is_active' => true,
        ]);

        return redirect()->route('school-admin.subjects')
            ->with('success', "Subject '{$subject->name}' has been created successfully.");
    }

    /**
     * Display all fee categories
     */
    public function feeCategories(): Response
    {
        $user = Auth::user();
        $school = $user->school;

        $feeCategories = $school->feeCategories()
            ->where('is_active', true)
            ->latest()
            ->get();

        return Inertia::render('SchoolAdmin/Fees/Index', [
            'feeCategories' => $feeCategories,
        ]);
    }

    /**
     * Show the form for creating a new fee category
     */
    public function createFeeCategory(): Response
    {
        return Inertia::render('SchoolAdmin/Fees/Create');
    }

    /**
     * Store a newly created fee category
     */
    public function storeFeeCategory(Request $request)
    {
        $user = Auth::user();
        $school = $user->school;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|string|max:3',
            'payment_frequency' => 'required|in:once,monthly,termly,yearly,semester',
            'due_date' => 'required|date',
            'is_mandatory' => 'boolean',
        ]);

        $feeCategory = $school->feeCategories()->create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'amount' => $validated['amount'],
            'currency' => $validated['currency'] ?? 'TZS',
            'payment_frequency' => $validated['payment_frequency'],
            'due_date' => $validated['due_date'],
            'is_mandatory' => $validated['is_mandatory'] ?? false,
            'is_active' => true,
        ]);

        return redirect()->route('school-admin.fee-categories')
            ->with('success', "Fee category '{$feeCategory->name}' has been created successfully.");
    }

    /**
     * Display school settings
     */
    public function settings(): Response
    {
        $user = Auth::user();
        $school = $user->school;

        return Inertia::render('SchoolAdmin/Settings', [
            'school' => $school,
        ]);
    }

    /**
     * Update school settings
     */
    public function updateSettings(Request $request)
    {
        $user = Auth::user();
        $school = $user->school;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'motto' => 'nullable|string|max:255',
            'contact_email' => 'required|email|max:255',
            'contact_phone' => 'required|string|max:20',
            'address' => 'required|string',
            'region' => 'required|string|max:255',
            'district' => 'required|string|max:255',
            'ward' => 'nullable|string|max:255',
            'registration_number' => 'nullable|string|max:255',
            'necta_number' => 'nullable|string|max:255',
        ]);

        $school->update($validated);

        return redirect()->back()
            ->with('success', 'School settings updated successfully.');
    }
}
