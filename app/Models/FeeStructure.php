<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeeStructure extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'fee_item_id',
        'school_class_id',
        'academic_year',
        'term',
        'amount',
        'day_student_amount',
        'boarding_student_amount',
        'stream_specific_amount',
        'transport_route_specific_amount',
        'effective_date',
        'expiry_date',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'day_student_amount' => 'decimal:2',
        'boarding_student_amount' => 'decimal:2',
        'stream_specific_amount' => 'decimal:2',
        'transport_route_specific_amount' => 'decimal:2',
        'effective_date' => 'date',
        'expiry_date' => 'date',
        'is_active' => 'boolean',
    ];

    const TERM_FIRST = 'first';
    const TERM_SECOND = 'second';
    const TERM_THIRD = 'third';
    const TERM_ANNUAL = 'annual';

    /**
     * Get the school this fee structure belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the fee item
     */
    public function feeItem(): BelongsTo
    {
        return $this->belongsTo(FeeItem::class);
    }

    /**
     * Get the school class
     */
    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class);
    }

    /**
     * Get the user who created this fee structure
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get student fees for this fee structure
     */
    public function studentFees(): HasMany
    {
        return $this->hasMany(StudentFee::class);
    }

    /**
     * Get term display name
     */
    public function getTermDisplayAttribute(): string
    {
        return match($this->term) {
            self::TERM_FIRST => 'First Term',
            self::TERM_SECOND => 'Second Term',
            self::TERM_THIRD => 'Third Term',
            self::TERM_ANNUAL => 'Annual',
            default => 'Unknown'
        };
    }

    /**
     * Check if fee structure is active
     */
    public function isActive(): bool
    {
        return $this->is_active && 
               $this->effective_date <= now() && 
               ($this->expiry_date === null || $this->expiry_date >= now());
    }

    /**
     * Get amount for specific student type
     */
    public function getAmountForStudentType(string $studentType): float
    {
        return match($studentType) {
            'day' => $this->day_student_amount ?? $this->amount,
            'boarding' => $this->boarding_student_amount ?? $this->amount,
            default => $this->amount
        };
    }

    /**
     * Calculate total amount with additional fees
     */
    public function getTotalAmount(string $studentType = 'day', array $additionalFees = []): float
    {
        $baseAmount = $this->getAmountForStudentType($studentType);
        $additionalAmount = array_sum($additionalFees);
        return $baseAmount + $additionalAmount;
    }
}



