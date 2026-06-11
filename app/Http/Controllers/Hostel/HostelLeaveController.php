<?php

namespace App\Http\Controllers\Hostel;

use App\Http\Controllers\Controller;
use App\Models\HostelLeaveApplication;
use App\Models\HostelAllocation;
use App\Models\Hostel;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class HostelLeaveController extends Controller
{
    public function index(Request $request)
    {
        $query = HostelLeaveApplication::with(['allocation', 'student', 'hostel', 'approvedBy', 'verifiedBy'])
            ->whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            });

        // Apply filters
        if ($request->filled('hostel_id')) {
            $query->where('hostel_id', $request->hostel_id);
        }

        if ($request->filled('leave_type')) {
            $query->where('leave_type', $request->leave_type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->where('departure_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('departure_date', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('student_number', 'like', "%{$search}%");
            });
        }

        $leaveApplications = $query->orderBy('departure_date', 'desc')
            ->paginate(15)
            ->withQueryString();

        $hostels = Hostel::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Statistics
        $stats = [
            'total_applications' => HostelLeaveApplication::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->count(),
            'pending_applications' => HostelLeaveApplication::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->where('status', 'pending')->count(),
            'approved_applications' => HostelLeaveApplication::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->where('status', 'approved')->count(),
            'rejected_applications' => HostelLeaveApplication::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->where('status', 'rejected')->count(),
        ];

        return Inertia::render('Hostel/Leave/Index', [
            'leaveApplications' => $leaveApplications,
            'hostels' => $hostels,
            'stats' => $stats,
            'typeOptions' => HostelLeaveApplication::TYPE_OPTIONS,
            'filters' => $request->only(['hostel_id', 'leave_type', 'status', 'date_from', 'date_to', 'search']),
        ]);
    }

    public function create()
    {
        $hostels = Hostel::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $students = User::where('school_id', Auth::user()->school_id)
            ->where('role', 'student')
            ->where('is_active', true)
            ->whereHas('hostelAllocations', function ($q) {
                $q->where('is_active', true);
            })
            ->orderBy('name')
            ->get();

        return Inertia::render('Hostel/Leave/Create', [
            'hostels' => $hostels,
            'students' => $students,
            'typeOptions' => HostelLeaveApplication::TYPE_OPTIONS,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'allocation_id' => 'required|exists:hostel_allocations,id',
            'student_id' => 'required|exists:users,id',
            'hostel_id' => 'required|exists:hostels,id',
            'leave_type' => 'required|in:' . implode(',', array_keys(HostelLeaveApplication::TYPE_OPTIONS)),
            'leave_reason' => 'required|string|max:500',
            'departure_date' => 'required|date',
            'departure_time' => 'required|date_format:H:i',
            'expected_return_date' => 'required|date|after_or_equal:departure_date',
            'expected_return_time' => 'required|date_format:H:i',
            'destination' => 'required|string|max:255',
            'emergency_contact' => 'required|string|max:255',
            'parent_contact' => 'required|string|max:255',
            'application_notes' => 'nullable|string|max:500',
        ]);

        // Check if student has an active allocation
        $allocation = HostelAllocation::findOrFail($request->allocation_id);
        if (!$allocation->is_active || $allocation->student_id !== $request->student_id) {
            return redirect()->back()
                ->with('error', 'Invalid allocation or student not currently allocated to hostel.');
        }

        // Check for overlapping leave applications
        $overlappingLeave = HostelLeaveApplication::where('student_id', $request->student_id)
            ->where('status', 'approved')
            ->where(function ($q) use ($request) {
                $q->whereBetween('departure_date', [$request->departure_date, $request->expected_return_date])
                  ->orWhereBetween('expected_return_date', [$request->departure_date, $request->expected_return_date])
                  ->orWhere(function ($q2) use ($request) {
                      $q2->where('departure_date', '<=', $request->departure_date)
                         ->where('expected_return_date', '>=', $request->expected_return_date);
                  });
            })
            ->first();

        if ($overlappingLeave) {
            return redirect()->back()
                ->with('error', 'Student already has an approved leave during this period.');
        }

        $leaveApplication = HostelLeaveApplication::create([
            'allocation_id' => $request->allocation_id,
            'student_id' => $request->student_id,
            'hostel_id' => $request->hostel_id,
            'leave_type' => $request->leave_type,
            'leave_reason' => $request->leave_reason,
            'departure_date' => $request->departure_date,
            'departure_time' => $request->departure_time,
            'expected_return_date' => $request->expected_return_date,
            'expected_return_time' => $request->expected_return_time,
            'destination' => $request->destination,
            'emergency_contact' => $request->emergency_contact,
            'parent_contact' => $request->parent_contact,
            'status' => 'pending',
            'application_notes' => $request->application_notes,
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('hostel.leave.index')
            ->with('success', 'Leave application submitted successfully.');
    }

    public function show(HostelLeaveApplication $leaveApplication)
    {
        $this->authorize('view', $leaveApplication);

        $leaveApplication->load([
            'allocation.hostel',
            'allocation.floor',
            'allocation.room',
            'allocation.bed',
            'student',
            'hostel',
            'approvedBy',
            'verifiedBy',
            'createdBy',
            'leaveHistory.performedBy'
        ]);

        return Inertia::render('Hostel/Leave/Show', [
            'leaveApplication' => $leaveApplication,
        ]);
    }

    public function edit(HostelLeaveApplication $leaveApplication)
    {
        $this->authorize('update', $leaveApplication);

        if ($leaveApplication->status !== 'pending') {
            return redirect()->back()
                ->with('error', 'Cannot edit non-pending leave application.');
        }

        $leaveApplication->load(['allocation', 'student', 'hostel']);

        $hostels = Hostel::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Hostel/Leave/Edit', [
            'leaveApplication' => $leaveApplication,
            'hostels' => $hostels,
            'typeOptions' => HostelLeaveApplication::TYPE_OPTIONS,
        ]);
    }

    public function update(Request $request, HostelLeaveApplication $leaveApplication)
    {
        $this->authorize('update', $leaveApplication);

        if ($leaveApplication->status !== 'pending') {
            return redirect()->back()
                ->with('error', 'Cannot update non-pending leave application.');
        }

        $request->validate([
            'leave_type' => 'required|in:' . implode(',', array_keys(HostelLeaveApplication::TYPE_OPTIONS)),
            'leave_reason' => 'required|string|max:500',
            'departure_date' => 'required|date',
            'departure_time' => 'required|date_format:H:i',
            'expected_return_date' => 'required|date|after_or_equal:departure_date',
            'expected_return_time' => 'required|date_format:H:i',
            'destination' => 'required|string|max:255',
            'emergency_contact' => 'required|string|max:255',
            'parent_contact' => 'required|string|max:255',
            'application_notes' => 'nullable|string|max:500',
        ]);

        // Check for overlapping leave applications (excluding current one)
        $overlappingLeave = HostelLeaveApplication::where('student_id', $leaveApplication->student_id)
            ->where('status', 'approved')
            ->where('id', '!=', $leaveApplication->id)
            ->where(function ($q) use ($request) {
                $q->whereBetween('departure_date', [$request->departure_date, $request->expected_return_date])
                  ->orWhereBetween('expected_return_date', [$request->departure_date, $request->expected_return_date])
                  ->orWhere(function ($q2) use ($request) {
                      $q2->where('departure_date', '<=', $request->departure_date)
                         ->where('expected_return_date', '>=', $request->expected_return_date);
                  });
            })
            ->first();

        if ($overlappingLeave) {
            return redirect()->back()
                ->with('error', 'Student already has an approved leave during this period.');
        }

        $leaveApplication->update([
            'leave_type' => $request->leave_type,
            'leave_reason' => $request->leave_reason,
            'departure_date' => $request->departure_date,
            'departure_time' => $request->departure_time,
            'expected_return_date' => $request->expected_return_date,
            'expected_return_time' => $request->expected_return_time,
            'destination' => $request->destination,
            'emergency_contact' => $request->emergency_contact,
            'parent_contact' => $request->parent_contact,
            'application_notes' => $request->application_notes,
        ]);

        return redirect()->route('hostel.leave.index')
            ->with('success', 'Leave application updated successfully.');
    }

    public function approve(Request $request, HostelLeaveApplication $leaveApplication)
    {
        $this->authorize('approve', $leaveApplication);

        if ($leaveApplication->status !== 'pending') {
            return redirect()->back()
                ->with('error', 'Only pending applications can be approved.');
        }

        $request->validate([
            'approval_notes' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($request, $leaveApplication) {
            $leaveApplication->update([
                'status' => 'approved',
                'approved_by' => Auth::id(),
                'approved_at' => now(),
                'approval_notes' => $request->approval_notes,
            ]);

            // Create history record
            $leaveApplication->leaveHistory()->create([
                'action' => 'approved',
                'action_date' => now(),
                'previous_status' => 'pending',
                'new_status' => 'approved',
                'performed_by' => Auth::id(),
                'notes' => $request->approval_notes,
            ]);
        });

        return redirect()->back()
            ->with('success', 'Leave application approved successfully.');
    }

    public function reject(Request $request, HostelLeaveApplication $leaveApplication)
    {
        $this->authorize('approve', $leaveApplication);

        if ($leaveApplication->status !== 'pending') {
            return redirect()->back()
                ->with('error', 'Only pending applications can be rejected.');
        }

        $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        DB::transaction(function () use ($request, $leaveApplication) {
            $leaveApplication->update([
                'status' => 'rejected',
                'approved_by' => Auth::id(),
                'approved_at' => now(),
                'rejection_reason' => $request->rejection_reason,
            ]);

            // Create history record
            $leaveApplication->leaveHistory()->create([
                'action' => 'rejected',
                'action_date' => now(),
                'previous_status' => 'pending',
                'new_status' => 'rejected',
                'performed_by' => Auth::id(),
                'notes' => $request->rejection_reason,
            ]);
        });

        return redirect()->back()
            ->with('success', 'Leave application rejected.');
    }

    public function checkIn(Request $request, HostelLeaveApplication $leaveApplication)
    {
        $this->authorize('verify', $leaveApplication);

        if ($leaveApplication->status !== 'approved') {
            return redirect()->back()
                ->with('error', 'Only approved leave applications can be checked in.');
        }

        $request->validate([
            'actual_return_date' => 'required|date',
            'actual_return_time' => 'required|date_format:H:i',
            'verification_notes' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($request, $leaveApplication) {
            $leaveApplication->update([
                'actual_return_date' => $request->actual_return_date,
                'actual_return_time' => $request->actual_return_time,
                'check_in_verified' => true,
                'verified_by' => Auth::id(),
                'verification_notes' => $request->verification_notes,
            ]);

            // Create history record
            $leaveApplication->leaveHistory()->create([
                'action' => 'checked_in',
                'action_date' => now(),
                'previous_status' => 'approved',
                'new_status' => 'completed',
                'performed_by' => Auth::id(),
                'notes' => $request->verification_notes,
            ]);
        });

        return redirect()->back()
            ->with('success', 'Student checked in successfully.');
    }

    public function checkOut(Request $request, HostelLeaveApplication $leaveApplication)
    {
        $this->authorize('verify', $leaveApplication);

        if ($leaveApplication->status !== 'approved') {
            return redirect()->back()
                ->with('error', 'Only approved leave applications can be checked out.');
        }

        $request->validate([
            'verification_notes' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($request, $leaveApplication) {
            $leaveApplication->update([
                'check_out_verified' => true,
                'verified_by' => Auth::id(),
                'verification_notes' => $request->verification_notes,
            ]);

            // Create history record
            $leaveApplication->leaveHistory()->create([
                'action' => 'checked_out',
                'action_date' => now(),
                'previous_status' => 'approved',
                'new_status' => 'approved',
                'performed_by' => Auth::id(),
                'notes' => $request->verification_notes,
            ]);
        });

        return redirect()->back()
            ->with('success', 'Student checked out successfully.');
    }

    public function getStudentLeaveHistory($studentId)
    {
        $leaveHistory = HostelLeaveApplication::where('student_id', $studentId)
            ->with(['hostel', 'approvedBy', 'verifiedBy'])
            ->orderBy('departure_date', 'desc')
            ->get();

        return response()->json($leaveHistory);
    }

    public function getPendingApplications()
    {
        $pendingApplications = HostelLeaveApplication::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })
            ->where('status', 'pending')
            ->with(['student', 'hostel'])
            ->orderBy('departure_date', 'asc')
            ->get();

        return response()->json($pendingApplications);
    }

    public function getOverdueReturns()
    {
        $overdueReturns = HostelLeaveApplication::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })
            ->where('status', 'approved')
            ->where('expected_return_date', '<', now()->toDateString())
            ->whereNull('actual_return_date')
            ->with(['student', 'hostel'])
            ->orderBy('expected_return_date', 'asc')
            ->get();

        return response()->json($overdueReturns);
    }
}



