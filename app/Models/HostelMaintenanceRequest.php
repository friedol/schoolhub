<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;

class HostelMaintenanceRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'hostel_id',
        'room_id',
        'bed_id',
        'requested_by',
        'reported_by',
        'request_type',
        'priority',
        'severity',
        'title',
        'description',
        'issue_description',
        'request_date',
        'reported_date',
        'status',
        'assigned_to',
        'assigned_date',
        'estimated_cost',
        'actual_cost',
        'cost',
        'completion_date',
        'resolution_notes',
        'attachments',
        'is_urgent',
        'created_by',
    ];

    protected $casts = [
        'request_date' => 'date',
        'assigned_date' => 'date',
        'completion_date' => 'date',
        'estimated_cost' => 'decimal:2',
        'actual_cost' => 'decimal:2',
        'attachments' => 'array',
        'is_urgent' => 'boolean',
    ];

    protected $appends = [
        'severity',
        'reported_date',
        'reported_by',
        'issue_description',
        'cost',
    ];

    // Request type constants
    const TYPE_PLUMBING = 'plumbing';
    const TYPE_ELECTRICAL = 'electrical';
    const TYPE_FURNITURE = 'furniture';
    const TYPE_CLEANING = 'cleaning';
    const TYPE_SAFETY = 'safety';
    const TYPE_APPLIANCE = 'appliance';
    const TYPE_STRUCTURAL = 'structural';
    const TYPE_OTHER = 'other';

    const TYPE_OPTIONS = [
        self::TYPE_PLUMBING => 'Plumbing',
        self::TYPE_ELECTRICAL => 'Electrical',
        self::TYPE_FURNITURE => 'Furniture',
        self::TYPE_CLEANING => 'Cleaning',
        self::TYPE_SAFETY => 'Safety',
        self::TYPE_APPLIANCE => 'Appliance',
        self::TYPE_STRUCTURAL => 'Structural',
        self::TYPE_OTHER => 'Other',
    ];

    // Priority constants
    const PRIORITY_LOW = 'low';
    const PRIORITY_MEDIUM = 'medium';
    const PRIORITY_HIGH = 'high';
    const PRIORITY_URGENT = 'urgent';

    const PRIORITY_OPTIONS = [
        self::PRIORITY_LOW => 'Low',
        self::PRIORITY_MEDIUM => 'Medium',
        self::PRIORITY_HIGH => 'High',
        self::PRIORITY_URGENT => 'Urgent',
    ];

    const SEVERITY_OPTIONS = self::PRIORITY_OPTIONS;

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_ASSIGNED = 'assigned';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_ON_HOLD = 'on_hold';

    const STATUS_OPTIONS = [
        self::STATUS_PENDING => 'Pending',
        self::STATUS_ASSIGNED => 'Assigned',
        self::STATUS_IN_PROGRESS => 'In Progress',
        self::STATUS_COMPLETED => 'Completed',
        self::STATUS_CANCELLED => 'Cancelled',
        self::STATUS_ON_HOLD => 'On Hold',
    ];

    /**
     * Get the hostel for this maintenance request
     */
    public function hostel(): BelongsTo
    {
        return $this->belongsTo(Hostel::class);
    }

    /**
     * Get the room for this maintenance request
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(HostelRoom::class, 'room_id');
    }

    /**
     * Get the bed for this maintenance request
     */
    public function bed(): BelongsTo
    {
        return $this->belongsTo(HostelBed::class, 'bed_id');
    }

    /**
     * Get the user who requested this maintenance
     */
    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    /**
     * Get the user who reported this maintenance request (alias for requestedBy)
     */
    public function reportedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    /**
     * Get the user assigned to this maintenance request
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the user who created this maintenance request
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get maintenance request history
     */
    public function history(): HasMany
    {
        return $this->hasMany(HostelMaintenanceHistory::class, 'maintenance_request_id');
    }

    /**
     * Check if request is pending
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if request is in progress
     */
    public function isInProgress(): bool
    {
        return $this->status === self::STATUS_IN_PROGRESS;
    }

    /**
     * Check if request is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Check if request is urgent
     */
    public function isUrgent(): bool
    {
        return $this->is_urgent || $this->priority === self::PRIORITY_URGENT;
    }

    /**
     * Get request age in days
     */
    public function getAgeInDaysAttribute(): int
    {
        return $this->request_date->diffInDays(now());
    }

    /**
     * Get resolution time in days
     */
    public function getResolutionTimeInDaysAttribute(): int
    {
        if (!$this->completion_date) {
            return 0;
        }

        return $this->request_date->diffInDays($this->completion_date);
    }

    /**
     * Get priority color for UI
     */
    public function getPriorityColorAttribute(): string
    {
        $colorMap = [
            self::PRIORITY_LOW => 'green',
            self::PRIORITY_MEDIUM => 'yellow',
            self::PRIORITY_HIGH => 'orange',
            self::PRIORITY_URGENT => 'red',
        ];

        return $colorMap[$this->priority] ?? 'gray';
    }

    /**
     * Get status color for UI
     */
    public function getStatusColorAttribute(): string
    {
        $colorMap = [
            self::STATUS_PENDING => 'yellow',
            self::STATUS_ASSIGNED => 'blue',
            self::STATUS_IN_PROGRESS => 'orange',
            self::STATUS_COMPLETED => 'green',
            self::STATUS_CANCELLED => 'red',
            self::STATUS_ON_HOLD => 'gray',
        ];

        return $colorMap[$this->status] ?? 'gray';
    }

    /**
     * Get request location string
     */
    public function getLocationStringAttribute(): string
    {
        $location = $this->hostel->name;
        
        if ($this->room) {
            $location .= " - {$this->room->display_name}";
        }
        
        if ($this->bed) {
            $location .= " - Bed {$this->bed->bed_number}";
        }

        return $location;
    }

    /**
     * Scope for pending requests
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope for urgent requests
     */
    public function scopeUrgent($query)
    {
        return $query->where(function ($q) {
            $q->where('is_urgent', true)
              ->orWhere('priority', self::PRIORITY_URGENT);
        });
    }

    /**
     * Scope for requests by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('request_type', $type);
    }

    /**
     * Scope for requests by priority
     */
    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope for requests by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for overdue requests
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', '!=', self::STATUS_COMPLETED)
            ->where('request_date', '<', now()->subDays(7)->toDateString());
    }

    /**
     * Boot method to set created_by
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($request) {
            if (!$request->created_by) {
                $request->created_by = Auth::id();
            }
        });
    }

    /**
     * Get severity attribute (alias for priority)
     */
    public function getSeverityAttribute(): string
    {
        return $this->priority ?? 'medium';
    }

    /**
     * Set severity attribute (alias for priority)
     */
    public function setSeverityAttribute(?string $value): void
    {
        if ($value) {
            $this->attributes['priority'] = $value;
        }
    }

    /**
     * Get reported_date attribute (alias for request_date)
     */
    public function getReportedDateAttribute()
    {
        return $this->request_date?->toDateString();
    }

    /**
     * Set reported_date attribute (alias for request_date)
     */
    public function setReportedDateAttribute($value): void
    {
        $this->attributes['request_date'] = $value;
    }

    /**
     * Get reported_by attribute (alias for requested_by)
     */
    public function getReportedByAttribute()
    {
        return $this->requested_by;
    }

    /**
     * Set reported_by attribute (alias for requested_by)
     */
    public function setReportedByAttribute($value): void
    {
        $this->attributes['requested_by'] = $value;
    }

    /**
     * Get issue_description attribute (alias for description)
     */
    public function getIssueDescriptionAttribute()
    {
        return $this->description;
    }

    /**
     * Set issue_description attribute (alias for description)
     */
    public function setIssueDescriptionAttribute($value): void
    {
        $this->attributes['description'] = $value;
    }

    /**
     * Get cost attribute (alias for actual_cost)
     */
    public function getCostAttribute()
    {
        return $this->actual_cost;
    }

    /**
     * Set cost attribute (alias for actual_cost)
     */
    public function setCostAttribute($value): void
    {
        $this->attributes['actual_cost'] = $value;
    }
}



