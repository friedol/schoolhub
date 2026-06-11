<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffAttendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_id',
        'school_id',
        'date',
        'clock_in_time',
        'clock_out_time',
        'break_start_time',
        'break_end_time',
        'total_working_hours',
        'overtime_hours',
        'attendance_status',
        'clock_in_method',
        'clock_out_method',
        'clock_in_location',
        'clock_out_location',
        'notes',
        'is_late',
        'is_early_departure',
    ];

    protected $casts = [
        'date' => 'date',
        'clock_in_time' => 'datetime',
        'clock_out_time' => 'datetime',
        'break_start_time' => 'datetime',
        'break_end_time' => 'datetime',
        'total_working_hours' => 'decimal:2',
        'overtime_hours' => 'decimal:2',
        'is_late' => 'boolean',
        'is_early_departure' => 'boolean',
    ];

    protected $appends = [
        'status',
    ];

    const ATTENDANCE_STATUS_PRESENT = 'present';
    const ATTENDANCE_STATUS_ABSENT = 'absent';
    const ATTENDANCE_STATUS_LATE = 'late';
    const ATTENDANCE_STATUS_HALF_DAY = 'half_day';
    const ATTENDANCE_STATUS_LEAVE = 'leave';

    const CLOCK_METHOD_WEB = 'web';
    const CLOCK_METHOD_MOBILE = 'mobile';
    const CLOCK_METHOD_BIOMETRIC = 'biometric';
    const CLOCK_METHOD_MANUAL = 'manual';

    /**
     * Get the staff member this attendance belongs to
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    /**
     * Get the school this attendance record belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Check if staff is present
     */
    public function isPresent(): bool
    {
        return $this->attendance_status === self::ATTENDANCE_STATUS_PRESENT;
    }

    /**
     * Check if staff is absent
     */
    public function isAbsent(): bool
    {
        return $this->attendance_status === self::ATTENDANCE_STATUS_ABSENT;
    }

    /**
     * Check if staff is late
     */
    public function isLate(): bool
    {
        return $this->attendance_status === self::ATTENDANCE_STATUS_LATE || $this->is_late;
    }

    /**
     * Get attendance status display name
     */
    public function getAttendanceStatusDisplayAttribute(): string
    {
        return match($this->attendance_status) {
            self::ATTENDANCE_STATUS_PRESENT => 'Present',
            self::ATTENDANCE_STATUS_ABSENT => 'Absent',
            self::ATTENDANCE_STATUS_LATE => 'Late',
            self::ATTENDANCE_STATUS_HALF_DAY => 'Half Day',
            self::ATTENDANCE_STATUS_LEAVE => 'On Leave',
            default => 'Unknown'
        };
    }

    /**
     * Get clock method display name
     */
    public function getClockMethodDisplayAttribute(): string
    {
        return match($this->clock_in_method) {
            self::CLOCK_METHOD_WEB => 'Web Portal',
            self::CLOCK_METHOD_MOBILE => 'Mobile App',
            self::CLOCK_METHOD_BIOMETRIC => 'Biometric',
            self::CLOCK_METHOD_MANUAL => 'Manual Entry',
            default => 'Unknown'
        };
    }

    /**
     * Calculate working hours
     */
    public function calculateWorkingHours(): float
    {
        if (!$this->clock_in_time || !$this->clock_out_time) {
            return 0;
        }

        $totalMinutes = $this->clock_out_time->diffInMinutes($this->clock_in_time);
        
        // Subtract break time if applicable
        if ($this->break_start_time && $this->break_end_time) {
            $breakMinutes = $this->break_end_time->diffInMinutes($this->break_start_time);
            $totalMinutes -= $breakMinutes;
        }

        return round($totalMinutes / 60, 2);
    }

    /**
     * Get status (alias for attendance_status)
     */
    public function getStatusAttribute(): string
    {
        return $this->attendance_status ?? '';
    }

    /**
     * Set status (alias for attendance_status)
     */
    public function setStatusAttribute(?string $value): void
    {
        $this->attributes['attendance_status'] = $value;
    }
}



