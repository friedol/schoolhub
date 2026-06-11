<?php

namespace App\Http\Controllers\Communication;

use App\Http\Controllers\Controller;
use App\Models\MeetingRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MeetingRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = MeetingRequest::where('school_id', Auth::user()->school_id);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('meeting_type')) {
            $query->where('meeting_type', $request->meeting_type);
        }

        if ($request->filled('requester_id')) {
            $query->where('requester_id', $request->requester_id);
        }

        if ($request->filled('requested_user_id')) {
            $query->where('requested_user_id', $request->requested_user_id);
        }

        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->filled('date_from')) {
            $query->where('preferred_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('preferred_date', '<=', $request->date_to);
        }

        $meetings = $query->with(['requester', 'requestedUser', 'student'])
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Statistics
        $stats = [
            'total_requests' => MeetingRequest::where('school_id', Auth::user()->school_id)->count(),
            'pending_requests' => MeetingRequest::where('school_id', Auth::user()->school_id)->where('status', 'pending')->count(),
            'scheduled_meetings' => MeetingRequest::where('school_id', Auth::user()->school_id)->where('status', 'scheduled')->count(),
            'completed_meetings' => MeetingRequest::where('school_id', Auth::user()->school_id)->where('status', 'completed')->count(),
            'upcoming_meetings' => MeetingRequest::where('school_id', Auth::user()->school_id)->upcoming()->count(),
        ];

        return Inertia::render('Communication/MeetingRequests/Index', [
            'meetings' => $meetings,
            'stats' => $stats,
            'statusOptions' => MeetingRequest::STATUS_OPTIONS,
            'meetingTypeOptions' => MeetingRequest::MEETING_TYPE_OPTIONS,
            'filters' => $request->only(['status', 'meeting_type', 'requester_id', 'requested_user_id', 'student_id', 'date_from', 'date_to']),
        ]);
    }

    public function create()
    {
        $users = User::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->whereIn('role', ['teacher', 'staff'])
            ->orderBy('name')
            ->get();

        $students = User::where('school_id', Auth::user()->school_id)
            ->where('role', 'student')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Communication/MeetingRequests/Create', [
            'users' => $users,
            'students' => $students,
            'meetingTypeOptions' => MeetingRequest::MEETING_TYPE_OPTIONS,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'requested_user_id' => 'required|exists:users,id',
            'student_id' => 'nullable|exists:users,id',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'preferred_date' => 'required|date|after_or_equal:today',
            'preferred_time' => 'required|date_format:H:i',
            'duration' => 'required|integer|min:15|max:240',
            'meeting_type' => 'required|in:' . implode(',', array_keys(MeetingRequest::MEETING_TYPE_OPTIONS)),
        ]);

        $meeting = MeetingRequest::create([
            'school_id' => Auth::user()->school_id,
            'requester_id' => Auth::id(),
            'requested_user_id' => $request->requested_user_id,
            'student_id' => $request->student_id,
            'subject' => $request->subject,
            'message' => $request->message,
            'preferred_date' => $request->preferred_date,
            'preferred_time' => $request->preferred_time,
            'duration' => $request->duration,
            'meeting_type' => $request->meeting_type,
            'status' => 'pending',
        ]);

        // Log the creation
        $meeting->addHistory('created', 'Meeting request created', Auth::user());

        return redirect()->route('communication.meetings.index')
            ->with('success', 'Meeting request sent successfully.');
    }

    public function show(MeetingRequest $meeting)
    {
        $this->authorize('view', $meeting);

        $meeting->load([
            'requester',
            'requestedUser',
            'student',
            'cancelledBy',
            'meetingHistory.performedBy'
        ]);

        return Inertia::render('Communication/MeetingRequests/Show', [
            'meeting' => $meeting,
        ]);
    }

    public function edit(MeetingRequest $meeting)
    {
        $this->authorize('update', $meeting);

        if (!in_array($meeting->status, ['pending', 'approved'])) {
            return redirect()->back()
                ->with('error', 'Only pending or approved meetings can be edited.');
        }

        $meeting->load(['requester', 'requestedUser', 'student']);

        $users = User::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->whereIn('role', ['teacher', 'staff'])
            ->orderBy('name')
            ->get();

        $students = User::where('school_id', Auth::user()->school_id)
            ->where('role', 'student')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Communication/MeetingRequests/Edit', [
            'meeting' => $meeting,
            'users' => $users,
            'students' => $students,
            'meetingTypeOptions' => MeetingRequest::MEETING_TYPE_OPTIONS,
        ]);
    }

    public function update(Request $request, MeetingRequest $meeting)
    {
        $this->authorize('update', $meeting);

        if (!in_array($meeting->status, ['pending', 'approved'])) {
            return redirect()->back()
                ->with('error', 'Only pending or approved meetings can be edited.');
        }

        $request->validate([
            'requested_user_id' => 'required|exists:users,id',
            'student_id' => 'nullable|exists:users,id',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'preferred_date' => 'required|date|after_or_equal:today',
            'preferred_time' => 'required|date_format:H:i',
            'duration' => 'required|integer|min:15|max:240',
            'meeting_type' => 'required|in:' . implode(',', array_keys(MeetingRequest::MEETING_TYPE_OPTIONS)),
        ]);

        $meeting->update([
            'requested_user_id' => $request->requested_user_id,
            'student_id' => $request->student_id,
            'subject' => $request->subject,
            'message' => $request->message,
            'preferred_date' => $request->preferred_date,
            'preferred_time' => $request->preferred_time,
            'duration' => $request->duration,
            'meeting_type' => $request->meeting_type,
        ]);

        // Log the update
        $meeting->addHistory('updated', 'Meeting request updated', Auth::user());

        return redirect()->route('communication.meetings.index')
            ->with('success', 'Meeting request updated successfully.');
    }

    public function destroy(MeetingRequest $meeting)
    {
        $this->authorize('delete', $meeting);

        if (in_array($meeting->status, ['scheduled', 'completed'])) {
            return redirect()->back()
                ->with('error', 'Cannot delete scheduled or completed meetings.');
        }

        $meeting->delete();

        return redirect()->route('communication.meetings.index')
            ->with('success', 'Meeting request deleted successfully.');
    }

    public function approve(MeetingRequest $meeting)
    {
        $this->authorize('update', $meeting);

        if ($meeting->status !== 'pending') {
            return redirect()->back()
                ->with('error', 'Only pending meetings can be approved.');
        }

        $meeting->approve();
        $meeting->addHistory('approved', 'Meeting request approved', Auth::user());

        return redirect()->back()
            ->with('success', 'Meeting request approved successfully.');
    }

    public function schedule(Request $request, MeetingRequest $meeting)
    {
        $this->authorize('update', $meeting);

        if (!in_array($meeting->status, ['approved', 'pending'])) {
            return redirect()->back()
                ->with('error', 'Only approved or pending meetings can be scheduled.');
        }

        $request->validate([
            'scheduled_date' => 'required|date|after_or_equal:today',
            'scheduled_time' => 'required|date_format:H:i',
            'meeting_link' => 'nullable|string|max:500',
        ]);

        $meeting->schedule(
            $request->scheduled_date,
            $request->scheduled_time,
            $request->meeting_link
        );

        $meeting->addHistory('scheduled', 'Meeting scheduled', Auth::user());

        return redirect()->back()
            ->with('success', 'Meeting scheduled successfully.');
    }

    public function complete(Request $request, MeetingRequest $meeting)
    {
        $this->authorize('update', $meeting);

        if ($meeting->status !== 'scheduled') {
            return redirect()->back()
                ->with('error', 'Only scheduled meetings can be completed.');
        }

        $request->validate([
            'meeting_notes' => 'nullable|string',
            'feedback' => 'nullable|string',
        ]);

        $meeting->complete($request->meeting_notes, $request->feedback);
        $meeting->addHistory('completed', 'Meeting completed', Auth::user());

        return redirect()->back()
            ->with('success', 'Meeting marked as completed successfully.');
    }

    public function cancel(Request $request, MeetingRequest $meeting)
    {
        $this->authorize('update', $meeting);

        if (in_array($meeting->status, ['completed', 'cancelled'])) {
            return redirect()->back()
                ->with('error', 'Cannot cancel completed or already cancelled meetings.');
        }

        $request->validate([
            'cancelled_reason' => 'required|string|max:500',
        ]);

        $meeting->cancel($request->cancelled_reason, Auth::user());
        $meeting->addHistory('cancelled', 'Meeting cancelled: ' . $request->cancelled_reason, Auth::user());

        return redirect()->back()
            ->with('success', 'Meeting cancelled successfully.');
    }

    public function decline(Request $request, MeetingRequest $meeting)
    {
        $this->authorize('update', $meeting);

        if ($meeting->status !== 'pending') {
            return redirect()->back()
                ->with('error', 'Only pending meetings can be declined.');
        }

        $request->validate([
            'rejection_reason' => 'nullable|string|max:500',
        ]);

        $meeting->decline($request->rejection_reason);
        $meeting->addHistory('declined', 'Meeting request declined', Auth::user());

        return redirect()->back()
            ->with('success', 'Meeting request declined successfully.');
    }

    public function getMyMeetings(Request $request)
    {
        $query = MeetingRequest::where('school_id', Auth::user()->school_id)
            ->where(function ($q) {
                $q->where('requester_id', Auth::id())
                  ->orWhere('requested_user_id', Auth::id());
            });

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $meetings = $query->with(['requester', 'requestedUser', 'student'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Communication/MeetingRequests/MyMeetings', [
            'meetings' => $meetings,
            'statusOptions' => MeetingRequest::STATUS_OPTIONS,
            'filters' => $request->only(['status']),
        ]);
    }

    public function getUpcomingMeetings()
    {
        $meetings = MeetingRequest::where('school_id', Auth::user()->school_id)
            ->where(function ($q) {
                $q->where('requester_id', Auth::id())
                  ->orWhere('requested_user_id', Auth::id());
            })
            ->upcoming()
            ->with(['requester', 'requestedUser', 'student'])
            ->orderBy('scheduled_date')
            ->orderBy('scheduled_time')
            ->limit(10)
            ->get();

        return response()->json($meetings);
    }

    public function getMeetingStats()
    {
        $userId = Auth::id();
        $schoolId = Auth::user()->school_id;

        $stats = [
            'total_requests' => MeetingRequest::where('school_id', $schoolId)
                ->where(function ($q) use ($userId) {
                    $q->where('requester_id', $userId)
                      ->orWhere('requested_user_id', $userId);
                })->count(),
            'pending_requests' => MeetingRequest::where('school_id', $schoolId)
                ->where(function ($q) use ($userId) {
                    $q->where('requester_id', $userId)
                      ->orWhere('requested_user_id', $userId);
                })->where('status', 'pending')->count(),
            'upcoming_meetings' => MeetingRequest::where('school_id', $schoolId)
                ->where(function ($q) use ($userId) {
                    $q->where('requester_id', $userId)
                      ->orWhere('requested_user_id', $userId);
                })->upcoming()->count(),
            'completed_meetings' => MeetingRequest::where('school_id', $schoolId)
                ->where(function ($q) use ($userId) {
                    $q->where('requester_id', $userId)
                      ->orWhere('requested_user_id', $userId);
                })->where('status', 'completed')->count(),
        ];

        return response()->json($stats);
    }
}



