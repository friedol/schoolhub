<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'student_id',
        'invoice_id',
        'plan_name',
        'total_amount',
        'installment_count',
        'installment_amount',
        'start_date',
        'end_date',
        'frequency',
        'status',
        'created_by',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'installment_amount' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'approved_at' => 'datetime',
    ];

    const FREQUENCY_WEEKLY = 'weekly';
    const FREQUENCY_MONTHLY = 'monthly';
    const FREQUENCY_TERMLY = 'termly';

    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_ACTIVE = 'active';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_DEFAULTED = 'defaulted';

    /**
     * Get the school this payment plan belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the student
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the invoice
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Get the user who created this payment plan
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who approved this payment plan
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get payment plan installments
     */
    public function installments(): HasMany
    {
        return $this->hasMany(PaymentPlanInstallment::class);
    }

    /**
     * Check if payment plan is approved
     */
    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED || $this->status === self::STATUS_ACTIVE;
    }

    /**
     * Check if payment plan is active
     */
    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    /**
     * Check if payment plan is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Get frequency display name
     */
    public function getFrequencyDisplayAttribute(): string
    {
        return match($this->frequency) {
            self::FREQUENCY_WEEKLY => 'Weekly',
            self::FREQUENCY_MONTHLY => 'Monthly',
            self::FREQUENCY_TERMLY => 'Termly',
            default => 'Unknown'
        };
    }

    /**
     * Get status display name
     */
    public function getStatusDisplayAttribute(): string
    {
        return match($this->status) {
            self::STATUS_PENDING => 'Pending',
            self::STATUS_APPROVED => 'Approved',
            self::STATUS_ACTIVE => 'Active',
            self::STATUS_COMPLETED => 'Completed',
            self::STATUS_CANCELLED => 'Cancelled',
            self::STATUS_DEFAULTED => 'Defaulted',
            default => 'Unknown'
        };
    }

    /**
     * Calculate total paid amount
     */
    public function getTotalPaidAmountAttribute(): float
    {
        return $this->installments()->where('status', PaymentPlanInstallment::STATUS_PAID)->sum('amount');
    }

    /**
     * Calculate remaining amount
     */
    public function getRemainingAmountAttribute(): float
    {
        return $this->total_amount - $this->total_paid_amount;
    }

    /**
     * Calculate completion percentage
     */
    public function getCompletionPercentageAttribute(): float
    {
        if ($this->total_amount == 0) return 0;
        return ($this->total_paid_amount / $this->total_amount) * 100;
    }

    /**
     * Mark payment plan as approved
     */
    public function markAsApproved(User $approvedBy): void
    {
        $this->update([
            'status' => self::STATUS_APPROVED,
            'approved_by' => $approvedBy->id,
            'approved_at' => now(),
        ]);
    }

    /**
     * Activate payment plan
     */
    public function activate(): void
    {
        $this->update(['status' => self::STATUS_ACTIVE]);
    }

    /**
     * Complete payment plan
     */
    public function complete(): void
    {
        $this->update(['status' => self::STATUS_COMPLETED]);
    }
}



