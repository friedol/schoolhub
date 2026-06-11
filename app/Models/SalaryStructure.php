<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SalaryStructure extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'name',
        'description',
        'basic_salary',
        'house_allowance',
        'transport_allowance',
        'risk_allowance',
        'medical_allowance',
        'other_allowances',
        'nssf_percentage',
        'paye_rate',
        'sdl_percentage',
        'is_active',
        'effective_date',
        'created_by',
    ];

    protected $casts = [
        'basic_salary' => 'decimal:2',
        'house_allowance' => 'decimal:2',
        'transport_allowance' => 'decimal:2',
        'risk_allowance' => 'decimal:2',
        'medical_allowance' => 'decimal:2',
        'other_allowances' => 'decimal:2',
        'nssf_percentage' => 'decimal:2',
        'paye_rate' => 'decimal:2',
        'sdl_percentage' => 'decimal:2',
        'is_active' => 'boolean',
        'effective_date' => 'date',
    ];

    /**
     * Get the school this salary structure belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the user who created this salary structure
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get staff members using this salary structure
     */
    public function staff(): HasMany
    {
        return $this->hasMany(User::class, 'salary_structure_id');
    }

    /**
     * Calculate total gross salary
     */
    public function getTotalGrossAttribute(): float
    {
        return $this->basic_salary + 
               $this->house_allowance + 
               $this->transport_allowance + 
               $this->risk_allowance + 
               $this->medical_allowance + 
               $this->other_allowances;
    }

    /**
     * Calculate NSSF deduction
     */
    public function getNssfDeductionAttribute(): float
    {
        return ($this->basic_salary * $this->nssf_percentage) / 100;
    }

    /**
     * Calculate PAYE deduction
     */
    public function getPayeDeductionAttribute(): float
    {
        return ($this->basic_salary * $this->paye_rate) / 100;
    }

    /**
     * Calculate SDL deduction
     */
    public function getSdlDeductionAttribute(): float
    {
        return ($this->basic_salary * $this->sdl_percentage) / 100;
    }

    /**
     * Calculate total statutory deductions
     */
    public function getTotalStatutoryDeductionsAttribute(): float
    {
        return $this->nssf_deduction + $this->paye_deduction + $this->sdl_deduction;
    }

    /**
     * Calculate net salary
     */
    public function getNetSalaryAttribute(): float
    {
        return $this->total_gross - $this->total_statutory_deductions;
    }
}



