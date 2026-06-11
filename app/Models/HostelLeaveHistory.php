<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HostelLeaveHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'leave_application_id',
        'student_id',
        'action',
        'action_date',
        'previous_status',
        'new_status',
        'notes',
        'performed_by',
    ];

    protected $casts = [
        'action_date' => 'datetime',
    ];

    // Action constants
    const ACTION_APPLIED = 'applied';
    const ACTION_APPROVED = 'approved';
    const ACTION_REJECTED = 'rejected';
    const ACTION_CANCELLED = 'cancelled';
    const ACTION_CHECKED_OUT = 'checked_out';
    const ACTION_CHECKED_IN = 'checked_in';
    const ACTION_OVERDUE = 'overdue';

    const ACTION_OPTIONS = [
        self::ACTION_APPLIED => 'Applied',
        self::ACTION_APPROVED => 'Approved',
        self::ACTION_REJECTED => 'Rejected',
        self::ACTION_CANCELLED => 'Cancelled',
        self::ACTION_CHECKED_OUT => 'Checked Out',
        self::ACTION_CHECKED_IN => 'Checked In',
        self::ACTION_OVERDUE => 'Overdue',
    ];

    /**
     * Get the leave application for this history record
     */
    public function leaveApplication(): BelongsTo
    {
        return $this->belongsTo(HostelLeaveApplication::class);
    }

    /**
     * Get the student for this history record
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the user who performed this action
     */
    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    /**
     * Get action color for UI
     */
    public function getActionColorAttribute(): string
    {
        $colorMap = [
            self::ACTION_APPLIED => 'blue',
            self::ACTION_APPROVED => 'green',
            self::ACTION_REJECTED => 'red',
            self::ACTION_CANCELLED => 'gray',
            self::ACTION_CHECKED_OUT => 'orange',
            self::ACTION_CHECKED_IN => 'green',
            self::ACTION_OVERDUE => 'red',
        ];

        return $colorMap[$this->action] ?? 'gray';
    }
}



