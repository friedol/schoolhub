<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AppraisalCycle extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'name',
        'description',
        'appraisal_type',
        'start_date',
        'end_date',
        'goal_setting_deadline',
        'self_assessment_deadline',
        'manager_review_deadline',
        'meeting_deadline',
        'status',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'goal_setting_deadline' => 'date',
        'self_assessment_deadline' => 'date',
        'manager_review_deadline' => 'date',
        'meeting_deadline' => 'date',
    ];

    const APPRAISAL_TYPE_MID_YEAR = 'mid_year';
    const APPRAISAL_TYPE_END_YEAR = 'end_year';
    const APPRAISAL_TYPE_QUARTERLY = 'quarterly';
    const APPRAISAL_TYPE_ANNUAL = 'annual';

    const STATUS_DRAFT = 'draft';
    const STATUS_ACTIVE = 'active';
    const STATUS_GOAL_SETTING = 'goal_setting';
    const STATUS_SELF_ASSESSMENT = 'self_assessment';
    const STATUS_MANAGER_REVIEW = 'manager_review';
    const STATUS_MEETINGS = 'meetings';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CLOSED = 'closed';

    /**
     * Get the school this appraisal cycle belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the user who created this appraisal cycle
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get performance appraisals for this cycle
     */
    public function performanceAppraisals(): HasMany
    {
        return $this->hasMany(PerformanceAppraisal::class);
    }

    /**
     * Get appraisal type display name
     */
    public function getAppraisalTypeDisplayAttribute(): string
    {
        return match($this->appraisal_type) {
            self::APPRAISAL_TYPE_MID_YEAR => 'Mid-Year',
            self::APPRAISAL_TYPE_END_YEAR => 'End-Year',
            self::APPRAISAL_TYPE_QUARTERLY => 'Quarterly',
            self::APPRAISAL_TYPE_ANNUAL => 'Annual',
            default => 'Unknown'
        };
    }

    /**
     * Get status display name
     */
    public function getStatusDisplayAttribute(): string
    {
        return match($this->status) {
            self::STATUS_DRAFT => 'Draft',
            self::STATUS_ACTIVE => 'Active',
            self::STATUS_GOAL_SETTING => 'Goal Setting',
            self::STATUS_SELF_ASSESSMENT => 'Self Assessment',
            self::STATUS_MANAGER_REVIEW => 'Manager Review',
            self::STATUS_MEETINGS => 'Meetings',
            self::STATUS_COMPLETED => 'Completed',
            self::STATUS_CLOSED => 'Closed',
            default => 'Unknown'
        };
    }

    /**
     * Check if cycle is active
     */
    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    /**
     * Check if cycle is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }
}



