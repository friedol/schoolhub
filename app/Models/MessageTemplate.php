<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MessageTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'name',
        'subject',
        'content',
        'type',
        'category',
        'language',
        'variables',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'variables' => 'array',
        'is_active' => 'boolean',
    ];

    const TYPE_OPTIONS = [
        'sms' => 'SMS',
        'email' => 'Email',
        'push' => 'Push Notification',
    ];

    const CATEGORY_OPTIONS = [
        'fee_reminder' => 'Fee Reminder',
        'absence_alert' => 'Absence Alert',
        'event_notification' => 'Event Notification',
        'exam_notice' => 'Exam Notice',
        'holiday_notice' => 'Holiday Notice',
        'emergency' => 'Emergency',
        'general' => 'General',
        'academic' => 'Academic',
        'transport' => 'Transport',
        'hostel' => 'Hostel',
    ];

    const LANGUAGE_OPTIONS = [
        'en' => 'English',
        'sw' => 'Kiswahili',
    ];

    // Relationships
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    // Scopes
    public function scopeForSchool($query, $schoolId)
    {
        return $query->where('school_id', $schoolId);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    // Accessors
    public function getTypeDisplayAttribute(): string
    {
        return self::TYPE_OPTIONS[$this->type] ?? $this->type;
    }

    public function getCategoryDisplayAttribute(): string
    {
        return self::CATEGORY_OPTIONS[$this->category] ?? $this->category;
    }

    public function getLanguageDisplayAttribute(): string
    {
        return self::LANGUAGE_OPTIONS[$this->language] ?? $this->language;
    }

    // Methods
    public function processContent(array $variables = []): string
    {
        $content = $this->content;
        
        foreach ($variables as $key => $value) {
            $content = str_replace("{{$key}}", $value, $content);
        }
        
        return $content;
    }

    public function getAvailableVariables(): array
    {
        return $this->variables ?? [];
    }
}



