<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StaffProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_id',
        'employee_number',
        'tsc_number',
        'employment_type',
        'employment_status',
        'hire_date',
        'contract_start_date',
        'contract_end_date',
        'department',
        'position',
        'job_title',
        'reporting_to',
        'qualifications',
        'certifications',
        'previous_employment',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relationship',
        'bank_name',
        'bank_account_number',
        'bank_branch',
        'nssf_number',
        'nhif_number',
        'tax_pin',
        'medical_info',
        'allergies',
        'medications',
        'performance_notes',
        'disciplinary_records',
        'achievements',
        'training_records',
        'notes',
    ];

    protected $casts = [
        'hire_date' => 'date',
        'contract_start_date' => 'date',
        'contract_end_date' => 'date',
        'qualifications' => 'array',
        'certifications' => 'array',
        'previous_employment' => 'array',
        'medical_info' => 'array',
        'performance_notes' => 'array',
        'disciplinary_records' => 'array',
        'achievements' => 'array',
        'training_records' => 'array',
    ];

    const EMPLOYMENT_TYPE_FULL_TIME = 'full_time';
    const EMPLOYMENT_TYPE_PART_TIME = 'part_time';
    const EMPLOYMENT_TYPE_CONTRACT = 'contract';
    const EMPLOYMENT_TYPE_TEMPORARY = 'temporary';

    const EMPLOYMENT_STATUS_ACTIVE = 'active';
    const EMPLOYMENT_STATUS_INACTIVE = 'inactive';
    const EMPLOYMENT_STATUS_SUSPENDED = 'suspended';
    const EMPLOYMENT_STATUS_TERMINATED = 'terminated';

    /**
     * Get the staff member
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    /**
     * Get the supervisor
     */
    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporting_to');
    }

    /**
     * Get salary records
     */
    public function salaryRecords(): HasMany
    {
        return $this->hasMany(SalaryRecord::class, 'staff_id', 'staff_id');
    }

    /**
     * Get leave records
     */
    public function leaveRecords(): HasMany
    {
        return $this->hasMany(LeaveRecord::class, 'staff_id', 'staff_id');
    }

    /**
     * Get performance appraisals
     */
    public function performanceAppraisals(): HasMany
    {
        return $this->hasMany(PerformanceAppraisal::class, 'staff_id', 'staff_id');
    }

    /**
     * Get employment type display name
     */
    public function getEmploymentTypeDisplayAttribute(): string
    {
        return match($this->employment_type) {
            self::EMPLOYMENT_TYPE_FULL_TIME => 'Full Time',
            self::EMPLOYMENT_TYPE_PART_TIME => 'Part Time',
            self::EMPLOYMENT_TYPE_CONTRACT => 'Contract',
            self::EMPLOYMENT_TYPE_TEMPORARY => 'Temporary',
            default => 'Unknown'
        };
    }

    /**
     * Get employment status display name
     */
    public function getEmploymentStatusDisplayAttribute(): string
    {
        return match($this->employment_status) {
            self::EMPLOYMENT_STATUS_ACTIVE => 'Active',
            self::EMPLOYMENT_STATUS_INACTIVE => 'Inactive',
            self::EMPLOYMENT_STATUS_SUSPENDED => 'Suspended',
            self::EMPLOYMENT_STATUS_TERMINATED => 'Terminated',
            default => 'Unknown'
        };
    }

    /**
     * Check if staff is active
     */
    public function isActive(): bool
    {
        return $this->employment_status === self::EMPLOYMENT_STATUS_ACTIVE;
    }

    /**
     * Check if contract is expiring soon
     */
    public function isContractExpiringSoon(int $days = 30): bool
    {
        if (!$this->contract_end_date) {
            return false;
        }

        return $this->contract_end_date->diffInDays(now()) <= $days;
    }

    /**
     * Get years of service
     */
    public function getYearsOfServiceAttribute(): int
    {
        return $this->hire_date->diffInYears(now());
    }

    /**
     * Generate employee number
     */
    public static function generateEmployeeNumber(School $school): string
    {
        $count = self::whereHas('staff', function($query) use ($school) {
            $query->where('school_id', $school->id);
        })->count() + 1;

        return $school->code . '/EMP/' . str_pad($count, 4, '0', STR_PAD_LEFT);
    }
}
