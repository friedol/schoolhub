<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehicleMaintenance extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'date',
        'maintenance_type',
        'description',
        'cost',
        'currency',
        'service_provider',
        'mileage',
        'next_maintenance_date',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'cost' => 'decimal:2',
        'next_maintenance_date' => 'date',
    ];

    /**
     * Get the vehicle
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * Get maintenance type display name
     */
    public function getMaintenanceTypeDisplayAttribute(): string
    {
        return match($this->maintenance_type) {
            'routine' => 'Routine Maintenance',
            'repair' => 'Repair',
            'inspection' => 'Inspection',
            'emergency' => 'Emergency Repair',
            default => $this->maintenance_type
        };
    }

    /**
     * Check if maintenance is overdue
     */
    public function isOverdue(): bool
    {
        return $this->next_maintenance_date && $this->next_maintenance_date < now()->toDateString();
    }

    /**
     * Check if maintenance is due soon
     */
    public function isDueSoon(int $days = 7): bool
    {
        return $this->next_maintenance_date && 
               $this->next_maintenance_date->diffInDays(now()) <= $days;
    }
}



