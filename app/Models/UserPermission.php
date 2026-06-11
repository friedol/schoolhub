<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPermission extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'permission_id',
        'granted_by',
        'granted_at',
        'expires_at',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'granted_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
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

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByPermission($query, $permissionId)
    {
        return $query->where('permission_id', $permissionId);
    }

    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<', now());
    }

    public function scopeNotExpired($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')
              ->orWhere('expires_at', '>', now());
        });
    }

    public function scopeValid($query)
    {
        return $query->active()->notExpired();
    }

    // Accessors
    public function getIsExpiredAttribute(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function getIsValidAttribute(): bool
    {
        return $this->is_active && !$this->is_expired;
    }

    public function getDaysUntilExpiryAttribute(): ?int
    {
        if (!$this->expires_at) {
            return null;
        }

        return now()->diffInDays($this->expires_at, false);
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

    public function extendExpiry(int $days): void
    {
        $newExpiry = $this->expires_at 
            ? $this->expires_at->addDays($days)
            : now()->addDays($days);
            
        $this->update(['expires_at' => $newExpiry]);
    }

    public function setExpiry(int $days): void
    {
        $this->update(['expires_at' => now()->addDays($days)]);
    }

    public function removeExpiry(): void
    {
        $this->update(['expires_at' => null]);
    }

    public static function grantPermission(int $userId, int $permissionId, int $grantedBy, int $expiryDays = null, string $notes = null): self
    {
        return self::create([
            'user_id' => $userId,
            'permission_id' => $permissionId,
            'granted_by' => $grantedBy,
            'granted_at' => now(),
            'expires_at' => $expiryDays ? now()->addDays($expiryDays) : null,
            'is_active' => true,
            'notes' => $notes,
        ]);
    }

    public static function revokePermission(int $userId, int $permissionId): bool
    {
        return self::where('user_id', $userId)
            ->where('permission_id', $permissionId)
            ->update(['is_active' => false]);
    }

    public static function bulkGrantPermissions(int $userId, array $permissionIds, int $grantedBy, int $expiryDays = null, string $notes = null): array
    {
        $grants = [];
        
        foreach ($permissionIds as $permissionId) {
            $grants[] = self::grantPermission($userId, $permissionId, $grantedBy, $expiryDays, $notes);
        }
        
        return $grants;
    }

    public static function bulkRevokePermissions(int $userId, array $permissionIds): int
    {
        return self::where('user_id', $userId)
            ->whereIn('permission_id', $permissionIds)
            ->update(['is_active' => false]);
    }

    public static function getUserPermissions(int $userId): \Illuminate\Database\Eloquent\Collection
    {
        return self::where('user_id', $userId)
            ->valid()
            ->with('permission')
            ->get();
    }

    public static function getUserPermissionNames(int $userId): array
    {
        return self::where('user_id', $userId)
            ->valid()
            ->with('permission')
            ->get()
            ->pluck('permission.name')
            ->toArray();
    }

    public static function getUsersWithPermission(int $permissionId): \Illuminate\Database\Eloquent\Collection
    {
        return self::where('permission_id', $permissionId)
            ->valid()
            ->with('user')
            ->get();
    }

    public static function hasPermission(int $userId, int $permissionId): bool
    {
        return self::where('user_id', $userId)
            ->where('permission_id', $permissionId)
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            })
            ->exists();
    }

    public static function getExpiringPermissions(int $days = 7): \Illuminate\Database\Eloquent\Collection
    {
        return self::where('expires_at', '<=', now()->addDays($days))
            ->where('expires_at', '>', now())
            ->where('is_active', true)
            ->with(['user', 'permission'])
            ->get();
    }

    public static function cleanupExpiredPermissions(): int
    {
        return self::where('expires_at', '<', now())
            ->where('is_active', true)
            ->update(['is_active' => false]);
    }
}



