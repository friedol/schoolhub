<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancialTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'transaction_type',
        'category',
        'subcategory',
        'amount',
        'description',
        'reference_number',
        'transaction_date',
        'payment_method',
        'account_type',
        'account_id',
        'related_model',
        'related_id',
        'created_by',
        'approved_by',
        'approved_at',
        'is_reconciled',
        'reconciled_at',
        'reconciled_by',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'transaction_date' => 'date',
        'approved_at' => 'datetime',
        'reconciled_at' => 'datetime',
        'is_reconciled' => 'boolean',
    ];

    const TRANSACTION_TYPE_INCOME = 'income';
    const TRANSACTION_TYPE_EXPENSE = 'expense';
    const TRANSACTION_TYPE_TRANSFER = 'transfer';

    const CATEGORY_FEES = 'fees';
    const CATEGORY_SALARIES = 'salaries';
    const CATEGORY_UTILITIES = 'utilities';
    const CATEGORY_MAINTENANCE = 'maintenance';
    const CATEGORY_TEACHING_MATERIALS = 'teaching_materials';
    const CATEGORY_SPORTS_EQUIPMENT = 'sports_equipment';
    const CATEGORY_ADMINISTRATION = 'administration';
    const CATEGORY_DONATIONS = 'donations';
    const CATEGORY_OTHER = 'other';

    const ACCOUNT_TYPE_ASSET = 'asset';
    const ACCOUNT_TYPE_LIABILITY = 'liability';
    const ACCOUNT_TYPE_EQUITY = 'equity';
    const ACCOUNT_TYPE_INCOME = 'income';
    const ACCOUNT_TYPE_EXPENSE = 'expense';

    /**
     * Get the school this transaction belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the user who created this transaction
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who approved this transaction
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the user who reconciled this transaction
     */
    public function reconciledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reconciled_by');
    }

    /**
     * Check if transaction is income
     */
    public function isIncome(): bool
    {
        return $this->transaction_type === self::TRANSACTION_TYPE_INCOME;
    }

    /**
     * Check if transaction is expense
     */
    public function isExpense(): bool
    {
        return $this->transaction_type === self::TRANSACTION_TYPE_EXPENSE;
    }

    /**
     * Check if transaction is approved
     */
    public function isApproved(): bool
    {
        return $this->approved_at !== null;
    }

    /**
     * Check if transaction is reconciled
     */
    public function isReconciled(): bool
    {
        return $this->is_reconciled;
    }

    /**
     * Get transaction type display name
     */
    public function getTransactionTypeDisplayAttribute(): string
    {
        return match($this->transaction_type) {
            self::TRANSACTION_TYPE_INCOME => 'Income',
            self::TRANSACTION_TYPE_EXPENSE => 'Expense',
            self::TRANSACTION_TYPE_TRANSFER => 'Transfer',
            default => 'Unknown'
        };
    }

    /**
     * Get category display name
     */
    public function getCategoryDisplayAttribute(): string
    {
        return match($this->category) {
            self::CATEGORY_FEES => 'Fees',
            self::CATEGORY_SALARIES => 'Salaries',
            self::CATEGORY_UTILITIES => 'Utilities',
            self::CATEGORY_MAINTENANCE => 'Maintenance',
            self::CATEGORY_TEACHING_MATERIALS => 'Teaching Materials',
            self::CATEGORY_SPORTS_EQUIPMENT => 'Sports Equipment',
            self::CATEGORY_ADMINISTRATION => 'Administration',
            self::CATEGORY_DONATIONS => 'Donations',
            self::CATEGORY_OTHER => 'Other',
            default => 'Unknown'
        };
    }

    /**
     * Get account type display name
     */
    public function getAccountTypeDisplayAttribute(): string
    {
        return match($this->account_type) {
            self::ACCOUNT_TYPE_ASSET => 'Asset',
            self::ACCOUNT_TYPE_LIABILITY => 'Liability',
            self::ACCOUNT_TYPE_EQUITY => 'Equity',
            self::ACCOUNT_TYPE_INCOME => 'Income',
            self::ACCOUNT_TYPE_EXPENSE => 'Expense',
            default => 'Unknown'
        };
    }

    /**
     * Mark transaction as approved
     */
    public function markAsApproved(User $approvedBy): void
    {
        $this->update([
            'approved_by' => $approvedBy->id,
            'approved_at' => now(),
        ]);
    }

    /**
     * Mark transaction as reconciled
     */
    public function markAsReconciled(User $reconciledBy): void
    {
        $this->update([
            'is_reconciled' => true,
            'reconciled_by' => $reconciledBy->id,
            'reconciled_at' => now(),
        ]);
    }
}