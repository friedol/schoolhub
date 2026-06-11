<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BookIssuance extends Model
{
    use HasFactory;

    protected $fillable = [
        'book_id',
        'book_copy_id',
        'borrower_id',
        'borrower_type',
        'issue_date',
        'due_date',
        'return_date',
        'status',
        'issued_by',
        'returned_by',
        'renewal_count',
        'notes',
        'fine_amount',
        'fine_paid',
        'fine_paid_date',
    ];

    protected $casts = [
        'issue_date' => 'datetime',
        'due_date' => 'date',
        'return_date' => 'datetime',
        'fine_amount' => 'decimal:2',
        'fine_paid' => 'decimal:2',
        'fine_paid_date' => 'datetime',
    ];

    const BORROWER_TYPE_STUDENT = 'student';
    const BORROWER_TYPE_TEACHER = 'teacher';
    const BORROWER_TYPE_STAFF = 'staff';

    const STATUS_ISSUED = 'issued';
    const STATUS_RETURNED = 'returned';
    const STATUS_OVERDUE = 'overdue';
    const STATUS_LOST = 'lost';
    const STATUS_DAMAGED = 'damaged';

    /**
     * Get the book
     */
    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    /**
     * Get the book copy
     */
    public function bookCopy(): BelongsTo
    {
        return $this->belongsTo(BookCopy::class);
    }

    /**
     * Get the borrower (student, teacher, or staff)
     */
    public function borrower(): BelongsTo
    {
        return $this->belongsTo(User::class, 'borrower_id');
    }

    /**
     * Get the user who issued the book
     */
    public function issuedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    /**
     * Get the user who processed the return
     */
    public function returnedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'returned_by');
    }

    /**
     * Get fine records for this issuance
     */
    public function fines(): HasMany
    {
        return $this->hasMany(LibraryFine::class);
    }

    /**
     * Get renewals for this issuance
     */
    public function renewals(): HasMany
    {
        return $this->hasMany(BookRenewal::class);
    }

    /**
     * Get borrower type display name
     */
    public function getBorrowerTypeDisplayAttribute(): string
    {
        return match($this->borrower_type) {
            self::BORROWER_TYPE_STUDENT => 'Student',
            self::BORROWER_TYPE_TEACHER => 'Teacher',
            self::BORROWER_TYPE_STAFF => 'Staff',
            default => 'Unknown'
        };
    }

    /**
     * Get status display name
     */
    public function getStatusDisplayAttribute(): string
    {
        return match($this->status) {
            self::STATUS_ISSUED => 'Issued',
            self::STATUS_RETURNED => 'Returned',
            self::STATUS_OVERDUE => 'Overdue',
            self::STATUS_LOST => 'Lost',
            self::STATUS_DAMAGED => 'Damaged',
            default => 'Unknown'
        };
    }

    /**
     * Get status color for UI
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            self::STATUS_ISSUED => 'blue',
            self::STATUS_RETURNED => 'green',
            self::STATUS_OVERDUE => 'red',
            self::STATUS_LOST => 'red',
            self::STATUS_DAMAGED => 'orange',
            default => 'gray'
        };
    }

    /**
     * Check if issuance is active (not returned)
     */
    public function isActive(): bool
    {
        return $this->status === self::STATUS_ISSUED;
    }

    /**
     * Check if issuance is overdue
     */
    public function isOverdue(): bool
    {
        return $this->status === self::STATUS_OVERDUE || 
               ($this->status === self::STATUS_ISSUED && $this->due_date < now()->toDateString());
    }

    /**
     * Check if issuance is returned
     */
    public function isReturned(): bool
    {
        return $this->status === self::STATUS_RETURNED;
    }

    /**
     * Calculate days overdue
     */
    public function getDaysOverdueAttribute(): int
    {
        if (!$this->isOverdue()) {
            return 0;
        }
        
        $overdueDate = $this->return_date ? $this->return_date : now();
        return $overdueDate->diffInDays($this->due_date);
    }

    /**
     * Calculate total fine amount
     */
    public function getTotalFineAmountAttribute(): float
    {
        return $this->fines()->sum('amount');
    }

    /**
     * Calculate outstanding fine amount
     */
    public function getOutstandingFineAmountAttribute(): float
    {
        return $this->total_fine_amount - $this->fine_paid;
    }

    /**
     * Check if fine is fully paid
     */
    public function isFinePaid(): bool
    {
        return $this->outstanding_fine_amount <= 0;
    }

    /**
     * Mark issuance as returned
     */
    public function markAsReturned(User $returnedBy, ?string $notes = null): void
    {
        $this->update([
            'status' => self::STATUS_RETURNED,
            'return_date' => now(),
            'returned_by' => $returnedBy->id,
            'notes' => $notes,
        ]);

        // Update book copy status
        if ($this->bookCopy) {
            $this->bookCopy->markAsAvailable();
        }
    }

    /**
     * Mark issuance as overdue
     */
    public function markAsOverdue(): void
    {
        if ($this->status === self::STATUS_ISSUED) {
            $this->update(['status' => self::STATUS_OVERDUE]);
        }
    }

    /**
     * Mark issuance as lost
     */
    public function markAsLost(User $processedBy, ?string $notes = null): void
    {
        $this->update([
            'status' => self::STATUS_LOST,
            'return_date' => now(),
            'returned_by' => $processedBy->id,
            'notes' => $notes,
        ]);

        // Update book copy status
        if ($this->bookCopy) {
            $this->bookCopy->markAsLost();
        }
    }

    /**
     * Mark issuance as damaged
     */
    public function markAsDamaged(User $processedBy, ?string $notes = null): void
    {
        $this->update([
            'status' => self::STATUS_DAMAGED,
            'return_date' => now(),
            'returned_by' => $processedBy->id,
            'notes' => $notes,
        ]);

        // Update book copy status
        if ($this->bookCopy) {
            $this->bookCopy->markAsDamaged();
        }
    }

    /**
     * Renew the issuance
     */
    public function renew(User $renewedBy, int $additionalDays = 14): void
    {
        $newDueDate = $this->due_date->addDays($additionalDays);
        
        $this->update([
            'due_date' => $newDueDate,
            'renewal_count' => $this->renewal_count + 1,
        ]);

        // Create renewal record
        BookRenewal::create([
            'book_issuance_id' => $this->id,
            'renewal_date' => now(),
            'new_due_date' => $newDueDate,
            'renewed_by' => $renewedBy->id,
        ]);
    }
}