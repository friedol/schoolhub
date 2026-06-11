<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HostelDutyRoster extends Model
{
    use HasFactory;

    protected $fillable = [
        'hostel_id',
        'warden_id',
        'duty_date',
        'shift_start_time',
        'shift_end_time',
        'duty_type',
        'responsibilities',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'duty_date' => 'date',
        'shift_start_time' => 'datetime',
        'shift_end_time' => 'datetime',
        'responsibilities' => 'array',
        'is_active' => 'boolean',
    ];

    // Duty type constants
    const TYPE_DAY_SHIFT = 'day_shift';
    const TYPE_NIGHT_SHIFT = 'night_shift';
    const TYPE_WEEKEND_DUTY = 'weekend_duty';
    const TYPE_EMERGENCY_DUTY = 'emergency_duty';

    const TYPE_OPTIONS = [
        self::TYPE_DAY_SHIFT => 'Day Shift',
        self::TYPE_NIGHT_SHIFT => 'Night Shift',
        self::TYPE_WEEKEND_DUTY => 'Weekend Duty',
        self::TYPE_EMERGENCY_DUTY => 'Emergency Duty',
    ];

    /**
     * Get the hostel for this duty roster
     */
    public function hostel(): BelongsTo
    {
        return $this->belongsTo(Hostel::class);
    }

    /**
     * Get the warden for this duty roster
     */
    public function warden(): BelongsTo
    {
        return $this->belongsTo(User::class, 'warden_id');
    }

    /**
     * Get shift duration in hours
     */
    public function getShiftDurationAttribute(): float
    {
        if (!$this->shift_start_time || !$this->shift_end_time) {
            return 0;
        }

        return $this->shift_start_time->diffInHours($this->shift_end_time);
    }

    /**
     * Check if duty is currently active
     */
    public function isCurrentlyActive(): bool
    {
        if (!$this->is_active || $this->duty_date->toDateString() !== now()->toDateString()) {
            return false;
        }

        $now = now();
        return $now >= $this->shift_start_time && $now <= $this->shift_end_time;
    }

    /**
     * Get duty type color for UI
     */
    public function getTypeColorAttribute(): string
    {
        $colorMap = [
            self::TYPE_DAY_SHIFT => 'blue',
            self::TYPE_NIGHT_SHIFT => 'purple',
            self::TYPE_WEEKEND_DUTY => 'green',
            self::TYPE_EMERGENCY_DUTY => 'red',
        ];

        return $colorMap[$this->duty_type] ?? 'gray';
    }

    /**
     * Scope for active duty rosters
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for duty rosters by date
     */
    public function scopeByDate($query, $date)
    {
        return $query->where('duty_date', $date);
    }

    /**
     * Scope for duty rosters by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('duty_type', $type);
    }

    /**
     * Scope for current duty rosters
     */
    public function scopeCurrent($query)
    {
        return $query->where('duty_date', now()->toDateString())
            ->where('is_active', true);
    }
}



