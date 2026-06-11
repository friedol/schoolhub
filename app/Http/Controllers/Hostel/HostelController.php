<?php

namespace App\Http\Controllers\Hostel;

use App\Http\Controllers\Controller;
use App\Models\Hostel;
use App\Models\HostelFloor;
use App\Models\HostelRoom;
use App\Models\HostelBed;
use App\Models\HostelAllocation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class HostelController extends Controller
{
    public function index(Request $request)
    {
        $query = Hostel::with(['floors', 'rooms', 'beds'])
            ->where('school_id', Auth::user()->school_id);

        // Apply filters
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('hostel_code', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        $hostels = $query->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        // Statistics
        $stats = [
            'total_hostels' => Hostel::where('school_id', Auth::user()->school_id)->count(),
            'boys_hostels' => Hostel::where('school_id', Auth::user()->school_id)
                ->where('type', 'boys')->count(),
            'girls_hostels' => Hostel::where('school_id', Auth::user()->school_id)
                ->where('type', 'girls')->count(),
            'total_capacity' => Hostel::where('school_id', Auth::user()->school_id)->sum('total_capacity'),
            'total_occupancy' => HostelBed::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->where('status', 'occupied')->count(),
        ];

        return Inertia::render('Hostel/Index', [
            'hostels' => $hostels,
            'stats' => $stats,
            'typeOptions' => Hostel::TYPE_OPTIONS,
            'filters' => $request->only(['type', 'search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Hostel/Create', [
            'typeOptions' => Hostel::TYPE_OPTIONS,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:' . implode(',', array_keys(Hostel::TYPE_OPTIONS)),
            'location' => 'required|string|max:255',
            'total_capacity' => 'required|integer|min:1',
            'description' => 'nullable|string|max:1000',
        ]);

        $hostel = Hostel::create([
            'school_id' => Auth::user()->school_id,
            'name' => $request->name,
            'type' => $request->type,
            'location' => $request->location,
            'total_capacity' => $request->total_capacity,
            'description' => $request->description,
        ]);

        return redirect()->route('hostel.show', $hostel)
            ->with('success', 'Hostel created successfully.');
    }

    public function show(Hostel $hostel)
    {
        $this->authorize('view', $hostel);

        $hostel->load([
            'floors.rooms.beds',
            'wardens.warden',
            'facilities',
            'allocations.student'
        ]);

        // Get occupancy statistics
        $occupancyStats = [
            'total_beds' => $hostel->beds()->count(),
            'occupied_beds' => $hostel->beds()->where('status', 'occupied')->count(),
            'vacant_beds' => $hostel->beds()->where('status', 'vacant')->count(),
            'under_maintenance' => $hostel->beds()->where('status', 'under_maintenance')->count(),
            'occupancy_percentage' => $hostel->occupancy_percentage,
        ];

        // Get floor-wise statistics
        $floorStats = $hostel->floors->map(function ($floor) {
            return [
                'floor' => $floor,
                'total_rooms' => $floor->rooms->count(),
                'total_beds' => $floor->beds->count(),
                'occupied_beds' => $floor->beds->where('status', 'occupied')->count(),
                'vacant_beds' => $floor->beds->where('status', 'vacant')->count(),
                'occupancy_percentage' => $floor->occupancy_percentage,
            ];
        });

        return Inertia::render('Hostel/Show', [
            'hostel' => $hostel,
            'occupancyStats' => $occupancyStats,
            'floorStats' => $floorStats,
        ]);
    }

    public function edit(Hostel $hostel)
    {
        $this->authorize('update', $hostel);

        return Inertia::render('Hostel/Edit', [
            'hostel' => $hostel,
            'typeOptions' => Hostel::TYPE_OPTIONS,
        ]);
    }

    public function update(Request $request, Hostel $hostel)
    {
        $this->authorize('update', $hostel);

        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:' . implode(',', array_keys(Hostel::TYPE_OPTIONS)),
            'location' => 'required|string|max:255',
            'total_capacity' => 'required|integer|min:1',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        $hostel->update($request->all());

        return redirect()->route('hostel.show', $hostel)
            ->with('success', 'Hostel updated successfully.');
    }

    public function destroy(Hostel $hostel)
    {
        $this->authorize('delete', $hostel);

        // Check if hostel has active allocations
        if ($hostel->allocations()->where('is_active', true)->exists()) {
            return redirect()->back()
                ->with('error', 'Cannot delete hostel with active student allocations.');
        }

        $hostel->delete();

        return redirect()->route('hostel.index')
            ->with('success', 'Hostel deleted successfully.');
    }

    public function getVacancyReport(Hostel $hostel)
    {
        $this->authorize('view', $hostel);

        $vacancyData = $hostel->floors->map(function ($floor) {
            return [
                'floor' => $floor,
                'rooms' => $floor->rooms->map(function ($room) {
                    return [
                        'room' => $room,
                        'beds' => $room->beds->map(function ($bed) {
                            return [
                                'bed' => $bed,
                                'status' => $bed->status,
                                'condition' => $bed->condition,
                                'current_allocation' => $bed->currentAllocation,
                            ];
                        }),
                    ];
                }),
            ];
        });

        return response()->json($vacancyData);
    }

    public function getOccupancyReport(Request $request)
    {
        $request->validate([
            'hostel_id' => 'nullable|exists:hostels,id',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after:date_from',
        ]);

        $query = HostelAllocation::with(['hostel', 'floor', 'room', 'bed', 'student'])
            ->whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            });

        if ($request->filled('hostel_id')) {
            $query->where('hostel_id', $request->hostel_id);
        }

        if ($request->filled('date_from')) {
            $query->where('allocation_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('allocation_date', '<=', $request->date_to);
        }

        $allocations = $query->orderBy('allocation_date', 'desc')->get();

        return response()->json($allocations);
    }

    public function getHostelStatistics()
    {
        $stats = [
            'total_hostels' => Hostel::where('school_id', Auth::user()->school_id)->count(),
            'boys_hostels' => Hostel::where('school_id', Auth::user()->school_id)
                ->where('type', 'boys')->count(),
            'girls_hostels' => Hostel::where('school_id', Auth::user()->school_id)
                ->where('type', 'girls')->count(),
            'total_capacity' => Hostel::where('school_id', Auth::user()->school_id)->sum('total_capacity'),
            'total_occupancy' => HostelBed::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->where('status', 'occupied')->count(),
            'occupancy_rate' => 0,
        ];

        if ($stats['total_capacity'] > 0) {
            $stats['occupancy_rate'] = round(($stats['total_occupancy'] / $stats['total_capacity']) * 100, 2);
        }

        return response()->json($stats);
    }

    public function getAvailableBeds(Hostel $hostel, Request $request)
    {
        $this->authorize('view', $hostel);

        $request->validate([
            'floor_id' => 'nullable|exists:hostel_floors,id',
            'room_type' => 'nullable|in:' . implode(',', array_keys(HostelRoom::TYPE_OPTIONS)),
        ]);

        $query = $hostel->beds()->with(['floor', 'room'])
            ->where('status', 'vacant')
            ->where('is_active', true);

        if ($request->filled('floor_id')) {
            $query->where('floor_id', $request->floor_id);
        }

        if ($request->filled('room_type')) {
            $query->whereHas('room', function ($q) use ($request) {
                $q->where('room_type', $request->room_type);
            });
        }

        $beds = $query->get();

        return response()->json($beds);
    }
}
