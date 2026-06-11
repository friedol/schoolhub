<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeeCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'name',
        'description',
        'amount',
        'currency',
        'payment_frequency',
        'due_date',
        'is_mandatory',
        'is_active',
        'settings',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'due_date' => 'date',
        'is_mandatory' => 'boolean',
        'is_active' => 'boolean',
        'settings' => 'array',
    ];

    /**
     * Get the school this fee category belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get fee payments for this category
     */
    public function payments(): HasMany
    {
        return $this->hasMany(FeePayment::class);
    }

    /**
     * Get student fee records for this category
     */
    public function studentFees(): HasMany
    {
        return $this->hasMany(StudentFee::class);
    }

    /**
     * Get payment frequency display name
     */
    public function getPaymentFrequencyDisplayAttribute(): string
    {
        return match($this->payment_frequency) {
            'once' => 'One Time Payment',
            'monthly' => 'Monthly',
            'termly' => 'Per Term',
            'yearly' => 'Per Year',
            'semester' => 'Per Semester',
            default => 'Custom'
        };
    }

    /**
     * Check if fee is overdue
     */
    public function isOverdue(): bool
    {
        return $this->due_date < now()->toDateString();
    }

    /**
     * Get total collected amount for this fee category
     */
    public function getTotalCollectedAttribute(): float
    {
        return $this->payments()->where('status', 'completed')->sum('amount');
    }

    /**
     * Get total pending amount for this fee category
     */
    public function getTotalPendingAttribute(): float
    {
        return $this->studentFees()->where('status', 'pending')->sum('amount');
    }

    /**
     * Get collection rate percentage
     */
    public function getCollectionRateAttribute(): float
    {
        $totalExpected = $this->studentFees()->sum('amount');
        $totalCollected = $this->total_collected;
        
        return $totalExpected > 0 ? round(($totalCollected / $totalExpected) * 100, 2) : 0;
    }
}
