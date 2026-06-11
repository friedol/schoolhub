<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GradingScale extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'name',
        'level',
        'scale_type',
        'grades',
        'is_active',
        'is_default',
    ];

    protected $casts = [
        'grades' => 'array',
        'is_active' => 'boolean',
        'is_default' => 'boolean',
    ];

    const SCALE_TYPE_NUMERICAL = 'numerical';
    const SCALE_TYPE_COMPETENCY = 'competency';
    const SCALE_TYPE_NECTA = 'necta';

    /**
     * Get the school this grading scale belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get grade for given marks
     */
    public function getGradeForMarks(float $marks): string
    {
        foreach ($this->grades as $grade => $range) {
            if ($marks >= $range['min'] && $marks <= $range['max']) {
                return $grade;
            }
        }
        return 'F'; // Default to fail if no range matches
    }

    /**
     * Get points for given marks
     */
    public function getPointsForMarks(float $marks): float
    {
        $grade = $this->getGradeForMarks($marks);
        return $this->grades[$grade]['points'] ?? 0;
    }

    /**
     * Check if this is a NECTA grading scale
     */
    public function isNectaScale(): bool
    {
        return $this->scale_type === self::SCALE_TYPE_NECTA;
    }

    /**
     * Check if this is a competency-based scale
     */
    public function isCompetencyScale(): bool
    {
        return $this->scale_type === self::SCALE_TYPE_COMPETENCY;
    }

    /**
     * Get default NECTA grading scale
     */
    public static function getDefaultNectaScale(): array
    {
        return [
            'A' => ['min' => 75, 'max' => 100, 'points' => 4, 'description' => 'Excellent'],
            'B' => ['min' => 65, 'max' => 74, 'points' => 3, 'description' => 'Very Good'],
            'C' => ['min' => 50, 'max' => 64, 'points' => 2, 'description' => 'Good'],
            'D' => ['min' => 40, 'max' => 49, 'points' => 1, 'description' => 'Satisfactory'],
            'F' => ['min' => 0, 'max' => 39, 'points' => 0, 'description' => 'Fail'],
        ];
    }

    /**
     * Get default competency-based scale
     */
    public static function getDefaultCompetencyScale(): array
    {
        return [
            'A' => ['min' => 90, 'max' => 100, 'points' => 4, 'description' => 'Excellent'],
            'B' => ['min' => 80, 'max' => 89, 'points' => 3, 'description' => 'Good'],
            'C' => ['min' => 70, 'max' => 79, 'points' => 2, 'description' => 'Satisfactory'],
            'D' => ['min' => 60, 'max' => 69, 'points' => 1, 'description' => 'Needs Improvement'],
            'F' => ['min' => 0, 'max' => 59, 'points' => 0, 'description' => 'Below Standard'],
        ];
    }
}



