<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'fee_item_id',
        'description',
        'quantity',
        'unit_price',
        'total_amount',
        'tax_rate',
        'tax_amount',
        'discount_rate',
        'discount_amount',
        'net_amount',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_rate' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'net_amount' => 'decimal:2',
    ];

    /**
     * Get the invoice this item belongs to
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Get the fee item
     */
    public function feeItem(): BelongsTo
    {
        return $this->belongsTo(FeeItem::class);
    }

    /**
     * Calculate total amount before tax and discount
     */
    public function calculateTotalAmount(): float
    {
        return $this->quantity * $this->unit_price;
    }

    /**
     * Calculate tax amount
     */
    public function calculateTaxAmount(): float
    {
        return ($this->total_amount * $this->tax_rate) / 100;
    }

    /**
     * Calculate discount amount
     */
    public function calculateDiscountAmount(): float
    {
        return ($this->total_amount * $this->discount_rate) / 100;
    }

    /**
     * Calculate net amount after tax and discount
     */
    public function calculateNetAmount(): float
    {
        return $this->total_amount + $this->tax_amount - $this->discount_amount;
    }

    /**
     * Update calculated amounts
     */
    public function updateCalculatedAmounts(): void
    {
        $this->total_amount = $this->calculateTotalAmount();
        $this->tax_amount = $this->calculateTaxAmount();
        $this->discount_amount = $this->calculateDiscountAmount();
        $this->net_amount = $this->calculateNetAmount();
        $this->save();
    }
}



