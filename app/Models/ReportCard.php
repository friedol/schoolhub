<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReportCard extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'student_id',
        'class_id',
        'academic_term_id',
        'academic_year',
        'term',
        'total_marks',
        'average_marks',
        'position',
        'total_students',
        'grade',
        'points',
        'attendance_percentage',
        'days_present',
        'days_absent',
        'headteacher_comment',
        'class_teacher_comment',
        'is_published',
        'published_at',
        'generated_by',
    ];

    protected $casts = [
        'total_marks' => 'decimal:2',
        'average_marks' => 'decimal:2',
        'points' => 'decimal:2',
        'attendance_percentage' => 'decimal:2',
        'days_present' => 'integer',
        'days_absent' => 'integer',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];

    /**
     * Get the school this report card belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the student
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the class
     */
    public function class(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    /**
     * Get the academic term
     */
    public function academicTerm(): BelongsTo
    {
        return $this->belongsTo(AcademicTerm::class);
    }

    /**
     * Get the user who generated this report card
     */
    public function generatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    /**
     * Get report card subjects
     */
    public function subjects(): HasMany
    {
        return $this->hasMany(ReportCardSubject::class);
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

    /**
     * Check if report card is published
     */
    public function isPublished(): bool
    {
        return $this->is_published;
    }

    /**
     * Calculate overall grade based on average marks
     */
    public function calculateOverallGrade(): string
    {
        return match(true) {
            $this->average_marks >= 80 => 'A',
            $this->average_marks >= 70 => 'B',
            $this->average_marks >= 60 => 'C',
            $this->average_marks >= 50 => 'D',
            default => 'F'
        };
    }

    /**
     * Calculate overall points
     */
    public function calculateOverallPoints(): float
    {
        return match($this->grade) {
            'A' => 4.0,
            'B' => 3.0,
            'C' => 2.0,
            'D' => 1.0,
            'F' => 0.0,
            default => 0.0
        };
    }

    /**
     * Get performance description
     */
    public function getPerformanceDescriptionAttribute(): string
    {
        return match($this->grade) {
            'A' => 'Outstanding performance. Keep up the excellent work!',
            'B' => 'Very good performance. Continue working hard.',
            'C' => 'Good performance. There is room for improvement.',
            'D' => 'Satisfactory performance. More effort is needed.',
            'F' => 'Performance needs significant improvement.',
            default => 'Performance not yet evaluated.'
        };
    }
}
