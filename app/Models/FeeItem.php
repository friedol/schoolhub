<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeeItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'name',
        'description',
        'category',
        'is_mandatory',
        'is_refundable',
        'is_taxable',
        'tax_rate',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'is_mandatory' => 'boolean',
        'is_refundable' => 'boolean',
        'is_taxable' => 'boolean',
        'tax_rate' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    const CATEGORY_TUITION = 'tuition';
    const CATEGORY_DEVELOPMENT = 'development';
    const CATEGORY_LABORATORY = 'laboratory';
    const CATEGORY_LIBRARY = 'library';
    const CATEGORY_SPORTS = 'sports';
    const CATEGORY_EXAMINATION = 'examination';
    const CATEGORY_LUNCH = 'lunch';
    const CATEGORY_HOSTEL = 'hostel';
    const CATEGORY_TRANSPORT = 'transport';
    const CATEGORY_STATIONERY = 'stationery';
    const CATEGORY_CAUTION = 'caution';
    const CATEGORY_OTHER = 'other';

    /**
     * Get the school this fee item belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the user who created this fee item
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get fee structures for this fee item
     */
    public function feeStructures(): HasMany
    {
        return $this->hasMany(FeeStructure::class);
    }

    /**
     * Get student fees for this fee item
     */
    public function studentFees(): HasMany
    {
        return $this->hasMany(StudentFee::class);
    }

    /**
     * Get category display name
     */
    public function getCategoryDisplayAttribute(): string
    {
        return match($this->category) {
            self::CATEGORY_TUITION => 'Tuition Fees',
            self::CATEGORY_DEVELOPMENT => 'Development Levy',
            self::CATEGORY_LABORATORY => 'Laboratory Fees',
            self::CATEGORY_LIBRARY => 'Library Fees',
            self::CATEGORY_SPORTS => 'Sports Fees',
            self::CATEGORY_EXAMINATION => 'Examination Fees',
            self::CATEGORY_LUNCH => 'Lunch Program Fees',
            self::CATEGORY_HOSTEL => 'Hostel/Boarding Fees',
            self::CATEGORY_TRANSPORT => 'Transport Fees',
            self::CATEGORY_STATIONERY => 'Stationery & Uniform Fees',
            self::CATEGORY_CAUTION => 'Caution Money',
            self::CATEGORY_OTHER => 'Other Fees',
            default => 'Unknown'
        };
    }

    /**
     * Check if fee item is active
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Check if fee item is mandatory
     */
    public function isMandatory(): bool
    {
        return $this->is_mandatory;
    }

    /**
     * Check if fee item is refundable
     */
    public function isRefundable(): bool
    {
        return $this->is_refundable;
    }
}



