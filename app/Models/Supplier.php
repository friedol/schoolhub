<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'supplier_code',
        'name',
        'contact_person',
        'email',
        'phone',
        'address',
        'city',
        'region',
        'country',
        'tax_number',
        'payment_terms',
        'credit_limit',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'credit_limit' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Get the school that owns the supplier
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get inventory items supplied by this supplier
     */
    public function inventoryItems(): HasMany
    {
        return $this->hasMany(InventoryItem::class);
    }

    /**
     * Get purchase orders from this supplier
     */
    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class);
    }

    /**
     * Get goods received notes from this supplier
     */
    public function goodsReceivedNotes(): HasMany
    {
        return $this->hasMany(GoodsReceivedNote::class);
    }

    /**
     * Scope for active suppliers
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Generate unique supplier code
     */
    public static function generateSupplierCode(): string
    {
        $count = self::count() + 1;
        return 'SUP-' . str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Boot method to auto-generate supplier code
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($supplier) {
            if (!$supplier->supplier_code) {
                $supplier->supplier_code = self::generateSupplierCode();
            }
        });
    }
}



