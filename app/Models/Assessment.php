<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Assessment extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'class_id',
        'subject_id',
        'teacher_id',
        'academic_term_id',
        'name',
        'type',
        'description',
        'total_marks',
        'weight',
        'date',
        'due_date',
        'is_published',
        'settings',
    ];

    protected $casts = [
        'total_marks' => 'decimal:2',
        'weight' => 'decimal:2',
        'date' => 'date',
        'due_date' => 'date',
        'is_published' => 'boolean',
        'settings' => 'array',
    ];

    const TYPE_ASSIGNMENT = 'assignment';
    const TYPE_QUIZ = 'quiz';
    const TYPE_TEST = 'test';
    const TYPE_EXAM = 'exam';
    const TYPE_PROJECT = 'project';
    const TYPE_PRESENTATION = 'presentation';

    /**
     * Get the school this assessment belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the assessment type
     */
    public function assessmentType(): BelongsTo
    {
        return $this->belongsTo(AssessmentType::class);
    }

    /**
     * Get the class
     */
    public function class(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    /**
     * Get the subject
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Get the teacher
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * Get the academic term
     */
    public function academicTerm(): BelongsTo
    {
        return $this->belongsTo(AcademicTerm::class);
    }

    /**
     * Get assessment results
     */
    public function results(): HasMany
    {
        return $this->hasMany(AssessmentResult::class);
    }

    /**
     * Get type display name
     */
    public function getTypeDisplayAttribute(): string
    {
        return match($this->type) {
            self::TYPE_ASSIGNMENT => 'Assignment',
            self::TYPE_QUIZ => 'Quiz',
            self::TYPE_TEST => 'Test',
            self::TYPE_EXAM => 'Exam',
            self::TYPE_PROJECT => 'Project',
            self::TYPE_PRESENTATION => 'Presentation',
            default => 'Unknown'
        };
    }

    /**
     * Check if assessment is published
     */
    public function isPublished(): bool
    {
        return $this->is_published;
    }

    /**
     * Get average score for this assessment
     */
    public function getAverageScore(): float
    {
        $results = $this->results()->whereNotNull('marks')->get();
        
        if ($results->isEmpty()) {
            return 0;
        }

        return round($results->avg('marks'), 2);
    }

    /**
     * Get highest score for this assessment
     */
    public function getHighestScore(): float
    {
        return $this->results()->max('marks') ?? 0;
    }

    /**
     * Get lowest score for this assessment
     */
    public function getLowestScore(): float
    {
        return $this->results()->min('marks') ?? 0;
    }
}
