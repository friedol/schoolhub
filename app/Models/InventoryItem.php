<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;

class InventoryItem extends Model
{
    use HasFactory;

    const TYPE_CONSUMABLE = 'consumable';
    const TYPE_ASSET = 'asset';

    const UNIT_OPTIONS = [
        'each' => 'Each',
        'box' => 'Box',
        'pack' => 'Pack',
        'kg' => 'Kilogram',
        'liter' => 'Liter',
        'meter' => 'Meter',
        'roll' => 'Roll',
        'set' => 'Set',
    ];

    protected $fillable = [
        'school_id',
        'category_id',
        'item_code',
        'name',
        'description',
        'item_type',
        'manufacturer',
        'model',
        'serial_number',
        'unit_of_measure',
        'cost_price',
        'unit_cost',
        'replacement_value',
        'supplier_id',
        'current_stock',
        'min_stock_level',
        'reorder_level',
        'max_stock_level',
        'location',
        'shelf_location',
        'barcode',
        'qr_code',
        'batch_number',
        'expiry_date',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'current_stock' => 'integer',
        'min_stock_level' => 'integer',
        'reorder_level' => 'integer',
        'max_stock_level' => 'integer',
        'cost_price' => 'decimal:2',
        'replacement_value' => 'decimal:2',
        'expiry_date' => 'date',
        'is_active' => 'boolean',
    ];

    protected $appends = [
        'unit_cost',
    ];

    /**
     * Get the school this item belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the category this item belongs to
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(InventoryCategory::class, 'category_id');
    }

    /**
     * Get the supplier of this item
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    /**
     * Get inventory transactions
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class);
    }

    /**
     * Get asset assignments
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(AssetAssignment::class);
    }

    /**
     * Get asset maintenance history
     */
    public function maintenanceRecords(): HasMany
    {
        return $this->hasMany(AssetMaintenance::class, 'inventory_item_id');
    }

    /**
     * Get category display name (legacy attribute)
     */
    public function getCategoryDisplayAttribute(): string
    {
        return $this->category ? $this->category->name : 'General';
    }

    /**
     * Check if item is low stock
     */
    public function isLowStock(): bool
    {
        return $this->current_stock <= $this->reorder_level;
    }

    /**
     * Check if item is out of stock
     */
    public function isOutOfStock(): bool
    {
        return $this->current_stock <= 0;
    }

    /**
     * Check if item is consumable
     */
    public function isConsumable(): bool
    {
        return $this->item_type === self::TYPE_CONSUMABLE;
    }

    /**
     * Get stock status
     */
    public function getStockStatusAttribute(): string
    {
        if ($this->isOutOfStock()) {
            return 'Out of Stock';
        } elseif ($this->isLowStock()) {
            return 'Low Stock';
        } else {
            return 'In Stock';
        }
    }

    /**
     * Get stock value
     */
    public function getStockValueAttribute(): float
    {
        return $this->current_stock * $this->cost_price;
    }

    /**
     * Add stock
     */
    public function addStock(int $quantity, string $reason = 'Purchase'): void
    {
        $this->current_stock += $quantity;
        $this->save();

        // Create transaction record
        $this->transactions()->create([
            'school_id' => $this->school_id,
            'transaction_type' => InventoryTransaction::TYPE_IN,
            'quantity' => $quantity,
            'unit_cost' => $this->cost_price,
            'total_cost' => $quantity * $this->cost_price,
            'transaction_date' => now(),
            'reason' => $reason,
            'performed_by' => Auth::id(),
        ]);
    }

    /**
     * Remove stock
     */
    public function removeStock(int $quantity, string $reason = 'Issue'): bool
    {
        if ($this->current_stock < $quantity) {
            return false;
        }

        $this->current_stock -= $quantity;
        $this->save();

        // Create transaction record
        $this->transactions()->create([
            'school_id' => $this->school_id,
            'transaction_type' => InventoryTransaction::TYPE_OUT,
            'quantity' => $quantity,
            'unit_cost' => $this->cost_price,
            'total_cost' => $quantity * $this->cost_price,
            'transaction_date' => now(),
            'reason' => $reason,
            'performed_by' => Auth::id(),
        ]);

        return true;
    }

    /**
     * Scope for consumable items
     */
    public function scopeConsumable($query)
    {
        return $query->where('item_type', self::TYPE_CONSUMABLE);
    }

    /**
     * Scope for asset items (non-consumable)
     */
    public function scopeAsset($query)
    {
        return $query->where('item_type', self::TYPE_ASSET);
    }

    /**
     * Scope for low stock items
     */
    public function scopeLowStock($query)
    {
        return $query->whereColumn('current_stock', '<=', 'reorder_level');
    }

    /**
     * Scope for overstocked items
     */
    public function scopeOverstocked($query)
    {
        return $query->whereColumn('current_stock', '>', 'max_stock_level');
    }

    /**
     * Scope for items needing reorder
     */
    public function scopeNeedsReorder($query)
    {
        return $query->whereColumn('current_stock', '<=', 'reorder_level');
    }

    /**
     * Generate item code
     */
    public static function generateItemCode(School $school, string $categoryName): string
    {
        $prefix = strtoupper(substr($categoryName, 0, 3));
        $count = self::where('school_id', $school->id)
            ->count() + 1;

        return $school->code . '/' . $prefix . '/' . str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Get unit_cost attribute (alias for cost_price)
     */
    public function getUnitCostAttribute()
    {
        return $this->cost_price;
    }

    /**
     * Set unit_cost attribute (alias for cost_price)
     */
    public function setUnitCostAttribute($value): void
    {
        $this->attributes['cost_price'] = $value;
    }
}
