<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HostelWarden extends Model
{
    use HasFactory;

    protected $fillable = [
        'hostel_id',
        'warden_id',
        'position',
        'responsibilities',
        'shift_schedule',
        'emergency_contact',
        'is_primary',
        'is_active',
        'assigned_date',
        'assigned_by',
    ];

    protected $casts = [
        'responsibilities' => 'array',
        'shift_schedule' => 'array',
        'is_primary' => 'boolean',
        'is_active' => 'boolean',
        'assigned_date' => 'date',
    ];

    // Position constants
    const POSITION_CHIEF_WARDEN = 'chief_warden';
    const POSITION_SENIOR_WARDEN = 'senior_warden';
    const POSITION_WARDEN = 'warden';
    const POSITION_ASSISTANT_WARDEN = 'assistant_warden';

    const POSITION_OPTIONS = [
        self::POSITION_CHIEF_WARDEN => 'Chief Warden',
        self::POSITION_SENIOR_WARDEN => 'Senior Warden',
        self::POSITION_WARDEN => 'Warden',
        self::POSITION_ASSISTANT_WARDEN => 'Assistant Warden',
    ];

    // Responsibility constants
    const RESPONSIBILITY_STUDENT_SUPERVISION = 'student_supervision';
    const RESPONSIBILITY_DISCIPLINE = 'discipline';
    const RESPONSIBILITY_SAFETY = 'safety';
    const RESPONSIBILITY_MAINTENANCE = 'maintenance';
    const RESPONSIBILITY_INVENTORY = 'inventory';
    const RESPONSIBILITY_LEAVE_MANAGEMENT = 'leave_management';
    const RESPONSIBILITY_EMERGENCY_RESPONSE = 'emergency_response';

    const RESPONSIBILITY_OPTIONS = [
        self::RESPONSIBILITY_STUDENT_SUPERVISION => 'Student Supervision',
        self::RESPONSIBILITY_DISCIPLINE => 'Discipline Management',
        self::RESPONSIBILITY_SAFETY => 'Safety & Security',
        self::RESPONSIBILITY_MAINTENANCE => 'Maintenance Coordination',
        self::RESPONSIBILITY_INVENTORY => 'Inventory Management',
        self::RESPONSIBILITY_LEAVE_MANAGEMENT => 'Leave Management',
        self::RESPONSIBILITY_EMERGENCY_RESPONSE => 'Emergency Response',
    ];

    /**
     * Get the hostel for this warden assignment
     */
    public function hostel(): BelongsTo
    {
        return $this->belongsTo(Hostel::class);
    }

    /**
     * Get the warden (user) for this assignment
     */
    public function warden(): BelongsTo
    {
        return $this->belongsTo(User::class, 'warden_id');
    }

    /**
     * Get the user who assigned this warden
     */
    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    /**
     * Get duty rosters for this warden
     */
    public function dutyRosters(): HasMany
    {
        return $this->hasMany(HostelDutyRoster::class, 'warden_id');
    }

    /**
     * Get maintenance requests handled by this warden
     */
    public function maintenanceRequests(): HasMany
    {
        return $this->hasMany(HostelMaintenanceRequest::class, 'assigned_to');
    }

    /**
     * Get leave applications handled by this warden
     */
    public function leaveApplications(): HasMany
    {
        return $this->hasMany(HostelLeaveApplication::class, 'approved_by');
    }

    /**
     * Get responsibilities as formatted string
     */
    public function getResponsibilitiesStringAttribute(): string
    {
        if (!$this->responsibilities || empty($this->responsibilities)) {
            return 'No specific responsibilities assigned';
        }

        $responsibilityNames = array_map(function ($responsibility) {
            return self::RESPONSIBILITY_OPTIONS[$responsibility] ?? $responsibility;
        }, $this->responsibilities);

        return implode(', ', $responsibilityNames);
    }

    /**
     * Get shift schedule as formatted string
     */
    public function getShiftScheduleStringAttribute(): string
    {
        if (!$this->shift_schedule || empty($this->shift_schedule)) {
            return 'No shift schedule assigned';
        }

        $schedule = [];
        foreach ($this->shift_schedule as $day => $shift) {
            $schedule[] = ucfirst($day) . ': ' . $shift;
        }

        return implode(', ', $schedule);
    }

    /**
     * Check if warden is on duty for a specific day
     */
    public function isOnDuty($day = null): bool
    {
        if (!$this->shift_schedule) {
            return false;
        }

        $day = $day ?: strtolower(now()->format('l'));

        return isset($this->shift_schedule[$day]) && !empty($this->shift_schedule[$day]);
    }

    /**
     * Get current shift for today
     */
    public function getCurrentShiftAttribute(): string
    {
        if (!$this->is_on_duty) {
            return 'Off Duty';
        }

        $day = strtolower(now()->format('l'));
        return $this->shift_schedule[$day] ?? 'Not specified';
    }

    /**
     * Get warden contact information
     */
    public function getContactInfoAttribute(): array
    {
        return [
            'name' => $this->warden->name,
            'email' => $this->warden->email,
            'phone' => $this->warden->phone,
            'emergency_contact' => $this->emergency_contact,
            'position' => self::POSITION_OPTIONS[$this->position] ?? $this->position,
        ];
    }

    /**
     * Scope for active wardens
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for primary wardens
     */
    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }

    /**
     * Scope for wardens by position
     */
    public function scopeByPosition($query, $position)
    {
        return $query->where('position', $position);
    }

    /**
     * Scope for wardens on duty today
     */
    public function scopeOnDuty($query)
    {
        $day = strtolower(now()->format('l'));
        return $query->whereJsonContains('shift_schedule->' . $day, '!=', null);
    }
}



