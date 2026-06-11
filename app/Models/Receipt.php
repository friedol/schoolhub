<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Receipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'student_id',
        'payment_id',
        'receipt_number',
        'receipt_date',
        'amount',
        'payment_method',
        'transaction_reference',
        'fee_breakdown',
        'balance_carried_forward',
        'is_duplicate',
        'duplicate_of',
        'generated_by',
        'printed_at',
        'language',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'receipt_date' => 'date',
        'fee_breakdown' => 'array',
        'balance_carried_forward' => 'decimal:2',
        'is_duplicate' => 'boolean',
        'printed_at' => 'datetime',
    ];

    const LANGUAGE_ENGLISH = 'english';
    const LANGUAGE_SWAHILI = 'swahili';

    /**
     * Get the school this receipt belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the student
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the payment
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    /**
     * Get the user who generated this receipt
     */
    public function generatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    /**
     * Get the original receipt if this is a duplicate
     */
    public function originalReceipt(): BelongsTo
    {
        return $this->belongsTo(Receipt::class, 'duplicate_of');
    }

    /**
     * Get duplicate receipts
     */
    public function duplicates()
    {
        return $this->hasMany(Receipt::class, 'duplicate_of');
    }

    /**
     * Check if receipt is a duplicate
     */
    public function isDuplicate(): bool
    {
        return $this->is_duplicate;
    }

    /**
     * Check if receipt has been printed
     */
    public function isPrinted(): bool
    {
        return $this->printed_at !== null;
    }

    /**
     * Mark receipt as printed
     */
    public function markAsPrinted(): void
    {
        $this->update(['printed_at' => now()]);
    }

    /**
     * Get language display name
     */
    public function getLanguageDisplayAttribute(): string
    {
        return match($this->language) {
            self::LANGUAGE_ENGLISH => 'English',
            self::LANGUAGE_SWAHILI => 'Kiswahili',
            default => 'English'
        };
    }

    /**
     * Generate unique receipt number
     */
    public static function generateReceiptNumber(): string
    {
        $year = date('Y');
        $month = date('m');
        $lastReceipt = self::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();
        
        $sequence = $lastReceipt ? (intval(substr($lastReceipt->receipt_number, -4)) + 1) : 1;
        
        return 'RCP/' . $year . '/' . $month . '/' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Create a duplicate receipt
     */
    public function createDuplicate(User $generatedBy): Receipt
    {
        return self::create([
            'school_id' => $this->school_id,
            'student_id' => $this->student_id,
            'payment_id' => $this->payment_id,
            'receipt_number' => self::generateReceiptNumber(),
            'receipt_date' => $this->receipt_date,
            'amount' => $this->amount,
            'payment_method' => $this->payment_method,
            'transaction_reference' => $this->transaction_reference,
            'fee_breakdown' => $this->fee_breakdown,
            'balance_carried_forward' => $this->balance_carried_forward,
            'is_duplicate' => true,
            'duplicate_of' => $this->id,
            'generated_by' => $generatedBy->id,
            'language' => $this->language,
        ]);
    }
}



