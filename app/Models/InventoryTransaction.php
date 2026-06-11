<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'inventory_item_id',
        'transaction_type',
        'quantity',
        'unit_cost',
        'total_cost',
        'reason',
        'reference_number',
        'performed_by',
        'approved_by',
        'transaction_date',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'transaction_date' => 'date',
    ];

    const TYPE_IN = 'in';
    const TYPE_OUT = 'out';
    const TYPE_ADJUSTMENT = 'adjustment';
    const TYPE_TRANSFER = 'transfer';

    /**
     * Get the school this transaction belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the inventory item
     */
    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    /**
     * Get the user who performed this transaction
     */
    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    /**
     * Get the user who approved this transaction
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get transaction type display name
     */
    public function getTransactionTypeDisplayAttribute(): string
    {
        return match($this->transaction_type) {
            self::TYPE_IN => 'Stock In',
            self::TYPE_OUT => 'Stock Out',
            self::TYPE_ADJUSTMENT => 'Adjustment',
            self::TYPE_TRANSFER => 'Transfer',
            default => 'Unknown'
        };
    }

    /**
     * Check if transaction is stock in
     */
    public function isStockIn(): bool
    {
        return $this->transaction_type === self::TYPE_IN;
    }

    /**
     * Check if transaction is stock out
     */
    public function isStockOut(): bool
    {
        return $this->transaction_type === self::TYPE_OUT;
    }

    /**
     * Calculate total cost
     */
    public function calculateTotalCost(): float
    {
        return $this->quantity * $this->unit_cost;
    }

    /**
     * Generate reference number
     */
    public static function generateReferenceNumber(School $school, string $type): string
    {
        $prefix = strtoupper($type);
        $year = date('Y');
        $count = self::where('school_id', $school->id)
            ->where('transaction_type', $type)
            ->whereYear('transaction_date', $year)
            ->count() + 1;

        return $school->code . '/' . $prefix . '/' . $year . '/' . str_pad($count, 4, '0', STR_PAD_LEFT);
    }
}
