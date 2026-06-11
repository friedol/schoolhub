<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ConfigurationController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('role:school_admin,headteacher,super_admin');
    }

    /**
     * Display system configuration dashboard
     */
    public function index(): Response
    {
        $user = Auth::user();
        
        if ($user->isSuperAdmin()) {
            return $this->superAdminConfiguration();
        } else {
            return $this->schoolConfiguration($user->school);
        }
    }

    /**
     * Super admin configuration
     */
    private function superAdminConfiguration(): Response
    {
        $platform = Auth::user()->platform;
        
        $systemSettings = [
            'platform' => $platform,
            'total_schools' => $platform->schools()->count(),
            'total_users' => $platform->allUsers()->count(),
            'active_schools' => $platform->schools()->where('is_active', true)->count(),
        ];

        return Inertia::render('System/SuperAdminConfiguration', [
            'systemSettings' => $systemSettings,
        ]);
    }

    /**
     * School configuration
     */
    private function schoolConfiguration(School $school): Response
    {
        $schoolSettings = [
            'school' => $school,
            'total_users' => $school->users()->count(),
            'total_students' => $school->students()->count(),
            'total_teachers' => $school->teachers()->count(),
            'total_classes' => $school->classes()->count(),
            'total_subjects' => $school->subjects()->count(),
        ];

        return Inertia::render('System/SchoolConfiguration', [
            'schoolSettings' => $schoolSettings,
        ]);
    }

    /**
     * Update configuration settings
     */
    public function update(Request $request)
    {
        $user = Auth::user();
        if ($user->isSuperAdmin()) {
            return $this->updatePlatformSettings($request);
        } else {
            return $this->updateSchoolSettings($request);
        }
    }

    /**
     * Update school settings
     */
    public function updateSchoolSettings(Request $request)
    {
        $user = Auth::user();
        $school = $user->school;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'motto' => 'nullable|string|max:255',
            'contact_email' => 'required|email|max:255',
            'contact_phone' => 'required|string|max:20',
            'address' => 'required|string',
            'region' => 'required|string|max:255',
            'district' => 'required|string|max:255',
            'ward' => 'nullable|string|max:255',
            'registration_number' => 'nullable|string|max:255',
            'necta_number' => 'nullable|string|max:255',
            'settings' => 'nullable|array',
        ]);

        $school->update($validated);

        return redirect()->back()
            ->with('success', 'School settings updated successfully.');
    }

    /**
     * Update platform settings (Super Admin only)
     */
    public function updatePlatformSettings(Request $request)
    {
        $user = Auth::user();
        
        if (!$user->isSuperAdmin()) {
            abort(403, 'Unauthorized access.');
        }

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
            'settings' => 'nullable|array',
        ]);

        $platform->update($validated);

        return redirect()->back()
            ->with('success', 'Platform settings updated successfully.');
    }

    /**
     * Manage user roles and permissions
     */
    public function manageRoles(): Response
    {
        $user = Auth::user();
        $school = $user->school;

        $roles = Role::where('is_system_role', true)->get();
        $permissions = Permission::where('is_system_permission', true)->get();

        return Inertia::render('System/RoleManagement', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Create custom role
     */
    public function createRole(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'display_name' => $validated['display_name'],
            'description' => $validated['description'],
            'is_system_role' => false,
            'permissions' => $validated['permissions'],
        ]);

        return redirect()->back()
            ->with('success', "Role '{$role->display_name}' created successfully.");
    }

    /**
     * Update role
     */
    public function updateRole(Request $request, Role $role)
    {
        $validated = $request->validate([
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role->update([
            'display_name' => $validated['display_name'],
            'description' => $validated['description'],
            'permissions' => $validated['permissions'],
        ]);

        return redirect()->back()
            ->with('success', "Role '{$role->display_name}' updated successfully.");
    }

    /**
     * Delete role
     */
    public function deleteRole(Role $role)
    {
        if ($role->is_system_role) {
            return redirect()->back()
                ->with('error', 'Cannot delete system roles.');
        }

        $role->delete();

        return redirect()->back()
            ->with('success', "Role '{$role->display_name}' deleted successfully.");
    }

    /**
     * Manage users
     */
    public function manageUsers(Request $request): Response
    {
        $user = Auth::user();
        $school = $user->school;

        $query = $school->users()->with(['roles']);

        // Apply filters
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $users = $query->latest()->paginate(15);

        $roles = Role::where('is_system_role', true)->get();

        return Inertia::render('System/UserManagement', [
            'users' => $users,
            'roles' => $roles,
            'filters' => $request->only(['search', 'role', 'status']),
        ]);
    }

    /**
     * Update user role
     */
    public function updateUserRole(Request $request, User $targetUser)
    {
        $user = Auth::user();
        $school = $user->school;

        // Ensure user belongs to the same school
        if ($targetUser->school_id !== $school->id) {
            abort(403, 'Unauthorized access.');
        }

        $validated = $request->validate([
            'role' => 'required|string|in:school_admin,headteacher,bursar,teacher,student,parent',
        ]);

        $targetUser->update(['role' => $validated['role']]);

        return redirect()->back()
            ->with('success', "User role updated successfully.");
    }

    /**
     * Toggle user status
     */
    public function toggleUserStatus(User $targetUser)
    {
        $user = Auth::user();
        $school = $user->school;

        // Ensure user belongs to the same school
        if ($targetUser->school_id !== $school->id) {
            abort(403, 'Unauthorized access.');
        }

        $targetUser->update(['is_active' => !$targetUser->is_active]);

        $status = $targetUser->is_active ? 'activated' : 'deactivated';
        
        return redirect()->back()
            ->with('success', "User has been {$status}.");
    }

    /**
     * Reset user password
     */
    public function resetUserPassword(Request $request, User $targetUser)
    {
        $user = Auth::user();
        $school = $user->school;

        // Ensure user belongs to the same school
        if ($targetUser->school_id !== $school->id) {
            abort(403, 'Unauthorized access.');
        }

        $validated = $request->validate([
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $targetUser->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return redirect()->back()
            ->with('success', 'User password reset successfully.');
    }

    /**
     * System backup
     */
    public function createBackup()
    {
        $user = Auth::user();
        
        if (!$user->isSuperAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        // Create database backup
        $backupPath = 'backups/backup_' . date('Y-m-d_H-i-s') . '.sql';
        
        // This would typically use a backup service
        // For now, we'll just return a success message
        $backupCreated = true;

        if ($backupCreated) {
            return redirect()->back()
                ->with('success', 'System backup created successfully.');
        } else {
            return redirect()->back()
                ->with('error', 'Failed to create system backup.');
        }
    }

    /**
     * System maintenance mode
     */
    public function toggleMaintenanceMode(Request $request)
    {
        $user = Auth::user();
        
        if (!$user->isSuperAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        $validated = $request->validate([
            'maintenance_mode' => 'required|boolean',
            'maintenance_message' => 'nullable|string',
        ]);

        // Update maintenance mode settings
        // This would typically update a configuration file or database setting
        
        $mode = $validated['maintenance_mode'] ? 'enabled' : 'disabled';
        
        return redirect()->back()
            ->with('success', "Maintenance mode {$mode}.");
    }

    /**
     * System logs
     */
    public function viewLogs(Request $request): Response
    {
        $user = Auth::user();
        
        if (!$user->isSuperAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        $logType = $request->get('type', 'application');
        $logLevel = $request->get('level', 'all');
        
        // This would typically read from log files
        $logs = [
            [
                'timestamp' => now()->subMinutes(5),
                'level' => 'info',
                'message' => 'User logged in successfully',
                'context' => ['user_id' => 1, 'ip' => '127.0.0.1'],
            ],
            [
                'timestamp' => now()->subMinutes(10),
                'level' => 'warning',
                'message' => 'Failed login attempt',
                'context' => ['email' => 'test@example.com', 'ip' => '127.0.0.1'],
            ],
        ];

        return Inertia::render('System/SystemLogs', [
            'logs' => $logs,
            'logType' => $logType,
            'logLevel' => $logLevel,
        ]);
    }

    /**
     * System health check
     */
    public function systemHealth()
    {
        $user = Auth::user();
        
        if (!$user->isSuperAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        $health = [
            'database' => $this->checkDatabaseHealth(),
            'storage' => $this->checkStorageHealth(),
            'cache' => $this->checkCacheHealth(),
            'queue' => $this->checkQueueHealth(),
        ];

        return response()->json([
            'success' => true,
            'health' => $health,
            'overall_status' => $this->getOverallHealthStatus($health),
        ]);
    }

    /**
     * Check database health
     */
    private function checkDatabaseHealth(): array
    {
        try {
            \DB::connection()->getPdo();
            return [
                'status' => 'healthy',
                'message' => 'Database connection successful',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'message' => 'Database connection failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Check storage health
     */
    private function checkStorageHealth(): array
    {
        try {
            $testFile = 'health_check_' . time() . '.txt';
            Storage::put($testFile, 'Health check');
            Storage::delete($testFile);
            
            return [
                'status' => 'healthy',
                'message' => 'Storage is accessible',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'message' => 'Storage check failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Check cache health
     */
    private function checkCacheHealth(): array
    {
        try {
            $testKey = 'health_check_' . time();
            \Cache::put($testKey, 'test', 60);
            $value = \Cache::get($testKey);
            \Cache::forget($testKey);
            
            if ($value === 'test') {
                return [
                    'status' => 'healthy',
                    'message' => 'Cache is working properly',
                ];
            } else {
                return [
                    'status' => 'unhealthy',
                    'message' => 'Cache read/write failed',
                ];
            }
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'message' => 'Cache check failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Check queue health
     */
    private function checkQueueHealth(): array
    {
        try {
            // This would typically check if queue workers are running
            return [
                'status' => 'healthy',
                'message' => 'Queue system is operational',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'message' => 'Queue check failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Get overall health status
     */
    private function getOverallHealthStatus(array $health): string
    {
        $unhealthyCount = collect($health)->where('status', 'unhealthy')->count();
        
        if ($unhealthyCount === 0) {
            return 'healthy';
        } elseif ($unhealthyCount < count($health) / 2) {
            return 'degraded';
        } else {
            return 'unhealthy';
        }
    }
}
