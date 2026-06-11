<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Payroll extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'academic_term_id',
        'payroll_period',
        'month',
        'year',
        'status',
        'total_staff',
        'total_gross_pay',
        'total_deductions',
        'total_net_pay',
        'processed_by',
        'approved_by',
        'processed_at',
        'approved_at',
        'notes',
    ];

    protected $casts = [
        'month' => 'integer',
        'year' => 'integer',
        'total_staff' => 'integer',
        'total_gross_pay' => 'decimal:2',
        'total_deductions' => 'decimal:2',
        'total_net_pay' => 'decimal:2',
        'processed_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    const STATUS_DRAFT = 'draft';
    const STATUS_PROCESSING = 'processing';
    const STATUS_PENDING_APPROVAL = 'pending_approval';
    const STATUS_APPROVED = 'approved';
    const STATUS_PAID = 'paid';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Get the school this payroll belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the academic term this payroll belongs to
     */
    public function academicTerm(): BelongsTo
    {
        return $this->belongsTo(AcademicTerm::class);
    }

    /**
     * Get the user who processed this payroll
     */
    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * Get the user who approved this payroll
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get payroll records for this payroll
     */
    public function payrollRecords(): HasMany
    {
        return $this->hasMany(PayrollRecord::class);
    }

    /**
     * Check if payroll is approved
     */
    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    /**
     * Check if payroll is paid
     */
    public function isPaid(): bool
    {
        return $this->status === self::STATUS_PAID;
    }

    /**
     * Get status display name
     */
    public function getStatusDisplayAttribute(): string
    {
        return match($this->status) {
            self::STATUS_DRAFT => 'Draft',
            self::STATUS_PROCESSING => 'Processing',
            self::STATUS_PENDING_APPROVAL => 'Pending Approval',
            self::STATUS_APPROVED => 'Approved',
            self::STATUS_PAID => 'Paid',
            self::STATUS_CANCELLED => 'Cancelled',
            default => 'Unknown'
        };
    }

    /**
     * Get payroll period display
     */
    public function getPayrollPeriodDisplayAttribute(): string
    {
        $months = [
            1 => 'January', 2 => 'February', 3 => 'March', 4 => 'April',
            5 => 'May', 6 => 'June', 7 => 'July', 8 => 'August',
            9 => 'September', 10 => 'October', 11 => 'November', 12 => 'December'
        ];
        
        return $months[$this->month] . ' ' . $this->year;
    }
}



