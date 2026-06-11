<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HostelAllocationHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'allocation_id',
        'student_id',
        'hostel_id',
        'floor_id',
        'room_id',
        'bed_id',
        'action',
        'action_date',
        'previous_allocation_id',
        'notes',
        'performed_by',
    ];

    protected $casts = [
        'action_date' => 'datetime',
    ];

    // Action constants
    const ACTION_ALLOCATED = 'allocated';
    const ACTION_TRANSFERRED = 'transferred';
    const ACTION_DEALLOCATED = 'deallocated';
    const ACTION_REALLOCATED = 'reallocated';

    const ACTION_OPTIONS = [
        self::ACTION_ALLOCATED => 'Allocated',
        self::ACTION_TRANSFERRED => 'Transferred',
        self::ACTION_DEALLOCATED => 'Deallocated',
        self::ACTION_REALLOCATED => 'Reallocated',
    ];

    /**
     * Get the allocation for this history record
     */
    public function allocation(): BelongsTo
    {
        return $this->belongsTo(HostelAllocation::class);
    }

    /**
     * Get the student for this history record
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the hostel for this history record
     */
    public function hostel(): BelongsTo
    {
        return $this->belongsTo(Hostel::class);
    }

    /**
     * Get the floor for this history record
     */
    public function floor(): BelongsTo
    {
        return $this->belongsTo(HostelFloor::class, 'floor_id');
    }

    /**
     * Get the room for this history record
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(HostelRoom::class, 'room_id');
    }

    /**
     * Get the bed for this history record
     */
    public function bed(): BelongsTo
    {
        return $this->belongsTo(HostelBed::class, 'bed_id');
    }

    /**
     * Get the user who performed this action
     */
    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    /**
     * Get the previous allocation
     */
    public function previousAllocation(): BelongsTo
    {
        return $this->belongsTo(HostelAllocation::class, 'previous_allocation_id');
    }

    /**
     * Get action color for UI
     */
    public function getActionColorAttribute(): string
    {
        $colorMap = [
            self::ACTION_ALLOCATED => 'green',
            self::ACTION_TRANSFERRED => 'blue',
            self::ACTION_DEALLOCATED => 'red',
            self::ACTION_REALLOCATED => 'orange',
        ];

        return $colorMap[$this->action] ?? 'gray';
    }

    /**
     * Get location string for this history record
     */
    public function getLocationStringAttribute(): string
    {
        return "{$this->hostel->name} - Floor {$this->floor->floor_number} - {$this->room->display_name} - Bed {$this->bed->bed_number}";
    }
}



