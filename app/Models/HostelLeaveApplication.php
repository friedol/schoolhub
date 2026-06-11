<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;

class HostelLeaveApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'allocation_id',
        'student_id',
        'hostel_id',
        'leave_type',
        'leave_reason',
        'departure_date',
        'departure_time',
        'expected_return_date',
        'expected_return_time',
        'actual_return_date',
        'actual_return_time',
        'destination',
        'emergency_contact',
        'parent_contact',
        'status',
        'approved_by',
        'approved_at',
        'rejection_reason',
        'check_in_verified',
        'check_out_verified',
        'verified_by',
        'application_notes',
        'created_by',
    ];

    protected $casts = [
        'departure_date' => 'date',
        'expected_return_date' => 'date',
        'actual_return_date' => 'date',
        'approved_at' => 'datetime',
        'check_in_verified' => 'boolean',
        'check_out_verified' => 'boolean',
    ];

    // Leave type constants
    const TYPE_WEEKEND = 'weekend';
    const TYPE_HOLIDAY = 'holiday';
    const TYPE_EMERGENCY = 'emergency';
    const TYPE_MEDICAL = 'medical';
    const TYPE_FAMILY = 'family';
    const TYPE_ACADEMIC = 'academic';

    const TYPE_OPTIONS = [
        self::TYPE_WEEKEND => 'Weekend Leave',
        self::TYPE_HOLIDAY => 'Holiday Leave',
        self::TYPE_EMERGENCY => 'Emergency Leave',
        self::TYPE_MEDICAL => 'Medical Leave',
        self::TYPE_FAMILY => 'Family Leave',
        self::TYPE_ACADEMIC => 'Academic Leave',
    ];

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_ACTIVE = 'active';
    const STATUS_COMPLETED = 'completed';
    const STATUS_OVERDUE = 'overdue';

    const STATUS_OPTIONS = [
        self::STATUS_PENDING => 'Pending Approval',
        self::STATUS_APPROVED => 'Approved',
        self::STATUS_REJECTED => 'Rejected',
        self::STATUS_CANCELLED => 'Cancelled',
        self::STATUS_ACTIVE => 'Active Leave',
        self::STATUS_COMPLETED => 'Completed',
        self::STATUS_OVERDUE => 'Overdue Return',
    ];

    /**
     * Get the allocation for this leave application
     */
    public function allocation(): BelongsTo
    {
        return $this->belongsTo(HostelAllocation::class, 'allocation_id');
    }

    /**
     * Get the student for this leave application
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the hostel for this leave application
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
     * Get the user who verified this leave
     */
    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Get the user who created this leave application
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get leave application history
     */
    public function history(): HasMany
    {
        return $this->hasMany(HostelLeaveHistory::class, 'leave_application_id');
    }

    /**
     * Check if leave is currently active
     */
    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
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
     * Check if leave is overdue
     */
    public function isOverdue(): bool
    {
        if (!$this->expected_return_date || $this->status !== self::STATUS_ACTIVE) {
            return false;
        }

        return now()->toDateString() > $this->expected_return_date->toDateString();
    }

    /**
     * Check if leave is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Get leave duration in days
     */
    public function getDurationInDaysAttribute(): int
    {
        if (!$this->departure_date || !$this->expected_return_date) {
            return 0;
        }

        return $this->departure_date->diffInDays($this->expected_return_date);
    }

    /**
     * Get actual leave duration in days
     */
    public function getActualDurationInDaysAttribute(): int
    {
        if (!$this->departure_date || !$this->actual_return_date) {
            return 0;
        }

        return $this->departure_date->diffInDays($this->actual_return_date);
    }

    /**
     * Get leave status color for UI
     */
    public function getStatusColorAttribute(): string
    {
        $colorMap = [
            self::STATUS_PENDING => 'yellow',
            self::STATUS_APPROVED => 'blue',
            self::STATUS_REJECTED => 'red',
            self::STATUS_CANCELLED => 'gray',
            self::STATUS_ACTIVE => 'green',
            self::STATUS_COMPLETED => 'blue',
            self::STATUS_OVERDUE => 'red',
        ];

        return $colorMap[$this->status] ?? 'gray';
    }

    /**
     * Get leave type color for UI
     */
    public function getTypeColorAttribute(): string
    {
        $colorMap = [
            self::TYPE_WEEKEND => 'blue',
            self::TYPE_HOLIDAY => 'green',
            self::TYPE_EMERGENCY => 'red',
            self::TYPE_MEDICAL => 'orange',
            self::TYPE_FAMILY => 'purple',
            self::TYPE_ACADEMIC => 'indigo',
        ];

        return $colorMap[$this->leave_type] ?? 'gray';
    }

    /**
     * Get leave display string
     */
    public function getDisplayStringAttribute(): string
    {
        return "{$this->student->name} - {$this->leave_type} - {$this->departure_date->format('M d, Y')}";
    }

    /**
     * Scope for active leaves
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    /**
     * Scope for pending leaves
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope for overdue leaves
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', self::STATUS_ACTIVE)
            ->where('expected_return_date', '<', now()->toDateString());
    }

    /**
     * Scope for leaves by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('leave_type', $type);
    }

    /**
     * Scope for leaves by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for leaves in date range
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('departure_date', [$startDate, $endDate]);
    }

    /**
     * Boot method to set created_by
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($leave) {
            if (!$leave->created_by) {
                $leave->created_by = Auth::id();
            }
        });
    }
}



