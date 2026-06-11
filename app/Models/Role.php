<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'name',
        'display_name',
        'description',
        'is_system_role',
        'is_active',
        'permissions',
        'data_scope',
        'approval_permissions',
        'created_by',
    ];

    protected $casts = [
        'is_system_role' => 'boolean',
        'is_active' => 'boolean',
        'permissions' => 'array',
        'data_scope' => 'array',
        'approval_permissions' => 'array',
    ];

    const SYSTEM_ROLES = [
        'super_admin' => 'Super Admin',
        'school_admin' => 'School Admin',
        'headteacher' => 'Headteacher',
        'teacher' => 'Teacher',
        'bursar' => 'Bursar',
        'librarian' => 'Librarian',
        'dormitory_manager' => 'Dormitory Manager',
        'academic_master' => 'Academic Master',
        'parent' => 'Parent',
        'student' => 'Student',
    ];

    const DATA_SCOPE_OPTIONS = [
        'all' => 'All Data',
        'school' => 'School Data Only',
        'department' => 'Department Data Only',
        'class' => 'Class Data Only',
        'own' => 'Own Data Only',
    ];

    const PERMISSION_GROUPS = [
        'academic' => 'Academic Management',
        'financial' => 'Financial Management',
        'hr' => 'Human Resources',
        'library' => 'Library Management',
        'inventory' => 'Inventory Management',
        'transport' => 'Transport Management',
        'hostel' => 'Hostel Management',
        'communication' => 'Communication',
        'reports' => 'Reports & Analytics',
        'system' => 'System Configuration',
    ];

    // Relationships
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_roles')
            ->withTimestamps();
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_permissions')
            ->withTimestamps();
    }

    public function rolePermissions(): HasMany
    {
        return $this->hasMany(RolePermission::class);
    }

    public function userRoles(): HasMany
    {
        return $this->hasMany(UserRole::class);
    }

    // Scopes
    public function scopeForSchool($query, $schoolId)
    {
        return $query->where('school_id', $schoolId);
    }

    public function scopeSystemRoles($query)
    {
        return $query->where('is_system_role', true);
    }

    public function scopeCustomRoles($query)
    {
        return $query->where('is_system_role', false);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByDataScope($query, $dataScope)
    {
        return $query->whereJsonContains('data_scope', $dataScope);
    }

    // Accessors
    public function getDisplayNameAttribute($value): string
    {
        return $value ?: self::SYSTEM_ROLES[$this->name] ?? $this->name;
    }

    public function getPermissionsAttribute($value): array
    {
        return json_decode($value, true) ?? [];
    }

    public function setPermissionsAttribute($value): void
    {
        $this->attributes['permissions'] = json_encode($value);
    }

    public function getDataScopeAttribute($value): array
    {
        if (is_null($value)) {
            return [];
        }
        
        $decoded = json_decode($value, true);
        
        // If it's a string, wrap it in an array
        if (is_string($decoded)) {
            return [$decoded];
        }
        
        // If it's already an array, return it
        if (is_array($decoded)) {
            return $decoded;
        }
        
        // Fallback to empty array
        return [];
    }

    public function setDataScopeAttribute($value): void
    {
        $this->attributes['data_scope'] = json_encode($value);
    }

    public function getApprovalPermissionsAttribute($value): array
    {
        return json_decode($value, true) ?? [];
    }

    public function setApprovalPermissionsAttribute($value): void
    {
        $this->attributes['approval_permissions'] = json_encode($value);
    }

    // Methods
    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->permissions);
    }

    public function hasAnyPermission(array $permissions): bool
    {
        return !empty(array_intersect($permissions, $this->permissions));
    }

    public function hasAllPermissions(array $permissions): bool
    {
        return empty(array_diff($permissions, $this->permissions));
    }

    public function canAccessData(string $dataType, $dataId = null): bool
    {
        $dataScope = $this->data_scope;

        if (in_array('all', $dataScope)) {
            return true;
        }

        if (in_array('school', $dataScope)) {
            return true; // School-level access
        }

        if (in_array('own', $dataScope)) {
            return $dataId === auth()->id();
        }

        return false;
    }

    public function canApprove(string $action): bool
    {
        return in_array($action, $this->approval_permissions);
    }

    public function assignPermission(string $permission): void
    {
        $permissions = $this->permissions;
        if (!in_array($permission, $permissions)) {
            $permissions[] = $permission;
            $this->update(['permissions' => $permissions]);
        }
    }

    public function removePermission(string $permission): void
    {
        $permissions = $this->permissions;
        $permissions = array_filter($permissions, fn($p) => $p !== $permission);
        $this->update(['permissions' => array_values($permissions)]);
    }

    public function assignPermissions(array $permissions): void
    {
        $currentPermissions = $this->permissions;
        $newPermissions = array_unique(array_merge($currentPermissions, $permissions));
        $this->update(['permissions' => $newPermissions]);
    }

    public function removePermissions(array $permissions): void
    {
        $currentPermissions = $this->permissions;
        $newPermissions = array_diff($currentPermissions, $permissions);
        $this->update(['permissions' => array_values($newPermissions)]);
    }

    public function setDataScope(array $dataScope): void
    {
        $this->update(['data_scope' => $dataScope]);
    }

    public function setApprovalPermissions(array $approvalPermissions): void
    {
        $this->update(['approval_permissions' => $approvalPermissions]);
    }

    public function getPermissionGroups(): array
    {
        $permissions = $this->permissions;
        $groups = [];

        foreach (self::PERMISSION_GROUPS as $group => $name) {
            $groupPermissions = array_filter($permissions, function($permission) use ($group) {
                return str_starts_with($permission, $group . '.');
            });
            
            if (!empty($groupPermissions)) {
                $groups[$group] = [
                    'name' => $name,
                    'permissions' => array_values($groupPermissions),
                ];
            }
        }

        return $groups;
    }

    public function duplicate(string $newName, int $createdBy): self
    {
        return self::create([
            'school_id' => $this->school_id,
            'name' => $newName,
            'display_name' => $newName,
            'description' => $this->description . ' (Copy)',
            'is_system_role' => false,
            'is_active' => true,
            'permissions' => $this->permissions,
            'data_scope' => $this->data_scope,
            'approval_permissions' => $this->approval_permissions,
            'created_by' => $createdBy,
        ]);
    }

    public function canBeDeleted(): bool
    {
        return !$this->is_system_role && $this->users()->count() === 0;
    }

    public static function getSystemRole(string $roleName, int $schoolId): ?self
    {
        return self::where('school_id', $schoolId)
            ->where('name', $roleName)
            ->where('is_system_role', true)
            ->first();
    }

    public static function createSystemRole(string $roleName, int $schoolId, array $permissions = [], array $dataScope = [], array $approvalPermissions = []): self
    {
        return self::create([
            'school_id' => $schoolId,
            'name' => $roleName,
            'display_name' => self::SYSTEM_ROLES[$roleName] ?? $roleName,
            'description' => 'System role for ' . (self::SYSTEM_ROLES[$roleName] ?? $roleName),
            'is_system_role' => true,
            'is_active' => true,
            'permissions' => $permissions,
            'data_scope' => $dataScope,
            'approval_permissions' => $approvalPermissions,
            'created_by' => 1, // System user
        ]);
    }
}