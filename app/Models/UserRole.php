<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserRole extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'role_id',
        'assigned_by',
        'assigned_at',
        'expires_at',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
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

    public static function assignRole(int $userId, int $roleId, int $assignedBy, int $expiryDays = null, string $notes = null): self
    {
        return self::create([
            'user_id' => $userId,
            'role_id' => $roleId,
            'assigned_by' => $assignedBy,
            'assigned_at' => now(),
            'expires_at' => $expiryDays ? now()->addDays($expiryDays) : null,
            'is_active' => true,
            'notes' => $notes,
        ]);
    }

    public static function bulkAssignRole(array $userIds, int $roleId, int $assignedBy, int $expiryDays = null, string $notes = null): array
    {
        $assignments = [];
        
        foreach ($userIds as $userId) {
            $assignments[] = self::assignRole($userId, $roleId, $assignedBy, $expiryDays, $notes);
        }
        
        return $assignments;
    }

    public static function revokeRole(int $userId, int $roleId): bool
    {
        return self::where('user_id', $userId)
            ->where('role_id', $roleId)
            ->update(['is_active' => false]);
    }

    public static function revokeAllUserRoles(int $userId): int
    {
        return self::where('user_id', $userId)
            ->update(['is_active' => false]);
    }

    public static function getActiveUserRoles(int $userId): \Illuminate\Database\Eloquent\Collection
    {
        return self::where('user_id', $userId)
            ->valid()
            ->with('role')
            ->get();
    }

    public static function getUserRoleNames(int $userId): array
    {
        return self::where('user_id', $userId)
            ->valid()
            ->with('role')
            ->get()
            ->pluck('role.name')
            ->toArray();
    }

    public static function getUsersWithRole(int $roleId): \Illuminate\Database\Eloquent\Collection
    {
        return self::where('role_id', $roleId)
            ->valid()
            ->with('user')
            ->get();
    }

    public static function getExpiringRoles(int $days = 7): \Illuminate\Database\Eloquent\Collection
    {
        return self::where('expires_at', '<=', now()->addDays($days))
            ->where('expires_at', '>', now())
            ->where('is_active', true)
            ->with(['user', 'role'])
            ->get();
    }

    public static function cleanupExpiredRoles(): int
    {
        return self::where('expires_at', '<', now())
            ->where('is_active', true)
            ->update(['is_active' => false]);
    }
}



