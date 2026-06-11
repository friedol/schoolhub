<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Platform;
use App\Models\School;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PlatformController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('role:super_admin');
    }

    /**
     * Display the super admin dashboard
     */
    public function dashboard(): Response
    {
        $user = Auth::user();
        $platform = $user->platform;
        
        // Get all schools for the view
        $schools = $platform->schools()
            ->with(['users' => function($query) {
                $query->where('role', 'student');
            }])
            ->get()
            ->map(function($school) {
                return [
                    'id' => $school->id,
                    'name' => $school->name,
                    'code' => $school->code,
                    'address' => $school->address,
                    'region' => $school->region,
                    'district' => $school->district,
                    'level' => $school->school_level,
                    'students_count' => $school->users->count(),
                    'teachers_count' => $school->users()->where('role', 'teacher')->count(),
                    'is_active' => $school->is_active,
                    'created_at' => $school->created_at,
                ];
            });

        // Get statistics in the format expected by the view
        $statistics = [
            'total_platforms' => 1, // Since we're managing one platform
            'total_schools' => $platform->schools()->count(),
            'total_students' => $platform->allUsers()->where('role', 'student')->count(),
            'total_teachers' => $platform->allUsers()->where('role', 'teacher')->count(),
            'total_revenue' => 0, // Placeholder - would need to calculate from actual data
            'active_schools' => $platform->schools()->where('is_active', true)->count(),
        ];

        return Inertia::render('SuperAdmin/Dashboard', [
            'platforms' => [$platform], // Wrap in array as expected by view
            'schools' => $schools,
            'statistics' => $statistics,
            'currentSchool' => User::getCurrentSchool(), // Pass current school context
        ]);
    }

    /**
     * Display all schools
     */
    public function schools(Request $request): Response
    {
        $user = Auth::user();
        $platform = $user->platform;

        $query = $platform->schools()->withCount(['users as student_count' => function($query) {
            $query->where('role', 'student');
        }]);

        // Apply filters
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('code', 'like', '%' . $request->search . '%')
                  ->orWhere('region', 'like', '%' . $request->search . '%')
                  ->orWhere('district', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('region')) {
            $query->where('region', $request->region);
        }

        if ($request->filled('level')) {
            $query->where('school_level', $request->level);
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $schools = $query->latest()->get();

        // Calculate statistics
        $statistics = [
            'total_schools' => $platform->schools()->count(),
            'active_schools' => $platform->schools()->where('is_active', true)->count(),
            'inactive_schools' => $platform->schools()->where('is_active', false)->count(),
            'total_students' => $platform->schools()->withCount(['users as student_count' => function($query) {
                $query->where('role', 'student');
            }])->get()->sum('student_count'),
            'total_teachers' => $platform->schools()->withCount(['users as teacher_count' => function($query) {
                $query->where('role', 'teacher');
            }])->get()->sum('teacher_count'),
        ];

        return Inertia::render('SuperAdmin/Schools', [
            'schools' => $schools,
            'statistics' => $statistics,
        ]);
    }

    /**
     * Show the form for creating a new school
     */
    public function createSchool(): Response
    {
        return Inertia::render('SuperAdmin/Schools/Create');
    }

    /**
     * Store a newly created school
     */
    public function storeSchool(Request $request)
    {
        $user = Auth::user();
        $platform = $user->platform;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'required|string',
            'region' => 'required|string|max:255',
            'district' => 'required|string|max:255',
            'ward' => 'nullable|string|max:255',
            'contact_email' => 'required|email|max:255',
            'contact_phone' => 'required|string|max:20',
            'school_level' => 'required|in:nursery,primary,secondary,combined',
            'registration_number' => 'nullable|string|max:255',
            'necta_number' => 'nullable|string|max:255',
            'motto' => 'nullable|string|max:255',
            'admin_name' => 'required|string|max:255',
            'admin_email' => 'required|email|max:255|unique:users,email',
            'admin_phone' => 'required|string|max:20',
        ]);

        // Create the school
        $school = $platform->schools()->create([
            'name' => $validated['name'],
            'code' => $platform->generateSchoolCode(),
            'description' => $validated['description'] ?? null,
            'address' => $validated['address'],
            'region' => $validated['region'],
            'district' => $validated['district'],
            'ward' => $validated['ward'] ?? null,
            'contact_email' => $validated['contact_email'],
            'contact_phone' => $validated['contact_phone'],
            'school_level' => $validated['school_level'],
            'registration_number' => $validated['registration_number'] ?? null,
            'necta_number' => $validated['necta_number'] ?? null,
            'motto' => $validated['motto'] ?? null,
            'is_active' => true,
        ]);

        // Create the school admin user
        $admin = User::create([
            'name' => $validated['admin_name'],
            'email' => $validated['admin_email'],
            'phone' => $validated['admin_phone'],
            'password' => Hash::make(Str::random(12)), // Temporary password
            'role' => 'school_admin',
            'school_id' => $school->id,
            'platform_id' => $platform->id,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        return redirect()->route('super-admin.schools')
            ->with('success', "School '{$school->name}' has been created successfully. Admin credentials have been sent to {$admin->email}.");
    }

    /**
     * Display the specified school
     */
    public function showSchool(School $school): Response
    {
        $school->load(['users' => function($query) {
            $query->with('roles');
        }]);

        $statistics = $school->getStatistics();

        // Add the school with statistics to the response
        $schoolWithStats = $school->toArray();
        $schoolWithStats['statistics'] = $statistics;

        return Inertia::render('SuperAdmin/Schools/Show', [
            'school' => $schoolWithStats,
        ]);
    }

    /**
     * Show the form for editing the specified school
     */
    public function editSchool(School $school): Response
    {
        return Inertia::render('SuperAdmin/Schools/Edit', [
            'school' => $school,
        ]);
    }

    /**
     * Update the specified school
     */
    public function updateSchool(Request $request, School $school): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'motto' => 'nullable|string|max:255',
            'contact_email' => 'required|email|max:255',
            'contact_phone' => 'required|string|max:20',
            'address' => 'required|string|max:500',
            'region' => 'required|string|max:100',
            'district' => 'required|string|max:100',
            'ward' => 'nullable|string|max:100',
            'registration_number' => 'nullable|string|max:100',
            'necta_number' => 'nullable|string|max:100',
            'school_level' => 'required|in:nursery,primary,secondary,advanced_level',
            'is_active' => 'boolean',
        ]);

        $school->update($validated);

        return redirect()->route('super-admin.schools.show', $school)
            ->with('success', 'School updated successfully.');
    }

    /**
     * Toggle school active status
     */
    public function toggleSchoolStatus(School $school)
    {
        $school->update(['is_active' => !$school->is_active]);

        $status = $school->is_active ? 'activated' : 'deactivated';
        
        return redirect()->back()
            ->with('success', "School '{$school->name}' has been {$status}.");
    }

    /**
     * Display platform analytics
     */
    public function analytics(): Response
    {
        $user = Auth::user();
        $platform = $user->platform;

        // Get detailed analytics
        $analytics = [
            'schools' => [
                'total' => $platform->schools()->count(),
                'active' => $platform->schools()->where('is_active', true)->count(),
                'by_level' => $platform->schools()
                    ->selectRaw('school_level, count(*) as count')
                    ->groupBy('school_level')
                    ->get()
                    ->pluck('count', 'school_level'),
                'by_region' => $platform->schools()
                    ->selectRaw('region, count(*) as count')
                    ->groupBy('region')
                    ->get()
                    ->pluck('count', 'region'),
            ],
            'users' => [
                'total' => $platform->allUsers()->count(),
                'by_role' => $platform->allUsers()
                    ->selectRaw('role, count(*) as count')
                    ->groupBy('role')
                    ->get()
                    ->pluck('count', 'role'),
                'active' => $platform->allUsers()->where('is_active', true)->count(),
            ],
            'growth' => [
                'schools_this_month' => $platform->schools()
                    ->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count(),
                'users_this_month' => $platform->allUsers()
                    ->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count(),
            ],
        ];

        return Inertia::render('SuperAdmin/Analytics', [
            'analytics' => $analytics,
        ]);
    }

    /**
     * Display platform settings
     */
    public function settings(): Response
    {
        $user = Auth::user();
        $platform = $user->platform;

        return Inertia::render('SuperAdmin/Settings', [
            'platform' => $platform,
        ]);
    }

    /**
     * Update platform settings
     */
    public function updateSettings(Request $request)
    {
        $user = Auth::user();
        $platform = $user->platform;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'contact_email' => 'required|email|max:255',
            'contact_phone' => 'required|string|max:20',
            'address' => 'required|string',
            'region' => 'required|string|max:255',
            'district' => 'required|string|max:255',
            'subscription_plan' => 'required|in:basic,premium,enterprise',
        ]);

        $platform->update($validated);

        return redirect()->back()
            ->with('success', 'Platform settings updated successfully.');
    }
}
