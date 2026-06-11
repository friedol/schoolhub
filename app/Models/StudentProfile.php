<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'admission_number',
        'admission_date',
        'class_id',
        'stream',
        'boarding_status',
        'transport_route',
        'medical_info',
        'allergies',
        'medications',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relationship',
        'previous_school',
        'previous_class',
        'transfer_reason',
        'disciplinary_records',
        'achievements',
        'extracurricular_activities',
        'special_needs',
        'learning_disabilities',
        'parent_marital_status',
        'siblings_in_school',
        'family_income_range',
        'scholarship_status',
        'scholarship_amount',
        'notes',
        'father_name',
        'mother_name',
        'father_occupation',
        'mother_occupation',
        'father_income_range',
        'blood_group',
        'religion',
        'nationality',
        'country',
        'region',
        'district',
        'ward',
        'village',
        'address_details',
        'submitted_documents',
        'uploaded_documents',
    ];

    protected $casts = [
        'admission_date' => 'date',
        'medical_info' => 'array',
        'disciplinary_records' => 'array',
        'achievements' => 'array',
        'extracurricular_activities' => 'array',
        'special_needs' => 'array',
        'learning_disabilities' => 'array',
        'siblings_in_school' => 'array',
        'scholarship_amount' => 'decimal:2',
        'submitted_documents' => 'array',
        'uploaded_documents' => 'array',
    ];

    /**
     * Get the student
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the class
     */
    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    /**
     * Get boarding status display name
     */
    public function getBoardingStatusDisplayAttribute(): string
    {
        return match($this->boarding_status) {
            'boarding' => 'Boarding',
            'day' => 'Day Scholar',
            'weekly_boarding' => 'Weekly Boarding',
            default => 'Not Specified'
        };
    }

    /**
     * Check if student is boarding
     */
    public function isBoarding(): bool
    {
        return in_array($this->boarding_status, ['boarding', 'weekly_boarding']);
    }

    /**
     * Check if student has special needs
     */
    public function hasSpecialNeeds(): bool
    {
        return !empty($this->special_needs);
    }

    /**
     * Check if student has learning disabilities
     */
    public function hasLearningDisabilities(): bool
    {
        return !empty($this->learning_disabilities);
    }

    /**
     * Check if student is on scholarship
     */
    public function isOnScholarship(): bool
    {
        return $this->scholarship_status === 'active';
    }

    /**
     * Get age in years
     */
    public function getAgeAttribute(): int
    {
        return $this->student->date_of_birth->age;
    }

    /**
     * Get years in school
     */
    public function getYearsInSchoolAttribute(): int
    {
        return $this->admission_date->diffInYears(now());
    }

    /**
     * Generate admission number
     */
    public static function generateAdmissionNumber(School $school, string $academicYear): string
    {
        $count = self::whereHas('student', function($query) use ($school) {
            $query->where('school_id', $school->id);
        })->whereYear('admission_date', $academicYear)->count() + 1;

        return $school->code . '/ADM/' . $academicYear . '/' . str_pad($count, 4, '0', STR_PAD_LEFT);
    }
}
