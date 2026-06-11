<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LibraryConfiguration extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'student_loan_limit',
        'teacher_loan_limit',
        'staff_loan_limit',
        'student_loan_period_days',
        'teacher_loan_period_days',
        'staff_loan_period_days',
        'grace_period_days',
        'daily_fine_rate',
        'max_fine_amount',
        'reservation_expiry_days',
        'max_renewals',
        'renewal_period_days',
        'auto_calculate_fines',
        'send_overdue_notifications',
        'notification_days_before_due',
        'is_active',
        'updated_by',
    ];

    protected $casts = [
        'student_loan_limit' => 'integer',
        'teacher_loan_limit' => 'integer',
        'staff_loan_limit' => 'integer',
        'student_loan_period_days' => 'integer',
        'teacher_loan_period_days' => 'integer',
        'staff_loan_period_days' => 'integer',
        'grace_period_days' => 'integer',
        'daily_fine_rate' => 'decimal:2',
        'max_fine_amount' => 'decimal:2',
        'reservation_expiry_days' => 'integer',
        'max_renewals' => 'integer',
        'renewal_period_days' => 'integer',
        'auto_calculate_fines' => 'boolean',
        'send_overdue_notifications' => 'boolean',
        'notification_days_before_due' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Get the school
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the user who last updated this configuration
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get loan limit for borrower type
     */
    public function getLoanLimit(string $borrowerType): int
    {
        return match($borrowerType) {
            'student' => $this->student_loan_limit,
            'teacher' => $this->teacher_loan_limit,
            'staff' => $this->staff_loan_limit,
            default => 0
        };
    }

    /**
     * Get loan period for borrower type
     */
    public function getLoanPeriod(string $borrowerType): int
    {
        return match($borrowerType) {
            'student' => $this->student_loan_period_days,
            'teacher' => $this->teacher_loan_period_days,
            'staff' => $this->staff_loan_period_days,
            default => 0
        };
    }

    /**
     * Check if auto fine calculation is enabled
     */
    public function isAutoFineCalculationEnabled(): bool
    {
        return $this->auto_calculate_fines;
    }

    /**
     * Check if overdue notifications are enabled
     */
    public function isOverdueNotificationEnabled(): bool
    {
        return $this->send_overdue_notifications;
    }

    /**
     * Get default configuration for a school
     */
    public static function getDefaultForSchool(int $schoolId): self
    {
        return self::firstOrCreate(
            ['school_id' => $schoolId],
            [
                'student_loan_limit' => 2,
                'teacher_loan_limit' => 5,
                'staff_loan_limit' => 3,
                'student_loan_period_days' => 14,
                'teacher_loan_period_days' => 30,
                'staff_loan_period_days' => 21,
                'grace_period_days' => 1,
                'daily_fine_rate' => 100.00,
                'max_fine_amount' => 5000.00,
                'reservation_expiry_days' => 7,
                'max_renewals' => 2,
                'renewal_period_days' => 14,
                'auto_calculate_fines' => true,
                'send_overdue_notifications' => true,
                'notification_days_before_due' => 1,
                'is_active' => true,
            ]
        );
    }
}



