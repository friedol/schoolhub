<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportShare extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_id',
        'user_id',
        'permission',
        'shared_by',
        'shared_at',
        'expires_at',
    ];

    protected $casts = [
        'shared_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    const PERMISSION_OPTIONS = [
        'view' => 'View Only',
        'run' => 'Run Report',
        'edit' => 'Edit Report',
        'admin' => 'Full Access',
    ];

    // Relationships
    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sharedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'shared_by');
    }

    // Scopes
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByPermission($query, $permission)
    {
        return $query->where('permission', $permission);
    }

    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')
              ->orWhere('expires_at', '>', now());
        });
    }

    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<', now());
    }

    // Accessors
    public function getPermissionDisplayAttribute(): string
    {
        return self::PERMISSION_OPTIONS[$this->permission] ?? $this->permission;
    }

    public function getIsExpiredAttribute(): bool
    {
        return $this->expires_at && $this->expires_at < now();
    }

    public function getIsActiveAttribute(): bool
    {
        return !$this->is_expired;
    }

    // Methods
    public function canView(): bool
    {
        return $this->is_active && in_array($this->permission, ['view', 'run', 'edit', 'admin']);
    }

    public function canRun(): bool
    {
        return $this->is_active && in_array($this->permission, ['run', 'edit', 'admin']);
    }

    public function canEdit(): bool
    {
        return $this->is_active && in_array($this->permission, ['edit', 'admin']);
    }

    public function canAdmin(): bool
    {
        return $this->is_active && $this->permission === 'admin';
    }

    public function extendExpiry(int $days): void
    {
        $newExpiry = $this->expires_at ? 
            $this->expires_at->addDays($days) : 
            now()->addDays($days);
            
        $this->update(['expires_at' => $newExpiry]);
    }

    public function revoke(): void
    {
        $this->update(['expires_at' => now()]);
    }
}



