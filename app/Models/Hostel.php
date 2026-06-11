<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Hostel extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'hostel_code',
        'name',
        'type',
        'location',
        'total_capacity',
        'description',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'total_capacity' => 'integer',
        'is_active' => 'boolean',
    ];

    // Hostel type constants
    const TYPE_BOYS = 'boys';
    const TYPE_GIRLS = 'girls';
    const TYPE_MIXED = 'mixed';

    const TYPE_OPTIONS = [
        self::TYPE_BOYS => 'Boys Hostel',
        self::TYPE_GIRLS => 'Girls Hostel',
        self::TYPE_MIXED => 'Mixed Hostel',
    ];

    /**
     * Get the school that owns the hostel
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the user who created this hostel
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get floors in this hostel
     */
    public function floors(): HasMany
    {
        return $this->hasMany(HostelFloor::class);
    }

    /**
     * Get rooms in this hostel
     */
    public function rooms(): HasMany
    {
        return $this->hasMany(HostelRoom::class);
    }

    /**
     * Get beds in this hostel
     */
    public function beds(): HasMany
    {
        return $this->hasMany(HostelBed::class);
    }

    /**
     * Get wardens assigned to this hostel
     */
    public function wardens(): HasMany
    {
        return $this->hasMany(HostelWarden::class);
    }

    /**
     * Get facilities in this hostel
     */
    public function facilities(): HasMany
    {
        return $this->hasMany(HostelFacility::class);
    }

    /**
     * Get student allocations in this hostel
     */
    public function allocations(): HasMany
    {
        return $this->hasMany(HostelAllocation::class);
    }

    /**
     * Get current occupancy count
     */
    public function getCurrentOccupancyAttribute(): int
    {
        return $this->beds()->where('status', HostelBed::STATUS_OCCUPIED)->count();
    }

    /**
     * Get vacancy count
     */
    public function getVacancyCountAttribute(): int
    {
        return $this->beds()->where('status', HostelBed::STATUS_VACANT)->count();
    }

    /**
     * Get occupancy percentage
     */
    public function getOccupancyPercentageAttribute(): float
    {
        if ($this->total_capacity == 0) {
            return 0;
        }
        return round(($this->current_occupancy / $this->total_capacity) * 100, 2);
    }

    /**
     * Check if hostel is full
     */
    public function isFull(): bool
    {
        return $this->current_occupancy >= $this->total_capacity;
    }

    /**
     * Check if hostel has vacancies
     */
    public function hasVacancies(): bool
    {
        return $this->vacancy_count > 0;
    }

    /**
     * Get available beds for allocation
     */
    public function getAvailableBeds()
    {
        return $this->beds()->where('status', HostelBed::STATUS_VACANT)->get();
    }

    /**
     * Scope for active hostels
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for hostels by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Generate unique hostel code
     */
    public static function generateHostelCode($name): string
    {
        $prefix = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $name), 0, 4));
        $count = self::count() + 1;
        return $prefix . '-' . str_pad($count, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Boot method to auto-generate hostel code
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($hostel) {
            if (!$hostel->hostel_code) {
                $hostel->hostel_code = self::generateHostelCode($hostel->name);
            }
        });
    }
}