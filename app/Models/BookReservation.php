<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookReservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'book_id',
        'borrower_id',
        'borrower_type',
        'reservation_date',
        'expiry_date',
        'status',
        'notified_at',
        'fulfilled_at',
        'cancelled_at',
        'cancellation_reason',
        'notes',
    ];

    protected $casts = [
        'reservation_date' => 'datetime',
        'expiry_date' => 'date',
        'notified_at' => 'datetime',
        'fulfilled_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    const BORROWER_TYPE_STUDENT = 'student';
    const BORROWER_TYPE_TEACHER = 'teacher';
    const BORROWER_TYPE_STAFF = 'staff';

    const STATUS_PENDING = 'pending';
    const STATUS_NOTIFIED = 'notified';
    const STATUS_FULFILLED = 'fulfilled';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_EXPIRED = 'expired';

    /**
     * Get the book
     */
    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    /**
     * Get the borrower
     */
    public function borrower(): BelongsTo
    {
        return $this->belongsTo(User::class, 'borrower_id');
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
            self::STATUS_NOTIFIED => 'Notified',
            self::STATUS_FULFILLED => 'Fulfilled',
            self::STATUS_CANCELLED => 'Cancelled',
            self::STATUS_EXPIRED => 'Expired',
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
            self::STATUS_NOTIFIED => 'blue',
            self::STATUS_FULFILLED => 'green',
            self::STATUS_CANCELLED => 'gray',
            self::STATUS_EXPIRED => 'red',
            default => 'gray'
        };
    }

    /**
     * Check if reservation is active
     */
    public function isActive(): bool
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_NOTIFIED]);
    }

    /**
     * Check if reservation is pending
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if reservation is notified
     */
    public function isNotified(): bool
    {
        return $this->status === self::STATUS_NOTIFIED;
    }

    /**
     * Check if reservation is fulfilled
     */
    public function isFulfilled(): bool
    {
        return $this->status === self::STATUS_FULFILLED;
    }

    /**
     * Check if reservation is cancelled
     */
    public function isCancelled(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    /**
     * Check if reservation is expired
     */
    public function isExpired(): bool
    {
        return $this->status === self::STATUS_EXPIRED || 
               ($this->expiry_date && $this->expiry_date < now()->toDateString());
    }

    /**
     * Mark reservation as notified
     */
    public function markAsNotified(): void
    {
        $this->update([
            'status' => self::STATUS_NOTIFIED,
            'notified_at' => now(),
        ]);
    }

    /**
     * Mark reservation as fulfilled
     */
    public function markAsFulfilled(): void
    {
        $this->update([
            'status' => self::STATUS_FULFILLED,
            'fulfilled_at' => now(),
        ]);
    }

    /**
     * Mark reservation as cancelled
     */
    public function markAsCancelled(string $reason = null): void
    {
        $this->update([
            'status' => self::STATUS_CANCELLED,
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
        ]);
    }

    /**
     * Mark reservation as expired
     */
    public function markAsExpired(): void
    {
        $this->update(['status' => self::STATUS_EXPIRED]);
    }

    /**
     * Check if book can be reserved by user
     */
    public static function canReserve(int $bookId, int $borrowerId): bool
    {
        // Check if user already has an active reservation for this book
        $existingReservation = self::where('book_id', $bookId)
            ->where('borrower_id', $borrowerId)
            ->whereIn('status', [self::STATUS_PENDING, self::STATUS_NOTIFIED])
            ->exists();

        if ($existingReservation) {
            return false;
        }

        // Check if user has reached maximum reservation limit
        $activeReservations = self::where('borrower_id', $borrowerId)
            ->whereIn('status', [self::STATUS_PENDING, self::STATUS_NOTIFIED])
            ->count();

        // Assuming max 3 reservations per user (configurable)
        return $activeReservations < 3;
    }
}



