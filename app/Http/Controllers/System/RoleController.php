<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('role:super_admin,school_admin,headteacher');
    }

    /**
     * Display a listing of roles
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        
        // For super admin, get all roles; for school admin, get school-specific roles
        if ($user->isSuperAdmin()) {
            $query = Role::with(['createdBy:id,name', 'users:id,name'])
                ->withCount(['users', 'permissions']);
        } else {
            $schoolId = $user->school_id;
            $query = Role::forSchool($schoolId)
                ->with(['createdBy:id,name', 'users:id,name'])
                ->withCount(['users', 'permissions']);
        }

        // Filter by type
        if ($request->has('type')) {
            if ($request->type === 'system') {
                $query->systemRoles();
            } elseif ($request->type === 'custom') {
                $query->customRoles();
            }
        }

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->active();
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Search
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('display_name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        $roles = $query->orderBy('is_system_role', 'desc')
            ->orderBy('name')
            ->paginate(15);

        return Inertia::render('System/Roles/Index', [
            'roles' => $roles,
            'filters' => $request->only(['type', 'status', 'search']),
            'systemRoles' => Role::SYSTEM_ROLES,
            'dataScopeOptions' => Role::DATA_SCOPE_OPTIONS,
            'permissionGroups' => Role::PERMISSION_GROUPS,
            'can' => [
                'createRole' => $user->isSuperAdmin() || $user->isSchoolAdmin(),
                'editRole' => $user->isSuperAdmin() || $user->isSchoolAdmin(),
                'deleteRole' => $user->isSuperAdmin() || $user->isSchoolAdmin(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new role
     */
    public function create(): Response
    {
        $user = Auth::user();
        $schoolId = $user->school_id;

        $permissions = Permission::forSchool($schoolId)
            ->active()
            ->orderBy('group')
            ->orderBy('resource')
            ->orderBy('action')
            ->get()
            ->groupBy('group');

        return Inertia::render('System/Roles/Create', [
            'permissions' => $permissions,
            'dataScopeOptions' => Role::DATA_SCOPE_OPTIONS,
            'permissionGroups' => Role::PERMISSION_GROUPS,
        ]);
    }

    /**
     * Store a newly created role
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $schoolId = $user->school_id;

        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,NULL,id,school_id,' . $schoolId,
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
            'data_scope' => 'required|array',
            'data_scope.*' => 'in:' . implode(',', array_keys(Role::DATA_SCOPE_OPTIONS)),
            'approval_permissions' => 'nullable|array',
            'approval_permissions.*' => 'string',
        ]);

        DB::beginTransaction();
        try {
            $role = Role::create([
                'school_id' => $schoolId,
                'name' => $request->name,
                'display_name' => $request->display_name,
                'description' => $request->description,
                'is_system_role' => false,
                'is_active' => true,
                'permissions' => $request->permissions ?? [],
                'data_scope' => $request->data_scope,
                'approval_permissions' => $request->approval_permissions ?? [],
                'created_by' => $user->id,
            ]);

            // Sync permissions
            if ($request->permissions) {
                $role->permissions()->sync($request->permissions);
            }

            DB::commit();

            return redirect()->route('system.roles.index')
                ->with('success', 'Role created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create role: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified role
     */
    public function show(Role $role): Response
    {
        $this->authorize('view', $role);

        $role->load([
            'createdBy:id,name',
            'permissions' => function ($query) {
                $query->orderBy('group')->orderBy('resource')->orderBy('action');
            },
            'users' => function ($query) {
                $query->select('users.id', 'users.name', 'users.email', 'users.role')
                      ->withPivot('assigned_at', 'expires_at', 'is_active');
            }
        ]);

        return Inertia::render('System/Roles/Show', [
            'role' => $role,
            'permissionGroups' => $role->getPermissionGroups(),
        ]);
    }

    /**
     * Show the form for editing the specified role
     */
    public function edit(Role $role): Response
    {
        $this->authorize('update', $role);

        $user = Auth::user();
        $schoolId = $user->school_id;

        $permissions = Permission::forSchool($schoolId)
            ->active()
            ->orderBy('group')
            ->orderBy('resource')
            ->orderBy('action')
            ->get()
            ->groupBy('group');

        $role->load('permissions');

        return Inertia::render('System/Roles/Edit', [
            'role' => $role,
            'permissions' => $permissions,
            'dataScopeOptions' => Role::DATA_SCOPE_OPTIONS,
            'permissionGroups' => Role::PERMISSION_GROUPS,
        ]);
    }

    /**
     * Update the specified role
     */
    public function update(Request $request, Role $role)
    {
        $this->authorize('update', $role);

        $user = Auth::user();
        $schoolId = $user->school_id;

        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $role->id . ',id,school_id,' . $schoolId,
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
            'data_scope' => 'required|array',
            'data_scope.*' => 'in:' . implode(',', array_keys(Role::DATA_SCOPE_OPTIONS)),
            'approval_permissions' => 'nullable|array',
            'approval_permissions.*' => 'string',
            'is_active' => 'boolean',
        ]);

        DB::beginTransaction();
        try {
            $role->update([
                'name' => $request->name,
                'display_name' => $request->display_name,
                'description' => $request->description,
                'permissions' => $request->permissions ?? [],
                'data_scope' => $request->data_scope,
                'approval_permissions' => $request->approval_permissions ?? [],
                'is_active' => $request->is_active ?? $role->is_active,
            ]);

            // Sync permissions
            if ($request->has('permissions')) {
                $role->permissions()->sync($request->permissions);
            }

            DB::commit();

            return redirect()->route('system.roles.index')
                ->with('success', 'Role updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update role: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified role
     */
    public function destroy(Role $role)
    {
        $this->authorize('delete', $role);

        if (!$role->canBeDeleted()) {
            return back()->withErrors(['error' => 'Cannot delete this role. It may be a system role or has assigned users.']);
        }

        DB::beginTransaction();
        try {
            // Remove all role permissions
            $role->permissions()->detach();
            
            // Remove all user role assignments
            $role->users()->detach();
            
            // Delete the role
            $role->delete();

            DB::commit();

            return redirect()->route('system.roles.index')
                ->with('success', 'Role deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to delete role: ' . $e->getMessage()]);
        }
    }

    /**
     * Duplicate a role
     */
    public function duplicate(Role $role)
    {
        $this->authorize('create', Role::class);

        $user = Auth::user();
        $newName = $role->name . '_copy_' . time();

        DB::beginTransaction();
        try {
            $newRole = $role->duplicate($newName, $user->id);
            
            // Copy permissions
            $newRole->permissions()->sync($role->permissions->pluck('id'));

            DB::commit();

            return redirect()->route('system.roles.edit', $newRole)
                ->with('success', 'Role duplicated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to duplicate role: ' . $e->getMessage()]);
        }
    }

    /**
     * Assign role to users
     */
    public function assignUsers(Request $request, Role $role)
    {
        $this->authorize('update', $role);

        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'expires_at' => 'nullable|date|after:today',
            'notes' => 'nullable|string',
        ]);

        $user = Auth::user();
        $assignedCount = 0;

        DB::beginTransaction();
        try {
            foreach ($request->user_ids as $userId) {
                // Check if user already has this role
                $existingAssignment = $role->users()->where('user_id', $userId)->first();
                
                if ($existingAssignment) {
                    // Update existing assignment
                    $existingAssignment->pivot->update([
                        'is_active' => true,
                        'expires_at' => $request->expires_at,
                        'notes' => $request->notes,
                    ]);
                } else {
                    // Create new assignment
                    $role->users()->attach($userId, [
                        'assigned_by' => $user->id,
                        'assigned_at' => now(),
                        'expires_at' => $request->expires_at,
                        'is_active' => true,
                        'notes' => $request->notes,
                    ]);
                }
                
                $assignedCount++;
            }

            DB::commit();

            return back()->with('success', "Role assigned to {$assignedCount} user(s) successfully.");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to assign role: ' . $e->getMessage()]);
        }
    }

    /**
     * Revoke role from users
     */
    public function revokeUsers(Request $request, Role $role)
    {
        $this->authorize('update', $role);

        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        DB::beginTransaction();
        try {
            $role->users()->whereIn('user_id', $request->user_ids)->update([
                'is_active' => false,
            ]);

            DB::commit();

            return back()->with('success', 'Role revoked from selected users successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to revoke role: ' . $e->getMessage()]);
        }
    }

    /**
     * Get users available for role assignment
     */
    public function getAvailableUsers(Request $request, Role $role)
    {
        $this->authorize('view', $role);

        $user = Auth::user();
        $schoolId = $user->school_id;

        $query = User::forSchool($schoolId)
            ->where('is_active', true)
            ->whereNotIn('id', $role->users()->pluck('user_id'));

        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        $users = $query->select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->limit(50)
            ->get();

        return response()->json($users);
    }

    /**
     * Get role statistics
     */
    public function statistics(Role $role)
    {
        $this->authorize('view', $role);

        $statistics = [
            'total_users' => $role->users()->count(),
            'active_users' => $role->users()->where('is_active', true)->count(),
            'expired_assignments' => $role->users()->where('expires_at', '<', now())->count(),
            'expiring_soon' => $role->users()->where('expires_at', '<=', now()->addDays(7))
                ->where('expires_at', '>', now())
                ->count(),
            'total_permissions' => $role->permissions()->count(),
            'permission_groups' => $role->getPermissionGroups(),
        ];

        return response()->json($statistics);
    }

    /**
     * Initialize system roles for a school
     */
    public function initializeSystemRoles(Request $request)
    {
        $this->authorize('create', Role::class);

        $user = Auth::user();
        $schoolId = $user->school_id;

        // Check if system roles already exist
        $existingSystemRoles = Role::where('school_id', $schoolId)
            ->where('is_system_role', true)
            ->count();

        if ($existingSystemRoles > 0) {
            return back()->withErrors(['error' => 'System roles already exist for this school.']);
        }

        DB::beginTransaction();
        try {
            // Create system roles with default permissions
            $systemRoles = [
                'super_admin' => [
                    'permissions' => [], // All permissions
                    'data_scope' => ['all'],
                    'approval_permissions' => ['*'],
                ],
                'school_admin' => [
                    'permissions' => [
                        'academic.students.view', 'academic.students.create', 'academic.students.edit',
                        'academic.teachers.view', 'academic.teachers.create', 'academic.teachers.edit',
                        'financial.fees.view', 'financial.fees.create', 'financial.fees.edit',
                        'system.users.view', 'system.users.create', 'system.users.edit',
                    ],
                    'data_scope' => ['school'],
                    'approval_permissions' => ['student_admission', 'fee_waiver', 'leave_approval'],
                ],
                'teacher' => [
                    'permissions' => [
                        'academic.students.view', 'academic.assessments.view', 'academic.assessments.create',
                        'academic.attendance.view', 'academic.attendance.create', 'academic.attendance.edit',
                    ],
                    'data_scope' => ['class'],
                    'approval_permissions' => [],
                ],
                'bursar' => [
                    'permissions' => [
                        'financial.fees.view', 'financial.fees.create', 'financial.fees.edit',
                        'financial.payments.view', 'financial.payments.create', 'financial.payments.edit',
                        'financial.invoices.view', 'financial.invoices.create', 'financial.invoices.edit',
                    ],
                    'data_scope' => ['school'],
                    'approval_permissions' => ['fee_waiver', 'payment_approval'],
                ],
                'parent' => [
                    'permissions' => [
                        'academic.students.view', 'financial.fees.view', 'financial.payments.view',
                    ],
                    'data_scope' => ['own'],
                    'approval_permissions' => [],
                ],
                'student' => [
                    'permissions' => [
                        'academic.students.view', 'academic.assessments.view', 'academic.attendance.view',
                    ],
                    'data_scope' => ['own'],
                    'approval_permissions' => [],
                ],
            ];

            foreach ($systemRoles as $roleName => $config) {
                Role::create([
                    'school_id' => $schoolId,
                    'name' => $roleName,
                    'display_name' => Role::SYSTEM_ROLES[$roleName],
                    'description' => 'System role for ' . Role::SYSTEM_ROLES[$roleName],
                    'is_system_role' => true,
                    'is_active' => true,
                    'permissions' => $config['permissions'],
                    'data_scope' => $config['data_scope'],
                    'approval_permissions' => $config['approval_permissions'],
                    'created_by' => $user->id,
                ]);
            }

            DB::commit();

            return back()->with('success', 'System roles initialized successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to initialize system roles: ' . $e->getMessage()]);
        }
    }
}
