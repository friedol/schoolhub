<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BookCopy extends Model
{
    use HasFactory;

    protected $fillable = [
        'book_id',
        'copy_number',
        'barcode',
        'qr_code',
        'status',
        'condition',
        'purchase_date',
        'purchase_price',
        'notes',
        'last_inspection_date',
        'last_inspection_by',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'purchase_price' => 'decimal:2',
        'last_inspection_date' => 'date',
    ];

    const STATUS_AVAILABLE = 'available';
    const STATUS_ISSUED = 'issued';
    const STATUS_LOST = 'lost';
    const STATUS_DAMAGED = 'damaged';
    const STATUS_UNDER_REPAIR = 'under_repair';
    const STATUS_WITHDRAWN = 'withdrawn';

    const CONDITION_EXCELLENT = 'excellent';
    const CONDITION_GOOD = 'good';
    const CONDITION_FAIR = 'fair';
    const CONDITION_POOR = 'poor';
    const CONDITION_DAMAGED = 'damaged';

    /**
     * Get the book this copy belongs to
     */
    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    /**
     * Get the user who last inspected this copy
     */
    public function lastInspectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'last_inspection_by');
    }

    /**
     * Get issuances for this copy
     */
    public function issuances(): HasMany
    {
        return $this->hasMany(BookIssuance::class);
    }

    /**
     * Get current issuance
     */
    public function currentIssuance(): HasMany
    {
        return $this->hasMany(BookIssuance::class)->whereNull('return_date');
    }

    /**
     * Get status display name
     */
    public function getStatusDisplayAttribute(): string
    {
        return match($this->status) {
            self::STATUS_AVAILABLE => 'Available',
            self::STATUS_ISSUED => 'Issued',
            self::STATUS_LOST => 'Lost',
            self::STATUS_DAMAGED => 'Damaged',
            self::STATUS_UNDER_REPAIR => 'Under Repair',
            self::STATUS_WITHDRAWN => 'Withdrawn',
            default => 'Unknown'
        };
    }

    /**
     * Get condition display name
     */
    public function getConditionDisplayAttribute(): string
    {
        return match($this->condition) {
            self::CONDITION_EXCELLENT => 'Excellent',
            self::CONDITION_GOOD => 'Good',
            self::CONDITION_FAIR => 'Fair',
            self::CONDITION_POOR => 'Poor',
            self::CONDITION_DAMAGED => 'Damaged',
            default => 'Unknown'
        };
    }

    /**
     * Get status color for UI
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            self::STATUS_AVAILABLE => 'green',
            self::STATUS_ISSUED => 'blue',
            self::STATUS_LOST => 'red',
            self::STATUS_DAMAGED => 'orange',
            self::STATUS_UNDER_REPAIR => 'yellow',
            self::STATUS_WITHDRAWN => 'gray',
            default => 'gray'
        };
    }

    /**
     * Get condition color for UI
     */
    public function getConditionColorAttribute(): string
    {
        return match($this->condition) {
            self::CONDITION_EXCELLENT => 'green',
            self::CONDITION_GOOD => 'blue',
            self::CONDITION_FAIR => 'yellow',
            self::CONDITION_POOR => 'orange',
            self::CONDITION_DAMAGED => 'red',
            default => 'gray'
        };
    }

    /**
     * Check if copy is available
     */
    public function isAvailable(): bool
    {
        return $this->status === self::STATUS_AVAILABLE;
    }

    /**
     * Check if copy is issued
     */
    public function isIssued(): bool
    {
        return $this->status === self::STATUS_ISSUED;
    }

    /**
     * Check if copy is lost
     */
    public function isLost(): bool
    {
        return $this->status === self::STATUS_LOST;
    }

    /**
     * Check if copy is damaged
     */
    public function isDamaged(): bool
    {
        return $this->status === self::STATUS_DAMAGED;
    }

    /**
     * Generate unique barcode
     */
    public static function generateBarcode(): string
    {
        do {
            $barcode = 'BC' . date('Y') . str_pad(rand(1, 999999), 6, '0', STR_PAD_LEFT);
        } while (self::where('barcode', $barcode)->exists());
        
        return $barcode;
    }

    /**
     * Generate unique QR code
     */
    public static function generateQRCode(): string
    {
        do {
            $qrCode = 'QR' . date('Y') . str_pad(rand(1, 999999), 6, '0', STR_PAD_LEFT);
        } while (self::where('qr_code', $qrCode)->exists());
        
        return $qrCode;
    }

    /**
     * Mark copy as available
     */
    public function markAsAvailable(): void
    {
        $this->update(['status' => self::STATUS_AVAILABLE]);
    }

    /**
     * Mark copy as issued
     */
    public function markAsIssued(): void
    {
        $this->update(['status' => self::STATUS_ISSUED]);
    }

    /**
     * Mark copy as lost
     */
    public function markAsLost(): void
    {
        $this->update(['status' => self::STATUS_LOST]);
    }

    /**
     * Mark copy as damaged
     */
    public function markAsDamaged(): void
    {
        $this->update(['status' => self::STATUS_DAMAGED]);
    }

    /**
     * Mark copy as under repair
     */
    public function markAsUnderRepair(): void
    {
        $this->update(['status' => self::STATUS_UNDER_REPAIR]);
    }

    /**
     * Mark copy as withdrawn
     */
    public function markAsWithdrawn(): void
    {
        $this->update(['status' => self::STATUS_WITHDRAWN]);
    }
}



