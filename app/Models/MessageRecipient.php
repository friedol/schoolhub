<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class MessageRecipient extends Model
{
    use HasFactory;

    protected $fillable = [
        'message_id',
        'recipient_type',
        'recipient_id',
        'recipient_contact',
        'status',
        'sent_at',
        'delivered_at',
        'read_at',
        'error_message',
        'cost',
        'metadata',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
        'cost' => 'decimal:2',
        'metadata' => 'array',
    ];

    const STATUS_OPTIONS = [
        'pending' => 'Pending',
        'sent' => 'Sent',
        'delivered' => 'Delivered',
        'failed' => 'Failed',
        'bounced' => 'Bounced',
        'blocked' => 'Blocked',
    ];

    const RECIPIENT_TYPE_OPTIONS = [
        'user' => 'User',
        'parent' => 'Parent',
        'student' => 'Student',
        'teacher' => 'Teacher',
        'staff' => 'Staff',
    ];

    // Relationships
    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }

    public function recipient(): MorphTo
    {
        return $this->morphTo();
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeDelivered($query)
    {
        return $query->where('status', 'delivered');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeByRecipientType($query, $type)
    {
        return $query->where('recipient_type', $type);
    }

    // Accessors
    public function getStatusDisplayAttribute(): string
    {
        return self::STATUS_OPTIONS[$this->status] ?? $this->status;
    }

    public function getRecipientTypeDisplayAttribute(): string
    {
        return self::RECIPIENT_TYPE_OPTIONS[$this->recipient_type] ?? $this->recipient_type;
    }

    public function getIsReadAttribute(): bool
    {
        return !is_null($this->read_at);
    }

    public function getIsDeliveredAttribute(): bool
    {
        return !is_null($this->delivered_at);
    }

    public function getIsSentAttribute(): bool
    {
        return !is_null($this->sent_at);
    }

    // Methods
    public function markAsSent(): void
    {
        if (!$this->is_sent) {
            $this->update(['sent_at' => now(), 'status' => 'sent']);
        }
    }

    public function markAsDelivered(): void
    {
        if (!$this->is_delivered) {
            $this->update(['delivered_at' => now(), 'status' => 'delivered']);
        }
    }

    public function markAsRead(): void
    {
        if (!$this->is_read) {
            $this->update(['read_at' => now()]);
        }
    }

    public function markAsFailed(string $errorMessage = null): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
        ]);
    }
}