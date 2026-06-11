<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PerformanceAppraisal extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'appraisal_cycle_id',
        'staff_id',
        'appraiser_id',
        'goals',
        'self_assessment',
        'manager_assessment',
        'overall_rating',
        'strengths',
        'areas_for_improvement',
        'development_plan',
        'meeting_notes',
        'meeting_date',
        'status',
        'completed_at',
    ];

    protected $casts = [
        'goals' => 'array',
        'self_assessment' => 'array',
        'manager_assessment' => 'array',
        'overall_rating' => 'decimal:2',
        'meeting_date' => 'date',
        'completed_at' => 'datetime',
    ];

    const STATUS_NOT_STARTED = 'not_started';
    const STATUS_GOAL_SETTING = 'goal_setting';
    const STATUS_SELF_ASSESSMENT = 'self_assessment';
    const STATUS_MANAGER_REVIEW = 'manager_review';
    const STATUS_MEETING_SCHEDULED = 'meeting_scheduled';
    const STATUS_MEETING_COMPLETED = 'meeting_completed';
    const STATUS_COMPLETED = 'completed';

    const RATING_EXCELLENT = 5;
    const RATING_GOOD = 4;
    const RATING_SATISFACTORY = 3;
    const RATING_NEEDS_IMPROVEMENT = 2;
    const RATING_UNSATISFACTORY = 1;

    /**
     * Get the school that owns this performance appraisal
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the appraisal cycle this appraisal belongs to
     */
    public function appraisalCycle(): BelongsTo
    {
        return $this->belongsTo(AppraisalCycle::class);
    }

    /**
     * Get the staff member being appraised
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    /**
     * Get the appraiser
     */
    public function appraiser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'appraiser_id');
    }

    /**
     * Get appraisal goals
     */
    public function appraisalGoals(): HasMany
    {
        return $this->hasMany(AppraisalGoal::class);
    }

    /**
     * Check if appraisal is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Get status display name
     */
    public function getStatusDisplayAttribute(): string
    {
        return match($this->status) {
            self::STATUS_NOT_STARTED => 'Not Started',
            self::STATUS_GOAL_SETTING => 'Goal Setting',
            self::STATUS_SELF_ASSESSMENT => 'Self Assessment',
            self::STATUS_MANAGER_REVIEW => 'Manager Review',
            self::STATUS_MEETING_SCHEDULED => 'Meeting Scheduled',
            self::STATUS_MEETING_COMPLETED => 'Meeting Completed',
            self::STATUS_COMPLETED => 'Completed',
            default => 'Unknown'
        };
    }

    /**
     * Get rating display name
     */
    public function getRatingDisplayAttribute(): string
    {
        if ($this->overall_rating >= 4.5) return 'Excellent';
        if ($this->overall_rating >= 3.5) return 'Good';
        if ($this->overall_rating >= 2.5) return 'Satisfactory';
        if ($this->overall_rating >= 1.5) return 'Needs Improvement';
        return 'Unsatisfactory';
    }

    /**
     * Get rating color for UI
     */
    public function getRatingColorAttribute(): string
    {
        if ($this->overall_rating >= 4.5) return 'green';
        if ($this->overall_rating >= 3.5) return 'blue';
        if ($this->overall_rating >= 2.5) return 'yellow';
        if ($this->overall_rating >= 1.5) return 'orange';
        return 'red';
    }
}