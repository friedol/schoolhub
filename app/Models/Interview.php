<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Interview extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_application_id',
        'interview_date',
        'interview_time',
        'interviewer_id',
        'interview_type',
        'location',
        'status',
        'score',
        'max_score',
        'comments',
        'recommendation',
        'notes',
    ];

    protected $casts = [
        'interview_date' => 'date',
        'interview_time' => 'datetime:H:i',
        'score' => 'decimal:2',
        'max_score' => 'decimal:2',
    ];

    const INTERVIEW_TYPE_ACADEMIC = 'academic';
    const INTERVIEW_TYPE_BEHAVIORAL = 'behavioral';
    const INTERVIEW_TYPE_MEDICAL = 'medical';
    const INTERVIEW_TYPE_GENERAL = 'general';

    const STATUS_SCHEDULED = 'scheduled';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_RESCHEDULED = 'rescheduled';

    const RECOMMENDATION_ACCEPT = 'accept';
    const RECOMMENDATION_REJECT = 'reject';
    const RECOMMENDATION_WAITLIST = 'waitlist';
    const RECOMMENDATION_CONDITIONAL = 'conditional';

    /**
     * Get the student application this interview belongs to
     */
    public function studentApplication(): BelongsTo
    {
        return $this->belongsTo(StudentApplication::class);
    }

    /**
     * Get the interviewer
     */
    public function interviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'interviewer_id');
    }

    /**
     * Check if interview is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Get interview type display name
     */
    public function getInterviewTypeDisplayAttribute(): string
    {
        return match($this->interview_type) {
            self::INTERVIEW_TYPE_ACADEMIC => 'Academic Interview',
            self::INTERVIEW_TYPE_BEHAVIORAL => 'Behavioral Interview',
            self::INTERVIEW_TYPE_MEDICAL => 'Medical Interview',
            self::INTERVIEW_TYPE_GENERAL => 'General Interview',
            default => 'Unknown'
        };
    }

    /**
     * Get status display name
     */
    public function getStatusDisplayAttribute(): string
    {
        return match($this->status) {
            self::STATUS_SCHEDULED => 'Scheduled',
            self::STATUS_COMPLETED => 'Completed',
            self::STATUS_CANCELLED => 'Cancelled',
            self::STATUS_RESCHEDULED => 'Rescheduled',
            default => 'Unknown'
        };
    }

    /**
     * Get recommendation display name
     */
    public function getRecommendationDisplayAttribute(): string
    {
        return match($this->recommendation) {
            self::RECOMMENDATION_ACCEPT => 'Accept',
            self::RECOMMENDATION_REJECT => 'Reject',
            self::RECOMMENDATION_WAITLIST => 'Waitlist',
            self::RECOMMENDATION_CONDITIONAL => 'Conditional',
            default => 'Pending'
        };
    }

    /**
     * Get interview score percentage
     */
    public function getScorePercentageAttribute(): float
    {
        if ($this->max_score == 0) {
            return 0;
        }
        return ($this->score / $this->max_score) * 100;
    }
}



