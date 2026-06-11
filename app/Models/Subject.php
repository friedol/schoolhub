<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subject extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'school_id',
        'school_type_id',
        'name',
        'code',
        'description',
        'necta_code',
        'category',
        'is_core',
        'is_elective',
        'is_necta_subject',
        'credits',
        'is_active',
        'settings',
    ];

    protected $casts = [
        'is_core' => 'boolean',
        'is_elective' => 'boolean',
        'is_necta_subject' => 'boolean',
        'is_active' => 'boolean',
        'settings' => 'array',
    ];

    /**
     * Get the school type this subject belongs to
     */
    public function schoolType(): BelongsTo
    {
        return $this->belongsTo(SchoolType::class, 'school_type_id');
    }

    /**
     * Get the school this subject belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get subject combinations that include this subject
     */
    public function subjectCombinations(): BelongsToMany
    {
        return $this->belongsToMany(SubjectCombination::class, 'subject_combination_subjects')
            ->withPivot(['is_principal', 'is_subsidiary', 'is_compulsory'])
            ->withTimestamps();
    }

    /**
     * Get class subjects
     */
    public function classSubjects(): HasMany
    {
        return $this->hasMany(ClassSubject::class);
    }

    /**
     * Get subject teachers
     */
    public function teachers(): HasMany
    {
        return $this->hasMany(SubjectTeacher::class);
    }

    /**
     * Get academic records for this subject
     */
    public function academicRecords(): HasMany
    {
        return $this->hasMany(AcademicRecord::class);
    }

    /**
     * Check if subject is NECTA compliant
     */
    public function isNectaCompliant(): bool
    {
        return $this->is_necta_subject;
    }

    /**
     * Get subject category display name
     */
    public function getCategoryDisplayAttribute(): string
    {
        return match($this->category) {
            'core' => 'Core Subject',
            'elective' => 'Elective Subject',
            'language' => 'Language Subject',
            'science' => 'Science Subject',
            'mathematics' => 'Mathematics Subject',
            'social' => 'Social Studies Subject',
            'arts' => 'Arts Subject',
            'practical' => 'Practical Subject',
            default => 'General Subject'
        };
    }
}
