<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class School extends Model
{
    use HasFactory;

    protected $fillable = [
        'platform_id',
        'name',
        'code',
        'description',
        'logo',
        'motto',
        'address',
        'region',
        'district',
        'ward',
        'contact_email',
        'contact_phone',
        'school_level', // nursery, primary, secondary, combined
        'registration_number',
        'necta_number',
        'is_active',
        'settings',
        'academic_calendar',
        'fee_structure',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'settings' => 'array',
        'academic_calendar' => 'array',
        'fee_structure' => 'array',
    ];

    /**
     * Get the platform this school belongs to
     */
    public function platform(): BelongsTo
    {
        return $this->belongsTo(Platform::class);
    }

    /**
     * Get all users belonging to this school
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get school administrators
     */
    public function administrators()
    {
        return $this->users()->whereIn('role', ['school_admin', 'headteacher', 'bursar']);
    }

    /**
     * Get teachers in this school
     */
    public function teachers()
    {
        return $this->users()->where('role', 'teacher');
    }

    /**
     * Get students in this school
     */
    public function students()
    {
        return $this->users()->where('role', 'student');
    }

    /**
     * Get parents of students in this school
     */
    public function parents()
    {
        return $this->users()->where('role', 'parent');
    }

    /**
     * Get classes in this school
     */
    public function classes(): HasMany
    {
        return $this->hasMany(SchoolClass::class);
    }

    /**
     * Get subjects offered in this school
     */
    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class);
    }

    /**
     * Get academic terms for this school
     */
    public function academicTerms(): HasMany
    {
        return $this->hasMany(AcademicTerm::class);
    }

    /**
     * Get fee categories for this school
     */
    public function feeCategories(): HasMany
    {
        return $this->hasMany(FeeCategory::class);
    }

    /**
     * Get school statistics
     */
    public function getStatistics(): array
    {
        return [
            'total_students' => $this->students()->count(),
            'total_teachers' => $this->teachers()->count(),
            'total_staff' => $this->users()->whereIn('role', ['headteacher', 'bursar', 'librarian', 'dormitory_manager', 'academic_master'])->count(),
            'total_classes' => $this->classes()->count(),
            'total_subjects' => $this->subjects()->count(),
        ];
    }

    /**
     * Check if school is NECTA registered
     */
    public function isNectaRegistered(): bool
    {
        return !empty($this->necta_number);
    }

    /**
     * Get school level display name
     */
    public function getSchoolLevelDisplayAttribute(): string
    {
        return match($this->school_level) {
            'nursery' => 'Nursery School',
            'primary' => 'Primary School',
            'secondary' => 'Secondary School',
            'combined' => 'Combined School',
            default => 'Unknown'
        };
    }
}
