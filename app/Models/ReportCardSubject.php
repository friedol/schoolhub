<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportCardSubject extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_card_id',
        'subject_id',
        'marks',
        'grade',
        'points',
        'position',
        'total_students',
        'teacher_comment',
    ];

    protected $casts = [
        'marks' => 'decimal:2',
        'points' => 'decimal:2',
    ];

    /**
     * Get the report card
     */
    public function reportCard(): BelongsTo
    {
        return $this->belongsTo(ReportCard::class);
    }

    /**
     * Get the subject
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Get grade display name
     */
    public function getGradeDisplayAttribute(): string
    {
        return match($this->grade) {
            'A' => 'Excellent (A)',
            'B' => 'Very Good (B)',
            'C' => 'Good (C)',
            'D' => 'Satisfactory (D)',
            'F' => 'Fail (F)',
            default => $this->grade ?? 'Not Graded'
        };
    }
}



