<?php

namespace App\Http\Controllers\Hostel;

use App\Http\Controllers\Controller;
use App\Models\HostelMaintenanceRequest;
use App\Models\Hostel;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class HostelMaintenanceController extends Controller
{
    public function index(Request $request)
    {
        $query = HostelMaintenanceRequest::with(['hostel', 'room', 'reportedBy', 'assignedTo'])
            ->whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            });

        // Apply filters
        if ($request->filled('hostel_id')) {
            $query->where('hostel_id', $request->hostel_id);
        }

        if ($request->filled('room_id')) {
            $query->where('room_id', $request->room_id);
        }

        if ($request->filled('severity')) {
            $query->where('priority', $request->severity);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        if ($request->filled('date_from')) {
            $query->where('request_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('request_date', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('resolution_notes', 'like', "%{$search}%");
            });
        }

        $maintenanceRequests = $query->orderBy('request_date', 'desc')
            ->paginate(15)
            ->withQueryString();

        $hostels = Hostel::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $staff = User::where('school_id', Auth::user()->school_id)
            ->whereIn('role', ['teacher', 'staff'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Statistics
        $stats = [
            'total_requests' => HostelMaintenanceRequest::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->count(),
            'pending_requests' => HostelMaintenanceRequest::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->where('status', 'pending')->count(),
            'in_progress_requests' => HostelMaintenanceRequest::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->where('status', 'in_progress')->count(),
            'completed_requests' => HostelMaintenanceRequest::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->where('status', 'completed')->count(),
            'urgent_requests' => HostelMaintenanceRequest::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->where('priority', 'urgent')->count(),
        ];

        return Inertia::render('Hostel/Maintenance/Index', [
            'maintenanceRequests' => $maintenanceRequests,
            'hostels' => $hostels,
            'staff' => $staff,
            'stats' => $stats,
            'severityOptions' => HostelMaintenanceRequest::SEVERITY_OPTIONS,
            'filters' => $request->only(['hostel_id', 'room_id', 'severity', 'status', 'assigned_to', 'date_from', 'date_to', 'search']),
        ]);
    }

    public function create()
    {
        $hostels = Hostel::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Hostel/Maintenance/Create', [
            'hostels' => $hostels,
            'severityOptions' => HostelMaintenanceRequest::SEVERITY_OPTIONS,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'hostel_id' => 'required|exists:hostels,id',
            'hostel_room_id' => 'nullable|exists:hostel_rooms,id',
            'issue_description' => 'required|string|max:1000',
            'severity' => 'required|in:' . implode(',', array_keys(HostelMaintenanceRequest::SEVERITY_OPTIONS)),
            'reported_date' => 'required|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $maintenanceRequest = HostelMaintenanceRequest::create([
            'hostel_id' => $request->hostel_id,
            'hostel_room_id' => $request->hostel_room_id,
            'reported_by' => Auth::id(),
            'issue_description' => $request->issue_description,
            'severity' => $request->severity,
            'status' => 'pending',
            'reported_date' => $request->reported_date,
            'notes' => $request->notes,
        ]);

        return redirect()->route('hostel.maintenance.index')
            ->with('success', 'Maintenance request submitted successfully.');
    }

    public function show(HostelMaintenanceRequest $maintenanceRequest)
    {
        $this->authorize('view', $maintenanceRequest);

        $maintenanceRequest->load([
            'hostel',
            'room',
            'reportedBy',
            'assignedTo',
            'maintenanceHistory.performedBy'
        ]);

        return Inertia::render('Hostel/Maintenance/Show', [
            'maintenanceRequest' => $maintenanceRequest,
        ]);
    }

    public function edit(HostelMaintenanceRequest $maintenanceRequest)
    {
        $this->authorize('update', $maintenanceRequest);

        if ($maintenanceRequest->status === 'completed') {
            return redirect()->back()
                ->with('error', 'Cannot edit completed maintenance request.');
        }

        $maintenanceRequest->load(['hostel', 'room']);

        $hostels = Hostel::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $staff = User::where('school_id', Auth::user()->school_id)
            ->whereIn('role', ['teacher', 'staff'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Hostel/Maintenance/Edit', [
            'maintenanceRequest' => $maintenanceRequest,
            'hostels' => $hostels,
            'staff' => $staff,
            'severityOptions' => HostelMaintenanceRequest::SEVERITY_OPTIONS,
        ]);
    }

    public function update(Request $request, HostelMaintenanceRequest $maintenanceRequest)
    {
        $this->authorize('update', $maintenanceRequest);

        if ($maintenanceRequest->status === 'completed') {
            return redirect()->back()
                ->with('error', 'Cannot update completed maintenance request.');
        }

        $request->validate([
            'hostel_id' => 'required|exists:hostels,id',
            'hostel_room_id' => 'nullable|exists:hostel_rooms,id',
            'issue_description' => 'required|string|max:1000',
            'severity' => 'required|in:' . implode(',', array_keys(HostelMaintenanceRequest::SEVERITY_OPTIONS)),
            'status' => 'required|in:' . implode(',', array_keys(HostelMaintenanceRequest::STATUS_OPTIONS)),
            'assigned_to' => 'nullable|exists:users,id',
            'reported_date' => 'required|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $maintenanceRequest->update([
            'hostel_id' => $request->hostel_id,
            'hostel_room_id' => $request->hostel_room_id,
            'issue_description' => $request->issue_description,
            'severity' => $request->severity,
            'status' => $request->status,
            'assigned_to' => $request->assigned_to,
            'reported_date' => $request->reported_date,
            'notes' => $request->notes,
        ]);

        return redirect()->route('hostel.maintenance.index')
            ->with('success', 'Maintenance request updated successfully.');
    }

    public function assign(Request $request, HostelMaintenanceRequest $maintenanceRequest)
    {
        $this->authorize('assign', $maintenanceRequest);

        if ($maintenanceRequest->status === 'completed') {
            return redirect()->back()
                ->with('error', 'Cannot assign completed maintenance request.');
        }

        $request->validate([
            'assigned_to' => 'required|exists:users,id',
            'notes' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($request, $maintenanceRequest) {
            $maintenanceRequest->update([
                'assigned_to' => $request->assigned_to,
                'status' => 'in_progress',
                'notes' => $request->notes,
            ]);

            // Create history record
            $maintenanceRequest->maintenanceHistory()->create([
                'action' => 'assigned',
                'action_date' => now(),
                'previous_status' => 'pending',
                'new_status' => 'in_progress',
                'notes' => $request->notes,
                'performed_by' => Auth::id(),
            ]);
        });

        return redirect()->back()
            ->with('success', 'Maintenance request assigned successfully.');
    }

    public function complete(Request $request, HostelMaintenanceRequest $maintenanceRequest)
    {
        $this->authorize('complete', $maintenanceRequest);

        if ($maintenanceRequest->status === 'completed') {
            return redirect()->back()
                ->with('error', 'Maintenance request is already completed.');
        }

        $request->validate([
            'resolution_notes' => 'required|string|max:1000',
            'resolved_date' => 'required|date',
            'cost' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($request, $maintenanceRequest) {
            $maintenanceRequest->update([
                'status' => 'completed',
                'resolution_notes' => $request->resolution_notes,
                'resolved_date' => $request->resolved_date,
                'cost' => $request->cost,
                'notes' => $request->notes,
            ]);

            // Create history record
            $maintenanceRequest->maintenanceHistory()->create([
                'action' => 'completed',
                'action_date' => now(),
                'previous_status' => $maintenanceRequest->status,
                'new_status' => 'completed',
                'notes' => $request->resolution_notes,
                'performed_by' => Auth::id(),
            ]);
        });

        return redirect()->back()
            ->with('success', 'Maintenance request completed successfully.');
    }

    public function cancel(Request $request, HostelMaintenanceRequest $maintenanceRequest)
    {
        $this->authorize('cancel', $maintenanceRequest);

        if ($maintenanceRequest->status === 'completed') {
            return redirect()->back()
                ->with('error', 'Cannot cancel completed maintenance request.');
        }

        $request->validate([
            'cancellation_reason' => 'required|string|max:500',
        ]);

        DB::transaction(function () use ($request, $maintenanceRequest) {
            $maintenanceRequest->update([
                'status' => 'cancelled',
                'resolution_notes' => $request->cancellation_reason,
            ]);

            // Create history record
            $maintenanceRequest->maintenanceHistory()->create([
                'action' => 'cancelled',
                'action_date' => now(),
                'previous_status' => $maintenanceRequest->status,
                'new_status' => 'cancelled',
                'notes' => $request->cancellation_reason,
                'performed_by' => Auth::id(),
            ]);
        });

        return redirect()->back()
            ->with('success', 'Maintenance request cancelled.');
    }

    public function getMyAssignedRequests()
    {
        $assignedRequests = HostelMaintenanceRequest::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })
            ->where('assigned_to', Auth::id())
            ->whereIn('status', ['pending', 'in_progress'])
            ->with(['hostel', 'room', 'reportedBy'])
            ->orderBy('priority', 'desc')
            ->orderBy('request_date', 'asc')
            ->get();

        return response()->json($assignedRequests);
    }

    public function getUrgentRequests()
    {
        $urgentRequests = HostelMaintenanceRequest::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })
            ->where('priority', 'urgent')
            ->whereIn('status', ['pending', 'in_progress'])
            ->with(['hostel', 'room', 'reportedBy', 'assignedTo'])
            ->orderBy('request_date', 'asc')
            ->get();

        return response()->json($urgentRequests);
    }

    public function getMaintenanceHistory($maintenanceRequestId)
    {
        $history = HostelMaintenanceRequest::findOrFail($maintenanceRequestId)
            ->maintenanceHistory()
            ->with('performedBy')
            ->orderBy('action_date', 'desc')
            ->get();

        return response()->json($history);
    }

    public function getMaintenanceStats()
    {
        $stats = [
            'total_requests' => HostelMaintenanceRequest::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->count(),
            'requests_by_status' => HostelMaintenanceRequest::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status'),
            'requests_by_severity' => HostelMaintenanceRequest::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->selectRaw('priority, COUNT(*) as count')
                ->groupBy('priority')
                ->pluck('count', 'priority'),
            'average_resolution_time' => HostelMaintenanceRequest::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->where('status', 'completed')
                ->whereNotNull('resolved_date')
                ->selectRaw('AVG(DATEDIFF(resolved_date, reported_date)) as avg_days')
                ->value('avg_days'),
        ];

        return response()->json($stats);
    }
}
