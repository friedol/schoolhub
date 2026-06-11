<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransportAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'student_id',
        'route_id',
        'vehicle_id',
        'stop_id',
        'assignment_date',
        'end_date',
        'status',
        'fare_amount',
        'currency',
        'notes',
    ];

    protected $casts = [
        'assignment_date' => 'date',
        'end_date' => 'date',
        'fare_amount' => 'decimal:2',
    ];

    const STATUS_ACTIVE = 'active';
    const STATUS_INACTIVE = 'inactive';
    const STATUS_SUSPENDED = 'suspended';

    /**
     * Get the school this assignment belongs to
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
     * Get the route
     */
    public function route(): BelongsTo
    {
        return $this->belongsTo(TransportRoute::class);
    }

    /**
     * Get the vehicle
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * Get the stop
     */
    public function stop(): BelongsTo
    {
        return $this->belongsTo(RouteStop::class);
    }

    /**
     * Get status display name
     */
    public function getStatusDisplayAttribute(): string
    {
        return match($this->status) {
            self::STATUS_ACTIVE => 'Active',
            self::STATUS_INACTIVE => 'Inactive',
            self::STATUS_SUSPENDED => 'Suspended',
            default => 'Unknown'
        };
    }

    /**
     * Check if assignment is active
     */
    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }
}



