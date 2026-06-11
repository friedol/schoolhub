<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveApplicationHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'leave_application_id',
        'action',
        'performed_by',
        'performed_at',
        'comments',
        'old_status',
        'new_status',
    ];

    protected $casts = [
        'performed_at' => 'datetime',
    ];

    const ACTION_APPLIED = 'applied';
    const ACTION_APPROVED = 'approved';
    const ACTION_REJECTED = 'rejected';
    const ACTION_CANCELLED = 'cancelled';
    const ACTION_MODIFIED = 'modified';

    /**
     * Get the leave application this history belongs to
     */
    public function leaveApplication(): BelongsTo
    {
        return $this->belongsTo(LeaveApplication::class);
    }

    /**
     * Get the user who performed this action
     */
    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    /**
     * Get action display name
     */
    public function getActionDisplayAttribute(): string
    {
        return match($this->action) {
            self::ACTION_APPLIED => 'Applied',
            self::ACTION_APPROVED => 'Approved',
            self::ACTION_REJECTED => 'Rejected',
            self::ACTION_CANCELLED => 'Cancelled',
            self::ACTION_MODIFIED => 'Modified',
            default => 'Unknown'
        };
    }
}



