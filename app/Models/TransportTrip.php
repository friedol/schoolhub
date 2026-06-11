<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TransportTrip extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'vehicle_id',
        'route_id',
        'driver_id',
        'trip_date',
        'trip_type',
        'scheduled_departure',
        'actual_departure',
        'scheduled_arrival',
        'actual_arrival',
        'total_passengers',
        'total_students',
        'total_teachers',
        'status',
        'notes',
    ];

    protected $casts = [
        'trip_date' => 'date',
        'scheduled_departure' => 'datetime:H:i',
        'actual_departure' => 'datetime:H:i',
        'scheduled_arrival' => 'datetime:H:i',
        'actual_arrival' => 'datetime:H:i',
    ];

    const TRIP_TYPE_MORNING = 'morning';
    const TRIP_TYPE_EVENING = 'evening';
    const TRIP_TYPE_SPECIAL = 'special';

    const STATUS_SCHEDULED = 'scheduled';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Get the school this trip belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the vehicle
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * Get the route
     */
    public function route(): BelongsTo
    {
        return $this->belongsTo(TransportRoute::class);
    }

    /**
     * Get the driver
     */
    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    /**
     * Get bus attendances for this trip
     */
    public function busAttendances(): HasMany
    {
        return $this->hasMany(BusAttendance::class);
    }

    /**
     * Get trip type display name
     */
    public function getTripTypeDisplayAttribute(): string
    {
        return match($this->trip_type) {
            self::TRIP_TYPE_MORNING => 'Morning Trip',
            self::TRIP_TYPE_EVENING => 'Evening Trip',
            self::TRIP_TYPE_SPECIAL => 'Special Trip',
            default => 'Unknown'
        };
    }

    /**
     * Get status display name
     */
    public function getStatusDisplayAttribute(): string
    {
        return match($this->status) {
            self::STATUS_SCHEDULED => 'Scheduled',
            self::STATUS_IN_PROGRESS => 'In Progress',
            self::STATUS_COMPLETED => 'Completed',
            self::STATUS_CANCELLED => 'Cancelled',
            default => 'Unknown'
        };
    }

    /**
     * Check if trip is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Check if trip is in progress
     */
    public function isInProgress(): bool
    {
        return $this->status === self::STATUS_IN_PROGRESS;
    }

    /**
     * Get trip duration
     */
    public function getTripDurationAttribute(): int
    {
        if ($this->actual_departure && $this->actual_arrival) {
            return $this->actual_departure->diffInMinutes($this->actual_arrival);
        }

        return 0;
    }
}



