<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HostelMaintenanceHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'maintenance_request_id',
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
    const ACTION_CREATED = 'created';
    const ACTION_ASSIGNED = 'assigned';
    const ACTION_STARTED = 'started';
    const ACTION_COMPLETED = 'completed';
    const ACTION_CANCELLED = 'cancelled';
    const ACTION_ON_HOLD = 'on_hold';
    const ACTION_REOPENED = 'reopened';

    const ACTION_OPTIONS = [
        self::ACTION_CREATED => 'Created',
        self::ACTION_ASSIGNED => 'Assigned',
        self::ACTION_STARTED => 'Started',
        self::ACTION_COMPLETED => 'Completed',
        self::ACTION_CANCELLED => 'Cancelled',
        self::ACTION_ON_HOLD => 'On Hold',
        self::ACTION_REOPENED => 'Reopened',
    ];

    /**
     * Get the maintenance request for this history record
     */
    public function maintenanceRequest(): BelongsTo
    {
        return $this->belongsTo(HostelMaintenanceRequest::class);
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
            self::ACTION_CREATED => 'blue',
            self::ACTION_ASSIGNED => 'orange',
            self::ACTION_STARTED => 'yellow',
            self::ACTION_COMPLETED => 'green',
            self::ACTION_CANCELLED => 'red',
            self::ACTION_ON_HOLD => 'gray',
            self::ACTION_REOPENED => 'purple',
        ];

        return $colorMap[$this->action] ?? 'gray';
    }
}



