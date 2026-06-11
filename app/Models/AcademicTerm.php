<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicTerm extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'academic_year',
        'term',
        'name',
        'start_date',
        'end_date',
        'is_current',
        'is_active',
        'settings',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_current' => 'boolean',
        'is_active' => 'boolean',
        'settings' => 'array',
    ];

    /**
     * Get the school this term belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get academic records for this term
     */
    public function academicRecords(): HasMany
    {
        return $this->hasMany(AcademicRecord::class);
    }

    /**
     * Get examinations for this term
     */
    public function examinations(): HasMany
    {
        return $this->hasMany(Examination::class);
    }

    /**
     * Get term duration in days
     */
    public function getDurationInDaysAttribute(): int
    {
        return $this->start_date->diffInDays($this->end_date);
    }

    /**
     * Check if term is currently active
     */
    public function isActive(): bool
    {
        $now = now();
        return $this->is_active && 
               $this->start_date <= $now && 
               $this->end_date >= $now;
    }

    /**
     * Get term progress percentage
     */
    public function getProgressPercentageAttribute(): float
    {
        if (!$this->isActive()) {
            return 100;
        }

        $totalDays = $this->duration_in_days;
        $elapsedDays = $this->start_date->diffInDays(now());
        
        return $totalDays > 0 ? round(($elapsedDays / $totalDays) * 100, 2) : 0;
    }

    /**
     * Scope for current term
     */
    public function scopeCurrent($query)
    {
        return $query->where('is_current', true);
    }

    /**
     * Scope for active terms
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
