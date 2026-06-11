<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HostelRoom extends Model
{
    use HasFactory;

    protected $fillable = [
        'hostel_id',
        'floor_id',
        'room_number',
        'room_name',
        'room_type',
        'capacity',
        'current_occupancy',
        'amenities',
        'description',
        'is_active',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'current_occupancy' => 'integer',
        'amenities' => 'array',
        'is_active' => 'boolean',
    ];

    // Room type constants
    const TYPE_SINGLE = 'single';
    const TYPE_DOUBLE = 'double';
    const TYPE_DORMITORY = 'dormitory';

    const TYPE_OPTIONS = [
        self::TYPE_SINGLE => 'Single Room',
        self::TYPE_DOUBLE => 'Double Room',
        self::TYPE_DORMITORY => 'Dormitory',
    ];

    // Amenities constants
    const AMENITY_ATTACHED_BATHROOM = 'attached_bathroom';
    const AMENITY_STUDY_TABLE = 'study_table';
    const AMENITY_WARDROBE = 'wardrobe';
    const AMENITY_CEILING_FAN = 'ceiling_fan';
    const AMENITY_AC = 'ac';
    const AMENITY_WIFI = 'wifi';
    const AMENITY_BALCONY = 'balcony';

    const AMENITY_OPTIONS = [
        self::AMENITY_ATTACHED_BATHROOM => 'Attached Bathroom',
        self::AMENITY_STUDY_TABLE => 'Study Table',
        self::AMENITY_WARDROBE => 'Wardrobe',
        self::AMENITY_CEILING_FAN => 'Ceiling Fan',
        self::AMENITY_AC => 'Air Conditioning',
        self::AMENITY_WIFI => 'WiFi',
        self::AMENITY_BALCONY => 'Balcony',
    ];

    /**
     * Get the hostel that owns this room
     */
    public function hostel(): BelongsTo
    {
        return $this->belongsTo(Hostel::class);
    }

    /**
     * Get the floor that owns this room
     */
    public function floor(): BelongsTo
    {
        return $this->belongsTo(HostelFloor::class, 'floor_id');
    }

    /**
     * Get beds in this room
     */
    public function beds(): HasMany
    {
        return $this->hasMany(HostelBed::class);
    }

    /**
     * Get allocations for this room
     */
    public function allocations(): HasMany
    {
        return $this->hasMany(HostelAllocation::class);
    }

    /**
     * Get inventory items in this room
     */
    public function inventoryItems(): HasMany
    {
        return $this->hasMany(HostelInventory::class);
    }

    /**
     * Get maintenance requests for this room
     */
    public function maintenanceRequests(): HasMany
    {
        return $this->hasMany(HostelMaintenanceRequest::class);
    }

    /**
     * Get vacancy count for this room
     */
    public function getVacancyCountAttribute(): int
    {
        return $this->capacity - $this->current_occupancy;
    }

    /**
     * Get occupancy percentage for this room
     */
    public function getOccupancyPercentageAttribute(): float
    {
        if ($this->capacity == 0) {
            return 0;
        }
        return round(($this->current_occupancy / $this->capacity) * 100, 2);
    }

    /**
     * Check if room is full
     */
    public function isFull(): bool
    {
        return $this->current_occupancy >= $this->capacity;
    }

    /**
     * Check if room has vacancies
     */
    public function hasVacancies(): bool
    {
        return $this->vacancy_count > 0;
    }

    /**
     * Get available beds in this room
     */
    public function getAvailableBeds()
    {
        return $this->beds()->where('status', HostelBed::STATUS_VACANT)->get();
    }

    /**
     * Get room display name
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->room_name ?: "Room {$this->room_number}";
    }

    /**
     * Get amenities as formatted string
     */
    public function getAmenitiesStringAttribute(): string
    {
        if (!$this->amenities || empty($this->amenities)) {
            return 'No amenities';
        }

        $amenityNames = array_map(function ($amenity) {
            return self::AMENITY_OPTIONS[$amenity] ?? $amenity;
        }, $this->amenities);

        return implode(', ', $amenityNames);
    }

    /**
     * Scope for active rooms
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for rooms by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('room_type', $type);
    }

    /**
     * Scope for rooms with vacancies
     */
    public function scopeWithVacancies($query)
    {
        return $query->whereRaw('current_occupancy < capacity');
    }

    /**
     * Scope for full rooms
     */
    public function scopeFull($query)
    {
        return $query->whereRaw('current_occupancy >= capacity');
    }
}