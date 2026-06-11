<?php

namespace App\Http\Controllers\Hostel;

use App\Http\Controllers\Controller;
use App\Models\Hostel;
use App\Models\HostelAllocation;
use App\Models\HostelLeaveApplication;
use App\Models\HostelMaintenanceRequest;
use App\Models\HostelInventory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class HostelReportsController extends Controller
{
    public function index()
    {
        $hostels = Hostel::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Hostel/Reports/Index', [
            'hostels' => $hostels,
        ]);
    }

    public function occupancyReport(Request $request)
    {
        $request->validate([
            'hostel_id' => 'nullable|exists:hostels,id',
            'academic_year' => 'nullable|string',
            'term' => 'nullable|string',
        ]);

        $query = Hostel::where('school_id', Auth::user()->school_id)
            ->where('is_active', true);

        if ($request->filled('hostel_id')) {
            $query->where('id', $request->hostel_id);
        }

        $hostels = $query->with(['allocations' => function ($q) use ($request) {
            if ($request->filled('academic_year')) {
                $q->where('academic_year', $request->academic_year);
            }
            if ($request->filled('term')) {
                $q->where('term', $request->term);
            }
            $q->where('is_active', true);
        }])->get();

        $reportData = $hostels->map(function ($hostel) {
            $activeAllocations = $hostel->allocations->count();
            $occupancyRate = $hostel->total_capacity > 0 
                ? round(($activeAllocations / $hostel->total_capacity) * 100, 2) 
                : 0;

            return [
                'hostel' => $hostel,
                'total_capacity' => $hostel->total_capacity,
                'current_occupancy' => $activeAllocations,
                'vacant_beds' => $hostel->total_capacity - $activeAllocations,
                'occupancy_rate' => $occupancyRate,
                'allocations_by_type' => $hostel->allocations->groupBy('allocation_type')->map->count(),
            ];
        });

        return Inertia::render('Hostel/Reports/OccupancyReport', [
            'reportData' => $reportData,
            'filters' => $request->only(['hostel_id', 'academic_year', 'term']),
        ]);
    }

    public function studentAllocationReport(Request $request)
    {
        $request->validate([
            'hostel_id' => 'nullable|exists:hostels,id',
            'academic_year' => 'nullable|string',
            'term' => 'nullable|string',
        ]);

        $query = HostelAllocation::with(['hostel', 'floor', 'room', 'bed', 'student'])
            ->whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })
            ->where('is_active', true);

        if ($request->filled('hostel_id')) {
            $query->where('hostel_id', $request->hostel_id);
        }

        if ($request->filled('academic_year')) {
            $query->where('academic_year', $request->academic_year);
        }

        if ($request->filled('term')) {
            $query->where('term', $request->term);
        }

        $allocations = $query->orderBy('hostel_id')
            ->orderBy('floor_id')
            ->orderBy('room_id')
            ->orderBy('bed_id')
            ->get();

        $reportData = [
            'total_allocations' => $allocations->count(),
            'allocations_by_hostel' => $allocations->groupBy('hostel.name')->map->count(),
            'allocations_by_type' => $allocations->groupBy('allocation_type')->map->count(),
            'allocations_by_floor' => $allocations->groupBy('floor.name')->map->count(),
            'detailed_allocations' => $allocations,
        ];

        return Inertia::render('Hostel/Reports/StudentAllocationReport', [
            'reportData' => $reportData,
            'filters' => $request->only(['hostel_id', 'academic_year', 'term']),
        ]);
    }

    public function leaveApplicationReport(Request $request)
    {
        $request->validate([
            'hostel_id' => 'nullable|exists:hostels,id',
            'leave_type' => 'nullable|string',
            'status' => 'nullable|string',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
        ]);

        $query = HostelLeaveApplication::with(['hostel', 'student', 'approvedBy'])
            ->whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            });

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

        $leaveApplications = $query->orderBy('departure_date', 'desc')->get();

        $reportData = [
            'total_applications' => $leaveApplications->count(),
            'applications_by_status' => $leaveApplications->groupBy('status')->map->count(),
            'applications_by_type' => $leaveApplications->groupBy('leave_type')->map->count(),
            'applications_by_hostel' => $leaveApplications->groupBy('hostel.name')->map->count(),
            'approval_rate' => $leaveApplications->count() > 0 
                ? round(($leaveApplications->where('status', 'approved')->count() / $leaveApplications->count()) * 100, 2)
                : 0,
            'detailed_applications' => $leaveApplications,
        ];

        return Inertia::render('Hostel/Reports/LeaveApplicationReport', [
            'reportData' => $reportData,
            'filters' => $request->only(['hostel_id', 'leave_type', 'status', 'date_from', 'date_to']),
        ]);
    }

    public function maintenanceReport(Request $request)
    {
        $request->validate([
            'hostel_id' => 'nullable|exists:hostels,id',
            'severity' => 'nullable|string',
            'status' => 'nullable|string',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
        ]);

        $query = HostelMaintenanceRequest::with(['hostel', 'room', 'reportedBy', 'assignedTo'])
            ->whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            });

        if ($request->filled('hostel_id')) {
            $query->where('hostel_id', $request->hostel_id);
        }

        if ($request->filled('severity')) {
            $query->where('priority', $request->severity);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->where('request_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('request_date', '<=', $request->date_to);
        }

        $maintenanceRequests = $query->orderBy('request_date', 'desc')->get();

        $reportData = [
            'total_requests' => $maintenanceRequests->count(),
            'requests_by_status' => $maintenanceRequests->groupBy('status')->map->count(),
            'requests_by_severity' => $maintenanceRequests->groupBy('severity')->map->count(),
            'requests_by_hostel' => $maintenanceRequests->groupBy('hostel.name')->map->count(),
            'completion_rate' => $maintenanceRequests->count() > 0 
                ? round(($maintenanceRequests->where('status', 'completed')->count() / $maintenanceRequests->count()) * 100, 2)
                : 0,
            'average_resolution_time' => $maintenanceRequests->where('status', 'completed')
                ->whereNotNull('resolved_date')
                ->avg(function ($request) {
                    return \Carbon\Carbon::parse($request->reported_date)
                        ->diffInDays(\Carbon\Carbon::parse($request->resolved_date));
                }),
            'total_cost' => $maintenanceRequests->where('status', 'completed')->sum('cost'),
            'detailed_requests' => $maintenanceRequests,
        ];

        return Inertia::render('Hostel/Reports/MaintenanceReport', [
            'reportData' => $reportData,
            'filters' => $request->only(['hostel_id', 'severity', 'status', 'date_from', 'date_to']),
        ]);
    }

    public function inventoryReport(Request $request)
    {
        $request->validate([
            'hostel_id' => 'nullable|exists:hostels,id',
            'condition' => 'nullable|string',
        ]);

        $query = HostelInventory::with(['hostel', 'inventoryItem', 'room'])
            ->whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            });

        if ($request->filled('hostel_id')) {
            $query->where('hostel_id', $request->hostel_id);
        }

        if ($request->filled('condition')) {
            $query->where('condition', $request->condition);
        }

        $inventory = $query->orderBy('hostel_id')->orderBy('inventory_item_id')->get();

        $reportData = [
            'total_items' => $inventory->sum('quantity'),
            'total_value' => $inventory->sum(function ($item) {
                return $item->quantity * ($item->inventoryItem->unit_cost ?? 0);
            }),
            'items_by_hostel' => $inventory->groupBy('hostel.name')->map(function ($items) {
                return [
                    'count' => $items->count(),
                    'quantity' => $items->sum('quantity'),
                    'value' => $items->sum(function ($item) {
                        return $item->quantity * ($item->inventoryItem->unit_cost ?? 0);
                    }),
                ];
            }),
            'items_by_condition' => $inventory->groupBy('condition')->map->sum('quantity'),
            'top_items' => $inventory->groupBy('inventory_item_id')->map(function ($items) {
                $item = $items->first()->inventoryItem;
                return [
                    'item' => $item,
                    'total_quantity' => $items->sum('quantity'),
                    'total_value' => $items->sum(function ($i) use ($item) {
                        return $i->quantity * ($item->unit_cost ?? 0);
                    }),
                ];
            })->sortByDesc('total_quantity')->take(10),
            'detailed_inventory' => $inventory,
        ];

        return Inertia::render('Hostel/Reports/InventoryReport', [
            'reportData' => $reportData,
            'filters' => $request->only(['hostel_id', 'condition']),
        ]);
    }

    public function wardenPerformanceReport(Request $request)
    {
        $request->validate([
            'hostel_id' => 'nullable|exists:hostels,id',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
        ]);

        $query = Hostel::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->with(['wardens.user']);

        if ($request->filled('hostel_id')) {
            $query->where('id', $request->hostel_id);
        }

        $hostels = $query->get();

        $reportData = $hostels->map(function ($hostel) use ($request) {
            $wardens = $hostel->wardens->where('is_active', true);
            
            return [
                'hostel' => $hostel,
                'wardens' => $wardens->map(function ($warden) use ($request) {
                    $dutyRosters = $warden->dutyRosters();
                    
                    if ($request->filled('date_from')) {
                        $dutyRosters->where('shift_date', '>=', $request->date_from);
                    }
                    if ($request->filled('date_to')) {
                        $dutyRosters->where('shift_date', '<=', $request->date_to);
                    }
                    
                    $rosters = $dutyRosters->get();
                    
                    return [
                        'warden' => $warden,
                        'total_shifts' => $rosters->count(),
                        'total_hours' => $rosters->sum(function ($roster) {
                            return \Carbon\Carbon::parse($roster->start_time)
                                ->diffInHours(\Carbon\Carbon::parse($roster->end_time));
                        }),
                        'assignment_date' => $warden->assignment_date,
                    ];
                }),
            ];
        });

        return Inertia::render('Hostel/Reports/WardenPerformanceReport', [
            'reportData' => $reportData,
            'filters' => $request->only(['hostel_id', 'date_from', 'date_to']),
        ]);
    }

    public function exportReport(Request $request)
    {
        $request->validate([
            'report_type' => 'required|in:occupancy,allocation,leave,maintenance,inventory,warden',
            'format' => 'required|in:pdf,excel',
        ]);

        // This would typically generate and download the report
        // For now, we'll return a success message
        return response()->json([
            'message' => 'Report export functionality will be implemented here',
            'report_type' => $request->report_type,
            'format' => $request->format,
        ]);
    }

    public function getDashboardStats()
    {
        $stats = [
            'total_hostels' => Hostel::where('school_id', Auth::user()->school_id)
                ->where('is_active', true)->count(),
            'total_capacity' => Hostel::where('school_id', Auth::user()->school_id)
                ->where('is_active', true)->sum('total_capacity'),
            'current_occupancy' => HostelAllocation::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->where('is_active', true)->count(),
            'pending_leave_applications' => HostelLeaveApplication::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->where('status', 'pending')->count(),
            'pending_maintenance_requests' => HostelMaintenanceRequest::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->where('status', 'pending')->count(),
            'urgent_maintenance_requests' => HostelMaintenanceRequest::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->where('priority', 'urgent')->whereIn('status', ['pending', 'in_progress'])->count(),
        ];

        $stats['occupancy_rate'] = $stats['total_capacity'] > 0 
            ? round(($stats['current_occupancy'] / $stats['total_capacity']) * 100, 2)
            : 0;

        return response()->json($stats);
    }

    public function dashboard()
    {
        $stats = [
            'total_hostels' => Hostel::where('school_id', Auth::user()->school_id)
                ->where('is_active', true)->count(),
            'total_capacity' => Hostel::where('school_id', Auth::user()->school_id)
                ->where('is_active', true)->sum('total_capacity'),
            'current_occupancy' => HostelAllocation::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->where('is_active', true)->count(),
            'pending_leave_applications' => HostelLeaveApplication::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->where('status', 'pending')->count(),
            'pending_maintenance_requests' => HostelMaintenanceRequest::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->where('status', 'pending')->count(),
            'urgent_maintenance_requests' => HostelMaintenanceRequest::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->where('priority', 'urgent')->whereIn('status', ['pending', 'in_progress'])->count(),
        ];

        $stats['occupancy_rate'] = $stats['total_capacity'] > 0 
            ? round(($stats['current_occupancy'] / $stats['total_capacity']) * 100, 2)
            : 0;

        return Inertia::render('Hostel/Dashboard', [
            'stats' => $stats,
        ]);
    }
}



