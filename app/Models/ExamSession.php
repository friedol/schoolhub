<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_id',
        'subject_id',
        'school_class_id',
        'date',
        'start_time',
        'end_time',
        'room_id',
        'invigilator_id',
        'max_marks',
        'instructions',
        'is_published',
    ];

    protected $casts = [
        'date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'max_marks' => 'integer',
        'is_published' => 'boolean',
    ];

    /**
     * Get the exam this session belongs to
     */
    public function exam(): BelongsTo
    {
        return $this->belongsTo(Examination::class, 'exam_id');
    }

    /**
     * Get the subject
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Get the school class
     */
    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class);
    }

    /**
     * Get the room
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * Get the invigilator
     */
    public function invigilator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invigilator_id');
    }

    /**
     * Get seating arrangements for this session
     */
    public function seatingArrangements(): HasMany
    {
        return $this->hasMany(SeatingArrangement::class);
    }

    /**
     * Get session duration in minutes
     */
    public function getDurationAttribute(): int
    {
        return $this->start_time->diffInMinutes($this->end_time);
    }

    /**
     * Check if session is published
     */
    public function isPublished(): bool
    {
        return $this->is_published;
    }
}



