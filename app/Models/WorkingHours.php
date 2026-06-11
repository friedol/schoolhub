<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkingHours extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'name',
        'description',
        'start_time',
        'end_time',
        'break_start_time',
        'break_end_time',
        'working_days',
        'is_default',
        'is_active',
    ];

    protected $casts = [
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'break_start_time' => 'datetime:H:i',
        'break_end_time' => 'datetime:H:i',
        'working_days' => 'array',
        'is_default' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Get the school this working hours belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Check if working hours is default
     */
    public function isDefault(): bool
    {
        return $this->is_default;
    }

    /**
     * Check if working hours is active
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Get working days display
     */
    public function getWorkingDaysDisplayAttribute(): string
    {
        $days = [
            'monday' => 'Monday',
            'tuesday' => 'Tuesday',
            'wednesday' => 'Wednesday',
            'thursday' => 'Thursday',
            'friday' => 'Friday',
            'saturday' => 'Saturday',
            'sunday' => 'Sunday',
        ];

        $workingDays = [];
        foreach ($this->working_days as $day) {
            if (isset($days[$day])) {
                $workingDays[] = $days[$day];
            }
        }

        return implode(', ', $workingDays);
    }

    /**
     * Calculate total working hours per day
     */
    public function getTotalWorkingHoursAttribute(): float
    {
        $start = $this->start_time;
        $end = $this->end_time;
        $breakStart = $this->break_start_time;
        $breakEnd = $this->break_end_time;

        $totalMinutes = $end->diffInMinutes($start);
        
        if ($breakStart && $breakEnd) {
            $breakMinutes = $breakEnd->diffInMinutes($breakStart);
            $totalMinutes -= $breakMinutes;
        }

        return round($totalMinutes / 60, 2);
    }

    /**
     * Check if a specific day is a working day
     */
    public function isWorkingDay(string $day): bool
    {
        return in_array(strtolower($day), $this->working_days);
    }
}



