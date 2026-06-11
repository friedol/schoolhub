<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_application_id',
        'amount',
        'payment_method',
        'transaction_id',
        'payment_reference',
        'status',
        'paid_at',
        'verified_at',
        'verified_by',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'verified_at' => 'datetime',
    ];

    const PAYMENT_METHOD_CASH = 'cash';
    const PAYMENT_METHOD_BANK = 'bank';
    const PAYMENT_METHOD_MPESA = 'mpesa';
    const PAYMENT_METHOD_TIGOPESA = 'tigopesa';
    const PAYMENT_METHOD_AIRTELMONEY = 'airtelmoney';
    const PAYMENT_METHOD_HALOPESA = 'halopesa';

    const STATUS_PENDING = 'pending';
    const STATUS_PAID = 'paid';
    const STATUS_VERIFIED = 'verified';
    const STATUS_FAILED = 'failed';
    const STATUS_REFUNDED = 'refunded';

    /**
     * Get the student application this payment belongs to
     */
    public function studentApplication(): BelongsTo
    {
        return $this->belongsTo(StudentApplication::class);
    }

    /**
     * Get the user who verified this payment
     */
    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Check if payment is verified
     */
    public function isVerified(): bool
    {
        return $this->status === self::STATUS_VERIFIED;
    }

    /**
     * Check if payment is paid
     */
    public function isPaid(): bool
    {
        return in_array($this->status, [self::STATUS_PAID, self::STATUS_VERIFIED]);
    }

    /**
     * Get payment method display name
     */
    public function getPaymentMethodDisplayAttribute(): string
    {
        return match($this->payment_method) {
            self::PAYMENT_METHOD_CASH => 'Cash',
            self::PAYMENT_METHOD_BANK => 'Bank Transfer',
            self::PAYMENT_METHOD_MPESA => 'M-Pesa',
            self::PAYMENT_METHOD_TIGOPESA => 'Tigo Pesa',
            self::PAYMENT_METHOD_AIRTELMONEY => 'Airtel Money',
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
            self::STATUS_PAID => 'Paid',
            self::STATUS_VERIFIED => 'Verified',
            self::STATUS_FAILED => 'Failed',
            self::STATUS_REFUNDED => 'Refunded',
            default => 'Unknown'
        };
    }
}



