<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;

class IssueNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'issue_number',
        'issued_to_id',
        'issued_to_type',
        'issued_by',
        'issue_date',
        'purpose',
        'status',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'issue_date' => 'date',
    ];

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_ISSUED = 'issued';
    const STATUS_RETURNED = 'returned';
    const STATUS_PARTIALLY_RETURNED = 'partially_returned';

    const STATUS_OPTIONS = [
        self::STATUS_PENDING => 'Pending',
        self::STATUS_ISSUED => 'Issued',
        self::STATUS_RETURNED => 'Returned',
        self::STATUS_PARTIALLY_RETURNED => 'Partially Returned',
    ];

    /**
     * Get the school that owns the issue note
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the user who issued the items
     */
    public function issuedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    /**
     * Get the user who created this issue note
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the recipient (polymorphic relationship)
     */
    public function issuedTo()
    {
        return $this->morphTo('issued_to');
    }

    /**
     * Get issue note items
     */
    public function items(): HasMany
    {
        return $this->hasMany(IssueNoteItem::class);
    }

    /**
     * Get total quantity issued
     */
    public function getTotalQuantityIssuedAttribute(): int
    {
        return $this->items()->sum('quantity_issued');
    }

    /**
     * Get total value issued
     */
    public function getTotalValueIssuedAttribute(): float
    {
        return $this->items()->sum('total_value');
    }

    /**
     * Check if issue note can be edited
     */
    public function canBeEdited(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Issue the items and update stock
     */
    public function issue(): void
    {
        $this->update(['status' => self::STATUS_ISSUED]);

        // Update stock levels for consumable items
        foreach ($this->items as $item) {
            $inventoryItem = $item->inventoryItem;
            
            if ($inventoryItem->item_type === InventoryItem::TYPE_CONSUMABLE) {
                $inventoryItem->removeStock($item->quantity_issued, "Issue Note {$this->issue_number}");
            } else {
                // For assets, create assignment record
                AssetAssignment::create([
                    'inventory_item_id' => $inventoryItem->id,
                    'school_id' => $this->school_id,
                    'assigned_to_id' => $this->issued_to_id,
                    'assigned_to_type' => $this->issued_to_type,
                    'assignment_date' => $this->issue_date,
                    'purpose' => $this->purpose,
                    'is_active' => true,
                ]);
            }
        }
    }

    /**
     * Generate unique issue number
     */
    public static function generateIssueNumber(): string
    {
        $year = now()->year;
        $month = now()->format('m');
        $count = self::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->count() + 1;

        return "ISSUE-{$year}{$month}-" . str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Boot method to auto-generate issue number
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($issue) {
            if (!$issue->issue_number) {
                $issue->issue_number = self::generateIssueNumber();
            }
            
            if (!$issue->created_by) {
                $issue->created_by = Auth::id();
            }
        });
    }
}



