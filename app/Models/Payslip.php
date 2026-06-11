<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payslip extends Model
{
    use HasFactory;

    protected $fillable = [
        'payroll_record_id',
        'staff_id',
        'payroll_id',
        'payslip_number',
        'generated_at',
        'is_downloaded',
        'downloaded_at',
        'language',
    ];

    protected $casts = [
        'generated_at' => 'datetime',
        'is_downloaded' => 'boolean',
        'downloaded_at' => 'datetime',
    ];

    const LANGUAGE_ENGLISH = 'english';
    const LANGUAGE_SWAHILI = 'swahili';

    /**
     * Get the payroll record this payslip belongs to
     */
    public function payrollRecord(): BelongsTo
    {
        return $this->belongsTo(PayrollRecord::class);
    }

    /**
     * Get the staff member this payslip belongs to
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    /**
     * Get the payroll this payslip belongs to
     */
    public function payroll(): BelongsTo
    {
        return $this->belongsTo(Payroll::class);
    }

    /**
     * Check if payslip has been downloaded
     */
    public function isDownloaded(): bool
    {
        return $this->is_downloaded;
    }

    /**
     * Mark payslip as downloaded
     */
    public function markAsDownloaded(): void
    {
        $this->update([
            'is_downloaded' => true,
            'downloaded_at' => now(),
        ]);
    }

    /**
     * Get language display name
     */
    public function getLanguageDisplayAttribute(): string
    {
        return match($this->language) {
            self::LANGUAGE_ENGLISH => 'English',
            self::LANGUAGE_SWAHILI => 'Kiswahili',
            default => 'English'
        };
    }

    /**
     * Generate unique payslip number
     */
    public static function generatePayslipNumber(): string
    {
        $year = date('Y');
        $month = date('m');
        $lastPayslip = self::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();
        
        $sequence = $lastPayslip ? (intval(substr($lastPayslip->payslip_number, -4)) + 1) : 1;
        
        return 'PSL/' . $year . '/' . $month . '/' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }
}



