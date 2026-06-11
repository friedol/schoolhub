<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'student_id',
        'invoice_id',
        'payment_number',
        'amount',
        'payment_method',
        'payment_date',
        'transaction_reference',
        'mobile_money_provider',
        'mobile_money_number',
        'bank_name',
        'bank_reference',
        'receipt_number',
        'status',
        'processed_by',
        'verified_by',
        'verified_at',
        'notes',
        'reconciliation_status',
        'reconciled_at',
        'reconciled_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'datetime',
        'verified_at' => 'datetime',
        'reconciled_at' => 'datetime',
    ];

    const PAYMENT_METHOD_CASH = 'cash';
    const PAYMENT_METHOD_BANK_TRANSFER = 'bank_transfer';
    const PAYMENT_METHOD_MPESA = 'mpesa';
    const PAYMENT_METHOD_TIGO_PESA = 'tigo_pesa';
    const PAYMENT_METHOD_AIRTEL_MONEY = 'airtel_money';
    const PAYMENT_METHOD_HALOPESA = 'halopesa';

    const STATUS_PENDING = 'pending';
    const STATUS_PROCESSING = 'processing';
    const STATUS_COMPLETED = 'completed';
    const STATUS_FAILED = 'failed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_REFUNDED = 'refunded';

    const RECONCILIATION_STATUS_PENDING = 'pending';
    const RECONCILIATION_STATUS_RECONCILED = 'reconciled';
    const RECONCILIATION_STATUS_DISCREPANCY = 'discrepancy';

    /**
     * Get the school this payment belongs to
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
     * Get the user who processed this payment
     */
    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * Get the user who verified this payment
     */
    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Get the user who reconciled this payment
     */
    public function reconciledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reconciled_by');
    }

    /**
     * Get receipts for this payment
     */
    public function receipts(): HasMany
    {
        return $this->hasMany(Receipt::class);
    }

    /**
     * Check if payment is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Check if payment is pending
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if payment is reconciled
     */
    public function isReconciled(): bool
    {
        return $this->reconciliation_status === self::RECONCILIATION_STATUS_RECONCILED;
    }

    /**
     * Get payment method display name
     */
    public function getPaymentMethodDisplayAttribute(): string
    {
        return match($this->payment_method) {
            self::PAYMENT_METHOD_CASH => 'Cash',
            self::PAYMENT_METHOD_BANK_TRANSFER => 'Bank Transfer',
            self::PAYMENT_METHOD_MPESA => 'M-Pesa',
            self::PAYMENT_METHOD_TIGO_PESA => 'Tigo Pesa',
            self::PAYMENT_METHOD_AIRTEL_MONEY => 'Airtel Money',
            self::PAYMENT_METHOD_HALOPESA => 'HaloPesa',
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
            self::STATUS_PROCESSING => 'Processing',
            self::STATUS_COMPLETED => 'Completed',
            self::STATUS_FAILED => 'Failed',
            self::STATUS_CANCELLED => 'Cancelled',
            self::STATUS_REFUNDED => 'Refunded',
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
            self::STATUS_PROCESSING => 'blue',
            self::STATUS_COMPLETED => 'green',
            self::STATUS_FAILED => 'red',
            self::STATUS_CANCELLED => 'gray',
            self::STATUS_REFUNDED => 'orange',
            default => 'gray'
        };
    }

    /**
     * Generate unique payment number
     */
    public static function generatePaymentNumber(): string
    {
        $year = date('Y');
        $month = date('m');
        $lastPayment = self::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();
        
        $sequence = $lastPayment ? (intval(substr($lastPayment->payment_number, -4)) + 1) : 1;
        
        return 'PAY/' . $year . '/' . $month . '/' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Mark payment as completed
     */
    public function markAsCompleted(User $verifiedBy): void
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'verified_by' => $verifiedBy->id,
            'verified_at' => now(),
        ]);
    }

    /**
     * Mark payment as reconciled
     */
    public function markAsReconciled(User $reconciledBy): void
    {
        $this->update([
            'reconciliation_status' => self::RECONCILIATION_STATUS_RECONCILED,
            'reconciled_by' => $reconciledBy->id,
            'reconciled_at' => now(),
        ]);
    }
}



