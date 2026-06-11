<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\LeaveApplication;
use App\Models\LeaveType;
use App\Models\LeaveApplicationHistory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class LeaveController extends Controller
{
    public function index(Request $request)
    {
        $query = LeaveApplication::with(['staff', 'leaveType', 'approvedBy'])
            ->where('school_id', Auth::user()->school_id);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('leave_type_id')) {
            $query->where('leave_type_id', $request->leave_type_id);
        }

        if ($request->filled('staff_id')) {
            $query->where('staff_id', $request->staff_id);
        }

        if ($request->filled('date_from')) {
            $query->where('start_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('end_date', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reason', 'like', "%{$search}%")
                  ->orWhereHas('staff', function ($staffQuery) use ($search) {
                      $staffQuery->where('name', 'like', "%{$search}%")
                                ->orWhereHas('staffProfile', function ($profileQuery) use ($search) {
                                    $profileQuery->where('employee_id', 'like', "%{$search}%");
                                });
                  });
            });
        }

        $leaveApplications = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $leaveTypes = LeaveType::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $staff = User::with('staffProfile')
            ->where('school_id', Auth::user()->school_id)
            ->whereIn('role', ['teacher', 'headteacher', 'bursar', 'librarian', 'dormitory_manager', 'academic_master'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Statistics
        $stats = [
            'total_applications' => LeaveApplication::where('school_id', Auth::user()->school_id)->count(),
            'pending_applications' => LeaveApplication::where('school_id', Auth::user()->school_id)
                ->where('status', 'pending')->count(),
            'approved_applications' => LeaveApplication::where('school_id', Auth::user()->school_id)
                ->where('status', 'approved')->count(),
            'rejected_applications' => LeaveApplication::where('school_id', Auth::user()->school_id)
                ->where('status', 'rejected')->count(),
            'current_leave' => LeaveApplication::where('school_id', Auth::user()->school_id)
                ->where('status', 'approved')
                ->where('start_date', '<=', now()->toDateString())
                ->where('end_date', '>=', now()->toDateString())
                ->count(),
        ];

        return Inertia::render('HR/Leave/Index', [
            'leaveApplications' => $leaveApplications,
            'leaveTypes' => $leaveTypes,
            'staff' => $staff,
            'stats' => $stats,
            'filters' => $request->only(['status', 'leave_type_id', 'staff_id', 'date_from', 'date_to', 'search']),
        ]);
    }

    public function create(Request $request)
    {
        $leaveTypes = LeaveType::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $staff = User::with('staffProfile')
            ->where('school_id', Auth::user()->school_id)
            ->whereIn('role', ['teacher', 'headteacher', 'bursar', 'librarian', 'dormitory_manager', 'academic_master'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('HR/Leave/Create', [
            'leaveTypes' => $leaveTypes,
            'staff' => $staff,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'staff_id' => 'required|exists:users,id',
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'reason' => 'required|string|max:1000',
            'document_path' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240',
        ]);

        // Check for leave conflicts
        $conflict = LeaveApplication::where('school_id', Auth::user()->school_id)
            ->where('staff_id', $request->staff_id)
            ->where('status', 'approved')
            ->where(function ($query) use ($request) {
                $query->whereBetween('start_date', [$request->start_date, $request->end_date])
                      ->orWhereBetween('end_date', [$request->start_date, $request->end_date])
                      ->orWhere(function ($q) use ($request) {
                          $q->where('start_date', '<=', $request->start_date)
                            ->where('end_date', '>=', $request->end_date);
                      });
            })
            ->exists();

        if ($conflict) {
            return redirect()->back()
                ->with('error', 'Leave application conflicts with existing approved leave.');
        }

        // Check leave balance
        $leaveType = LeaveType::findOrFail($request->leave_type_id);
        $leaveDays = Carbon::parse($request->start_date)->diffInDays(Carbon::parse($request->end_date)) + 1;
        
        if ($leaveType->max_days && $leaveDays > $leaveType->max_days) {
            return redirect()->back()
                ->with('error', "Leave duration exceeds maximum allowed days ({$leaveType->max_days} days).");
        }

        DB::transaction(function () use ($request) {
            $documentPath = null;
            if ($request->hasFile('document_path')) {
                $file = $request->file('document_path');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $documentPath = $file->storeAs('leave_documents', $fileName, 'public');
            }

            $leaveApplication = LeaveApplication::create([
                'staff_id' => $request->staff_id,
                'school_id' => Auth::user()->school_id,
                'leave_type_id' => $request->leave_type_id,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'reason' => $request->reason,
                'status' => 'pending',
                'applied_at' => now(),
                'document_path' => $documentPath,
            ]);

            // Create history record
            LeaveApplicationHistory::create([
                'leave_application_id' => $leaveApplication->id,
                'action' => 'applied',
                'performed_by' => Auth::id(),
                'performed_at' => now(),
                'comments' => 'Leave application submitted',
                'old_status' => null,
                'new_status' => 'pending',
            ]);
        });

        return redirect()->route('hr.leave.index')
            ->with('success', 'Leave application submitted successfully.');
    }

    public function show(LeaveApplication $leaveApplication)
    {
        $this->authorize('view', $leaveApplication);

        $leaveApplication->load([
            'staff.staffProfile',
            'leaveType',
            'approvedBy',
            'history.performedBy'
        ]);

        return Inertia::render('HR/Leave/Show', [
            'leaveApplication' => $leaveApplication,
        ]);
    }

    public function edit(LeaveApplication $leaveApplication)
    {
        $this->authorize('update', $leaveApplication);

        if ($leaveApplication->status !== 'pending') {
            return redirect()->back()
                ->with('error', 'Cannot edit leave application that is not pending.');
        }

        $leaveApplication->load(['staff', 'leaveType']);

        $leaveTypes = LeaveType::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $staff = User::with('staffProfile')
            ->where('school_id', Auth::user()->school_id)
            ->whereIn('role', ['teacher', 'headteacher', 'bursar', 'librarian', 'dormitory_manager', 'academic_master'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('HR/Leave/Edit', [
            'leaveApplication' => $leaveApplication,
            'leaveTypes' => $leaveTypes,
            'staff' => $staff,
        ]);
    }

    public function update(Request $request, LeaveApplication $leaveApplication)
    {
        $this->authorize('update', $leaveApplication);

        if ($leaveApplication->status !== 'pending') {
            return redirect()->back()
                ->with('error', 'Cannot edit leave application that is not pending.');
        }

        $request->validate([
            'staff_id' => 'required|exists:users,id',
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'reason' => 'required|string|max:1000',
            'document_path' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240',
        ]);

        DB::transaction(function () use ($request, $leaveApplication) {
            $documentPath = $leaveApplication->document_path;
            if ($request->hasFile('document_path')) {
                // Delete old document
                if ($documentPath && Storage::disk('public')->exists($documentPath)) {
                    Storage::disk('public')->delete($documentPath);
                }
                
                $file = $request->file('document_path');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $documentPath = $file->storeAs('leave_documents', $fileName, 'public');
            }

            $leaveApplication->update([
                'staff_id' => $request->staff_id,
                'leave_type_id' => $request->leave_type_id,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'reason' => $request->reason,
                'document_path' => $documentPath,
            ]);

            // Create history record
            LeaveApplicationHistory::create([
                'leave_application_id' => $leaveApplication->id,
                'action' => 'updated',
                'performed_by' => Auth::id(),
                'performed_at' => now(),
                'comments' => 'Leave application updated',
                'old_status' => 'pending',
                'new_status' => 'pending',
            ]);
        });

        return redirect()->route('hr.leave.index')
            ->with('success', 'Leave application updated successfully.');
    }

    public function destroy(LeaveApplication $leaveApplication)
    {
        $this->authorize('delete', $leaveApplication);

        if ($leaveApplication->status !== 'pending') {
            return redirect()->back()
                ->with('error', 'Cannot delete leave application that is not pending.');
        }

        // Delete document if exists
        if ($leaveApplication->document_path && Storage::disk('public')->exists($leaveApplication->document_path)) {
            Storage::disk('public')->delete($leaveApplication->document_path);
        }

        $leaveApplication->delete();

        return redirect()->route('hr.leave.index')
            ->with('success', 'Leave application deleted successfully.');
    }

    public function approve(Request $request, LeaveApplication $leaveApplication)
    {
        $this->authorize('approve', $leaveApplication);

        if ($leaveApplication->status !== 'pending') {
            return redirect()->back()
                ->with('error', 'Only pending leave applications can be approved.');
        }

        $request->validate([
            'comments' => 'nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($request, $leaveApplication) {
            $leaveApplication->update([
                'status' => 'approved',
                'approved_by' => Auth::id(),
                'approved_at' => now(),
            ]);

            // Create history record
            LeaveApplicationHistory::create([
                'leave_application_id' => $leaveApplication->id,
                'action' => 'approved',
                'performed_by' => Auth::id(),
                'performed_at' => now(),
                'comments' => $request->comments ?? 'Leave application approved',
                'old_status' => 'pending',
                'new_status' => 'approved',
            ]);
        });

        return redirect()->back()
            ->with('success', 'Leave application approved successfully.');
    }

    public function reject(Request $request, LeaveApplication $leaveApplication)
    {
        $this->authorize('approve', $leaveApplication);

        if ($leaveApplication->status !== 'pending') {
            return redirect()->back()
                ->with('error', 'Only pending leave applications can be rejected.');
        }

        $request->validate([
            'comments' => 'required|string|max:1000',
        ]);

        DB::transaction(function () use ($request, $leaveApplication) {
            $leaveApplication->update([
                'status' => 'rejected',
                'approved_by' => Auth::id(),
                'approved_at' => now(),
            ]);

            // Create history record
            LeaveApplicationHistory::create([
                'leave_application_id' => $leaveApplication->id,
                'action' => 'rejected',
                'performed_by' => Auth::id(),
                'performed_at' => now(),
                'comments' => $request->comments,
                'old_status' => 'pending',
                'new_status' => 'rejected',
            ]);
        });

        return redirect()->back()
            ->with('success', 'Leave application rejected successfully.');
    }

    public function cancel(LeaveApplication $leaveApplication)
    {
        $this->authorize('update', $leaveApplication);

        if (!in_array($leaveApplication->status, ['pending', 'approved'])) {
            return redirect()->back()
                ->with('error', 'Only pending or approved leave applications can be cancelled.');
        }

        // Check if leave has already started
        if ($leaveApplication->start_date <= now()->toDateString()) {
            return redirect()->back()
                ->with('error', 'Cannot cancel leave that has already started.');
        }

        DB::transaction(function () use ($leaveApplication) {
            $oldStatus = $leaveApplication->status;
            $leaveApplication->update([
                'status' => 'cancelled',
            ]);

            // Create history record
            LeaveApplicationHistory::create([
                'leave_application_id' => $leaveApplication->id,
                'action' => 'cancelled',
                'performed_by' => Auth::id(),
                'performed_at' => now(),
                'comments' => 'Leave application cancelled',
                'old_status' => $oldStatus,
                'new_status' => 'cancelled',
            ]);
        });

        return redirect()->back()
            ->with('success', 'Leave application cancelled successfully.');
    }

    public function getLeaveBalance(Request $request)
    {
        $request->validate([
            'staff_id' => 'required|exists:users,id',
            'leave_type_id' => 'required|exists:leave_types,id',
        ]);

        $staff = User::findOrFail($request->staff_id);
        $leaveType = LeaveType::findOrFail($request->leave_type_id);

        // Calculate used leave days for current year
        $usedDays = LeaveApplication::where('school_id', Auth::user()->school_id)
            ->where('staff_id', $request->staff_id)
            ->where('leave_type_id', $request->leave_type_id)
            ->where('status', 'approved')
            ->whereYear('start_date', now()->year)
            ->get()
            ->sum(function ($application) {
                return Carbon::parse($application->start_date)->diffInDays(Carbon::parse($application->end_date)) + 1;
            });

        $availableDays = $leaveType->max_days - $usedDays;

        return response()->json([
            'leave_type' => $leaveType->name,
            'max_days' => $leaveType->max_days,
            'used_days' => $usedDays,
            'available_days' => max(0, $availableDays),
        ]);
    }

    public function getStaffOnLeave(Request $request)
    {
        $request->validate([
            'date' => 'nullable|date',
        ]);

        $date = $request->date ?? now()->toDateString();

        $staffOnLeave = LeaveApplication::with(['staff.staffProfile', 'leaveType'])
            ->where('school_id', Auth::user()->school_id)
            ->where('status', 'approved')
            ->where('start_date', '<=', $date)
            ->where('end_date', '>=', $date)
            ->get();

        return response()->json($staffOnLeave);
    }

    public function getLeaveCalendar(Request $request)
    {
        $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2030',
        ]);

        $startDate = Carbon::create($request->year, $request->month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        $leaveApplications = LeaveApplication::with(['staff.staffProfile', 'leaveType'])
            ->where('school_id', Auth::user()->school_id)
            ->where('status', 'approved')
            ->where(function ($query) use ($startDate, $endDate) {
                $query->whereBetween('start_date', [$startDate->toDateString(), $endDate->toDateString()])
                      ->orWhereBetween('end_date', [$startDate->toDateString(), $endDate->toDateString()])
                      ->orWhere(function ($q) use ($startDate, $endDate) {
                          $q->where('start_date', '<=', $startDate->toDateString())
                            ->where('end_date', '>=', $endDate->toDateString());
                      });
            })
            ->get();

        $calendar = [];
        $currentDate = $startDate->copy();

        while ($currentDate->lte($endDate)) {
            $dayLeave = $leaveApplications->filter(function ($application) use ($currentDate) {
                return $currentDate->between(
                    Carbon::parse($application->start_date),
                    Carbon::parse($application->end_date)
                );
            });

            $calendar[] = [
                'date' => $currentDate->toDateString(),
                'day' => $currentDate->day,
                'leave_applications' => $dayLeave->values(),
            ];

            $currentDate->addDay();
        }

        return response()->json($calendar);
    }
}
