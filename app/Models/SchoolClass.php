<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class SchoolClass extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'school_type_id',
        'name',
        'level',
        'stream',
        'section',
        'capacity',
        'class_teacher_id',
        'room_number',
        'is_active',
        'settings',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'settings' => 'array',
    ];

    /**
     * Get the school type this class belongs to
     */
    public function schoolType(): BelongsTo
    {
        return $this->belongsTo(SchoolType::class, 'school_type_id');
    }

    /**
     * Get the school this class belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the class teacher
     */
    public function classTeacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'class_teacher_id');
    }

    /**
     * Get students in this class
     */
    public function students()
    {
        return $this->hasManyThrough(
            User::class,
            StudentProfile::class,
            'class_id',
            'id',
            'id',
            'student_id'
        )->where('users.role', 'student');
    }

    /**
     * Get subjects for this class
     */
    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'class_subjects', 'school_class_id', 'subject_id');
    }

    /**
     * Get class name with stream
     */
    public function getFullNameAttribute(): string
    {
        return $this->stream ? "{$this->name} {$this->stream}" : $this->name;
    }

    /**
     * Get class statistics
     */
    public function getStatistics(): array
    {
        return [
            'total_students' => $this->students()->count(),
            'total_subjects' => $this->subjects()->count(),
            'capacity_utilization' => $this->capacity > 0 ? 
                round(($this->students()->count() / $this->capacity) * 100, 2) : 0,
        ];
    }
}
