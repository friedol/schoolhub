<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\StaffProfile;
use App\Models\StaffQualification;
use App\Models\StaffDocument;
use App\Models\SchoolClass;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class StaffController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['staffProfile', 'currentClass', 'subjects'])
            ->where('school_id', Auth::user()->school_id)
            ->whereIn('role', ['teacher', 'headteacher', 'bursar', 'librarian', 'dormitory_manager', 'academic_master']);

        // Apply filters
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('department')) {
            $query->whereHas('staffProfile', function ($q) use ($request) {
                $q->where('department', $request->department);
            });
        }

        if ($request->filled('employment_status')) {
            $query->whereHas('staffProfile', function ($q) use ($request) {
                $q->where('employment_status', $request->employment_status);
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('staffProfile', function ($profileQuery) use ($search) {
                      $profileQuery->where('employee_id', 'like', "%{$search}%")
                                  ->orWhere('tsc_number', 'like', "%{$search}%");
                  });
            });
        }

        $staff = $query->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        // Statistics
        $stats = [
            'total_staff' => User::where('school_id', Auth::user()->school_id)
                ->whereIn('role', ['teacher', 'headteacher', 'bursar', 'librarian', 'dormitory_manager', 'academic_master'])
                ->count(),
            'teaching_staff' => User::where('school_id', Auth::user()->school_id)
                ->whereIn('role', ['teacher', 'headteacher', 'academic_master'])
                ->count(),
            'non_teaching_staff' => User::where('school_id', Auth::user()->school_id)
                ->whereIn('role', ['bursar', 'librarian', 'dormitory_manager'])
                ->count(),
            'active_staff' => User::where('school_id', Auth::user()->school_id)
                ->whereIn('role', ['teacher', 'headteacher', 'bursar', 'librarian', 'dormitory_manager', 'academic_master'])
                ->where('is_active', true)
                ->count(),
        ];

        $departments = StaffProfile::where('school_id', Auth::user()->school_id)
            ->whereNotNull('department')
            ->distinct()
            ->pluck('department')
            ->map(function ($dept, $index) {
                return ['id' => $index + 1, 'name' => $dept];
            })
            ->toArray();

        return Inertia::render('HR/Staff/Index', [
            'staff' => $staff,
            'stats' => $stats,
            'departments' => $departments,
            'filters' => $request->only(['role', 'department', 'employment_status', 'search']),
        ]);
    }

    public function create()
    {
        $schoolClasses = SchoolClass::where('school_id', Auth::user()->school_id)
            ->orderBy('name')
            ->get();

        $subjects = Subject::where('school_id', Auth::user()->school_id)
            ->orderBy('name')
            ->get();

        return Inertia::render('HR/Staff/Create', [
            'schoolClasses' => $schoolClasses,
            'subjects' => $subjects,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:20',
            'role' => 'required|in:teacher,headteacher,bursar,librarian,dormitory_manager,academic_master',
            'date_of_birth' => 'required|date|before:today',
            'gender' => 'required|in:male,female',
            'address' => 'required|string|max:500',
            'employee_id' => 'required|string|max:50|unique:staff_profiles',
            'tsc_number' => 'nullable|string|max:50',
            'designation' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'date_of_joining' => 'required|date',
            'employment_status' => 'required|in:active,on_leave,terminated,resigned',
            'is_teaching_staff' => 'boolean',
            'current_class_id' => 'nullable|exists:school_classes,id',
            'subjects' => 'nullable|array',
            'subjects.*' => 'exists:subjects,id',
            'qualifications' => 'nullable|array',
            'qualifications.*.institution' => 'required_with:qualifications|string|max:255',
            'qualifications.*.year_of_completion' => 'required_with:qualifications|integer|min:1950|max:' . date('Y'),
            'qualifications.*.qualification_title' => 'required_with:qualifications|string|max:255',
            'qualifications.*.classification' => 'required_with:qualifications|string|max:100',
            'employment_history' => 'nullable|array',
            'employment_history.*.institution' => 'required_with:employment_history|string|max:255',
            'employment_history.*.position' => 'required_with:employment_history|string|max:255',
            'employment_history.*.start_date' => 'required_with:employment_history|date',
            'employment_history.*.end_date' => 'nullable|date|after:employment_history.*.start_date',
            'employment_history.*.responsibilities' => 'nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($request) {
            // Create user account
            $user = User::create([
                'name' => $request->first_name . ' ' . $request->last_name,
                'email' => $request->email,
                'phone' => $request->phone,
                'role' => $request->role,
                'school_id' => Auth::user()->school_id,
                'date_of_birth' => $request->date_of_birth,
                'gender' => $request->gender,
                'address' => $request->address,
                'password' => Hash::make('password123'), // Default password
                'is_active' => true,
            ]);

            // Create staff profile
            $staffProfile = StaffProfile::create([
                'user_id' => $user->id,
                'school_id' => Auth::user()->school_id,
                'employee_id' => $request->employee_id,
                'tsc_number' => $request->tsc_number,
                'designation' => $request->designation,
                'department' => $request->department,
                'date_of_joining' => $request->date_of_joining,
                'employment_status' => $request->employment_status,
                'is_teaching_staff' => $request->is_teaching_staff ?? false,
                'current_class_id' => $request->current_class_id,
                'qualifications' => $request->qualifications ?? [],
                'employment_history' => $request->employment_history ?? [],
            ]);

            // Assign subjects if teaching staff
            if ($request->is_teaching_staff && $request->subjects) {
                $user->subjects()->sync($request->subjects);
            }
        });

        return redirect()->route('hr.staff.index')
            ->with('success', 'Staff member created successfully.');
    }

    public function show(User $staff)
    {
        $this->authorize('view', $staff);

        $staff->load([
            'staffProfile',
            'currentClass',
            'subjects',
            'qualifications',
            'documents',
            'salaryStructure',
            'payrollRecords' => function ($query) {
                $query->orderBy('created_at', 'desc')->limit(12);
            },
            'leaveApplications' => function ($query) {
                $query->orderBy('created_at', 'desc')->limit(10);
            },
            'performanceAppraisals' => function ($query) {
                $query->orderBy('appraisal_date', 'desc')->limit(5);
            },
            'staffAttendance' => function ($query) {
                $query->orderBy('date', 'desc')->limit(30);
            }
        ]);

        return Inertia::render('HR/Staff/Show', [
            'staff' => $staff,
        ]);
    }

    public function edit(User $staff)
    {
        $this->authorize('update', $staff);

        $staff->load(['staffProfile', 'subjects']);

        $schoolClasses = SchoolClass::where('school_id', Auth::user()->school_id)
            ->orderBy('name')
            ->get();

        $subjects = Subject::where('school_id', Auth::user()->school_id)
            ->orderBy('name')
            ->get();

        return Inertia::render('HR/Staff/Edit', [
            'staff' => $staff,
            'schoolClasses' => $schoolClasses,
            'subjects' => $subjects,
        ]);
    }

    public function update(Request $request, User $staff)
    {
        $this->authorize('update', $staff);

        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($staff->id)],
            'phone' => 'required|string|max:20',
            'role' => 'required|in:teacher,headteacher,bursar,librarian,dormitory_manager,academic_master',
            'date_of_birth' => 'required|date|before:today',
            'gender' => 'required|in:male,female',
            'address' => 'required|string|max:500',
            'employee_id' => ['required', 'string', 'max:50', Rule::unique('staff_profiles')->ignore($staff->staffProfile->id ?? null)],
            'tsc_number' => 'nullable|string|max:50',
            'designation' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'date_of_joining' => 'required|date',
            'employment_status' => 'required|in:active,on_leave,terminated,resigned',
            'is_teaching_staff' => 'boolean',
            'current_class_id' => 'nullable|exists:school_classes,id',
            'subjects' => 'nullable|array',
            'subjects.*' => 'exists:subjects,id',
            'qualifications' => 'nullable|array',
            'qualifications.*.institution' => 'required_with:qualifications|string|max:255',
            'qualifications.*.year_of_completion' => 'required_with:qualifications|integer|min:1950|max:' . date('Y'),
            'qualifications.*.qualification_title' => 'required_with:qualifications|string|max:255',
            'qualifications.*.classification' => 'required_with:qualifications|string|max:100',
            'employment_history' => 'nullable|array',
            'employment_history.*.institution' => 'required_with:employment_history|string|max:255',
            'employment_history.*.position' => 'required_with:employment_history|string|max:255',
            'employment_history.*.start_date' => 'required_with:employment_history|date',
            'employment_history.*.end_date' => 'nullable|date|after:employment_history.*.start_date',
            'employment_history.*.responsibilities' => 'nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($request, $staff) {
            // Update user
            $staff->update([
                'name' => $request->first_name . ' ' . $request->last_name,
                'email' => $request->email,
                'phone' => $request->phone,
                'role' => $request->role,
                'date_of_birth' => $request->date_of_birth,
                'gender' => $request->gender,
                'address' => $request->address,
            ]);

            // Update or create staff profile
            if ($staff->staffProfile) {
                $staff->staffProfile->update([
                    'employee_id' => $request->employee_id,
                    'tsc_number' => $request->tsc_number,
                    'designation' => $request->designation,
                    'department' => $request->department,
                    'date_of_joining' => $request->date_of_joining,
                    'employment_status' => $request->employment_status,
                    'is_teaching_staff' => $request->is_teaching_staff ?? false,
                    'current_class_id' => $request->current_class_id,
                    'qualifications' => $request->qualifications ?? [],
                    'employment_history' => $request->employment_history ?? [],
                ]);
            } else {
                StaffProfile::create([
                    'user_id' => $staff->id,
                    'school_id' => Auth::user()->school_id,
                    'employee_id' => $request->employee_id,
                    'tsc_number' => $request->tsc_number,
                    'designation' => $request->designation,
                    'department' => $request->department,
                    'date_of_joining' => $request->date_of_joining,
                    'employment_status' => $request->employment_status,
                    'is_teaching_staff' => $request->is_teaching_staff ?? false,
                    'current_class_id' => $request->current_class_id,
                    'qualifications' => $request->qualifications ?? [],
                    'employment_history' => $request->employment_history ?? [],
                ]);
            }

            // Update subjects if teaching staff
            if ($request->is_teaching_staff && $request->subjects) {
                $staff->subjects()->sync($request->subjects);
            } else {
                $staff->subjects()->detach();
            }
        });

        return redirect()->route('hr.staff.index')
            ->with('success', 'Staff member updated successfully.');
    }

    public function destroy(User $staff)
    {
        $this->authorize('delete', $staff);

        // Check if staff has any related records
        if ($staff->payrollRecords()->exists() || $staff->leaveApplications()->exists()) {
            return redirect()->back()
                ->with('error', 'Cannot delete staff member with existing payroll or leave records.');
        }

        $staff->delete();

        return redirect()->route('hr.staff.index')
            ->with('success', 'Staff member deleted successfully.');
    }

    public function toggleStatus(User $staff)
    {
        $this->authorize('update', $staff);

        $staff->update([
            'is_active' => !$staff->is_active,
        ]);

        $status = $staff->is_active ? 'activated' : 'deactivated';

        return redirect()->back()
            ->with('success', "Staff member {$status} successfully.");
    }

    public function uploadDocument(Request $request, User $staff)
    {
        $this->authorize('update', $staff);

        $request->validate([
            'document_type' => 'required|string|max:100',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240',
            'expiry_date' => 'nullable|date|after:today',
        ]);

        $file = $request->file('file');
        $fileName = time() . '_' . $file->getClientOriginalName();
        $filePath = $file->storeAs('staff_documents', $fileName, 'public');

        StaffDocument::create([
            'staff_id' => $staff->id,
            'school_id' => Auth::user()->school_id,
            'document_type' => $request->document_type,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $filePath,
            'expiry_date' => $request->expiry_date,
            'uploaded_by' => Auth::id(),
        ]);

        return redirect()->back()
            ->with('success', 'Document uploaded successfully.');
    }

    public function downloadDocument(StaffDocument $document)
    {
        $this->authorize('view', $document->staff);

        if (!Storage::disk('public')->exists($document->file_path)) {
            return redirect()->back()
                ->with('error', 'Document file not found.');
        }

        return Storage::disk('public')->download($document->file_path, $document->file_name);
    }

    public function deleteDocument(StaffDocument $document)
    {
        $this->authorize('update', $document->staff);

        Storage::disk('public')->delete($document->file_path);
        $document->delete();

        return redirect()->back()
            ->with('success', 'Document deleted successfully.');
    }

    public function resetPassword(User $staff)
    {
        $this->authorize('update', $staff);

        $staff->update([
            'password' => Hash::make('password123'),
        ]);

        return redirect()->back()
            ->with('success', 'Password reset successfully. New password: password123');
    }

    public function getStaffByDepartment(Request $request)
    {
        $request->validate([
            'department' => 'required|string',
        ]);

        $staff = User::with(['staffProfile'])
            ->where('school_id', Auth::user()->school_id)
            ->whereHas('staffProfile', function ($query) use ($request) {
                $query->where('department', $request->department);
            })
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json($staff);
    }

    public function getTeachingStaff()
    {
        $staff = User::with(['staffProfile', 'subjects'])
            ->where('school_id', Auth::user()->school_id)
            ->whereHas('staffProfile', function ($query) {
                $query->where('is_teaching_staff', true);
            })
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json($staff);
    }
}
