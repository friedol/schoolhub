<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class CommunicationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'communication_type',
        'communication_id',
        'sender_type',
        'sender_id',
        'recipient_type',
        'recipient_id',
        'action',
        'details',
        'metadata',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'details' => 'array',
        'metadata' => 'array',
    ];

    const COMMUNICATION_TYPE_OPTIONS = [
        'message' => 'Message',
        'announcement' => 'Announcement',
        'notification' => 'Notification',
        'email' => 'Email',
        'sms' => 'SMS',
        'push' => 'Push Notification',
    ];

    const ACTION_OPTIONS = [
        'sent' => 'Sent',
        'delivered' => 'Delivered',
        'read' => 'Read',
        'replied' => 'Replied',
        'forwarded' => 'Forwarded',
        'failed' => 'Failed',
        'bounced' => 'Bounced',
        'blocked' => 'Blocked',
        'viewed' => 'Viewed',
        'commented' => 'Commented',
        'shared' => 'Shared',
        'downloaded' => 'Downloaded',
    ];

    // Relationships
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function sender(): MorphTo
    {
        return $this->morphTo();
    }

    public function recipient(): MorphTo
    {
        return $this->morphTo();
    }

    // Scopes
    public function scopeForSchool($query, $schoolId)
    {
        return $query->where('school_id', $schoolId);
    }

    public function scopeByCommunicationType($query, $type)
    {
        return $query->where('communication_type', $type);
    }

    public function scopeByAction($query, $action)
    {
        return $query->where('action', $action);
    }

    public function scopeBySender($query, $senderType, $senderId)
    {
        return $query->where('sender_type', $senderType)
                    ->where('sender_id', $senderId);
    }

    public function scopeByRecipient($query, $recipientType, $recipientId)
    {
        return $query->where('recipient_type', $recipientType)
                    ->where('recipient_id', $recipientId);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    public function scopeThisWeek($query)
    {
        return $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
    }

    public function scopeThisMonth($query)
    {
        return $query->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year);
    }

    // Accessors
    public function getCommunicationTypeDisplayAttribute(): string
    {
        return self::COMMUNICATION_TYPE_OPTIONS[$this->communication_type] ?? $this->communication_type;
    }

    public function getActionDisplayAttribute(): string
    {
        return self::ACTION_OPTIONS[$this->action] ?? $this->action;
    }

    // Methods
    public static function log(
        string $communicationType,
        int $communicationId,
        string $senderType,
        int $senderId,
        string $recipientType,
        int $recipientId,
        string $action,
        array $details = [],
        array $metadata = []
    ): self {
        return self::create([
            'school_id' => auth()->user()->school_id ?? null,
            'communication_type' => $communicationType,
            'communication_id' => $communicationId,
            'sender_type' => $senderType,
            'sender_id' => $senderId,
            'recipient_type' => $recipientType,
            'recipient_id' => $recipientId,
            'action' => $action,
            'details' => $details,
            'metadata' => $metadata,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}



