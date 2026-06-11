<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BusAttendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'student_id',
        'vehicle_id',
        'trip_id',
        'attendance_date',
        'trip_type',
        'status',
        'boarding_time',
        'alighting_time',
        'marked_by',
        'notes',
    ];

    protected $casts = [
        'attendance_date' => 'date',
        'boarding_time' => 'datetime:H:i',
        'alighting_time' => 'datetime:H:i',
    ];

    const TRIP_TYPE_MORNING = 'morning';
    const TRIP_TYPE_EVENING = 'evening';

    const STATUS_PRESENT = 'present';
    const STATUS_ABSENT = 'absent';
    const STATUS_LATE = 'late';

    /**
     * Get the school this attendance belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the student
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the vehicle
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * Get the trip
     */
    public function trip(): BelongsTo
    {
        return $this->belongsTo(TransportTrip::class);
    }

    /**
     * Get the user who marked this attendance
     */
    public function markedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'marked_by');
    }

    /**
     * Get trip type display name
     */
    public function getTripTypeDisplayAttribute(): string
    {
        return match($this->trip_type) {
            self::TRIP_TYPE_MORNING => 'Morning',
            self::TRIP_TYPE_EVENING => 'Evening',
            default => 'Unknown'
        };
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
            default => 'Unknown'
        };
    }

    /**
     * Check if student is present
     */
    public function isPresent(): bool
    {
        return $this->status === self::STATUS_PRESENT;
    }

    /**
     * Check if student is absent
     */
    public function isAbsent(): bool
    {
        return $this->status === self::STATUS_ABSENT;
    }
}



