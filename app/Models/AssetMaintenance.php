<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

class AssetMaintenance extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_item_id',
        'school_id',
        'maintenance_type',
        'maintenance_date',
        'next_maintenance_date',
        'description',
        'cost',
        'performed_by',
        'status',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'maintenance_date' => 'date',
        'next_maintenance_date' => 'date',
        'cost' => 'decimal:2',
    ];

    // Maintenance type constants
    const TYPE_PREVENTIVE = 'preventive';
    const TYPE_CORRECTIVE = 'corrective';
    const TYPE_EMERGENCY = 'emergency';
    const TYPE_UPGRADE = 'upgrade';

    const TYPE_OPTIONS = [
        self::TYPE_PREVENTIVE => 'Preventive',
        self::TYPE_CORRECTIVE => 'Corrective',
        self::TYPE_EMERGENCY => 'Emergency',
        self::TYPE_UPGRADE => 'Upgrade',
    ];

    // Status constants
    const STATUS_SCHEDULED = 'scheduled';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    const STATUS_OPTIONS = [
        self::STATUS_SCHEDULED => 'Scheduled',
        self::STATUS_IN_PROGRESS => 'In Progress',
        self::STATUS_COMPLETED => 'Completed',
        self::STATUS_CANCELLED => 'Cancelled',
    ];

    /**
     * Get the inventory item that owns this maintenance record
     */
    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    /**
     * Get the school that owns this maintenance record
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the user who performed the maintenance
     */
    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    /**
     * Get the user who created this maintenance record
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Check if maintenance is overdue
     */
    public function isOverdue(): bool
    {
        return $this->next_maintenance_date && 
               $this->next_maintenance_date < now()->toDateString() &&
               $this->status !== self::STATUS_COMPLETED;
    }

    /**
     * Check if maintenance is due soon (within 30 days)
     */
    public function isDueSoon(): bool
    {
        return $this->next_maintenance_date && 
               $this->next_maintenance_date <= now()->addDays(30)->toDateString() &&
               $this->status !== self::STATUS_COMPLETED;
    }

    /**
     * Scope for overdue maintenance
     */
    public function scopeOverdue($query)
    {
        return $query->where('next_maintenance_date', '<', now()->toDateString())
            ->where('status', '!=', self::STATUS_COMPLETED);
    }

    /**
     * Scope for maintenance due soon
     */
    public function scopeDueSoon($query)
    {
        return $query->where('next_maintenance_date', '<=', now()->addDays(30)->toDateString())
            ->where('next_maintenance_date', '>=', now()->toDateString())
            ->where('status', '!=', self::STATUS_COMPLETED);
    }

    /**
     * Boot method to set created_by
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($maintenance) {
            if (!$maintenance->created_by) {
                $maintenance->created_by = Auth::id();
            }
        });
    }
}



