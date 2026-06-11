<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MeetingRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'requester_id',
        'requested_user_id',
        'student_id',
        'subject',
        'message',
        'preferred_date',
        'preferred_time',
        'duration',
        'meeting_type',
        'status',
        'scheduled_date',
        'scheduled_time',
        'meeting_link',
        'meeting_notes',
        'cancelled_reason',
        'cancelled_by',
        'cancelled_at',
        'completed_at',
        'feedback',
        'metadata',
    ];

    protected $casts = [
        'preferred_date' => 'date',
        'scheduled_date' => 'date',
        'cancelled_at' => 'datetime',
        'completed_at' => 'datetime',
        'metadata' => 'array',
    ];

    const MEETING_TYPE_OPTIONS = [
        'in_person' => 'In Person',
        'video_call' => 'Video Call',
        'phone_call' => 'Phone Call',
        'hybrid' => 'Hybrid',
    ];

    const STATUS_OPTIONS = [
        'pending' => 'Pending',
        'approved' => 'Approved',
        'scheduled' => 'Scheduled',
        'completed' => 'Completed',
        'cancelled' => 'Cancelled',
        'declined' => 'Declined',
    ];

    // Relationships
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function requestedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_user_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    public function meetingHistory(): HasMany
    {
        return $this->hasMany(MeetingHistory::class);
    }

    // Scopes
    public function scopeForSchool($query, $schoolId)
    {
        return $query->where('school_id', $schoolId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByRequester($query, $requesterId)
    {
        return $query->where('requester_id', $requesterId);
    }

    public function scopeByRequestedUser($query, $requestedUserId)
    {
        return $query->where('requested_user_id', $requestedUserId);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeUpcoming($query)
    {
        return $query->where('status', 'scheduled')
                    ->where('scheduled_date', '>=', today());
    }

    // Accessors
    public function getMeetingTypeDisplayAttribute(): string
    {
        return self::MEETING_TYPE_OPTIONS[$this->meeting_type] ?? $this->meeting_type;
    }

    public function getStatusDisplayAttribute(): string
    {
        return self::STATUS_OPTIONS[$this->status] ?? $this->status;
    }

    public function getIsPendingAttribute(): bool
    {
        return $this->status === 'pending';
    }

    public function getIsScheduledAttribute(): bool
    {
        return $this->status === 'scheduled';
    }

    public function getIsCompletedAttribute(): bool
    {
        return $this->status === 'completed';
    }

    public function getIsCancelledAttribute(): bool
    {
        return $this->status === 'cancelled';
    }

    public function getIsUpcomingAttribute(): bool
    {
        return $this->is_scheduled && $this->scheduled_date >= today();
    }

    public function getIsOverdueAttribute(): bool
    {
        return $this->is_scheduled && $this->scheduled_date < today() && !$this->is_completed;
    }

    // Methods
    public function approve(): void
    {
        $this->update(['status' => 'approved']);
    }

    public function schedule(string $date, string $time, string $link = null): void
    {
        $this->update([
            'status' => 'scheduled',
            'scheduled_date' => $date,
            'scheduled_time' => $time,
            'meeting_link' => $link,
        ]);
    }

    public function complete(string $notes = null, string $feedback = null): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
            'meeting_notes' => $notes,
            'feedback' => $feedback,
        ]);
    }

    public function cancel(string $reason, User $cancelledBy): void
    {
        $this->update([
            'status' => 'cancelled',
            'cancelled_reason' => $reason,
            'cancelled_by' => $cancelledBy->id,
            'cancelled_at' => now(),
        ]);
    }

    public function decline(string $reason = null): void
    {
        $this->update([
            'status' => 'declined',
            'cancelled_reason' => $reason,
        ]);
    }

    public function addHistory(string $action, string $notes = null, User $user = null): void
    {
        $this->meetingHistory()->create([
            'action' => $action,
            'notes' => $notes,
            'performed_by' => $user ? $user->id : auth()->id(),
        ]);
    }

    public function getFormattedScheduledDateTime(): string
    {
        if (!$this->scheduled_date || !$this->scheduled_time) {
            return 'Not scheduled';
        }

        return $this->scheduled_date->format('M d, Y') . ' at ' . $this->scheduled_time;
    }
}



