<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PermissionController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('role:super_admin,school_admin,headteacher');
    }

    /**
     * Display a listing of permissions
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $schoolId = $user->school_id;

        $query = Permission::forSchool($schoolId)
            ->with(['createdBy:id,name'])
            ->withCount(['roles', 'users']);

        // Filter by group
        if ($request->has('group') && $request->group) {
            $query->byGroup($request->group);
        }

        // Filter by module
        if ($request->has('module') && $request->module) {
            $query->byModule($request->module);
        }

        // Filter by action
        if ($request->has('action') && $request->action) {
            $query->byAction($request->action);
        }

        // Filter by resource
        if ($request->has('resource') && $request->resource) {
            $query->byResource($request->resource);
        }

        // Filter by type
        if ($request->has('type')) {
            if ($request->type === 'system') {
                $query->systemPermissions();
            } elseif ($request->type === 'custom') {
                $query->customPermissions();
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
                  ->orWhere('description', 'like', '%' . $request->search . '%')
                  ->orWhere('resource', 'like', '%' . $request->search . '%');
            });
        }

        $permissions = $query->orderBy('group')
            ->orderBy('resource')
            ->orderBy('action')
            ->paginate(20);

        return Inertia::render('System/Permissions/Index', [
            'permissions' => $permissions,
            'filters' => $request->only(['group', 'module', 'action', 'resource', 'type', 'status', 'search']),
            'permissionGroups' => Permission::PERMISSION_GROUPS,
            'actions' => Permission::ACTIONS,
            'resources' => Permission::RESOURCES,
        ]);
    }

    /**
     * Show the form for creating a new permission
     */
    public function create(): Response
    {
        return Inertia::render('System/Permissions/Create', [
            'permissionGroups' => Permission::PERMISSION_GROUPS,
            'actions' => Permission::ACTIONS,
            'resources' => Permission::RESOURCES,
        ]);
    }

    /**
     * Store a newly created permission
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $schoolId = $user->school_id;

        $request->validate([
            'name' => 'required|string|max:255|unique:permissions,name,NULL,id,school_id,' . $schoolId,
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'group' => 'required|string|in:' . implode(',', array_keys(Permission::PERMISSION_GROUPS)),
            'module' => 'required|string|max:255',
            'action' => 'required|string|in:' . implode(',', array_keys(Permission::ACTIONS)),
            'resource' => 'required|string|in:' . implode(',', array_keys(Permission::RESOURCES)),
        ]);

        try {
            $permission = Permission::create([
                'school_id' => $schoolId,
                'name' => $request->name,
                'display_name' => $request->display_name,
                'description' => $request->description,
                'group' => $request->group,
                'module' => $request->module,
                'action' => $request->action,
                'resource' => $request->resource,
                'is_system_permission' => false,
                'is_active' => true,
                'created_by' => $user->id,
            ]);

            return redirect()->route('system.permissions.index')
                ->with('success', 'Permission created successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create permission: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified permission
     */
    public function show(Permission $permission): Response
    {
        $this->authorize('view', $permission);

        $permission->load([
            'createdBy:id,name',
            'roles' => function ($query) {
                $query->select('roles.id', 'roles.name', 'roles.display_name')
                      ->withPivot('granted_at', 'is_active');
            },
            'users' => function ($query) {
                $query->select('users.id', 'users.name', 'users.email')
                      ->withPivot('granted_at', 'expires_at', 'is_active');
            }
        ]);

        return Inertia::render('System/Permissions/Show', [
            'permission' => $permission,
        ]);
    }

    /**
     * Show the form for editing the specified permission
     */
    public function edit(Permission $permission): Response
    {
        $this->authorize('update', $permission);

        return Inertia::render('System/Permissions/Edit', [
            'permission' => $permission,
            'permissionGroups' => Permission::PERMISSION_GROUPS,
            'actions' => Permission::ACTIONS,
            'resources' => Permission::RESOURCES,
        ]);
    }

    /**
     * Update the specified permission
     */
    public function update(Request $request, Permission $permission)
    {
        $this->authorize('update', $permission);

        $user = Auth::user();
        $schoolId = $user->school_id;

        $request->validate([
            'name' => 'required|string|max:255|unique:permissions,name,' . $permission->id . ',id,school_id,' . $schoolId,
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'group' => 'required|string|in:' . implode(',', array_keys(Permission::PERMISSION_GROUPS)),
            'module' => 'required|string|max:255',
            'action' => 'required|string|in:' . implode(',', array_keys(Permission::ACTIONS)),
            'resource' => 'required|string|in:' . implode(',', array_keys(Permission::RESOURCES)),
            'is_active' => 'boolean',
        ]);

        try {
            $permission->update([
                'name' => $request->name,
                'display_name' => $request->display_name,
                'description' => $request->description,
                'group' => $request->group,
                'module' => $request->module,
                'action' => $request->action,
                'resource' => $request->resource,
                'is_active' => $request->is_active ?? $permission->is_active,
            ]);

            return redirect()->route('system.permissions.index')
                ->with('success', 'Permission updated successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update permission: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified permission
     */
    public function destroy(Permission $permission)
    {
        $this->authorize('delete', $permission);

        if (!$permission->canBeDeleted()) {
            return back()->withErrors(['error' => 'Cannot delete this permission. It may be a system permission or is assigned to roles.']);
        }

        try {
            $permission->delete();

            return redirect()->route('system.permissions.index')
                ->with('success', 'Permission deleted successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete permission: ' . $e->getMessage()]);
        }
    }

    /**
     * Duplicate a permission
     */
    public function duplicate(Permission $permission)
    {
        $this->authorize('create', Permission::class);

        $user = Auth::user();
        $newName = $permission->name . '_copy_' . time();

        try {
            $newPermission = $permission->duplicate($newName, $user->id);

            return redirect()->route('system.permissions.edit', $newPermission)
                ->with('success', 'Permission duplicated successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to duplicate permission: ' . $e->getMessage()]);
        }
    }

    /**
     * Get permissions grouped by module
     */
    public function getByModule(Request $request)
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

        return response()->json($permissions);
    }

    /**
     * Get permissions for a specific role
     */
    public function getForRole(Role $role)
    {
        $this->authorize('view', $role);

        $permissions = Permission::forSchool($role->school_id)
            ->active()
            ->orderBy('group')
            ->orderBy('resource')
            ->orderBy('action')
            ->get()
            ->groupBy('group');

        $rolePermissions = $role->permissions->pluck('id')->toArray();

        return response()->json([
            'permissions' => $permissions,
            'role_permissions' => $rolePermissions,
        ]);
    }

    /**
     * Grant permission to role
     */
    public function grantToRole(Request $request, Permission $permission)
    {
        $this->authorize('update', $permission);

        $request->validate([
            'role_id' => 'required|exists:roles,id',
            'notes' => 'nullable|string',
        ]);

        try {
            $role = Role::findOrFail($request->role_id);
            
            // Check if permission is already granted
            if ($role->permissions()->where('permission_id', $permission->id)->exists()) {
                return back()->withErrors(['error' => 'Permission is already granted to this role.']);
            }

            $role->permissions()->attach($permission->id, [
                'granted_by' => Auth::id(),
                'granted_at' => now(),
                'is_active' => true,
                'notes' => $request->notes,
            ]);

            return back()->with('success', 'Permission granted to role successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to grant permission: ' . $e->getMessage()]);
        }
    }

    /**
     * Revoke permission from role
     */
    public function revokeFromRole(Request $request, Permission $permission)
    {
        $this->authorize('update', $permission);

        $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        try {
            $role = Role::findOrFail($request->role_id);
            $role->permissions()->updateExistingPivot($permission->id, [
                'is_active' => false,
            ]);

            return back()->with('success', 'Permission revoked from role successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to revoke permission: ' . $e->getMessage()]);
        }
    }

    /**
     * Initialize system permissions for a school
     */
    public function initializeSystemPermissions(Request $request)
    {
        $this->authorize('create', Permission::class);

        $user = Auth::user();
        $schoolId = $user->school_id;

        // Check if system permissions already exist
        $existingSystemPermissions = Permission::where('school_id', $schoolId)
            ->where('is_system_permission', true)
            ->count();

        if ($existingSystemPermissions > 0) {
            return back()->withErrors(['error' => 'System permissions already exist for this school.']);
        }

        try {
            $systemPermissions = Permission::getSystemPermissions($schoolId);
            $createdCount = 0;

            foreach ($systemPermissions as $permissionData) {
                Permission::create([
                    'school_id' => $schoolId,
                    'name' => $permissionData['name'],
                    'display_name' => $permissionData['name'],
                    'description' => $permissionData['description'],
                    'group' => $permissionData['group'],
                    'module' => $permissionData['module'],
                    'action' => $permissionData['action'],
                    'resource' => $permissionData['resource'],
                    'is_system_permission' => true,
                    'is_active' => true,
                    'created_by' => $user->id,
                ]);
                $createdCount++;
            }

            return back()->with('success', "System permissions initialized successfully. {$createdCount} permissions created.");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to initialize system permissions: ' . $e->getMessage()]);
        }
    }

    /**
     * Get permission statistics
     */
    public function statistics()
    {
        $user = Auth::user();
        $schoolId = $user->school_id;

        $statistics = [
            'total_permissions' => Permission::forSchool($schoolId)->count(),
            'system_permissions' => Permission::forSchool($schoolId)->systemPermissions()->count(),
            'custom_permissions' => Permission::forSchool($schoolId)->customPermissions()->count(),
            'active_permissions' => Permission::forSchool($schoolId)->active()->count(),
            'permissions_by_group' => Permission::forSchool($schoolId)
                ->active()
                ->selectRaw('group, COUNT(*) as count')
                ->groupBy('group')
                ->pluck('count', 'group'),
            'permissions_by_action' => Permission::forSchool($schoolId)
                ->active()
                ->selectRaw('action, COUNT(*) as count')
                ->groupBy('action')
                ->pluck('count', 'action'),
        ];

        return response()->json($statistics);
    }
}
