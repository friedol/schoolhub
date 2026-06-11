<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

class FeePayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'student_id',
        'student_fee_id',
        'fee_category_id',
        'amount',
        'currency',
        'payment_method',
        'payment_reference',
        'transaction_id',
        'payment_date',
        'status',
        'processed_by',
        'processed_at',
        'notes',
        'receipt_number',
        'bank_reference',
        'mobile_money_provider',
        'mobile_money_phone',
        'mobile_money_transaction_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date',
        'processed_at' => 'datetime',
    ];

    const PAYMENT_METHOD_CASH = 'cash';
    const PAYMENT_METHOD_BANK_TRANSFER = 'bank_transfer';
    const PAYMENT_METHOD_MOBILE_MONEY = 'mobile_money';
    const PAYMENT_METHOD_CHEQUE = 'cheque';

    const STATUS_PENDING = 'pending';
    const STATUS_PROCESSING = 'processing';
    const STATUS_COMPLETED = 'completed';
    const STATUS_FAILED = 'failed';
    const STATUS_CANCELLED = 'cancelled';

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
     * Get the student fee
     */
    public function studentFee(): BelongsTo
    {
        return $this->belongsTo(StudentFee::class);
    }

    /**
     * Get the fee category
     */
    public function feeCategory(): BelongsTo
    {
        return $this->belongsTo(FeeCategory::class);
    }

    /**
     * Get the user who processed this payment
     */
    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * Get payment method display name
     */
    public function getPaymentMethodDisplayAttribute(): string
    {
        return match($this->payment_method) {
            self::PAYMENT_METHOD_CASH => 'Cash',
            self::PAYMENT_METHOD_BANK_TRANSFER => 'Bank Transfer',
            self::PAYMENT_METHOD_MOBILE_MONEY => 'Mobile Money',
            self::PAYMENT_METHOD_CHEQUE => 'Cheque',
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
            default => 'Unknown'
        };
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
     * Check if payment is mobile money
     */
    public function isMobileMoney(): bool
    {
        return $this->payment_method === self::PAYMENT_METHOD_MOBILE_MONEY;
    }

    /**
     * Get mobile money provider display name
     */
    public function getMobileMoneyProviderDisplayAttribute(): string
    {
        return match($this->mobile_money_provider) {
            'mpesa' => 'M-Pesa',
            'tigopesa' => 'Tigo Pesa',
            'airtelmoney' => 'Airtel Money',
            'halopesa' => 'HaloPesa',
            default => $this->mobile_money_provider ?? 'Unknown'
        };
    }

    /**
     * Generate receipt number
     */
    public static function generateReceiptNumber(School $school): string
    {
        $year = date('Y');
        $count = self::where('school_id', $school->id)
            ->whereYear('payment_date', $year)
            ->count() + 1;

        return $school->code . '/RCP/' . $year . '/' . str_pad($count, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Process payment
     */
    public function processPayment(): void
    {
        $this->status = self::STATUS_COMPLETED;
        $this->processed_at = now();
        $this->processed_by = Auth::id();
        $this->save();

        // Update student fee balance
        if ($this->studentFee) {
            $this->studentFee->paid_amount += $this->amount;
            $this->studentFee->updateStatus();
        }
    }
}
