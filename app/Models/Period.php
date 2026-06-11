<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Period extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'period_number',
        'name',
        'start_time',
        'end_time',
        'is_break',
        'break_type',
        'is_active',
    ];

    protected $casts = [
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'is_break' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Get the school this period belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get timetable entries for this period
     */
    public function timetableEntries(): HasMany
    {
        return $this->hasMany(Timetable::class, 'period_id');
    }

    /**
     * Check if this is a break period
     */
    public function isBreak(): bool
    {
        return $this->is_break;
    }

    /**
     * Get period duration in minutes
     */
    public function getDurationAttribute(): int
    {
        return $this->start_time->diffInMinutes($this->end_time);
    }

    /**
     * Check if period is active
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }
}



