<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IssueNoteItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'issue_note_id',
        'inventory_item_id',
        'quantity_issued',
        'unit_price',
        'total_value',
        'condition',
        'notes',
    ];

    protected $casts = [
        'quantity_issued' => 'integer',
        'unit_price' => 'decimal:2',
        'total_value' => 'decimal:2',
    ];

    // Condition constants
    const CONDITION_GOOD = 'good';
    const CONDITION_FAIR = 'fair';
    const CONDITION_POOR = 'poor';

    const CONDITION_OPTIONS = [
        self::CONDITION_GOOD => 'Good',
        self::CONDITION_FAIR => 'Fair',
        self::CONDITION_POOR => 'Poor',
    ];

    /**
     * Get the issue note that owns this item
     */
    public function issueNote(): BelongsTo
    {
        return $this->belongsTo(IssueNote::class);
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
        $this->total_value = $this->quantity_issued * $this->unit_price;
        $this->save();
    }

    /**
     * Boot method to calculate total value
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($item) {
            $item->total_value = $item->quantity_issued * $item->unit_price;
        });
    }
}



