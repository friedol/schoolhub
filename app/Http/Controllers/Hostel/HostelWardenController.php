<?php

namespace App\Http\Controllers\Hostel;

use App\Http\Controllers\Controller;
use App\Models\HostelWarden;
use App\Models\Hostel;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class HostelWardenController extends Controller
{
    public function index(Request $request)
    {
        $query = HostelWarden::with(['hostel', 'user'])
            ->whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            });

        // Apply filters
        if ($request->filled('hostel_id')) {
            $query->where('hostel_id', $request->hostel_id);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $wardens = $query->orderBy('assignment_date', 'desc')
            ->paginate(15)
            ->withQueryString();

        $hostels = Hostel::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Statistics
        $stats = [
            'total_wardens' => HostelWarden::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->count(),
            'active_wardens' => HostelWarden::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->where('is_active', true)->count(),
            'hostels_with_wardens' => Hostel::where('school_id', Auth::user()->school_id)
                ->whereHas('wardens', function ($q) {
                    $q->where('is_active', true);
                })->count(),
            'hostels_without_wardens' => Hostel::where('school_id', Auth::user()->school_id)
                ->whereDoesntHave('wardens', function ($q) {
                    $q->where('is_active', true);
                })->count(),
        ];

        return Inertia::render('Hostel/Wardens/Index', [
            'wardens' => $wardens,
            'hostels' => $hostels,
            'stats' => $stats,
            'filters' => $request->only(['hostel_id', 'is_active', 'search']),
        ]);
    }

    public function create()
    {
        $hostels = Hostel::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $staff = User::where('school_id', Auth::user()->school_id)
            ->whereIn('role', ['teacher', 'staff'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Hostel/Wardens/Create', [
            'hostels' => $hostels,
            'staff' => $staff,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'hostel_id' => 'required|exists:hostels,id',
            'user_id' => 'required|exists:users,id',
            'assignment_date' => 'required|date',
            'responsibilities' => 'nullable|string|max:1000',
            'notes' => 'nullable|string|max:500',
        ]);

        // Check if user is already assigned as warden to any hostel
        $existingWarden = HostelWarden::where('user_id', $request->user_id)
            ->where('is_active', true)
            ->first();

        if ($existingWarden) {
            return redirect()->back()
                ->with('error', 'Staff member is already assigned as warden to another hostel.');
        }

        // Check if hostel already has an active warden
        $existingHostelWarden = HostelWarden::where('hostel_id', $request->hostel_id)
            ->where('is_active', true)
            ->first();

        if ($existingHostelWarden) {
            return redirect()->back()
                ->with('error', 'Hostel already has an active warden assigned.');
        }

        $warden = HostelWarden::create([
            'hostel_id' => $request->hostel_id,
            'user_id' => $request->user_id,
            'assignment_date' => $request->assignment_date,
            'responsibilities' => $request->responsibilities,
            'notes' => $request->notes,
            'is_active' => true,
        ]);

        return redirect()->route('hostel.wardens.index')
            ->with('success', 'Warden assigned successfully.');
    }

    public function show(HostelWarden $warden)
    {
        $this->authorize('view', $warden);

        $warden->load([
            'hostel',
            'user',
            'dutyRosters' => function ($query) {
                $query->orderBy('shift_date', 'desc')->limit(10);
            }
        ]);

        return Inertia::render('Hostel/Wardens/Show', [
            'warden' => $warden,
        ]);
    }

    public function edit(HostelWarden $warden)
    {
        $this->authorize('update', $warden);

        $warden->load(['hostel', 'user']);

        $hostels = Hostel::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $staff = User::where('school_id', Auth::user()->school_id)
            ->whereIn('role', ['teacher', 'staff'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Hostel/Wardens/Edit', [
            'warden' => $warden,
            'hostels' => $hostels,
            'staff' => $staff,
        ]);
    }

    public function update(Request $request, HostelWarden $warden)
    {
        $this->authorize('update', $warden);

        $request->validate([
            'hostel_id' => 'required|exists:hostels,id',
            'user_id' => 'required|exists:users,id',
            'assignment_date' => 'required|date',
            'responsibilities' => 'nullable|string|max:1000',
            'notes' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        // Check if user is already assigned as warden to another hostel
        if ($request->user_id !== $warden->user_id) {
            $existingWarden = HostelWarden::where('user_id', $request->user_id)
                ->where('is_active', true)
                ->where('id', '!=', $warden->id)
                ->first();

            if ($existingWarden) {
                return redirect()->back()
                    ->with('error', 'Staff member is already assigned as warden to another hostel.');
            }
        }

        // Check if hostel already has an active warden
        if ($request->hostel_id !== $warden->hostel_id) {
            $existingHostelWarden = HostelWarden::where('hostel_id', $request->hostel_id)
                ->where('is_active', true)
                ->where('id', '!=', $warden->id)
                ->first();

            if ($existingHostelWarden) {
                return redirect()->back()
                    ->with('error', 'Hostel already has an active warden assigned.');
            }
        }

        $warden->update([
            'hostel_id' => $request->hostel_id,
            'user_id' => $request->user_id,
            'assignment_date' => $request->assignment_date,
            'responsibilities' => $request->responsibilities,
            'notes' => $request->notes,
            'is_active' => $request->is_active ?? true,
        ]);

        return redirect()->route('hostel.wardens.index')
            ->with('success', 'Warden assignment updated successfully.');
    }

    public function deactivate(HostelWarden $warden)
    {
        $this->authorize('update', $warden);

        if (!$warden->is_active) {
            return redirect()->back()
                ->with('error', 'Warden is already inactive.');
        }

        $warden->update(['is_active' => false]);

        return redirect()->back()
            ->with('success', 'Warden deactivated successfully.');
    }

    public function activate(HostelWarden $warden)
    {
        $this->authorize('update', $warden);

        if ($warden->is_active) {
            return redirect()->back()
                ->with('error', 'Warden is already active.');
        }

        // Check if user is already assigned as warden to another hostel
        $existingWarden = HostelWarden::where('user_id', $warden->user_id)
            ->where('is_active', true)
            ->where('id', '!=', $warden->id)
            ->first();

        if ($existingWarden) {
            return redirect()->back()
                ->with('error', 'Staff member is already assigned as warden to another hostel.');
        }

        // Check if hostel already has an active warden
        $existingHostelWarden = HostelWarden::where('hostel_id', $warden->hostel_id)
            ->where('is_active', true)
            ->where('id', '!=', $warden->id)
            ->first();

        if ($existingHostelWarden) {
            return redirect()->back()
                ->with('error', 'Hostel already has an active warden assigned.');
        }

        $warden->update(['is_active' => true]);

        return redirect()->back()
            ->with('success', 'Warden activated successfully.');
    }

    public function getWardenDutyRoster(HostelWarden $warden)
    {
        $this->authorize('view', $warden);

        $roster = $warden->dutyRosters()
            ->orderBy('shift_date', 'desc')
            ->paginate(15);

        return response()->json($roster);
    }

    public function createDutyRoster(Request $request, HostelWarden $warden)
    {
        $this->authorize('update', $warden);

        $request->validate([
            'shift_date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'notes' => 'nullable|string|max:500',
        ]);

        $warden->dutyRosters()->create([
            'shift_date' => $request->shift_date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'notes' => $request->notes,
        ]);

        return redirect()->back()
            ->with('success', 'Duty roster created successfully.');
    }

    public function getHostelWardens($hostelId)
    {
        $wardens = HostelWarden::where('hostel_id', $hostelId)
            ->with(['user'])
            ->orderBy('assignment_date', 'desc')
            ->get();

        return response()->json($wardens);
    }

    public function getActiveWardens()
    {
        $wardens = HostelWarden::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })
            ->where('is_active', true)
            ->with(['hostel', 'user'])
            ->get();

        return response()->json($wardens);
    }
}



