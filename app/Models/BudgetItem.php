<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BudgetItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'budget_id',
        'category',
        'description',
        'budgeted_amount',
        'actual_amount',
        'notes',
    ];

    protected $casts = [
        'budgeted_amount' => 'decimal:2',
        'actual_amount' => 'decimal:2',
    ];

    /**
     * Get the budget this item belongs to
     */
    public function budget(): BelongsTo
    {
        return $this->belongsTo(Budget::class);
    }

    /**
     * Calculate variance amount
     */
    public function getVarianceAmountAttribute(): float
    {
        return $this->actual_amount - $this->budgeted_amount;
    }

    /**
     * Calculate variance percentage
     */
    public function getVariancePercentageAttribute(): float
    {
        if ($this->budgeted_amount == 0) return 0;
        return (($this->actual_amount - $this->budgeted_amount) / $this->budgeted_amount) * 100;
    }

    /**
     * Check if item is over budget
     */
    public function isOverBudget(): bool
    {
        return $this->actual_amount > $this->budgeted_amount;
    }

    /**
     * Check if item is under budget
     */
    public function isUnderBudget(): bool
    {
        return $this->actual_amount < $this->budgeted_amount;
    }

    /**
     * Get variance color for UI
     */
    public function getVarianceColorAttribute(): string
    {
        if ($this->isOverBudget()) return 'red';
        if ($this->isUnderBudget()) return 'green';
        return 'gray';
    }
}



