<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NectaCandidate extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'student_id',
        'exam_type',
        'candidate_number',
        'index_number',
        'registration_number',
        'exam_year',
        'exam_center',
        'subjects',
        'continuous_assessment_marks',
        'final_marks',
        'grades',
        'points',
        'division',
        'is_registered',
        'registration_date',
        'submission_status',
        'submitted_at',
        'notes',
    ];

    protected $casts = [
        'subjects' => 'array',
        'continuous_assessment_marks' => 'array',
        'final_marks' => 'array',
        'grades' => 'array',
        'points' => 'array',
        'is_registered' => 'boolean',
        'registration_date' => 'date',
        'submitted_at' => 'datetime',
    ];

    const EXAM_TYPE_PSLE = 'PSLE'; // Primary School Leaving Examination
    const EXAM_TYPE_FTNA = 'FTNA'; // Form Two National Assessment
    const EXAM_TYPE_CSEE = 'CSEE'; // Certificate of Secondary Education Examination
    const EXAM_TYPE_ACSEE = 'ACSEE'; // Advanced Certificate of Secondary Education Examination

    const SUBMISSION_STATUS_PENDING = 'pending';
    const SUBMISSION_STATUS_SUBMITTED = 'submitted';
    const SUBMISSION_STATUS_APPROVED = 'approved';
    const SUBMISSION_STATUS_REJECTED = 'rejected';

    /**
     * Get the school this candidate belongs to
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
     * Get NECTA results for this candidate
     */
    public function nectaResults(): HasMany
    {
        return $this->hasMany(NectaResult::class);
    }

    /**
     * Get exam type display name
     */
    public function getExamTypeDisplayAttribute(): string
    {
        return match($this->exam_type) {
            self::EXAM_TYPE_PSLE => 'Primary School Leaving Examination (PSLE)',
            self::EXAM_TYPE_FTNA => 'Form Two National Assessment (FTNA)',
            self::EXAM_TYPE_CSEE => 'Certificate of Secondary Education Examination (CSEE)',
            self::EXAM_TYPE_ACSEE => 'Advanced Certificate of Secondary Education Examination (ACSEE)',
            default => 'Unknown'
        };
    }

    /**
     * Check if candidate is registered
     */
    public function isRegistered(): bool
    {
        return $this->is_registered;
    }

    /**
     * Check if candidate is submitted
     */
    public function isSubmitted(): bool
    {
        return $this->submission_status === self::SUBMISSION_STATUS_SUBMITTED;
    }

    /**
     * Get total points
     */
    public function getTotalPointsAttribute(): float
    {
        if (!$this->points) {
            return 0;
        }
        return array_sum($this->points);
    }

    /**
     * Get average points
     */
    public function getAveragePointsAttribute(): float
    {
        if (!$this->points || count($this->points) === 0) {
            return 0;
        }
        return $this->total_points / count($this->points);
    }

    /**
     * Generate candidate number
     */
    public static function generateCandidateNumber(School $school, string $examType, int $year): string
    {
        $schoolCode = $school->code;
        $examCode = match($examType) {
            self::EXAM_TYPE_PSLE => '01',
            self::EXAM_TYPE_FTNA => '02',
            self::EXAM_TYPE_CSEE => '03',
            self::EXAM_TYPE_ACSEE => '04',
            default => '00'
        };
        
        $count = self::where('school_id', $school->id)
            ->where('exam_type', $examType)
            ->where('exam_year', $year)
            ->count() + 1;

        return $schoolCode . $examCode . $year . str_pad($count, 3, '0', STR_PAD_LEFT);
    }
}



