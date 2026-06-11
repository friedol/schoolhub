<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;

class PurchaseOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'po_number',
        'supplier_id',
        'requested_by',
        'approved_by',
        'po_date',
        'expected_delivery_date',
        'status',
        'subtotal',
        'tax_amount',
        'total_amount',
        'notes',
        'terms_conditions',
        'created_by',
    ];

    protected $casts = [
        'po_date' => 'date',
        'expected_delivery_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    // Status constants
    const STATUS_DRAFT = 'draft';
    const STATUS_PENDING_APPROVAL = 'pending_approval';
    const STATUS_APPROVED = 'approved';
    const STATUS_SENT = 'sent';
    const STATUS_ACKNOWLEDGED = 'acknowledged';
    const STATUS_PARTIALLY_DELIVERED = 'partially_delivered';
    const STATUS_FULLY_DELIVERED = 'fully_delivered';
    const STATUS_CLOSED = 'closed';
    const STATUS_CANCELLED = 'cancelled';

    const STATUS_OPTIONS = [
        self::STATUS_DRAFT => 'Draft',
        self::STATUS_PENDING_APPROVAL => 'Pending Approval',
        self::STATUS_APPROVED => 'Approved',
        self::STATUS_SENT => 'Sent to Supplier',
        self::STATUS_ACKNOWLEDGED => 'Acknowledged',
        self::STATUS_PARTIALLY_DELIVERED => 'Partially Delivered',
        self::STATUS_FULLY_DELIVERED => 'Fully Delivered',
        self::STATUS_CLOSED => 'Closed',
        self::STATUS_CANCELLED => 'Cancelled',
    ];

    /**
     * Get the school that owns the purchase order
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the supplier for this purchase order
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Get the user who requested this purchase order
     */
    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    /**
     * Get the user who approved this purchase order
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the user who created this purchase order
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get purchase order items
     */
    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    /**
     * Get goods received notes for this purchase order
     */
    public function goodsReceivedNotes(): HasMany
    {
        return $this->hasMany(GoodsReceivedNote::class);
    }

    /**
     * Calculate total amount
     */
    public function calculateTotal(): void
    {
        $subtotal = $this->items()->sum('total_amount');
        $taxAmount = $subtotal * 0.18; // 18% VAT in Tanzania
        $total = $subtotal + $taxAmount;

        $this->update([
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'total_amount' => $total,
        ]);
    }

    /**
     * Check if purchase order can be edited
     */
    public function canBeEdited(): bool
    {
        return in_array($this->status, [
            self::STATUS_DRAFT,
            self::STATUS_PENDING_APPROVAL,
        ]);
    }

    /**
     * Check if purchase order can be cancelled
     */
    public function canBeCancelled(): bool
    {
        return !in_array($this->status, [
            self::STATUS_CLOSED,
            self::STATUS_CANCELLED,
            self::STATUS_FULLY_DELIVERED,
        ]);
    }

    /**
     * Get delivery progress percentage
     */
    public function getDeliveryProgressAttribute(): float
    {
        $totalQuantity = $this->items()->sum('quantity');
        $deliveredQuantity = $this->goodsReceivedNotes()
            ->join('goods_received_items', 'goods_received_notes.id', '=', 'goods_received_items.grn_id')
            ->sum('goods_received_items.quantity_received');

        if ($totalQuantity == 0) {
            return 0;
        }

        return round(($deliveredQuantity / $totalQuantity) * 100, 2);
    }

    /**
     * Scope for pending purchase orders
     */
    public function scopePending($query)
    {
        return $query->whereIn('status', [
            self::STATUS_PENDING_APPROVAL,
            self::STATUS_APPROVED,
            self::STATUS_SENT,
        ]);
    }

    /**
     * Scope for overdue purchase orders
     */
    public function scopeOverdue($query)
    {
        return $query->where('expected_delivery_date', '<', now())
            ->whereNotIn('status', [
                self::STATUS_FULLY_DELIVERED,
                self::STATUS_CLOSED,
                self::STATUS_CANCELLED,
            ]);
    }

    /**
     * Generate unique PO number
     */
    public static function generatePONumber(): string
    {
        $year = now()->year;
        $month = now()->format('m');
        $count = self::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->count() + 1;

        return "PO-{$year}{$month}-" . str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Boot method to auto-generate PO number
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($po) {
            if (!$po->po_number) {
                $po->po_number = self::generatePONumber();
            }
            
            if (!$po->created_by) {
                $po->created_by = Auth::id();
            }
        });
    }
}



