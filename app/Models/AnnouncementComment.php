<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AnnouncementComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'announcement_id',
        'user_id',
        'parent_id',
        'content',
        'is_approved',
        'approved_by',
        'approved_at',
        'is_anonymous',
    ];

    protected $casts = [
        'is_approved' => 'boolean',
        'approved_at' => 'datetime',
        'is_anonymous' => 'boolean',
    ];

    // Relationships
    public function announcement(): BelongsTo
    {
        return $this->belongsTo(Announcement::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(AnnouncementComment::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(AnnouncementComment::class, 'parent_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Scopes
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    public function scopePending($query)
    {
        return $query->where('is_approved', false);
    }

    public function scopeTopLevel($query)
    {
        return $query->whereNull('parent_id');
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    // Accessors
    public function getAuthorNameAttribute(): string
    {
        if ($this->is_anonymous) {
            return 'Anonymous';
        }
        
        return $this->user ? $this->user->name : 'Unknown';
    }

    public function getIsReplyAttribute(): bool
    {
        return !is_null($this->parent_id);
    }

    // Methods
    public function approve(User $approver): void
    {
        $this->update([
            'is_approved' => true,
            'approved_by' => $approver->id,
            'approved_at' => now(),
        ]);
    }

    public function unapprove(): void
    {
        $this->update([
            'is_approved' => false,
            'approved_by' => null,
            'approved_at' => null,
        ]);
    }

    public function getRepliesCount(): int
    {
        return $this->replies()->count();
    }
}



