<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentPlanInstallment extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_plan_id',
        'installment_number',
        'due_date',
        'amount',
        'paid_amount',
        'status',
        'paid_at',
        'payment_id',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'due_date' => 'date',
        'paid_at' => 'datetime',
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_PAID = 'paid';
    const STATUS_OVERDUE = 'overdue';
    const STATUS_PARTIAL = 'partial';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Get the payment plan this installment belongs to
     */
    public function paymentPlan(): BelongsTo
    {
        return $this->belongsTo(PaymentPlan::class);
    }

    /**
     * Get the payment
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    /**
     * Check if installment is paid
     */
    public function isPaid(): bool
    {
        return $this->status === self::STATUS_PAID;
    }

    /**
     * Check if installment is overdue
     */
    public function isOverdue(): bool
    {
        return $this->due_date < now() && $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if installment is partially paid
     */
    public function isPartiallyPaid(): bool
    {
        return $this->status === self::STATUS_PARTIAL;
    }

    /**
     * Get status display name
     */
    public function getStatusDisplayAttribute(): string
    {
        return match($this->status) {
            self::STATUS_PENDING => 'Pending',
            self::STATUS_PAID => 'Paid',
            self::STATUS_OVERDUE => 'Overdue',
            self::STATUS_PARTIAL => 'Partially Paid',
            self::STATUS_CANCELLED => 'Cancelled',
            default => 'Unknown'
        };
    }

    /**
     * Get status color for UI
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            self::STATUS_PENDING => 'yellow',
            self::STATUS_PAID => 'green',
            self::STATUS_OVERDUE => 'red',
            self::STATUS_PARTIAL => 'blue',
            self::STATUS_CANCELLED => 'gray',
            default => 'gray'
        };
    }

    /**
     * Calculate remaining amount
     */
    public function getRemainingAmountAttribute(): float
    {
        return $this->amount - $this->paid_amount;
    }

    /**
     * Mark installment as paid
     */
    public function markAsPaid(Payment $payment): void
    {
        $this->update([
            'status' => self::STATUS_PAID,
            'paid_amount' => $this->amount,
            'paid_at' => now(),
            'payment_id' => $payment->id,
        ]);
    }

    /**
     * Mark installment as partially paid
     */
    public function markAsPartiallyPaid(float $amount, Payment $payment): void
    {
        $this->update([
            'status' => self::STATUS_PARTIAL,
            'paid_amount' => $this->paid_amount + $amount,
            'payment_id' => $payment->id,
        ]);
    }

    /**
     * Update installment status based on payments
     */
    public function updateStatus(): void
    {
        if ($this->paid_amount >= $this->amount) {
            $this->status = self::STATUS_PAID;
        } elseif ($this->paid_amount > 0) {
            $this->status = self::STATUS_PARTIAL;
        } elseif ($this->isOverdue()) {
            $this->status = self::STATUS_OVERDUE;
        } else {
            $this->status = self::STATUS_PENDING;
        }
        
        $this->save();
    }
}



