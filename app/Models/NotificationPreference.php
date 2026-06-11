<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'notification_type',
        'email_enabled',
        'sms_enabled',
        'push_enabled',
        'frequency',
        'quiet_hours_start',
        'quiet_hours_end',
        'categories',
        'metadata',
    ];

    protected $casts = [
        'email_enabled' => 'boolean',
        'sms_enabled' => 'boolean',
        'push_enabled' => 'boolean',
        'categories' => 'array',
        'metadata' => 'array',
    ];

    const NOTIFICATION_TYPE_OPTIONS = [
        'academic' => 'Academic Notifications',
        'financial' => 'Financial Notifications',
        'attendance' => 'Attendance Notifications',
        'events' => 'Event Notifications',
        'emergency' => 'Emergency Notifications',
        'transport' => 'Transport Notifications',
        'hostel' => 'Hostel Notifications',
        'library' => 'Library Notifications',
        'general' => 'General Notifications',
    ];

    const FREQUENCY_OPTIONS = [
        'immediate' => 'Immediate',
        'daily' => 'Daily Digest',
        'weekly' => 'Weekly Digest',
        'monthly' => 'Monthly Digest',
        'never' => 'Never',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('notification_type', $type);
    }

    public function scopeEmailEnabled($query)
    {
        return $query->where('email_enabled', true);
    }

    public function scopeSmsEnabled($query)
    {
        return $query->where('sms_enabled', true);
    }

    public function scopePushEnabled($query)
    {
        return $query->where('push_enabled', true);
    }

    // Accessors
    public function getNotificationTypeDisplayAttribute(): string
    {
        return self::NOTIFICATION_TYPE_OPTIONS[$this->notification_type] ?? $this->notification_type;
    }

    public function getFrequencyDisplayAttribute(): string
    {
        return self::FREQUENCY_OPTIONS[$this->frequency] ?? $this->frequency;
    }

    public function getIsInQuietHoursAttribute(): bool
    {
        if (!$this->quiet_hours_start || !$this->quiet_hours_end) {
            return false;
        }

        $now = now()->format('H:i');
        $start = $this->quiet_hours_start;
        $end = $this->quiet_hours_end;

        if ($start <= $end) {
            return $now >= $start && $now <= $end;
        } else {
            // Quiet hours span midnight
            return $now >= $start || $now <= $end;
        }
    }

    // Methods
    public function isChannelEnabled(string $channel): bool
    {
        switch ($channel) {
            case 'email':
                return $this->email_enabled;
            case 'sms':
                return $this->sms_enabled;
            case 'push':
                return $this->push_enabled;
            default:
                return false;
        }
    }

    public function enableChannel(string $channel): void
    {
        switch ($channel) {
            case 'email':
                $this->update(['email_enabled' => true]);
                break;
            case 'sms':
                $this->update(['sms_enabled' => true]);
                break;
            case 'push':
                $this->update(['push_enabled' => true]);
                break;
        }
    }

    public function disableChannel(string $channel): void
    {
        switch ($channel) {
            case 'email':
                $this->update(['email_enabled' => false]);
                break;
            case 'sms':
                $this->update(['sms_enabled' => false]);
                break;
            case 'push':
                $this->update(['push_enabled' => false]);
                break;
        }
    }

    public function addCategory(string $category): void
    {
        $categories = $this->categories ?? [];
        if (!in_array($category, $categories)) {
            $categories[] = $category;
            $this->update(['categories' => $categories]);
        }
    }

    public function removeCategory(string $category): void
    {
        $categories = $this->categories ?? [];
        $categories = array_filter($categories, fn($cat) => $cat !== $category);
        $this->update(['categories' => array_values($categories)]);
    }

    public function hasCategory(string $category): bool
    {
        return in_array($category, $this->categories ?? []);
    }

    public static function getDefaultPreferences(): array
    {
        return [
            'email_enabled' => true,
            'sms_enabled' => true,
            'push_enabled' => true,
            'frequency' => 'immediate',
            'categories' => array_keys(self::NOTIFICATION_TYPE_OPTIONS),
        ];
    }
}



