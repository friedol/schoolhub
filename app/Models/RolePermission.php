<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RolePermission extends Model
{
    use HasFactory;

    protected $fillable = [
        'role_id',
        'permission_id',
        'granted_by',
        'granted_at',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'granted_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function permission(): BelongsTo
    {
        return $this->belongsTo(Permission::class);
    }

    public function grantedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'granted_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByRole($query, $roleId)
    {
        return $query->where('role_id', $roleId);
    }

    public function scopeByPermission($query, $permissionId)
    {
        return $query->where('permission_id', $permissionId);
    }

    // Methods
    public function activate(): void
    {
        $this->update(['is_active' => true]);
    }

    public function deactivate(): void
    {
        $this->update(['is_active' => false]);
    }

    public static function grantPermission(int $roleId, int $permissionId, int $grantedBy, string $notes = null): self
    {
        return self::create([
            'role_id' => $roleId,
            'permission_id' => $permissionId,
            'granted_by' => $grantedBy,
            'granted_at' => now(),
            'is_active' => true,
            'notes' => $notes,
        ]);
    }

    public static function revokePermission(int $roleId, int $permissionId): bool
    {
        return self::where('role_id', $roleId)
            ->where('permission_id', $permissionId)
            ->update(['is_active' => false]);
    }

    public static function bulkGrantPermissions(int $roleId, array $permissionIds, int $grantedBy, string $notes = null): array
    {
        $grants = [];
        
        foreach ($permissionIds as $permissionId) {
            $grants[] = self::grantPermission($roleId, $permissionId, $grantedBy, $notes);
        }
        
        return $grants;
    }

    public static function bulkRevokePermissions(int $roleId, array $permissionIds): int
    {
        return self::where('role_id', $roleId)
            ->whereIn('permission_id', $permissionIds)
            ->update(['is_active' => false]);
    }

    public static function getRolePermissions(int $roleId): \Illuminate\Database\Eloquent\Collection
    {
        return self::where('role_id', $roleId)
            ->active()
            ->with('permission')
            ->get();
    }

    public static function getRolePermissionNames(int $roleId): array
    {
        return self::where('role_id', $roleId)
            ->active()
            ->with('permission')
            ->get()
            ->pluck('permission.name')
            ->toArray();
    }

    public static function getRolesWithPermission(int $permissionId): \Illuminate\Database\Eloquent\Collection
    {
        return self::where('permission_id', $permissionId)
            ->active()
            ->with('role')
            ->get();
    }

    public static function hasPermission(int $roleId, int $permissionId): bool
    {
        return self::where('role_id', $roleId)
            ->where('permission_id', $permissionId)
            ->where('is_active', true)
            ->exists();
    }

    public static function syncRolePermissions(int $roleId, array $permissionIds, int $grantedBy): void
    {
        // Deactivate all current permissions
        self::where('role_id', $roleId)->update(['is_active' => false]);
        
        // Grant new permissions
        foreach ($permissionIds as $permissionId) {
            self::updateOrCreate(
                [
                    'role_id' => $roleId,
                    'permission_id' => $permissionId,
                ],
                [
                    'granted_by' => $grantedBy,
                    'granted_at' => now(),
                    'is_active' => true,
                ]
            );
        }
    }
}



