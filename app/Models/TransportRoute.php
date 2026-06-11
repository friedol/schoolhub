<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TransportRoute extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'route_name',
        'route_code',
        'start_location',
        'end_location',
        'distance_km',
        'estimated_duration',
        'fare_amount',
        'currency',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'distance_km' => 'decimal:2',
        'estimated_duration' => 'integer', // in minutes
        'fare_amount' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Get the school this route belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get route stops
     */
    public function stops(): HasMany
    {
        return $this->hasMany(RouteStop::class);
    }

    /**
     * Get assigned students
     */
    public function students(): HasMany
    {
        return $this->hasMany(TransportAssignment::class);
    }

    /**
     * Get assigned vehicles
     */
    public function vehicles(): HasMany
    {
        return $this->hasMany(Vehicle::class);
    }

    /**
     * Get transport trips
     */
    public function trips(): HasMany
    {
        return $this->hasMany(TransportTrip::class);
    }

    /**
     * Check if route is active
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Get total students assigned to this route
     */
    public function getTotalStudentsAttribute(): int
    {
        return $this->students()->count();
    }

    /**
     * Get total vehicles assigned to this route
     */
    public function getTotalVehiclesAttribute(): int
    {
        return $this->vehicles()->where('status', Vehicle::STATUS_ACTIVE)->count();
    }

    /**
     * Get route display name
     */
    public function getRouteDisplayAttribute(): string
    {
        return $this->route_name . ' (' . $this->route_code . ')';
    }

    /**
     * Get estimated duration display
     */
    public function getDurationDisplayAttribute(): string
    {
        $hours = floor($this->estimated_duration / 60);
        $minutes = $this->estimated_duration % 60;

        if ($hours > 0) {
            return $hours . 'h ' . $minutes . 'm';
        }

        return $minutes . ' minutes';
    }
}
