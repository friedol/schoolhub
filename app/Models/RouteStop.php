<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RouteStop extends Model
{
    use HasFactory;

    protected $fillable = [
        'route_id',
        'stop_name',
        'stop_code',
        'address',
        'latitude',
        'longitude',
        'pickup_time',
        'dropoff_time',
        'sequence_order',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'pickup_time' => 'datetime:H:i',
        'dropoff_time' => 'datetime:H:i',
        'is_active' => 'boolean',
    ];

    /**
     * Get the route this stop belongs to
     */
    public function route(): BelongsTo
    {
        return $this->belongsTo(TransportRoute::class);
    }

    /**
     * Get transport assignments for this stop
     */
    public function transportAssignments(): HasMany
    {
        return $this->hasMany(TransportAssignment::class, 'stop_id');
    }

    /**
     * Check if stop is active
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Get stop display name
     */
    public function getStopDisplayAttribute(): string
    {
        return $this->stop_name . ' (' . $this->stop_code . ')';
    }
}



