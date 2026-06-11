<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HostelBed extends Model
{
    use HasFactory;

    protected $fillable = [
        'hostel_id',
        'floor_id',
        'room_id',
        'bed_number',
        'bed_code',
        'status',
        'condition',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Bed status constants
    const STATUS_VACANT = 'vacant';
    const STATUS_OCCUPIED = 'occupied';
    const STATUS_UNDER_MAINTENANCE = 'under_maintenance';
    const STATUS_RESERVED = 'reserved';

    const STATUS_OPTIONS = [
        self::STATUS_VACANT => 'Vacant',
        self::STATUS_OCCUPIED => 'Occupied',
        self::STATUS_UNDER_MAINTENANCE => 'Under Maintenance',
        self::STATUS_RESERVED => 'Reserved',
    ];

    // Bed condition constants
    const CONDITION_EXCELLENT = 'excellent';
    const CONDITION_GOOD = 'good';
    const CONDITION_FAIR = 'fair';
    const CONDITION_POOR = 'poor';
    const CONDITION_DAMAGED = 'damaged';

    const CONDITION_OPTIONS = [
        self::CONDITION_EXCELLENT => 'Excellent',
        self::CONDITION_GOOD => 'Good',
        self::CONDITION_FAIR => 'Fair',
        self::CONDITION_POOR => 'Poor',
        self::CONDITION_DAMAGED => 'Damaged',
    ];

    /**
     * Get the hostel that owns this bed
     */
    public function hostel(): BelongsTo
    {
        return $this->belongsTo(Hostel::class);
    }

    /**
     * Get the floor that owns this bed
     */
    public function floor(): BelongsTo
    {
        return $this->belongsTo(HostelFloor::class, 'floor_id');
    }

    /**
     * Get the room that owns this bed
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(HostelRoom::class, 'room_id');
    }

    /**
     * Get current allocation for this bed
     */
    public function currentAllocation(): BelongsTo
    {
        return $this->belongsTo(HostelAllocation::class, 'id', 'bed_id')
            ->where('is_active', true);
    }

    /**
     * Get all allocations for this bed
     */
    public function allocations(): HasMany
    {
        return $this->hasMany(HostelAllocation::class, 'bed_id');
    }

    /**
     * Get inventory items assigned to this bed
     */
    public function inventoryItems(): HasMany
    {
        return $this->hasMany(HostelInventory::class, 'bed_id');
    }

    /**
     * Get maintenance requests for this bed
     */
    public function maintenanceRequests(): HasMany
    {
        return $this->hasMany(HostelMaintenanceRequest::class, 'bed_id');
    }

    /**
     * Check if bed is available for allocation
     */
    public function isAvailable(): bool
    {
        return $this->status === self::STATUS_VACANT && $this->is_active;
    }

    /**
     * Check if bed is occupied
     */
    public function isOccupied(): bool
    {
        return $this->status === self::STATUS_OCCUPIED;
    }

    /**
     * Check if bed is under maintenance
     */
    public function isUnderMaintenance(): bool
    {
        return $this->status === self::STATUS_UNDER_MAINTENANCE;
    }

    /**
     * Get bed display name
     */
    public function getDisplayNameAttribute(): string
    {
        return "Bed {$this->bed_number}";
    }

    /**
     * Get full bed code with location
     */
    public function getFullBedCodeAttribute(): string
    {
        return $this->bed_code ?: "{$this->hostel->hostel_code}-{$this->room->room_number}-{$this->bed_number}";
    }

    /**
     * Get bed location string
     */
    public function getLocationStringAttribute(): string
    {
        return "{$this->hostel->name} - Floor {$this->floor->floor_number} - {$this->room->display_name} - Bed {$this->bed_number}";
    }

    /**
     * Get status color for UI
     */
    public function getStatusColorAttribute(): string
    {
        $colorMap = [
            self::STATUS_VACANT => 'green',
            self::STATUS_OCCUPIED => 'blue',
            self::STATUS_UNDER_MAINTENANCE => 'yellow',
            self::STATUS_RESERVED => 'purple',
        ];

        return $colorMap[$this->status] ?? 'gray';
    }

    /**
     * Get condition color for UI
     */
    public function getConditionColorAttribute(): string
    {
        $colorMap = [
            self::CONDITION_EXCELLENT => 'green',
            self::CONDITION_GOOD => 'blue',
            self::CONDITION_FAIR => 'yellow',
            self::CONDITION_POOR => 'orange',
            self::CONDITION_DAMAGED => 'red',
        ];

        return $colorMap[$this->condition] ?? 'gray';
    }

    /**
     * Scope for available beds
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', self::STATUS_VACANT)
            ->where('is_active', true);
    }

    /**
     * Scope for occupied beds
     */
    public function scopeOccupied($query)
    {
        return $query->where('status', self::STATUS_OCCUPIED);
    }

    /**
     * Scope for beds under maintenance
     */
    public function scopeUnderMaintenance($query)
    {
        return $query->where('status', self::STATUS_UNDER_MAINTENANCE);
    }

    /**
     * Scope for active beds
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Boot method to auto-generate bed code
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($bed) {
            if (!$bed->bed_code) {
                $bed->bed_code = "{$bed->hostel->hostel_code}-{$bed->room->room_number}-{$bed->bed_number}";
            }
        });
    }
}



