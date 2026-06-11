<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnnouncementView extends Model
{
    use HasFactory;

    protected $fillable = [
        'announcement_id',
        'user_id',
        'viewed_at',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'viewed_at' => 'datetime',
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

    // Scopes
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByAnnouncement($query, $announcementId)
    {
        return $query->where('announcement_id', $announcementId);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('viewed_at', today());
    }

    public function scopeThisWeek($query)
    {
        return $query->whereBetween('viewed_at', [now()->startOfWeek(), now()->endOfWeek()]);
    }

    public function scopeThisMonth($query)
    {
        return $query->whereMonth('viewed_at', now()->month)
                    ->whereYear('viewed_at', now()->year);
    }
}



