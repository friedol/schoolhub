<?php

namespace App\Http\Controllers\Hostel;

use App\Http\Controllers\Controller;
use App\Models\HostelAllocation;
use App\Models\Hostel;
use App\Models\HostelBed;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class HostelAllocationController extends Controller
{
    public function index(Request $request)
    {
        $query = HostelAllocation::with(['hostel', 'floor', 'room', 'bed', 'student', 'allocatedBy'])
            ->whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            });

        // Apply filters
        if ($request->filled('hostel_id')) {
            $query->where('hostel_id', $request->hostel_id);
        }

        if ($request->filled('academic_year')) {
            $query->where('academic_year', $request->academic_year);
        }

        if ($request->filled('term')) {
            $query->where('term', $request->term);
        }

        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('student_number', 'like', "%{$search}%");
            });
        }

        $allocations = $query->orderBy('allocation_date', 'desc')
            ->paginate(15)
            ->withQueryString();

        $hostels = Hostel::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Statistics
        $stats = [
            'total_allocations' => HostelAllocation::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->count(),
            'active_allocations' => HostelAllocation::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->where('is_active', true)->count(),
            'new_allocations' => HostelAllocation::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->where('allocation_type', 'new')->count(),
            'transfers' => HostelAllocation::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->where('allocation_type', 'transfer')->count(),
        ];

        return Inertia::render('Hostel/Allocations/Index', [
            'allocations' => $allocations,
            'hostels' => $hostels,
            'stats' => $stats,
            'typeOptions' => HostelAllocation::TYPE_OPTIONS,
            'filters' => $request->only(['hostel_id', 'academic_year', 'term', 'status', 'search']),
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
            ->orderBy('name')
            ->get();

        return Inertia::render('Hostel/Allocations/Create', [
            'hostels' => $hostels,
            'students' => $students,
            'typeOptions' => HostelAllocation::TYPE_OPTIONS,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'hostel_id' => 'required|exists:hostels,id',
            'floor_id' => 'required|exists:hostel_floors,id',
            'room_id' => 'required|exists:hostel_rooms,id',
            'bed_id' => 'required|exists:hostel_beds,id',
            'student_id' => 'required|exists:users,id',
            'allocation_date' => 'required|date',
            'allocation_type' => 'required|in:' . implode(',', array_keys(HostelAllocation::TYPE_OPTIONS)),
            'academic_year' => 'required|string',
            'term' => 'required|string',
            'allocation_notes' => 'nullable|string|max:500',
        ]);

        // Check if student already has an active allocation
        $existingAllocation = HostelAllocation::where('student_id', $request->student_id)
            ->where('is_active', true)
            ->first();

        if ($existingAllocation && $request->allocation_type !== 'transfer') {
            return redirect()->back()
                ->with('error', 'Student already has an active allocation. Use transfer option instead.');
        }

        // Check if bed is available
        $bed = HostelBed::findOrFail($request->bed_id);
        if (!$bed->isAvailable()) {
            return redirect()->back()
                ->with('error', 'Selected bed is not available for allocation.');
        }

        DB::transaction(function () use ($request) {
            // Deactivate existing allocation if this is a transfer
            if ($request->allocation_type === 'transfer' && $existingAllocation) {
                $existingAllocation->update(['is_active' => false]);
            }

            // Create new allocation
            $allocation = HostelAllocation::create([
                'hostel_id' => $request->hostel_id,
                'floor_id' => $request->floor_id,
                'room_id' => $request->room_id,
                'bed_id' => $request->bed_id,
                'student_id' => $request->student_id,
                'allocation_date' => $request->allocation_date,
                'allocation_type' => $request->allocation_type,
                'academic_year' => $request->academic_year,
                'term' => $request->term,
                'allocation_notes' => $request->allocation_notes,
                'allocated_by' => Auth::id(),
            ]);

            // Update bed status
            $bed = HostelBed::findOrFail($request->bed_id);
            $bed->update(['status' => 'occupied']);

            // Update room occupancy
            $room = $bed->room;
            $room->increment('current_occupancy');
        });

        return redirect()->route('hostel.allocations.index')
            ->with('success', 'Student allocated successfully.');
    }

    public function show(HostelAllocation $allocation)
    {
        $this->authorize('view', $allocation);

        $allocation->load([
            'hostel',
            'floor',
            'room',
            'bed',
            'student',
            'allocatedBy',
            'createdBy',
            'allocationHistory.performedBy'
        ]);

        return Inertia::render('Hostel/Allocations/Show', [
            'allocation' => $allocation,
        ]);
    }

    public function edit(HostelAllocation $allocation)
    {
        $this->authorize('update', $allocation);

        if (!$allocation->is_active) {
            return redirect()->back()
                ->with('error', 'Cannot edit inactive allocation.');
        }

        $allocation->load(['hostel', 'floor', 'room', 'bed', 'student']);

        $hostels = Hostel::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Hostel/Allocations/Edit', [
            'allocation' => $allocation,
            'hostels' => $hostels,
            'typeOptions' => HostelAllocation::TYPE_OPTIONS,
        ]);
    }

    public function update(Request $request, HostelAllocation $allocation)
    {
        $this->authorize('update', $allocation);

        if (!$allocation->is_active) {
            return redirect()->back()
                ->with('error', 'Cannot update inactive allocation.');
        }

        $request->validate([
            'hostel_id' => 'required|exists:hostels,id',
            'floor_id' => 'required|exists:hostel_floors,id',
            'room_id' => 'required|exists:hostel_rooms,id',
            'bed_id' => 'required|exists:hostel_beds,id',
            'allocation_date' => 'required|date',
            'allocation_type' => 'required|in:' . implode(',', array_keys(HostelAllocation::TYPE_OPTIONS)),
            'academic_year' => 'required|string',
            'term' => 'required|string',
            'allocation_notes' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($request, $allocation) {
            // Update old bed status
            $oldBed = $allocation->bed;
            $oldBed->update(['status' => 'vacant']);
            $oldRoom = $oldBed->room;
            $oldRoom->decrement('current_occupancy');

            // Check if new bed is available
            $newBed = HostelBed::findOrFail($request->bed_id);
            if (!$newBed->isAvailable()) {
                throw new \Exception('Selected bed is not available for allocation.');
            }

            // Update allocation
            $allocation->update([
                'hostel_id' => $request->hostel_id,
                'floor_id' => $request->floor_id,
                'room_id' => $request->room_id,
                'bed_id' => $request->bed_id,
                'allocation_date' => $request->allocation_date,
                'allocation_type' => $request->allocation_type,
                'academic_year' => $request->academic_year,
                'term' => $request->term,
                'allocation_notes' => $request->allocation_notes,
            ]);

            // Update new bed status
            $newBed->update(['status' => 'occupied']);
            $newRoom = $newBed->room;
            $newRoom->increment('current_occupancy');
        });

        return redirect()->route('hostel.allocations.index')
            ->with('success', 'Allocation updated successfully.');
    }

    public function deallocate(HostelAllocation $allocation)
    {
        $this->authorize('update', $allocation);

        if (!$allocation->is_active) {
            return redirect()->back()
                ->with('error', 'Allocation is already inactive.');
        }

        DB::transaction(function () use ($allocation) {
            // Update allocation
            $allocation->update(['is_active' => false]);

            // Update bed status
            $bed = $allocation->bed;
            $bed->update(['status' => 'vacant']);

            // Update room occupancy
            $room = $bed->room;
            $room->decrement('current_occupancy');
        });

        return redirect()->back()
            ->with('success', 'Student deallocated successfully.');
    }

    public function bulkAllocate(Request $request)
    {
        $request->validate([
            'hostel_id' => 'required|exists:hostels,id',
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'exists:users,id',
            'allocation_date' => 'required|date',
            'academic_year' => 'required|string',
            'term' => 'required|string',
        ]);

        $hostel = Hostel::findOrFail($request->hostel_id);
        $availableBeds = $hostel->getAvailableBeds();

        if (count($availableBeds) < count($request->student_ids)) {
            return redirect()->back()
                ->with('error', 'Not enough available beds for all students.');
        }

        $allocatedCount = 0;
        $errors = [];

        DB::transaction(function () use ($request, $availableBeds, &$allocatedCount, &$errors) {
            foreach ($request->student_ids as $index => $studentId) {
                try {
                    // Check if student already has an active allocation
                    $existingAllocation = HostelAllocation::where('student_id', $studentId)
                        ->where('is_active', true)
                        ->first();

                    if ($existingAllocation) {
                        $errors[] = "Student ID {$studentId} already has an active allocation.";
                        continue;
                    }

                    $bed = $availableBeds[$index];

                    // Create allocation
                    HostelAllocation::create([
                        'hostel_id' => $request->hostel_id,
                        'floor_id' => $bed->floor_id,
                        'room_id' => $bed->room_id,
                        'bed_id' => $bed->id,
                        'student_id' => $studentId,
                        'allocation_date' => $request->allocation_date,
                        'allocation_type' => 'new',
                        'academic_year' => $request->academic_year,
                        'term' => $request->term,
                        'allocated_by' => Auth::id(),
                    ]);

                    // Update bed status
                    $bed->update(['status' => 'occupied']);

                    // Update room occupancy
                    $room = $bed->room;
                    $room->increment('current_occupancy');

                    $allocatedCount++;
                } catch (\Exception $e) {
                    $errors[] = "Error allocating student ID {$studentId}: " . $e->getMessage();
                }
            }
        });

        $message = "Successfully allocated {$allocatedCount} students.";
        if (!empty($errors)) {
            $message .= " Errors: " . implode(', ', $errors);
        }

        return redirect()->back()
            ->with('success', $message);
    }

    public function getStudentAllocationHistory($studentId)
    {
        $allocations = HostelAllocation::where('student_id', $studentId)
            ->with(['hostel', 'floor', 'room', 'bed', 'allocatedBy'])
            ->orderBy('allocation_date', 'desc')
            ->get();

        return response()->json($allocations);
    }

    public function getCurrentAllocation($studentId)
    {
        $allocation = HostelAllocation::getCurrentAllocation($studentId);

        return response()->json($allocation);
    }
}
