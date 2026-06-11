<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GoodsReceivedItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'grn_id',
        'inventory_item_id',
        'quantity_ordered',
        'quantity_received',
        'quantity_accepted',
        'quantity_rejected',
        'unit_price',
        'total_value',
        'condition',
        'notes',
    ];

    protected $casts = [
        'quantity_ordered' => 'integer',
        'quantity_received' => 'integer',
        'quantity_accepted' => 'integer',
        'quantity_rejected' => 'integer',
        'unit_price' => 'decimal:2',
        'total_value' => 'decimal:2',
    ];

    // Condition constants
    const CONDITION_GOOD = 'good';
    const CONDITION_DAMAGED = 'damaged';
    const CONDITION_DEFECTIVE = 'defective';

    const CONDITION_OPTIONS = [
        self::CONDITION_GOOD => 'Good',
        self::CONDITION_DAMAGED => 'Damaged',
        self::CONDITION_DEFECTIVE => 'Defective',
    ];

    /**
     * Get the GRN that owns this item
     */
    public function grn(): BelongsTo
    {
        return $this->belongsTo(GoodsReceivedNote::class, 'grn_id');
    }

    /**
     * Get the inventory item
     */
    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    /**
     * Calculate total value
     */
    public function calculateTotalValue(): void
    {
        $this->total_value = $this->quantity_accepted * $this->unit_price;
        $this->save();
    }

    /**
     * Check if there are discrepancies
     */
    public function hasDiscrepancies(): bool
    {
        return $this->quantity_ordered !== $this->quantity_received ||
               $this->quantity_received !== $this->quantity_accepted ||
               $this->quantity_rejected > 0;
    }

    /**
     * Get discrepancy details
     */
    public function getDiscrepancyDetailsAttribute(): array
    {
        $discrepancies = [];

        if ($this->quantity_ordered !== $this->quantity_received) {
            $discrepancies[] = "Ordered: {$this->quantity_ordered}, Received: {$this->quantity_received}";
        }

        if ($this->quantity_received !== $this->quantity_accepted) {
            $discrepancies[] = "Received: {$this->quantity_received}, Accepted: {$this->quantity_accepted}";
        }

        if ($this->quantity_rejected > 0) {
            $discrepancies[] = "Rejected: {$this->quantity_rejected}";
        }

        return $discrepancies;
    }

    /**
     * Boot method to calculate total value
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($item) {
            $item->total_value = $item->quantity_accepted * $item->unit_price;
        });
    }
}



