<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Budget extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'academic_year',
        'budget_name',
        'department',
        'budget_type',
        'total_budgeted_amount',
        'total_actual_amount',
        'start_date',
        'end_date',
        'status',
        'created_by',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'total_budgeted_amount' => 'decimal:2',
        'total_actual_amount' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'approved_at' => 'datetime',
    ];

    const BUDGET_TYPE_ANNUAL = 'annual';
    const BUDGET_TYPE_TERM = 'term';
    const BUDGET_TYPE_MONTHLY = 'monthly';
    const BUDGET_TYPE_PROJECT = 'project';

    const STATUS_DRAFT = 'draft';
    const STATUS_APPROVED = 'approved';
    const STATUS_ACTIVE = 'active';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    const DEPARTMENT_ACADEMIC = 'academic';
    const DEPARTMENT_SPORTS = 'sports';
    const DEPARTMENT_ADMINISTRATION = 'administration';
    const DEPARTMENT_MAINTENANCE = 'maintenance';
    const DEPARTMENT_LIBRARY = 'library';
    const DEPARTMENT_LABORATORY = 'laboratory';
    const DEPARTMENT_TRANSPORT = 'transport';
    const DEPARTMENT_HOSTEL = 'hostel';

    /**
     * Get the school this budget belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the user who created this budget
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who approved this budget
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get budget items
     */
    public function budgetItems(): HasMany
    {
        return $this->hasMany(BudgetItem::class);
    }

    /**
     * Check if budget is approved
     */
    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED || $this->status === self::STATUS_ACTIVE;
    }

    /**
     * Check if budget is active
     */
    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    /**
     * Check if budget is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Get budget type display name
     */
    public function getBudgetTypeDisplayAttribute(): string
    {
        return match($this->budget_type) {
            self::BUDGET_TYPE_ANNUAL => 'Annual',
            self::BUDGET_TYPE_TERM => 'Term',
            self::BUDGET_TYPE_MONTHLY => 'Monthly',
            self::BUDGET_TYPE_PROJECT => 'Project',
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
            self::STATUS_APPROVED => 'Approved',
            self::STATUS_ACTIVE => 'Active',
            self::STATUS_COMPLETED => 'Completed',
            self::STATUS_CANCELLED => 'Cancelled',
            default => 'Unknown'
        };
    }

    /**
     * Get department display name
     */
    public function getDepartmentDisplayAttribute(): string
    {
        return match($this->department) {
            self::DEPARTMENT_ACADEMIC => 'Academic',
            self::DEPARTMENT_SPORTS => 'Sports',
            self::DEPARTMENT_ADMINISTRATION => 'Administration',
            self::DEPARTMENT_MAINTENANCE => 'Maintenance',
            self::DEPARTMENT_LIBRARY => 'Library',
            self::DEPARTMENT_LABORATORY => 'Laboratory',
            self::DEPARTMENT_TRANSPORT => 'Transport',
            self::DEPARTMENT_HOSTEL => 'Hostel',
            default => 'Unknown'
        };
    }

    /**
     * Calculate variance percentage
     */
    public function getVariancePercentageAttribute(): float
    {
        if ($this->total_budgeted_amount == 0) return 0;
        return (($this->total_actual_amount - $this->total_budgeted_amount) / $this->total_budgeted_amount) * 100;
    }

    /**
     * Calculate remaining budget
     */
    public function getRemainingBudgetAttribute(): float
    {
        return $this->total_budgeted_amount - $this->total_actual_amount;
    }

    /**
     * Mark budget as approved
     */
    public function markAsApproved(User $approvedBy): void
    {
        $this->update([
            'status' => self::STATUS_APPROVED,
            'approved_by' => $approvedBy->id,
            'approved_at' => now(),
        ]);
    }

    /**
     * Activate budget
     */
    public function activate(): void
    {
        $this->update(['status' => self::STATUS_ACTIVE]);
    }

    /**
     * Complete budget
     */
    public function complete(): void
    {
        $this->update(['status' => self::STATUS_COMPLETED]);
    }
}



