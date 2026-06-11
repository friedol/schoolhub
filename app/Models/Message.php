<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'message_template_id',
        'sender_id',
        'recipient_type',
        'recipient_id',
        'type',
        'subject',
        'content',
        'status',
        'scheduled_at',
        'sent_at',
        'delivered_at',
        'read_at',
        'reply_to_message_id',
        'thread_id',
        'metadata',
        'cost',
        'currency',
        'error_message',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
        'metadata' => 'array',
        'cost' => 'decimal:2',
    ];

    const TYPE_OPTIONS = [
        'sms' => 'SMS',
        'email' => 'Email',
        'push' => 'Push Notification',
    ];

    const STATUS_OPTIONS = [
        'draft' => 'Draft',
        'scheduled' => 'Scheduled',
        'sending' => 'Sending',
        'sent' => 'Sent',
        'delivered' => 'Delivered',
        'failed' => 'Failed',
        'cancelled' => 'Cancelled',
    ];

    const RECIPIENT_TYPE_OPTIONS = [
        'user' => 'User',
        'parent' => 'Parent',
        'student' => 'Student',
        'teacher' => 'Teacher',
        'staff' => 'Staff',
        'class' => 'Class',
        'group' => 'Group',
    ];

    // Relationships
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(MessageTemplate::class, 'message_template_id');
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function recipient(): MorphTo
    {
        return $this->morphTo();
    }

    public function replies(): HasMany
    {
        return $this->hasMany(Message::class, 'reply_to_message_id');
    }

    public function parentMessage(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'reply_to_message_id');
    }

    public function threadMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'thread_id');
    }

    public function threadParent(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'thread_id');
    }

    public function messageRecipients(): HasMany
    {
        return $this->hasMany(MessageRecipient::class);
    }

    // Scopes
    public function scopeForSchool($query, $schoolId)
    {
        return $query->where('school_id', $schoolId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled')
                    ->where('scheduled_at', '<=', now());
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeInThread($query, $threadId)
    {
        return $query->where('thread_id', $threadId);
    }

    // Accessors
    public function getTypeDisplayAttribute(): string
    {
        return self::TYPE_OPTIONS[$this->type] ?? $this->type;
    }

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
    public function markAsRead(): void
    {
        if (!$this->is_read) {
            $this->update(['read_at' => now()]);
        }
    }

    public function markAsDelivered(): void
    {
        if (!$this->is_delivered) {
            $this->update(['delivered_at' => now()]);
        }
    }

    public function markAsSent(): void
    {
        if (!$this->is_sent) {
            $this->update(['sent_at' => now()]);
        }
    }

    public function createReply(array $data): Message
    {
        return $this->replies()->create(array_merge($data, [
            'school_id' => $this->school_id,
            'thread_id' => $this->thread_id ?? $this->id,
            'reply_to_message_id' => $this->id,
        ]));
    }

    public function getThreadMessages()
    {
        $threadId = $this->thread_id ?? $this->id;
        return self::where('thread_id', $threadId)
                  ->orWhere('id', $threadId)
                  ->orderBy('created_at')
                  ->get();
    }

    public function calculateCost(): float
    {
        // This would integrate with actual SMS/Email service pricing
        switch ($this->type) {
            case 'sms':
                return 0.05; // Example: TZS 0.05 per SMS
            case 'email':
                return 0.01; // Example: TZS 0.01 per email
            default:
                return 0.00;
        }
    }
}