<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HostelFacility extends Model
{
    use HasFactory;

    protected $fillable = [
        'hostel_id',
        'facility_name',
        'facility_type',
        'location',
        'capacity',
        'description',
        'is_available',
        'maintenance_schedule',
        'last_maintenance_date',
        'next_maintenance_date',
        'notes',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'is_available' => 'boolean',
        'maintenance_schedule' => 'array',
        'last_maintenance_date' => 'date',
        'next_maintenance_date' => 'date',
    ];

    // Facility type constants
    const TYPE_COMMON_ROOM = 'common_room';
    const TYPE_WASHROOM = 'washroom';
    const TYPE_STUDY_AREA = 'study_area';
    const TYPE_LAUNDRY = 'laundry';
    const TYPE_KITCHEN = 'kitchen';
    const TYPE_DINING_HALL = 'dining_hall';
    const TYPE_RECREATION = 'recreation';
    const TYPE_STORAGE = 'storage';

    const TYPE_OPTIONS = [
        self::TYPE_COMMON_ROOM => 'Common Room',
        self::TYPE_WASHROOM => 'Washroom',
        self::TYPE_STUDY_AREA => 'Study Area',
        self::TYPE_LAUNDRY => 'Laundry',
        self::TYPE_KITCHEN => 'Kitchen',
        self::TYPE_DINING_HALL => 'Dining Hall',
        self::TYPE_RECREATION => 'Recreation Area',
        self::TYPE_STORAGE => 'Storage Room',
    ];

    /**
     * Get the hostel that owns this facility
     */
    public function hostel(): BelongsTo
    {
        return $this->belongsTo(Hostel::class);
    }

    /**
     * Check if facility needs maintenance
     */
    public function needsMaintenance(): bool
    {
        if (!$this->next_maintenance_date) {
            return false;
        }

        return now()->toDateString() >= $this->next_maintenance_date->toDateString();
    }

    /**
     * Get facility type color for UI
     */
    public function getTypeColorAttribute(): string
    {
        $colorMap = [
            self::TYPE_COMMON_ROOM => 'blue',
            self::TYPE_WASHROOM => 'green',
            self::TYPE_STUDY_AREA => 'purple',
            self::TYPE_LAUNDRY => 'orange',
            self::TYPE_KITCHEN => 'red',
            self::TYPE_DINING_HALL => 'yellow',
            self::TYPE_RECREATION => 'pink',
            self::TYPE_STORAGE => 'gray',
        ];

        return $colorMap[$this->facility_type] ?? 'gray';
    }

    /**
     * Scope for available facilities
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    /**
     * Scope for facilities by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('facility_type', $type);
    }

    /**
     * Scope for facilities needing maintenance
     */
    public function scopeNeedsMaintenance($query)
    {
        return $query->where('next_maintenance_date', '<=', now()->toDateString());
    }
}



