<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Promotion extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'from_class_id',
        'to_class_id',
        'from_academic_year',
        'to_academic_year',
        'promotion_date',
        'promotion_type',
        'reason',
        'promoted_by',
        'notes',
    ];

    protected $casts = [
        'promotion_date' => 'date',
    ];

    const PROMOTION_TYPE_REGULAR = 'regular';
    const PROMOTION_TYPE_REPEAT = 'repeat';
    const PROMOTION_TYPE_ACCELERATED = 'accelerated';
    const PROMOTION_TYPE_TRANSFER = 'transfer';
    const PROMOTION_TYPE_GRADUATION = 'graduation';

    /**
     * Get the student
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the from class
     */
    public function fromClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'from_class_id');
    }

    /**
     * Get the to class
     */
    public function toClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'to_class_id');
    }

    /**
     * Get the user who promoted the student
     */
    public function promotedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'promoted_by');
    }

    /**
     * Get promotion type display name
     */
    public function getPromotionTypeDisplayAttribute(): string
    {
        return match($this->promotion_type) {
            self::PROMOTION_TYPE_REGULAR => 'Regular Promotion',
            self::PROMOTION_TYPE_REPEAT => 'Repeat Class',
            self::PROMOTION_TYPE_ACCELERATED => 'Accelerated Promotion',
            self::PROMOTION_TYPE_TRANSFER => 'Transfer',
            self::PROMOTION_TYPE_GRADUATION => 'Graduation',
            default => 'Unknown'
        };
    }

    /**
     * Check if this is a graduation
     */
    public function isGraduation(): bool
    {
        return $this->promotion_type === self::PROMOTION_TYPE_GRADUATION;
    }

    /**
     * Check if this is a repeat
     */
    public function isRepeat(): bool
    {
        return $this->promotion_type === self::PROMOTION_TYPE_REPEAT;
    }
}



