<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HostelLeaveRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'hostel_id',
        'leave_type',
        'start_date',
        'end_date',
        'reason',
        'destination',
        'contact_person',
        'contact_phone',
        'status',
        'approved_by',
        'approved_at',
        'rejection_reason',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'approved_at' => 'datetime',
    ];

    const LEAVE_TYPE_WEEKEND = 'weekend';
    const LEAVE_TYPE_HOLIDAY = 'holiday';
    const LEAVE_TYPE_EMERGENCY = 'emergency';
    const LEAVE_TYPE_MEDICAL = 'medical';
    const LEAVE_TYPE_FAMILY = 'family';

    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';

    /**
     * Get the student
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the hostel
     */
    public function hostel(): BelongsTo
    {
        return $this->belongsTo(Hostel::class);
    }

    /**
     * Get the user who approved this leave
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get leave type display name
     */
    public function getLeaveTypeDisplayAttribute(): string
    {
        return match($this->leave_type) {
            self::LEAVE_TYPE_WEEKEND => 'Weekend Leave',
            self::LEAVE_TYPE_HOLIDAY => 'Holiday Leave',
            self::LEAVE_TYPE_EMERGENCY => 'Emergency Leave',
            self::LEAVE_TYPE_MEDICAL => 'Medical Leave',
            self::LEAVE_TYPE_FAMILY => 'Family Leave',
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
            default => 'Unknown'
        };
    }

    /**
     * Check if leave is approved
     */
    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    /**
     * Check if leave is pending
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Calculate leave duration in days
     */
    public function getLeaveDurationAttribute(): int
    {
        return $this->start_date->diffInDays($this->end_date) + 1;
    }
}



