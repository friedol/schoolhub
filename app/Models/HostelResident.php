<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HostelResident extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'hostel_id',
        'room_id',
        'bed_number',
        'allocation_date',
        'end_date',
        'status',
        'allocation_notes',
        'allocated_by',
        'transferred_by',
        'notes',
    ];

    protected $casts = [
        'allocation_date' => 'date',
        'end_date' => 'date',
    ];

    const STATUS_ACTIVE = 'active';
    const STATUS_INACTIVE = 'inactive';
    const STATUS_TRANSFERRED = 'transferred';

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
     * Get the room
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(HostelRoom::class);
    }

    /**
     * Get the user who allocated this resident
     */
    public function allocatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'allocated_by');
    }

    /**
     * Get the user who transferred this resident
     */
    public function transferredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'transferred_by');
    }

    /**
     * Get status display name
     */
    public function getStatusDisplayAttribute(): string
    {
        return match($this->status) {
            self::STATUS_ACTIVE => 'Active',
            self::STATUS_INACTIVE => 'Inactive',
            self::STATUS_TRANSFERRED => 'Transferred',
            default => 'Unknown'
        };
    }

    /**
     * Check if resident is active
     */
    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    /**
     * Get allocation duration in days
     */
    public function getAllocationDurationAttribute(): int
    {
        $endDate = $this->end_date ?? now();
        return $this->allocation_date->diffInDays($endDate);
    }
}



