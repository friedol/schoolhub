<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'vehicle_number',
        'registration_number',
        'make',
        'model',
        'year',
        'color',
        'capacity',
        'vehicle_type',
        'fuel_type',
        'insurance_company',
        'insurance_policy_number',
        'insurance_expiry',
        'license_plate',
        'chassis_number',
        'engine_number',
        'purchase_date',
        'purchase_price',
        'current_value',
        'driver_id',
        'route_id',
        'status',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'year' => 'integer',
        'capacity' => 'integer',
        'insurance_expiry' => 'date',
        'purchase_date' => 'date',
        'purchase_price' => 'decimal:2',
        'current_value' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    const VEHICLE_TYPE_BUS = 'bus';
    const VEHICLE_TYPE_VAN = 'van';
    const VEHICLE_TYPE_CAR = 'car';
    const VEHICLE_TYPE_TRUCK = 'truck';

    const STATUS_ACTIVE = 'active';
    const STATUS_MAINTENANCE = 'maintenance';
    const STATUS_OUT_OF_SERVICE = 'out_of_service';
    const STATUS_SOLD = 'sold';

    /**
     * Get the school this vehicle belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the assigned driver
     */
    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    /**
     * Get the assigned route
     */
    public function route(): BelongsTo
    {
        return $this->belongsTo(TransportRoute::class);
    }

    /**
     * Get transport trips
     */
    public function trips(): HasMany
    {
        return $this->hasMany(TransportTrip::class);
    }

    /**
     * Get maintenance records
     */
    public function maintenanceRecords(): HasMany
    {
        return $this->hasMany(VehicleMaintenance::class);
    }

    /**
     * Get fuel records
     */
    public function fuelRecords(): HasMany
    {
        return $this->hasMany(FuelRecord::class);
    }

    /**
     * Get vehicle type display name
     */
    public function getVehicleTypeDisplayAttribute(): string
    {
        return match($this->vehicle_type) {
            self::VEHICLE_TYPE_BUS => 'Bus',
            self::VEHICLE_TYPE_VAN => 'Van',
            self::VEHICLE_TYPE_CAR => 'Car',
            self::VEHICLE_TYPE_TRUCK => 'Truck',
            default => 'Unknown'
        };
    }

    /**
     * Get status display name
     */
    public function getStatusDisplayAttribute(): string
    {
        return match($this->status) {
            self::STATUS_ACTIVE => 'Active',
            self::STATUS_MAINTENANCE => 'Under Maintenance',
            self::STATUS_OUT_OF_SERVICE => 'Out of Service',
            self::STATUS_SOLD => 'Sold',
            default => 'Unknown'
        };
    }

    /**
     * Check if vehicle is active
     */
    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    /**
     * Check if insurance is expired
     */
    public function isInsuranceExpired(): bool
    {
        return $this->insurance_expiry < now()->toDateString();
    }

    /**
     * Check if insurance is expiring soon
     */
    public function isInsuranceExpiringSoon(int $days = 30): bool
    {
        return $this->insurance_expiry->diffInDays(now()) <= $days;
    }

    /**
     * Get vehicle age in years
     */
    public function getAgeAttribute(): int
    {
        return now()->year - $this->year;
    }

    /**
     * Get total fuel consumption for a period
     */
    public function getTotalFuelConsumption(string $startDate, string $endDate): float
    {
        return $this->fuelRecords()
            ->whereBetween('date', [$startDate, $endDate])
            ->sum('quantity');
    }

    /**
     * Get total maintenance cost for a period
     */
    public function getTotalMaintenanceCost(string $startDate, string $endDate): float
    {
        return $this->maintenanceRecords()
            ->whereBetween('date', [$startDate, $endDate])
            ->sum('cost');
    }
}
