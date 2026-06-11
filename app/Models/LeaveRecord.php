<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_id',
        'leave_type',
        'start_date',
        'end_date',
        'total_days',
        'reason',
        'status',
        'applied_date',
        'approved_by',
        'approved_date',
        'rejected_reason',
        'rejected_by',
        'rejected_date',
        'emergency_contact',
        'handover_notes',
        'return_date',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'applied_date' => 'date',
        'approved_date' => 'date',
        'rejected_date' => 'date',
        'return_date' => 'date',
    ];

    const LEAVE_TYPE_ANNUAL = 'annual';
    const LEAVE_TYPE_SICK = 'sick';
    const LEAVE_TYPE_MATERNITY = 'maternity';
    const LEAVE_TYPE_PATERNITY = 'paternity';
    const LEAVE_TYPE_STUDY = 'study';
    const LEAVE_TYPE_EMERGENCY = 'emergency';
    const LEAVE_TYPE_UNPAID = 'unpaid';

    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Get the staff member
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    /**
     * Get the user who approved this leave
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the user who rejected this leave
     */
    public function rejectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    /**
     * Get leave type display name
     */
    public function getLeaveTypeDisplayAttribute(): string
    {
        return match($this->leave_type) {
            self::LEAVE_TYPE_ANNUAL => 'Annual Leave',
            self::LEAVE_TYPE_SICK => 'Sick Leave',
            self::LEAVE_TYPE_MATERNITY => 'Maternity Leave',
            self::LEAVE_TYPE_PATERNITY => 'Paternity Leave',
            self::LEAVE_TYPE_STUDY => 'Study Leave',
            self::LEAVE_TYPE_EMERGENCY => 'Emergency Leave',
            self::LEAVE_TYPE_UNPAID => 'Unpaid Leave',
            default => 'Unknown'
        };
    }

    /**
     * Get status display name
     */
    public function getStatusDisplayAttribute(): string
    {
        return match($this->status) {
            self::STATUS_PENDING => 'Pending',
            self::STATUS_APPROVED => 'Approved',
            self::STATUS_REJECTED => 'Rejected',
            self::STATUS_CANCELLED => 'Cancelled',
            default => 'Unknown'
        };
    }

    /**
     * Check if leave is pending
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if leave is approved
     */
    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    /**
     * Check if leave is rejected
     */
    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    /**
     * Check if leave is currently active
     */
    public function isActive(): bool
    {
        if (!$this->isApproved()) {
            return false;
        }

        $today = now()->toDateString();
        return $this->start_date <= $today && $this->end_date >= $today;
    }

    /**
     * Calculate total days
     */
    public function calculateTotalDays(): int
    {
        return $this->start_date->diffInDays($this->end_date) + 1;
    }

    /**
     * Get leave duration display
     */
    public function getDurationDisplayAttribute(): string
    {
        $days = $this->total_days;
        
        if ($days == 1) {
            return '1 day';
        }
        
        return $days . ' days';
    }
}
