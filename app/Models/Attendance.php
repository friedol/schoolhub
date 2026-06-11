<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'user_id',
        'class_id',
        'date',
        'status',
        'time_in',
        'time_out',
        'notes',
        'marked_by',
        'is_late',
        'late_reason',
    ];

    protected $casts = [
        'date' => 'date',
        'time_in' => 'datetime:H:i',
        'time_out' => 'datetime:H:i',
        'is_late' => 'boolean',
    ];

    const STATUS_PRESENT = 'present';
    const STATUS_ABSENT = 'absent';
    const STATUS_LATE = 'late';
    const STATUS_EXCUSED = 'excused';
    const STATUS_SICK = 'sick';
    const STATUS_LEAVE = 'leave';

    /**
     * Get the school this attendance belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the user (student or teacher)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the student (user)
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the class
     */
    public function class(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    /**
     * Get the user who marked the attendance
     */
    public function markedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'marked_by');
    }

    /**
     * Get status display name
     */
    public function getStatusDisplayAttribute(): string
    {
        return match($this->status) {
            self::STATUS_PRESENT => 'Present',
            self::STATUS_ABSENT => 'Absent',
            self::STATUS_LATE => 'Late',
            self::STATUS_EXCUSED => 'Excused',
            self::STATUS_SICK => 'Sick',
            self::STATUS_LEAVE => 'Leave',
            default => 'Unknown'
        };
    }

    /**
     * Check if attendance is marked
     */
    public function isMarked(): bool
    {
        return !is_null($this->status);
    }

    /**
     * Get attendance percentage for a user in a date range
     */
    public static function getAttendancePercentage(int $userId, string $startDate, string $endDate): float
    {
        $totalDays = self::where('user_id', $userId)
            ->whereBetween('date', [$startDate, $endDate])
            ->count();

        if ($totalDays === 0) {
            return 0;
        }

        $presentDays = self::where('user_id', $userId)
            ->whereBetween('date', [$startDate, $endDate])
            ->whereIn('status', [self::STATUS_PRESENT, self::STATUS_LATE])
            ->count();

        return round(($presentDays / $totalDays) * 100, 2);
    }

    /**
     * Scope for student attendance
     */
    public function scopeStudents($query)
    {
        return $query->whereHas('user', function($q) {
            $q->where('role', 'student');
        });
    }

    /**
     * Scope for teacher attendance
     */
    public function scopeTeachers($query)
    {
        return $query->whereHas('user', function($q) {
            $q->where('role', 'teacher');
        });
    }
}
