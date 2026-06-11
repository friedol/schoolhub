<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookRenewal extends Model
{
    use HasFactory;

    protected $fillable = [
        'book_issuance_id',
        'renewal_date',
        'new_due_date',
        'renewal_reason',
        'renewed_by',
        'approved_by',
        'notes',
    ];

    protected $casts = [
        'renewal_date' => 'datetime',
        'new_due_date' => 'date',
    ];

    const RENEWAL_REASON_EXTENDED_STUDY = 'extended_study';
    const RENEWAL_REASON_ACADEMIC_PROJECT = 'academic_project';
    const RENEWAL_REASON_PERSONAL = 'personal';
    const RENEWAL_REASON_OTHER = 'other';

    /**
     * Get the book issuance
     */
    public function bookIssuance(): BelongsTo
    {
        return $this->belongsTo(BookIssuance::class);
    }

    /**
     * Get the user who requested the renewal
     */
    public function renewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'renewed_by');
    }

    /**
     * Get the user who approved the renewal
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get renewal reason display name
     */
    public function getRenewalReasonDisplayAttribute(): string
    {
        return match($this->renewal_reason) {
            self::RENEWAL_REASON_EXTENDED_STUDY => 'Extended Study',
            self::RENEWAL_REASON_ACADEMIC_PROJECT => 'Academic Project',
            self::RENEWAL_REASON_PERSONAL => 'Personal',
            self::RENEWAL_REASON_OTHER => 'Other',
            default => 'Unknown'
        };
    }

    /**
     * Calculate renewal period in days
     */
    public function getRenewalPeriodAttribute(): int
    {
        return $this->renewal_date->diffInDays($this->new_due_date);
    }

    /**
     * Check if renewal is approved
     */
    public function isApproved(): bool
    {
        return $this->approved_by !== null;
    }

    /**
     * Approve renewal
     */
    public function approve(User $approvedBy): void
    {
        $this->update(['approved_by' => $approvedBy->id]);
    }
}



