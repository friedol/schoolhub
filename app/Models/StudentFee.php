<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudentFee extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'student_id',
        'fee_category_id',
        'academic_term_id',
        'amount',
        'currency',
        'due_date',
        'status',
        'paid_amount',
        'balance',
        'payment_plan',
        'installments',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'balance' => 'decimal:2',
        'due_date' => 'date',
        'installments' => 'array',
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_PARTIAL = 'partial';
    const STATUS_PAID = 'paid';
    const STATUS_OVERDUE = 'overdue';
    const STATUS_WAIVED = 'waived';

    /**
     * Get the school this fee belongs to
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
     * Get the fee category
     */
    public function feeCategory(): BelongsTo
    {
        return $this->belongsTo(FeeCategory::class);
    }

    /**
     * Get the academic term
     */
    public function academicTerm(): BelongsTo
    {
        return $this->belongsTo(AcademicTerm::class);
    }

    /**
     * Get the user who created this fee
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get fee payments
     */
    public function payments(): HasMany
    {
        return $this->hasMany(FeePayment::class);
    }

    /**
     * Get status display name
     */
    public function getStatusDisplayAttribute(): string
    {
        return match($this->status) {
            self::STATUS_PENDING => 'Pending',
            self::STATUS_PARTIAL => 'Partial',
            self::STATUS_PAID => 'Paid',
            self::STATUS_OVERDUE => 'Overdue',
            self::STATUS_WAIVED => 'Waived',
            default => 'Unknown'
        };
    }

    /**
     * Check if fee is paid
     */
    public function isPaid(): bool
    {
        return $this->status === self::STATUS_PAID;
    }

    /**
     * Check if fee is overdue
     */
    public function isOverdue(): bool
    {
        return $this->due_date < now()->toDateString() && !$this->isPaid();
    }

    /**
     * Check if fee is partially paid
     */
    public function isPartiallyPaid(): bool
    {
        return $this->status === self::STATUS_PARTIAL;
    }

    /**
     * Calculate balance
     */
    public function calculateBalance(): float
    {
        return $this->amount - $this->paid_amount;
    }

    /**
     * Update status based on payments
     */
    public function updateStatus(): void
    {
        $balance = $this->calculateBalance();
        
        if ($balance <= 0) {
            $this->status = self::STATUS_PAID;
        } elseif ($this->paid_amount > 0) {
            $this->status = self::STATUS_PARTIAL;
        } elseif ($this->isOverdue()) {
            $this->status = self::STATUS_OVERDUE;
        } else {
            $this->status = self::STATUS_PENDING;
        }

        $this->balance = $balance;
        $this->save();
    }

    /**
     * Get payment progress percentage
     */
    public function getPaymentProgressAttribute(): float
    {
        if ($this->amount == 0) {
            return 0;
        }

        return round(($this->paid_amount / $this->amount) * 100, 2);
    }
}
