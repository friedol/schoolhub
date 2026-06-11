<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NectaResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'necta_candidate_id',
        'subject_code',
        'subject_name',
        'continuous_assessment_mark',
        'final_exam_mark',
        'total_mark',
        'grade',
        'points',
        'is_principal',
        'is_subsidiary',
        'is_compulsory',
    ];

    protected $casts = [
        'continuous_assessment_mark' => 'decimal:2',
        'final_exam_mark' => 'decimal:2',
        'total_mark' => 'decimal:2',
        'points' => 'decimal:2',
        'is_principal' => 'boolean',
        'is_subsidiary' => 'boolean',
        'is_compulsory' => 'boolean',
    ];

    /**
     * Get the NECTA candidate
     */
    public function nectaCandidate(): BelongsTo
    {
        return $this->belongsTo(NectaCandidate::class);
    }

    /**
     * Check if this is a principal subject
     */
    public function isPrincipal(): bool
    {
        return $this->is_principal;
    }

    /**
     * Check if this is a subsidiary subject
     */
    public function isSubsidiary(): bool
    {
        return $this->is_subsidiary;
    }

    /**
     * Check if this is a compulsory subject
     */
    public function isCompulsory(): bool
    {
        return $this->is_compulsory;
    }

    /**
     * Get grade description
     */
    public function getGradeDescriptionAttribute(): string
    {
        return match($this->grade) {
            'A' => 'Excellent',
            'B' => 'Very Good',
            'C' => 'Good',
            'D' => 'Satisfactory',
            'F' => 'Fail',
            default => 'Unknown'
        };
    }
}



