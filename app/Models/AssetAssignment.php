<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'inventory_item_id',
        'assigned_to_id',
        'assigned_to_type',
        'assignment_date',
        'purpose',
        'is_active',
    ];

    protected $casts = [
        'assignment_date' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Get the school that owns this assignment
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the inventory item assigned
     */
    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    /**
     * Get the polymorphic entity assigned to (User/Student/etc.)
     */
    public function assignedTo()
    {
        return $this->morphTo('assigned_to');
    }
}
