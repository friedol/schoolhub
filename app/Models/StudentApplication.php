<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;

class StudentApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'application_number',
        'first_name',
        'middle_name',
        'last_name',
        'date_of_birth',
        'gender',
        'nationality',
        'religion',
        'phone',
        'email',
        'address',
        'region',
        'district',
        'ward',
        'previous_school',
        'previous_class',
        'reason_for_transfer',
        'parent_name',
        'parent_phone',
        'parent_email',
        'parent_occupation',
        'parent_address',
        'guardian_name',
        'guardian_phone',
        'guardian_email',
        'guardian_relationship',
        'medical_conditions',
        'allergies',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relationship',
        'documents',
        'status',
        'applied_class',
        'applied_academic_year',
        'notes',
        'reviewed_by',
        'reviewed_at',
        'approved_by',
        'approved_at',
    ];


    protected $casts = [
        'date_of_birth' => 'date',
        'documents' => 'array',
        'reviewed_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_UNDER_REVIEW = 'under_review';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';
    const STATUS_WITHDRAWN = 'withdrawn';

    /**
     * Get the school this application belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get application documents
     */
    public function documents(): HasMany
    {
        return $this->hasMany(ApplicationDocument::class);
    }

    /**
     * Get application payments
     */
    public function payments(): HasMany
    {
        return $this->hasMany(ApplicationPayment::class);
    }

    /**
     * Get interviews for this application
     */
    public function interviews(): HasMany
    {
        return $this->hasMany(Interview::class);
    }

    /**
     * Get the user who reviewed this application
     */
    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Get the user who approved this application
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get full name
     */
    public function getFullNameAttribute(): string
    {
        return trim($this->first_name . ' ' . $this->middle_name . ' ' . $this->last_name);
    }

    /**
     * Get status display name
     */
    public function getStatusDisplayAttribute(): string
    {
        return match($this->status) {
            self::STATUS_PENDING => 'Pending',
            self::STATUS_UNDER_REVIEW => 'Under Review',
            self::STATUS_APPROVED => 'Approved',
            self::STATUS_REJECTED => 'Rejected',
            self::STATUS_WITHDRAWN => 'Withdrawn',
            default => 'Unknown'
        };
    }

    /**
     * Check if application is pending
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if application is approved
     */
    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    /**
     * Check if application is rejected
     */
    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    /**
     * Generate application number
     */
    public static function generateApplicationNumber(School $school): string
    {
        $year = date('Y');
        $count = self::where('school_id', $school->id)
            ->whereYear('created_at', $year)
            ->count() + 1;

        return $school->code . '/APP/' . $year . '/' . str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Convert application to student
     */
    public function convertToStudent(): User
    {
        $student = User::create([
            'name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'password' => bcrypt('password'), // Temporary password
            'role' => 'student',
            'school_id' => $this->school_id,
            'platform_id' => $this->school->platform_id,
            'date_of_birth' => $this->date_of_birth,
            'gender' => $this->gender,
            'address' => $this->address,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Update application status
        $this->update([
            'status' => self::STATUS_APPROVED,
            'approved_at' => now(),
            'approved_by' => Auth::id(),
        ]);

        return $student;
    }
}
