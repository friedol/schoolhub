<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FuelRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'date',
        'quantity',
        'unit',
        'cost',
        'currency',
        'fuel_station',
        'mileage',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'quantity' => 'decimal:2',
        'cost' => 'decimal:2',
    ];

    /**
     * Get the vehicle
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * Get cost per unit
     */
    public function getCostPerUnitAttribute(): float
    {
        if ($this->quantity == 0) {
            return 0;
        }

        return round($this->cost / $this->quantity, 2);
    }

    /**
     * Get fuel efficiency (if mileage is available)
     */
    public function getFuelEfficiencyAttribute(): float
    {
        if ($this->quantity == 0 || !$this->mileage) {
            return 0;
        }

        return round($this->mileage / $this->quantity, 2);
    }
}



