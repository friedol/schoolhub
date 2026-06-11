<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'title',
        'content',
        'excerpt',
        'category',
        'priority',
        'target_audience',
        'is_published',
        'published_at',
        'expires_at',
        'author_id',
        'featured_image',
        'attachments',
        'metadata',
        'views_count',
        'is_pinned',
        'language',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
        'expires_at' => 'datetime',
        'attachments' => 'array',
        'metadata' => 'array',
        'views_count' => 'integer',
        'is_pinned' => 'boolean',
    ];

    const CATEGORY_OPTIONS = [
        'news' => 'News',
        'events' => 'Events',
        'emergencies' => 'Emergencies',
        'academic' => 'Academic Notices',
        'sports' => 'Sports',
        'cultural' => 'Cultural',
        'transport' => 'Transport',
        'hostel' => 'Hostel',
        'library' => 'Library',
        'general' => 'General',
    ];

    const PRIORITY_OPTIONS = [
        'low' => 'Low',
        'normal' => 'Normal',
        'high' => 'High',
        'urgent' => 'Urgent',
    ];

    const TARGET_AUDIENCE_OPTIONS = [
        'all' => 'All Users',
        'students' => 'Students Only',
        'parents' => 'Parents Only',
        'teachers' => 'Teachers Only',
        'staff' => 'Staff Only',
        'boarders' => 'Boarders Only',
        'day_students' => 'Day Students Only',
        'specific_class' => 'Specific Class',
        'specific_grade' => 'Specific Grade',
    ];

    const LANGUAGE_OPTIONS = [
        'en' => 'English',
        'sw' => 'Kiswahili',
        'both' => 'Both Languages',
    ];

    // Relationships
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function views(): HasMany
    {
        return $this->hasMany(AnnouncementView::class);
    }

    public function targetClasses(): BelongsToMany
    {
        return $this->belongsToMany(SchoolClass::class, 'announcement_target_classes');
    }

    public function targetGrades(): BelongsToMany
    {
        return $this->belongsToMany(Grade::class, 'announcement_target_grades');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(AnnouncementComment::class);
    }

    // Scopes
    public function scopeForSchool($query, $schoolId)
    {
        return $query->where('school_id', $schoolId);
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true)
                    ->where('published_at', '<=', now())
                    ->where(function ($q) {
                        $q->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                    });
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeByTargetAudience($query, $audience)
    {
        return $query->where('target_audience', $audience);
    }

    public function scopePinned($query)
    {
        return $query->where('is_pinned', true);
    }

    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<', now());
    }

    public function scopeActive($query)
    {
        return $query->where('is_published', true)
                    ->where('published_at', '<=', now())
                    ->where(function ($q) {
                        $q->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                    });
    }

    // Accessors
    public function getCategoryDisplayAttribute(): string
    {
        return self::CATEGORY_OPTIONS[$this->category] ?? $this->category;
    }

    public function getPriorityDisplayAttribute(): string
    {
        return self::PRIORITY_OPTIONS[$this->priority] ?? $this->priority;
    }

    public function getTargetAudienceDisplayAttribute(): string
    {
        return self::TARGET_AUDIENCE_OPTIONS[$this->target_audience] ?? $this->target_audience;
    }

    public function getLanguageDisplayAttribute(): string
    {
        return self::LANGUAGE_OPTIONS[$this->language] ?? $this->language;
    }

    public function getIsActiveAttribute(): bool
    {
        return $this->is_published && 
               $this->published_at <= now() && 
               (is_null($this->expires_at) || $this->expires_at > now());
    }

    public function getIsExpiredAttribute(): bool
    {
        return !is_null($this->expires_at) && $this->expires_at <= now();
    }

    public function getExcerptAttribute($value): string
    {
        if ($value) {
            return $value;
        }
        
        return \Str::limit(strip_tags($this->content), 150);
    }

    // Methods
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

    public function publish(): void
    {
        $this->update([
            'is_published' => true,
            'published_at' => now(),
        ]);
    }

    public function unpublish(): void
    {
        $this->update(['is_published' => false]);
    }

    public function pin(): void
    {
        $this->update(['is_pinned' => true]);
    }

    public function unpin(): void
    {
        $this->update(['is_pinned' => false]);
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

    public function canBeViewedBy(User $user): bool
    {
        // Check if announcement is active
        if (!$this->is_active) {
            return false;
        }

        // Check target audience
        switch ($this->target_audience) {
            case 'all':
                return true;
            case 'students':
                return $user->role === 'student';
            case 'parents':
                return $user->role === 'parent';
            case 'teachers':
                return $user->role === 'teacher';
            case 'staff':
                return in_array($user->role, ['teacher', 'staff']);
            case 'boarders':
                return $user->role === 'student' && $user->is_boarder;
            case 'day_students':
                return $user->role === 'student' && !$user->is_boarder;
            default:
                return true;
        }
    }
}