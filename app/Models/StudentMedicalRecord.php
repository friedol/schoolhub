<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentMedicalRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'record_type',
        'condition_name',
        'description',
        'severity',
        'diagnosis_date',
        'treatment',
        'medications',
        'allergies',
        'dietary_restrictions',
        'emergency_instructions',
        'doctor_name',
        'doctor_contact',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'diagnosis_date' => 'date',
        'medications' => 'array',
        'allergies' => 'array',
        'dietary_restrictions' => 'array',
        'is_active' => 'boolean',
    ];

    const RECORD_TYPE_ALLERGY = 'allergy';
    const RECORD_TYPE_CHRONIC_CONDITION = 'chronic_condition';
    const RECORD_TYPE_MEDICATION = 'medication';
    const RECORD_TYPE_DIETARY_RESTRICTION = 'dietary_restriction';
    const RECORD_TYPE_EMERGENCY_CONTACT = 'emergency_contact';
    const RECORD_TYPE_VACCINATION = 'vaccination';
    const RECORD_TYPE_OTHER = 'other';

    const SEVERITY_LOW = 'low';
    const SEVERITY_MEDIUM = 'medium';
    const SEVERITY_HIGH = 'high';
    const SEVERITY_CRITICAL = 'critical';

    /**
     * Get the student this medical record belongs to
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Check if record is active
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Get record type display name
     */
    public function getRecordTypeDisplayAttribute(): string
    {
        return match($this->record_type) {
            self::RECORD_TYPE_ALLERGY => 'Allergy',
            self::RECORD_TYPE_CHRONIC_CONDITION => 'Chronic Condition',
            self::RECORD_TYPE_MEDICATION => 'Medication',
            self::RECORD_TYPE_DIETARY_RESTRICTION => 'Dietary Restriction',
            self::RECORD_TYPE_EMERGENCY_CONTACT => 'Emergency Contact',
            self::RECORD_TYPE_VACCINATION => 'Vaccination',
            self::RECORD_TYPE_OTHER => 'Other',
            default => 'Unknown'
        };
    }

    /**
     * Get severity display name
     */
    public function getSeverityDisplayAttribute(): string
    {
        return match($this->severity) {
            self::SEVERITY_LOW => 'Low',
            self::SEVERITY_MEDIUM => 'Medium',
            self::SEVERITY_HIGH => 'High',
            self::SEVERITY_CRITICAL => 'Critical',
            default => 'Unknown'
        };
    }

    /**
     * Get severity color for UI
     */
    public function getSeverityColorAttribute(): string
    {
        return match($this->severity) {
            self::SEVERITY_LOW => 'green',
            self::SEVERITY_MEDIUM => 'yellow',
            self::SEVERITY_HIGH => 'orange',
            self::SEVERITY_CRITICAL => 'red',
            default => 'gray'
        };
    }
}
