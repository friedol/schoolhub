<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'title',
        'description',
        'event_type',
        'start_date',
        'end_date',
        'start_time',
        'end_time',
        'location',
        'is_all_day',
        'is_public',
        'requires_rsvp',
        'max_attendees',
        'registration_deadline',
        'organizer_id',
        'status',
        'featured_image',
        'attachments',
        'metadata',
        'views_count',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'registration_deadline' => 'datetime',
        'is_all_day' => 'boolean',
        'is_public' => 'boolean',
        'requires_rsvp' => 'boolean',
        'max_attendees' => 'integer',
        'attachments' => 'array',
        'metadata' => 'array',
        'views_count' => 'integer',
    ];

    const EVENT_TYPE_OPTIONS = [
        'academic' => 'Academic',
        'sports' => 'Sports',
        'cultural' => 'Cultural',
        'social' => 'Social',
        'parent_meeting' => 'Parent Meeting',
        'graduation' => 'Graduation',
        'orientation' => 'Orientation',
        'workshop' => 'Workshop',
        'seminar' => 'Seminar',
        'conference' => 'Conference',
        'exhibition' => 'Exhibition',
        'fundraising' => 'Fundraising',
        'holiday' => 'Holiday',
        'emergency' => 'Emergency',
        'general' => 'General',
    ];

    const STATUS_OPTIONS = [
        'draft' => 'Draft',
        'published' => 'Published',
        'cancelled' => 'Cancelled',
        'completed' => 'Completed',
    ];

    // Relationships
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    public function rsvps(): HasMany
    {
        return $this->hasMany(EventRSVP::class);
    }

    public function targetClasses(): BelongsToMany
    {
        return $this->belongsToMany(SchoolClass::class, 'event_target_classes');
    }

    public function targetGrades(): BelongsToMany
    {
        return $this->belongsToMany(Grade::class, 'event_target_grades');
    }

    public function views(): HasMany
    {
        return $this->hasMany(EventView::class);
    }

    // Scopes
    public function scopeForSchool($query, $schoolId)
    {
        return $query->where('school_id', $schoolId);
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('event_type', $type);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeRequiresRsvp($query)
    {
        return $query->where('requires_rsvp', true);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('start_date', '>=', today());
    }

    public function scopePast($query)
    {
        return $query->where('end_date', '<', today());
    }

    public function scopeToday($query)
    {
        return $query->where('start_date', '<=', today())
                    ->where('end_date', '>=', today());
    }

    public function scopeThisWeek($query)
    {
        return $query->whereBetween('start_date', [now()->startOfWeek(), now()->endOfWeek()]);
    }

    public function scopeThisMonth($query)
    {
        return $query->whereMonth('start_date', now()->month)
                    ->whereYear('start_date', now()->year);
    }

    // Accessors
    public function getEventTypeDisplayAttribute(): string
    {
        return self::EVENT_TYPE_OPTIONS[$this->event_type] ?? $this->event_type;
    }

    public function getStatusDisplayAttribute(): string
    {
        return self::STATUS_OPTIONS[$this->status] ?? $this->status;
    }

    public function getIsUpcomingAttribute(): bool
    {
        return $this->start_date >= today();
    }

    public function getIsPastAttribute(): bool
    {
        return $this->end_date < today();
    }

    public function getIsTodayAttribute(): bool
    {
        return $this->start_date <= today() && $this->end_date >= today();
    }

    public function getIsOngoingAttribute(): bool
    {
        return $this->start_date <= today() && $this->end_date >= today();
    }

    public function getIsPublishedAttribute(): bool
    {
        return $this->status === 'published';
    }

    public function getIsCancelledAttribute(): bool
    {
        return $this->status === 'cancelled';
    }

    public function getIsCompletedAttribute(): bool
    {
        return $this->status === 'completed';
    }

    public function getFormattedDateTimeAttribute(): string
    {
        if ($this->is_all_day) {
            if ($this->start_date->isSameDay($this->end_date)) {
                return $this->start_date->format('M d, Y') . ' (All Day)';
            } else {
                return $this->start_date->format('M d') . ' - ' . $this->end_date->format('M d, Y') . ' (All Day)';
            }
        } else {
            $date = $this->start_date->format('M d, Y');
            $time = $this->start_time . ' - ' . $this->end_time;
            return $date . ' at ' . $time;
        }
    }

    public function getRsvpStatsAttribute(): array
    {
        return EventRSVP::getEventStats($this->id);
    }

    // Methods
    public function publish(): void
    {
        $this->update(['status' => 'published']);
    }

    public function cancel(): void
    {
        $this->update(['status' => 'cancelled']);
    }

    public function complete(): void
    {
        $this->update(['status' => 'completed']);
    }

    public function incrementViews(): void
    {
        $this->increment('views_count');
    }

    public function recordView(User $user): void
    {
        $this->views()->firstOrCreate([
            'user_id' => $user->id,
        ]);
    }

    public function canUserRsvp(User $user): bool
    {
        if (!$this->requires_rsvp || $this->is_cancelled) {
            return false;
        }

        if ($this->registration_deadline && now() > $this->registration_deadline) {
            return false;
        }

        if ($this->max_attendees) {
            $currentAttendees = $this->rsvps()->where('response', 'attending')->sum(function ($rsvp) {
                return 1 + $rsvp->guests_count;
            });
            
            if ($currentAttendees >= $this->max_attendees) {
                return false;
            }
        }

        return true;
    }

    public function getAttachmentUrls(): array
    {
        if (!$this->attachments) {
            return [];
        }

        return array_map(function ($attachment) {
            return [
                'name' => $attachment['name'],
                'url' => asset('storage/' . $attachment['path']),
                'size' => $attachment['size'] ?? null,
                'type' => $attachment['type'] ?? null,
            ];
        }, $this->attachments);
    }
}



