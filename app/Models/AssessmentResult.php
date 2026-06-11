<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssessmentResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'assessment_id',
        'student_id',
        'marks_obtained',
        'total_marks',
        'grade',
        'position',
        'comments',
        'is_published',
    ];

    protected $casts = [
        'marks_obtained' => 'decimal:2',
        'total_marks' => 'decimal:2',
        'is_published' => 'boolean',
    ];

    /**
     * Get the assessment that owns the assessment result
     */
    public function assessment(): BelongsTo
    {
        return $this->belongsTo(Assessment::class);
    }

    /**
     * Get the student that owns the assessment result
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Calculate percentage
     */
    public function getPercentageAttribute(): float
    {
        if ($this->total_marks > 0) {
            return round(($this->marks_obtained / $this->total_marks) * 100, 2);
        }
        return 0;
    }

    /**
     * Get grade based on percentage
     */
    public function getGradeAttribute($value): string
    {
        if ($value) {
            return $value;
        }

        $percentage = $this->percentage;
        
        if ($percentage >= 80) return 'A';
        if ($percentage >= 70) return 'B';
        if ($percentage >= 60) return 'C';
        if ($percentage >= 50) return 'D';
        return 'F';
    }
}