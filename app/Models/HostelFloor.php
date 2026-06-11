<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HostelFloor extends Model
{
    use HasFactory;

    protected $fillable = [
        'hostel_id',
        'floor_number',
        'floor_name',
        'description',
        'is_active',
    ];

    protected $casts = [
        'floor_number' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Get the hostel that owns this floor
     */
    public function hostel(): BelongsTo
    {
        return $this->belongsTo(Hostel::class);
    }

    /**
     * Get rooms on this floor
     */
    public function rooms(): HasMany
    {
        return $this->hasMany(HostelRoom::class);
    }

    /**
     * Get beds on this floor
     */
    public function beds(): HasMany
    {
        return $this->hasMany(HostelBed::class);
    }

    /**
     * Get current occupancy count for this floor
     */
    public function getCurrentOccupancyAttribute(): int
    {
        return $this->beds()->where('status', HostelBed::STATUS_OCCUPIED)->count();
    }

    /**
     * Get total capacity for this floor
     */
    public function getTotalCapacityAttribute(): int
    {
        return $this->beds()->count();
    }

    /**
     * Get vacancy count for this floor
     */
    public function getVacancyCountAttribute(): int
    {
        return $this->beds()->where('status', HostelBed::STATUS_VACANT)->count();
    }

    /**
     * Get occupancy percentage for this floor
     */
    public function getOccupancyPercentageAttribute(): float
    {
        if ($this->total_capacity == 0) {
            return 0;
        }
        return round(($this->current_occupancy / $this->total_capacity) * 100, 2);
    }

    /**
     * Scope for active floors
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for floors by number
     */
    public function scopeByNumber($query, $number)
    {
        return $query->where('floor_number', $number);
    }
}



