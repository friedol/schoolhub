<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Graduation extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'graduation_year',
        'graduation_date',
        'final_class_id',
        'certificate_number',
        'certificate_issued_date',
        'necta_certificate_number',
        'necta_certificate_year',
        'graduation_ceremony_date',
        'graduation_ceremony_attended',
        'graduation_speech',
        'awards_received',
        'higher_education_institution',
        'higher_education_program',
        'current_occupation',
        'current_employer',
        'contact_email',
        'contact_phone',
        'address',
        'is_alumni',
        'alumni_member_since',
        'notes',
    ];

    protected $casts = [
        'graduation_date' => 'date',
        'certificate_issued_date' => 'date',
        'graduation_ceremony_date' => 'date',
        'graduation_ceremony_attended' => 'boolean',
        'awards_received' => 'array',
        'is_alumni' => 'boolean',
        'alumni_member_since' => 'date',
    ];

    /**
     * Get the student
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the final class
     */
    public function finalClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'final_class_id');
    }

    /**
     * Check if student attended graduation ceremony
     */
    public function attendedCeremony(): bool
    {
        return $this->graduation_ceremony_attended;
    }

    /**
     * Check if student is alumni member
     */
    public function isAlumniMember(): bool
    {
        return $this->is_alumni;
    }

    /**
     * Get graduation level
     */
    public function getGraduationLevelAttribute(): string
    {
        return match($this->finalClass->level ?? '') {
            'Standard VII' => 'Primary School',
            'Form IV' => 'O-Level',
            'Form VI' => 'A-Level',
            default => 'Unknown'
        };
    }

    /**
     * Get awards as comma-separated string
     */
    public function getAwardsStringAttribute(): string
    {
        if (!$this->awards_received) {
            return 'None';
        }
        return implode(', ', $this->awards_received);
    }
}



