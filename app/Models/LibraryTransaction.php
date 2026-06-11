<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LibraryTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'transaction_type',
        'book_id',
        'book_copy_id',
        'borrower_id',
        'borrower_type',
        'transaction_date',
        'due_date',
        'return_date',
        'fine_amount',
        'status',
        'processed_by',
        'notes',
        'related_transaction_id',
    ];

    protected $casts = [
        'transaction_date' => 'datetime',
        'due_date' => 'date',
        'return_date' => 'datetime',
        'fine_amount' => 'decimal:2',
    ];

    const TRANSACTION_TYPE_ISSUE = 'issue';
    const TRANSACTION_TYPE_RETURN = 'return';
    const TRANSACTION_TYPE_RENEWAL = 'renewal';
    const TRANSACTION_TYPE_RESERVATION = 'reservation';
    const TRANSACTION_TYPE_FINE = 'fine';
    const TRANSACTION_TYPE_LOST = 'lost';
    const TRANSACTION_TYPE_DAMAGED = 'damaged';

    const BORROWER_TYPE_STUDENT = 'student';
    const BORROWER_TYPE_TEACHER = 'teacher';
    const BORROWER_TYPE_STAFF = 'staff';

    const STATUS_PENDING = 'pending';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_OVERDUE = 'overdue';

    /**
     * Get the school
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

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
     * Get the borrower
     */
    public function borrower(): BelongsTo
    {
        return $this->belongsTo(User::class, 'borrower_id');
    }

    /**
     * Get the user who processed this transaction
     */
    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * Get the related transaction
     */
    public function relatedTransaction(): BelongsTo
    {
        return $this->belongsTo(LibraryTransaction::class, 'related_transaction_id');
    }

    /**
     * Get transaction type display name
     */
    public function getTransactionTypeDisplayAttribute(): string
    {
        return match($this->transaction_type) {
            self::TRANSACTION_TYPE_ISSUE => 'Issue',
            self::TRANSACTION_TYPE_RETURN => 'Return',
            self::TRANSACTION_TYPE_RENEWAL => 'Renewal',
            self::TRANSACTION_TYPE_RESERVATION => 'Reservation',
            self::TRANSACTION_TYPE_FINE => 'Fine',
            self::TRANSACTION_TYPE_LOST => 'Lost',
            self::TRANSACTION_TYPE_DAMAGED => 'Damaged',
            default => 'Unknown'
        };
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
            self::STATUS_PENDING => 'Pending',
            self::STATUS_COMPLETED => 'Completed',
            self::STATUS_CANCELLED => 'Cancelled',
            self::STATUS_OVERDUE => 'Overdue',
            default => 'Unknown'
        };
    }

    /**
     * Get transaction type color for UI
     */
    public function getTransactionTypeColorAttribute(): string
    {
        return match($this->transaction_type) {
            self::TRANSACTION_TYPE_ISSUE => 'blue',
            self::TRANSACTION_TYPE_RETURN => 'green',
            self::TRANSACTION_TYPE_RENEWAL => 'yellow',
            self::TRANSACTION_TYPE_RESERVATION => 'purple',
            self::TRANSACTION_TYPE_FINE => 'red',
            self::TRANSACTION_TYPE_LOST => 'red',
            self::TRANSACTION_TYPE_DAMAGED => 'orange',
            default => 'gray'
        };
    }

    /**
     * Get status color for UI
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            self::STATUS_PENDING => 'yellow',
            self::STATUS_COMPLETED => 'green',
            self::STATUS_CANCELLED => 'gray',
            self::STATUS_OVERDUE => 'red',
            default => 'gray'
        };
    }

    /**
     * Check if transaction is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Check if transaction is pending
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if transaction is overdue
     */
    public function isOverdue(): bool
    {
        return $this->status === self::STATUS_OVERDUE || 
               ($this->due_date && $this->due_date < now()->toDateString() && !$this->return_date);
    }

    /**
     * Mark transaction as completed
     */
    public function markAsCompleted(): void
    {
        $this->update(['status' => self::STATUS_COMPLETED]);
    }

    /**
     * Mark transaction as cancelled
     */
    public function markAsCancelled(): void
    {
        $this->update(['status' => self::STATUS_CANCELLED]);
    }

    /**
     * Mark transaction as overdue
     */
    public function markAsOverdue(): void
    {
        if ($this->status === self::STATUS_PENDING) {
            $this->update(['status' => self::STATUS_OVERDUE]);
        }
    }

    /**
     * Create a related transaction
     */
    public function createRelatedTransaction(array $data): self
    {
        $data['related_transaction_id'] = $this->id;
        $data['school_id'] = $this->school_id;
        
        return self::create($data);
    }
}



