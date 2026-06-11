<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalaryRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_id',
        'pay_period_start',
        'pay_period_end',
        'basic_salary',
        'allowances',
        'deductions',
        'gross_salary',
        'net_salary',
        'currency',
        'payment_method',
        'payment_date',
        'payment_status',
        'bank_reference',
        'notes',
        'processed_by',
        'processed_at',
    ];

    protected $casts = [
        'pay_period_start' => 'date',
        'pay_period_end' => 'date',
        'basic_salary' => 'decimal:2',
        'allowances' => 'array',
        'deductions' => 'array',
        'gross_salary' => 'decimal:2',
        'net_salary' => 'decimal:2',
        'payment_date' => 'date',
        'processed_at' => 'datetime',
    ];

    const PAYMENT_STATUS_PENDING = 'pending';
    const PAYMENT_STATUS_PROCESSED = 'processed';
    const PAYMENT_STATUS_PAID = 'paid';
    const PAYMENT_STATUS_FAILED = 'failed';

    /**
     * Get the staff member
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    /**
     * Get the user who processed this salary
     */
    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * Get payment status display name
     */
    public function getPaymentStatusDisplayAttribute(): string
    {
        return match($this->payment_status) {
            self::PAYMENT_STATUS_PENDING => 'Pending',
            self::PAYMENT_STATUS_PROCESSED => 'Processed',
            self::PAYMENT_STATUS_PAID => 'Paid',
            self::PAYMENT_STATUS_FAILED => 'Failed',
            default => 'Unknown'
        };
    }

    /**
     * Check if salary is paid
     */
    public function isPaid(): bool
    {
        return $this->payment_status === self::PAYMENT_STATUS_PAID;
    }

    /**
     * Check if salary is pending
     */
    public function isPending(): bool
    {
        return $this->payment_status === self::PAYMENT_STATUS_PENDING;
    }

    /**
     * Calculate total allowances
     */
    public function getTotalAllowancesAttribute(): float
    {
        if (empty($this->allowances)) {
            return 0;
        }

        return array_sum($this->allowances);
    }

    /**
     * Calculate total deductions
     */
    public function getTotalDeductionsAttribute(): float
    {
        if (empty($this->deductions)) {
            return 0;
        }

        return array_sum($this->deductions);
    }

    /**
     * Calculate gross salary
     */
    public function calculateGrossSalary(): float
    {
        return $this->basic_salary + $this->total_allowances;
    }

    /**
     * Calculate net salary
     */
    public function calculateNetSalary(): float
    {
        return $this->gross_salary - $this->total_deductions;
    }

    /**
     * Get pay period display
     */
    public function getPayPeriodDisplayAttribute(): string
    {
        return $this->pay_period_start->format('M d') . ' - ' . $this->pay_period_end->format('M d, Y');
    }
}
