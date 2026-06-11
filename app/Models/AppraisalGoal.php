<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppraisalGoal extends Model
{
    use HasFactory;

    protected $fillable = [
        'performance_appraisal_id',
        'goal_title',
        'goal_description',
        'target_date',
        'success_criteria',
        'weight',
        'status',
        'progress_notes',
        'achievement_rating',
        'achievement_notes',
    ];

    protected $casts = [
        'target_date' => 'date',
        'weight' => 'decimal:2',
        'achievement_rating' => 'decimal:2',
    ];

    const STATUS_NOT_STARTED = 'not_started';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED = 'completed';
    const STATUS_OVERDUE = 'overdue';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Get the performance appraisal this goal belongs to
     */
    public function performanceAppraisal(): BelongsTo
    {
        return $this->belongsTo(PerformanceAppraisal::class);
    }

    /**
     * Check if goal is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Check if goal is overdue
     */
    public function isOverdue(): bool
    {
        return $this->target_date->isPast() && $this->status !== self::STATUS_COMPLETED;
    }

    /**
     * Get status display name
     */
    public function getStatusDisplayAttribute(): string
    {
        return match($this->status) {
            self::STATUS_NOT_STARTED => 'Not Started',
            self::STATUS_IN_PROGRESS => 'In Progress',
            self::STATUS_COMPLETED => 'Completed',
            self::STATUS_OVERDUE => 'Overdue',
            self::STATUS_CANCELLED => 'Cancelled',
            default => 'Unknown'
        };
    }

    /**
     * Get status color for UI
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            self::STATUS_NOT_STARTED => 'gray',
            self::STATUS_IN_PROGRESS => 'blue',
            self::STATUS_COMPLETED => 'green',
            self::STATUS_OVERDUE => 'red',
            self::STATUS_CANCELLED => 'gray',
            default => 'gray'
        };
    }
}



