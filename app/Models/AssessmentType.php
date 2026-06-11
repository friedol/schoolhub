<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssessmentType extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'name',
        'code',
        'description',
        'weight',
        'is_active',
        'is_necta_assessment',
        'max_marks',
        'grading_scale',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_necta_assessment' => 'boolean',
        'weight' => 'decimal:2',
        'max_marks' => 'integer',
        'grading_scale' => 'array',
    ];

    /**
     * Get the school this assessment type belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get assessments of this type
     */
    public function assessments(): HasMany
    {
        return $this->hasMany(Assessment::class);
    }

    /**
     * Check if this is a NECTA assessment type
     */
    public function isNectaAssessment(): bool
    {
        return $this->is_necta_assessment;
    }

    /**
     * Get default grading scale
     */
    public function getDefaultGradingScale(): array
    {
        return [
            'A' => ['min' => 75, 'max' => 100, 'points' => 4],
            'B' => ['min' => 65, 'max' => 74, 'points' => 3],
            'C' => ['min' => 50, 'max' => 64, 'points' => 2],
            'D' => ['min' => 40, 'max' => 49, 'points' => 1],
            'F' => ['min' => 0, 'max' => 39, 'points' => 0],
        ];
    }
}



