<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LeaveType extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'name',
        'description',
        'max_days_per_year',
        'max_days_per_request',
        'requires_approval',
        'requires_documentation',
        'is_paid',
        'accrual_type',
        'accrual_rate',
        'carry_forward',
        'is_active',
    ];

    protected $casts = [
        'max_days_per_year' => 'integer',
        'max_days_per_request' => 'integer',
        'requires_approval' => 'boolean',
        'requires_documentation' => 'boolean',
        'is_paid' => 'boolean',
        'accrual_rate' => 'decimal:2',
        'carry_forward' => 'boolean',
        'is_active' => 'boolean',
    ];

    const ACCRUAL_TYPE_NONE = 'none';
    const ACCRUAL_TYPE_MONTHLY = 'monthly';
    const ACCRUAL_TYPE_ANNUAL = 'annual';

    /**
     * Get the school this leave type belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get leave applications for this leave type
     */
    public function leaveApplications(): HasMany
    {
        return $this->hasMany(LeaveApplication::class);
    }

    /**
     * Get accrual type display name
     */
    public function getAccrualTypeDisplayAttribute(): string
    {
        return match($this->accrual_type) {
            self::ACCRUAL_TYPE_NONE => 'No Accrual',
            self::ACCRUAL_TYPE_MONTHLY => 'Monthly',
            self::ACCRUAL_TYPE_ANNUAL => 'Annual',
            default => 'Unknown'
        };
    }

    /**
     * Calculate monthly accrual
     */
    public function getMonthlyAccrualAttribute(): float
    {
        if ($this->accrual_type === self::ACCRUAL_TYPE_MONTHLY) {
            return $this->accrual_rate;
        } elseif ($this->accrual_type === self::ACCRUAL_TYPE_ANNUAL) {
            return $this->accrual_rate / 12;
        }
        return 0;
    }
}



