<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseOrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_order_id',
        'inventory_item_id',
        'quantity',
        'unit_price',
        'total_amount',
        'description',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    /**
     * Get the purchase order that owns this item
     */
    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    /**
     * Get the inventory item
     */
    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    /**
     * Calculate total amount
     */
    public function calculateTotal(): void
    {
        $this->total_amount = $this->quantity * $this->unit_price;
        $this->save();
    }

    /**
     * Get quantity received
     */
    public function getQuantityReceivedAttribute(): int
    {
        return $this->purchaseOrder->goodsReceivedNotes()
            ->join('goods_received_items', 'goods_received_notes.id', '=', 'goods_received_items.grn_id')
            ->where('goods_received_items.inventory_item_id', $this->inventory_item_id)
            ->sum('goods_received_items.quantity_received');
    }

    /**
     * Get remaining quantity to be received
     */
    public function getRemainingQuantityAttribute(): int
    {
        return $this->quantity - $this->quantity_received;
    }

    /**
     * Check if item is fully received
     */
    public function isFullyReceived(): bool
    {
        return $this->remaining_quantity <= 0;
    }

    /**
     * Boot method to calculate total amount
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($item) {
            $item->total_amount = $item->quantity * $item->unit_price;
        });
    }
}



