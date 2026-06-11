<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Timetable extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'school_id',
        'school_type_id',
        'class_id',
        'section',
        'academic_term_id',
        'is_active',
        'settings',
        // Keep old fields for backward compatibility / fallback
        'subject_id',
        'teacher_id',
        'day_of_week',
        'start_time',
        'end_time',
        'room',
        'notes',
    ];

    protected $casts = [
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'is_active' => 'boolean',
        'settings' => 'array',
    ];

    /**
     * Get the school type
     */
    public function schoolType(): BelongsTo
    {
        return $this->belongsTo(SchoolType::class);
    }

    /**
     * Get the slots for this timetable
     */
    public function slots(): HasMany
    {
        return $this->hasMany(TimetableSlot::class);
    }

    /**
     * Get the slots for this timetable (alias)
     */
    public function timetableSlots(): HasMany
    {
        return $this->hasMany(TimetableSlot::class);
    }

    /**
     * Get the school this timetable belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the period (legacy)
     */
    public function period(): BelongsTo
    {
        return $this->belongsTo(Period::class);
    }

    /**
     * Get the room (legacy)
     */
    public function roomRelation(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'room');
    }

    /**
     * Get the class
     */
    public function class(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    /**
     * Get the class (alias)
     */
    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    /**
     * Get the subject (legacy)
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Get the teacher (legacy)
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * Get the academic term
     */
    public function academicTerm(): BelongsTo
    {
        return $this->belongsTo(AcademicTerm::class, 'academic_term_id');
    }

    /**
     * Get day of week display name (legacy)
     */
    public function getDayDisplayAttribute(): string
    {
        return match($this->day_of_week) {
            1 => 'Monday',
            2 => 'Tuesday',
            3 => 'Wednesday',
            4 => 'Thursday',
            5 => 'Friday',
            6 => 'Saturday',
            7 => 'Sunday',
            default => 'Unknown'
        };
    }

    /**
     * Get duration in minutes
     */
    public function getDurationAttribute(): int
    {
        return $this->start_time->diffInMinutes($this->end_time);
    }

    /**
     * Check if timetable conflicts with another
     */
    public function conflictsWith(Timetable $other): bool
    {
        if ($this->day_of_week !== $other->day_of_week) {
            return false;
        }

        if ($this->teacher_id === $other->teacher_id || $this->class_id === $other->class_id) {
            return $this->start_time < $other->end_time && $this->end_time > $other->start_time;
        }

        return false;
    }
}
