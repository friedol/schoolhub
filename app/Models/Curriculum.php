<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Curriculum extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'name',
        'code',
        'description',
        'level',
        'is_necta_curriculum',
        'is_active',
        'academic_year',
        'settings',
    ];

    protected $casts = [
        'is_necta_curriculum' => 'boolean',
        'is_active' => 'boolean',
        'settings' => 'array',
    ];

    /**
     * Get the school this curriculum belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get subjects in this curriculum
     */
    public function subjects(): HasMany
    {
        return $this->hasMany(CurriculumSubject::class);
    }

    /**
     * Get classes using this curriculum
     */
    public function classes(): HasMany
    {
        return $this->hasMany(SchoolClass::class);
    }

    /**
     * Check if curriculum is NECTA compliant
     */
    public function isNectaCompliant(): bool
    {
        return $this->is_necta_curriculum;
    }

    /**
     * Get curriculum level display name
     */
    public function getLevelDisplayAttribute(): string
    {
        return match($this->level) {
            'nursery' => 'Nursery',
            'primary' => 'Primary',
            'secondary' => 'Secondary',
            'advanced' => 'Advanced Level',
            default => 'Unknown'
        };
    }
}
