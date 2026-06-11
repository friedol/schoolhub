<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LibraryFine extends Model
{
    use HasFactory;

    protected $fillable = [
        'book_issuance_id',
        'borrower_id',
        'school_id',
        'amount',
        'reason',
        'fine_date',
        'due_date',
        'paid_amount',
        'paid_date',
        'status',
        'waived_by',
        'waived_date',
        'waiver_reason',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'fine_date' => 'date',
        'due_date' => 'date',
        'paid_amount' => 'decimal:2',
        'paid_date' => 'datetime',
        'waived_date' => 'datetime',
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_PAID = 'paid';
    const STATUS_PARTIAL = 'partial';
    const STATUS_WAIVED = 'waived';
    const STATUS_OVERDUE = 'overdue';

    const REASON_OVERDUE = 'overdue';
    const REASON_LOST = 'lost';
    const REASON_DAMAGED = 'damaged';
    const REASON_OTHER = 'other';

    /**
     * Get the book issuance
     */
    public function bookIssuance(): BelongsTo
    {
        return $this->belongsTo(BookIssuance::class);
    }

    /**
     * Get the borrower
     */
    public function borrower(): BelongsTo
    {
        return $this->belongsTo(User::class, 'borrower_id');
    }

    /**
     * Get the school
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the user who created this fine
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who waived this fine
     */
    public function waivedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'waived_by');
    }

    /**
     * Get status display name
     */
    public function getStatusDisplayAttribute(): string
    {
        return match($this->status) {
            self::STATUS_PENDING => 'Pending',
            self::STATUS_PAID => 'Paid',
            self::STATUS_PARTIAL => 'Partially Paid',
            self::STATUS_WAIVED => 'Waived',
            self::STATUS_OVERDUE => 'Overdue',
            default => 'Unknown'
        };
    }

    /**
     * Get reason display name
     */
    public function getReasonDisplayAttribute(): string
    {
        return match($this->reason) {
            self::REASON_OVERDUE => 'Overdue Return',
            self::REASON_LOST => 'Lost Book',
            self::REASON_DAMAGED => 'Damaged Book',
            self::REASON_OTHER => 'Other',
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
            self::STATUS_PARTIAL => 'blue',
            self::STATUS_WAIVED => 'gray',
            self::STATUS_OVERDUE => 'red',
            default => 'gray'
        };
    }

    /**
     * Check if fine is paid
     */
    public function isPaid(): bool
    {
        return $this->status === self::STATUS_PAID;
    }

    /**
     * Check if fine is partially paid
     */
    public function isPartiallyPaid(): bool
    {
        return $this->status === self::STATUS_PARTIAL;
    }

    /**
     * Check if fine is waived
     */
    public function isWaived(): bool
    {
        return $this->status === self::STATUS_WAIVED;
    }

    /**
     * Check if fine is overdue
     */
    public function isOverdue(): bool
    {
        return $this->status === self::STATUS_OVERDUE || 
               ($this->status === self::STATUS_PENDING && $this->due_date < now()->toDateString());
    }

    /**
     * Calculate outstanding amount
     */
    public function getOutstandingAmountAttribute(): float
    {
        return $this->amount - $this->paid_amount;
    }

    /**
     * Calculate payment percentage
     */
    public function getPaymentPercentageAttribute(): float
    {
        if ($this->amount == 0) return 0;
        return ($this->paid_amount / $this->amount) * 100;
    }

    /**
     * Mark fine as paid
     */
    public function markAsPaid(float $amount, ?string $notes = null): void
    {
        $newPaidAmount = $this->paid_amount + $amount;
        
        if ($newPaidAmount >= $this->amount) {
            $this->update([
                'status' => self::STATUS_PAID,
                'paid_amount' => $this->amount,
                'paid_date' => now(),
            ]);
        } else {
            $this->update([
                'status' => self::STATUS_PARTIAL,
                'paid_amount' => $newPaidAmount,
                'paid_date' => now(),
            ]);
        }
    }

    /**
     * Mark fine as waived
     */
    public function markAsWaived(User $waivedBy, string $reason): void
    {
        $this->update([
            'status' => self::STATUS_WAIVED,
            'waived_by' => $waivedBy->id,
            'waived_date' => now(),
            'waiver_reason' => $reason,
        ]);
    }

    /**
     * Mark fine as overdue
     */
    public function markAsOverdue(): void
    {
        if ($this->status === self::STATUS_PENDING) {
            $this->update(['status' => self::STATUS_OVERDUE]);
        }
    }

    /**
     * Calculate fine amount based on rules
     */
    public static function calculateFineAmount(
        int $daysOverdue,
        float $dailyFineRate,
        int $gracePeriod = 0,
        ?float $maxFine = null,
        ?float $bookCost = null
    ): float {
        if ($daysOverdue <= $gracePeriod) {
            return 0;
        }

        $effectiveDays = $daysOverdue - $gracePeriod;
        $fineAmount = $effectiveDays * $dailyFineRate;

        // Apply maximum fine limit
        if ($maxFine && $fineAmount > $maxFine) {
            $fineAmount = $maxFine;
        }

        // Apply book cost limit
        if ($bookCost && $fineAmount > $bookCost) {
            $fineAmount = $bookCost;
        }

        return $fineAmount;
    }
}