<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffQualification extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_id',
        'qualification_type',
        'institution_name',
        'qualification_title',
        'field_of_study',
        'year_completed',
        'grade_classification',
        'document_path',
        'is_verified',
        'verified_by',
        'verified_at',
        'notes',
    ];

    protected $casts = [
        'year_completed' => 'integer',
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
    ];

    const QUALIFICATION_TYPE_DEGREE = 'degree';
    const QUALIFICATION_TYPE_DIPLOMA = 'diploma';
    const QUALIFICATION_TYPE_CERTIFICATE = 'certificate';
    const QUALIFICATION_TYPE_PROFESSIONAL = 'professional';
    const QUALIFICATION_TYPE_TRAINING = 'training';

    const GRADE_CLASSIFICATION_FIRST_CLASS = 'first_class';
    const GRADE_CLASSIFICATION_SECOND_CLASS_UPPER = 'second_class_upper';
    const GRADE_CLASSIFICATION_SECOND_CLASS_LOWER = 'second_class_lower';
    const GRADE_CLASSIFICATION_PASS = 'pass';
    const GRADE_CLASSIFICATION_DISTINCTION = 'distinction';
    const GRADE_CLASSIFICATION_CREDIT = 'credit';
    const GRADE_CLASSIFICATION_ORDINARY = 'ordinary';

    /**
     * Get the staff member this qualification belongs to
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    /**
     * Get the user who verified this qualification
     */
    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Check if qualification is verified
     */
    public function isVerified(): bool
    {
        return $this->is_verified;
    }

    /**
     * Get qualification type display name
     */
    public function getQualificationTypeDisplayAttribute(): string
    {
        return match($this->qualification_type) {
            self::QUALIFICATION_TYPE_DEGREE => 'Degree',
            self::QUALIFICATION_TYPE_DIPLOMA => 'Diploma',
            self::QUALIFICATION_TYPE_CERTIFICATE => 'Certificate',
            self::QUALIFICATION_TYPE_PROFESSIONAL => 'Professional',
            self::QUALIFICATION_TYPE_TRAINING => 'Training',
            default => 'Unknown'
        };
    }

    /**
     * Get grade classification display name
     */
    public function getGradeClassificationDisplayAttribute(): string
    {
        return match($this->grade_classification) {
            self::GRADE_CLASSIFICATION_FIRST_CLASS => 'First Class',
            self::GRADE_CLASSIFICATION_SECOND_CLASS_UPPER => 'Second Class Upper',
            self::GRADE_CLASSIFICATION_SECOND_CLASS_LOWER => 'Second Class Lower',
            self::GRADE_CLASSIFICATION_PASS => 'Pass',
            self::GRADE_CLASSIFICATION_DISTINCTION => 'Distinction',
            self::GRADE_CLASSIFICATION_CREDIT => 'Credit',
            self::GRADE_CLASSIFICATION_ORDINARY => 'Ordinary',
            default => 'Not Specified'
        };
    }
}



