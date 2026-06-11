<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

class HostelInventory extends Model
{
    use HasFactory;

    protected $fillable = [
        'hostel_id',
        'room_id',
        'bed_id',
        'item_name',
        'item_type',
        'item_code',
        'quantity',
        'condition',
        'purchase_date',
        'purchase_cost',
        'supplier',
        'warranty_expiry',
        'last_maintenance_date',
        'next_maintenance_date',
        'notes',
        'is_active',
        'created_by',
        'inventory_item_id',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'purchase_date' => 'date',
        'purchase_cost' => 'decimal:2',
        'warranty_expiry' => 'date',
        'last_maintenance_date' => 'date',
        'next_maintenance_date' => 'date',
        'is_active' => 'boolean',
    ];

    protected $appends = [
        'inventory_item_id',
    ];

    // Item type constants
    const TYPE_BEDDING = 'bedding';
    const TYPE_FURNITURE = 'furniture';
    const TYPE_ELECTRONICS = 'electronics';
    const TYPE_APPLIANCES = 'appliances';
    const TYPE_MAINTENANCE = 'maintenance';
    const TYPE_SAFETY = 'safety';

    const TYPE_OPTIONS = [
        self::TYPE_BEDDING => 'Bedding & Linens',
        self::TYPE_FURNITURE => 'Furniture',
        self::TYPE_ELECTRONICS => 'Electronics',
        self::TYPE_APPLIANCES => 'Appliances',
        self::TYPE_MAINTENANCE => 'Maintenance Equipment',
        self::TYPE_SAFETY => 'Safety Equipment',
    ];

    // Condition constants
    const CONDITION_EXCELLENT = 'excellent';
    const CONDITION_GOOD = 'good';
    const CONDITION_FAIR = 'fair';
    const CONDITION_POOR = 'poor';
    const CONDITION_DAMAGED = 'damaged';
    const CONDITION_BEYOND_REPAIR = 'beyond_repair';

    const CONDITION_OPTIONS = [
        self::CONDITION_EXCELLENT => 'Excellent',
        self::CONDITION_GOOD => 'Good',
        self::CONDITION_FAIR => 'Fair',
        self::CONDITION_POOR => 'Poor',
        self::CONDITION_DAMAGED => 'Damaged',
        self::CONDITION_BEYOND_REPAIR => 'Beyond Repair',
    ];

    /**
     * Get the hostel that owns this inventory item
     */
    public function hostel(): BelongsTo
    {
        return $this->belongsTo(Hostel::class);
    }

    /**
     * Get the inventory item (general item mapped via item_code)
     */
    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class, 'item_code', 'item_code');
    }

    /**
     * Get the room that owns this inventory item
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(HostelRoom::class, 'room_id');
    }

    /**
     * Get the bed that owns this inventory item
     */
    public function bed(): BelongsTo
    {
        return $this->belongsTo(HostelBed::class, 'bed_id');
    }

    /**
     * Get the user who created this inventory item
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Check if item needs maintenance
     */
    public function needsMaintenance(): bool
    {
        if (!$this->next_maintenance_date) {
            return false;
        }

        return now()->toDateString() >= $this->next_maintenance_date->toDateString();
    }

    /**
     * Check if item is under warranty
     */
    public function isUnderWarranty(): bool
    {
        if (!$this->warranty_expiry) {
            return false;
        }

        return now()->toDateString() <= $this->warranty_expiry->toDateString();
    }

    /**
     * Check if item is in good condition
     */
    public function isInGoodCondition(): bool
    {
        return in_array($this->condition, [
            self::CONDITION_EXCELLENT,
            self::CONDITION_GOOD,
        ]);
    }

    /**
     * Check if item needs replacement
     */
    public function needsReplacement(): bool
    {
        return in_array($this->condition, [
            self::CONDITION_POOR,
            self::CONDITION_DAMAGED,
            self::CONDITION_BEYOND_REPAIR,
        ]);
    }

    /**
     * Get condition color for UI
     */
    public function getConditionColorAttribute(): string
    {
        $colorMap = [
            self::CONDITION_EXCELLENT => 'green',
            self::CONDITION_GOOD => 'blue',
            self::CONDITION_FAIR => 'yellow',
            self::CONDITION_POOR => 'orange',
            self::CONDITION_DAMAGED => 'red',
            self::CONDITION_BEYOND_REPAIR => 'red',
        ];

        return $colorMap[$this->condition] ?? 'gray';
    }

    /**
     * Get item location string
     */
    public function getLocationStringAttribute(): string
    {
        $location = $this->hostel->name;
        
        if ($this->room) {
            $location .= " - {$this->room->display_name}";
        }
        
        if ($this->bed) {
            $location .= " - Bed {$this->bed->bed_number}";
        }

        return $location;
    }

    /**
     * Get total value of this inventory item
     */
    public function getTotalValueAttribute(): float
    {
        return $this->quantity * $this->purchase_cost;
    }

    /**
     * Scope for active inventory items
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for items by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('item_type', $type);
    }

    /**
     * Scope for items by condition
     */
    public function scopeByCondition($query, $condition)
    {
        return $query->where('condition', $condition);
    }

    /**
     * Scope for items needing maintenance
     */
    public function scopeNeedsMaintenance($query)
    {
        return $query->where('next_maintenance_date', '<=', now()->toDateString());
    }

    /**
     * Scope for items under warranty
     */
    public function scopeUnderWarranty($query)
    {
        return $query->where('warranty_expiry', '>=', now()->toDateString());
    }

    /**
     * Scope for items needing replacement
     */
    public function scopeNeedsReplacement($query)
    {
        return $query->whereIn('condition', [
            self::CONDITION_POOR,
            self::CONDITION_DAMAGED,
            self::CONDITION_BEYOND_REPAIR,
        ]);
    }

    /**
     * Boot method to set created_by
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($inventory) {
            if (!$inventory->created_by) {
                $inventory->created_by = Auth::id();
            }
        });
    }

    /**
     * Get inventory_item_id attribute
     */
    public function getInventoryItemIdAttribute()
    {
        return $this->inventoryItem?->id;
    }

    /**
     * Set inventory_item_id attribute
     */
    public function setInventoryItemIdAttribute($value)
    {
        $item = InventoryItem::find($value);
        if ($item) {
            $this->attributes['item_code'] = $item->item_code;
            $this->attributes['item_name'] = $item->name;
            $this->attributes['purchase_cost'] = $item->cost_price;
        }
    }
}



