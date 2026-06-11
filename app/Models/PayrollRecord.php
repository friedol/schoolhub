<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayrollRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'payroll_id',
        'staff_id',
        'basic_salary',
        'house_allowance',
        'transport_allowance',
        'risk_allowance',
        'medical_allowance',
        'other_allowances',
        'overtime_pay',
        'bonus',
        'advance_payment',
        'gross_pay',
        'nssf_deduction',
        'paye_deduction',
        'sdl_deduction',
        'loan_deduction',
        'insurance_deduction',
        'other_deductions',
        'total_deductions',
        'net_pay',
        'attendance_days',
        'working_days',
        'leave_days',
        'absent_days',
        'notes',
    ];

    protected $casts = [
        'basic_salary' => 'decimal:2',
        'house_allowance' => 'decimal:2',
        'transport_allowance' => 'decimal:2',
        'risk_allowance' => 'decimal:2',
        'medical_allowance' => 'decimal:2',
        'other_allowances' => 'decimal:2',
        'overtime_pay' => 'decimal:2',
        'bonus' => 'decimal:2',
        'advance_payment' => 'decimal:2',
        'gross_pay' => 'decimal:2',
        'nssf_deduction' => 'decimal:2',
        'paye_deduction' => 'decimal:2',
        'sdl_deduction' => 'decimal:2',
        'loan_deduction' => 'decimal:2',
        'insurance_deduction' => 'decimal:2',
        'other_deductions' => 'decimal:2',
        'total_deductions' => 'decimal:2',
        'net_pay' => 'decimal:2',
        'attendance_days' => 'integer',
        'working_days' => 'integer',
        'leave_days' => 'integer',
        'absent_days' => 'integer',
    ];

    /**
     * Get the payroll this record belongs to
     */
    public function payroll(): BelongsTo
    {
        return $this->belongsTo(Payroll::class);
    }

    /**
     * Get the staff member this record belongs to
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    /**
     * Calculate attendance percentage
     */
    public function getAttendancePercentageAttribute(): float
    {
        if ($this->working_days == 0) {
            return 0;
        }
        return ($this->attendance_days / $this->working_days) * 100;
    }

    /**
     * Calculate total allowances
     */
    public function getTotalAllowancesAttribute(): float
    {
        return $this->house_allowance + 
               $this->transport_allowance + 
               $this->risk_allowance + 
               $this->medical_allowance + 
               $this->other_allowances;
    }

    /**
     * Calculate total earnings
     */
    public function getTotalEarningsAttribute(): float
    {
        return $this->basic_salary + 
               $this->total_allowances + 
               $this->overtime_pay + 
               $this->bonus;
    }

    /**
     * Calculate total voluntary deductions
     */
    public function getTotalVoluntaryDeductionsAttribute(): float
    {
        return $this->loan_deduction + 
               $this->insurance_deduction + 
               $this->other_deductions;
    }

    /**
     * Calculate total statutory deductions
     */
    public function getTotalStatutoryDeductionsAttribute(): float
    {
        return $this->nssf_deduction + 
               $this->paye_deduction + 
               $this->sdl_deduction;
    }
}



