<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Permission extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'name',
        'display_name',
        'description',
        'group',
        'module',
        'action',
        'resource',
        'is_system_permission',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'is_system_permission' => 'boolean',
        'is_active' => 'boolean',
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

    const ACTIONS = [
        'view' => 'View',
        'create' => 'Create',
        'edit' => 'Edit',
        'delete' => 'Delete',
        'approve' => 'Approve',
        'export' => 'Export',
        'import' => 'Import',
        'manage' => 'Manage',
    ];

    const RESOURCES = [
        'students' => 'Students',
        'teachers' => 'Teachers',
        'classes' => 'Classes',
        'subjects' => 'Subjects',
        'assessments' => 'Assessments',
        'attendance' => 'Attendance',
        'fees' => 'Fees',
        'payments' => 'Payments',
        'invoices' => 'Invoices',
        'budgets' => 'Budgets',
        'staff' => 'Staff',
        'payroll' => 'Payroll',
        'leave' => 'Leave',
        'performance' => 'Performance',
        'books' => 'Books',
        'issuances' => 'Book Issuances',
        'fines' => 'Library Fines',
        'items' => 'Inventory Items',
        'purchase_orders' => 'Purchase Orders',
        'vehicles' => 'Vehicles',
        'routes' => 'Transport Routes',
        'hostels' => 'Hostels',
        'allocations' => 'Hostel Allocations',
        'messages' => 'Messages',
        'announcements' => 'Announcements',
        'events' => 'Events',
        'reports' => 'Reports',
        'dashboards' => 'Dashboards',
        'users' => 'Users',
        'roles' => 'Roles',
        'permissions' => 'Permissions',
        'settings' => 'Settings',
        'backups' => 'Backups',
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

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_permissions')
            ->withTimestamps();
    }

    public function rolePermissions(): HasMany
    {
        return $this->hasMany(RolePermission::class);
    }

    public function userPermissions(): HasMany
    {
        return $this->hasMany(UserPermission::class);
    }

    // Scopes
    public function scopeForSchool($query, $schoolId)
    {
        return $query->where('school_id', $schoolId);
    }

    public function scopeByGroup($query, $group)
    {
        return $query->where('group', $group);
    }

    public function scopeByModule($query, $module)
    {
        return $query->where('module', $module);
    }

    public function scopeByAction($query, $action)
    {
        return $query->where('action', $action);
    }

    public function scopeByResource($query, $resource)
    {
        return $query->where('resource', $resource);
    }

    public function scopeSystemPermissions($query)
    {
        return $query->where('is_system_permission', true);
    }

    public function scopeCustomPermissions($query)
    {
        return $query->where('is_system_permission', false);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Accessors
    public function getDisplayNameAttribute($value): string
    {
        return $value ?: $this->generateDisplayName();
    }

    public function getGroupDisplayAttribute(): string
    {
        return self::PERMISSION_GROUPS[$this->group] ?? $this->group;
    }

    public function getActionDisplayAttribute(): string
    {
        return self::ACTIONS[$this->action] ?? $this->action;
    }

    public function getResourceDisplayAttribute(): string
    {
        return self::RESOURCES[$this->resource] ?? $this->resource;
    }

    public function getFullNameAttribute(): string
    {
        return $this->group . '.' . $this->resource . '.' . $this->action;
    }

    // Methods
    private function generateDisplayName(): string
    {
        $action = self::ACTIONS[$this->action] ?? $this->action;
        $resource = self::RESOURCES[$this->resource] ?? $this->resource;
        
        return $action . ' ' . $resource;
    }

    public function isSystemPermission(): bool
    {
        return $this->is_system_permission;
    }

    public function isCustomPermission(): bool
    {
        return !$this->is_system_permission;
    }

    public function canBeDeleted(): bool
    {
        return !$this->is_system_permission && $this->roles()->count() === 0;
    }

    public function duplicate(string $newName, int $createdBy): self
    {
        return self::create([
            'school_id' => $this->school_id,
            'name' => $newName,
            'display_name' => $newName,
            'description' => $this->description . ' (Copy)',
            'group' => $this->group,
            'module' => $this->module,
            'action' => $this->action,
            'resource' => $this->resource,
            'is_system_permission' => false,
            'is_active' => true,
            'created_by' => $createdBy,
        ]);
    }
}