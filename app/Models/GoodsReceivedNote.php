<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;

class GoodsReceivedNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'grn_number',
        'purchase_order_id',
        'supplier_id',
        'received_date',
        'received_by',
        'delivery_note_number',
        'status',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'received_date' => 'date',
    ];

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_VERIFIED = 'verified';
    const STATUS_ACCEPTED = 'accepted';
    const STATUS_REJECTED = 'rejected';

    const STATUS_OPTIONS = [
        self::STATUS_PENDING => 'Pending',
        self::STATUS_VERIFIED => 'Verified',
        self::STATUS_ACCEPTED => 'Accepted',
        self::STATUS_REJECTED => 'Rejected',
    ];

    /**
     * Get the school that owns the GRN
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the purchase order for this GRN
     */
    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    /**
     * Get the supplier for this GRN
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Get the user who received the goods
     */
    public function receivedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    /**
     * Get the user who created this GRN
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get GRN items
     */
    public function items(): HasMany
    {
        return $this->hasMany(GoodsReceivedItem::class, 'grn_id');
    }

    /**
     * Get total quantity received
     */
    public function getTotalQuantityReceivedAttribute(): int
    {
        return $this->items()->sum('quantity_received');
    }

    /**
     * Get total value received
     */
    public function getTotalValueReceivedAttribute(): float
    {
        return $this->items()->sum('total_value');
    }

    /**
     * Check if GRN can be edited
     */
    public function canBeEdited(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Accept the GRN and update stock
     */
    public function accept(): void
    {
        $this->update(['status' => self::STATUS_ACCEPTED]);

        // Update stock levels for each item
        foreach ($this->items as $item) {
            $inventoryItem = $item->inventoryItem;
            $inventoryItem->addStock($item->quantity_received, "Goods Received - GRN {$this->grn_number}");
        }
    }

    /**
     * Reject the GRN
     */
    public function reject(): void
    {
        $this->update(['status' => self::STATUS_REJECTED]);
    }

    /**
     * Generate unique GRN number
     */
    public static function generateGRNNumber(): string
    {
        $year = now()->year;
        $month = now()->format('m');
        $count = self::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->count() + 1;

        return "GRN-{$year}{$month}-" . str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Boot method to auto-generate GRN number
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($grn) {
            if (!$grn->grn_number) {
                $grn->grn_number = self::generateGRNNumber();
            }
            
            if (!$grn->created_by) {
                $grn->created_by = Auth::id();
            }
        });
    }
}



