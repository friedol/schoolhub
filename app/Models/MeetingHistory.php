<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MeetingHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'meeting_request_id',
        'action',
        'notes',
        'performed_by',
        'performed_at',
        'metadata',
    ];

    protected $casts = [
        'performed_at' => 'datetime',
        'metadata' => 'array',
    ];

    const ACTION_OPTIONS = [
        'created' => 'Created',
        'approved' => 'Approved',
        'scheduled' => 'Scheduled',
        'rescheduled' => 'Rescheduled',
        'completed' => 'Completed',
        'cancelled' => 'Cancelled',
        'declined' => 'Declined',
        'reminder_sent' => 'Reminder Sent',
        'notes_updated' => 'Notes Updated',
    ];

    // Relationships
    public function meetingRequest(): BelongsTo
    {
        return $this->belongsTo(MeetingRequest::class);
    }

    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    // Scopes
    public function scopeByAction($query, $action)
    {
        return $query->where('action', $action);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('performed_by', $userId);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('performed_at', today());
    }

    public function scopeThisWeek($query)
    {
        return $query->whereBetween('performed_at', [now()->startOfWeek(), now()->endOfWeek()]);
    }

    // Accessors
    public function getActionDisplayAttribute(): string
    {
        return self::ACTION_OPTIONS[$this->action] ?? $this->action;
    }

    // Methods
    public static function log(
        int $meetingRequestId,
        string $action,
        string $notes = null,
        int $performedBy = null,
        array $metadata = []
    ): self {
        return self::create([
            'meeting_request_id' => $meetingRequestId,
            'action' => $action,
            'notes' => $notes,
            'performed_by' => $performedBy ?? auth()->id(),
            'performed_at' => now(),
            'metadata' => $metadata,
        ]);
    }
}
