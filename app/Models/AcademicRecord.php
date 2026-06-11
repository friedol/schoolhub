<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AcademicRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'subject_id',
        'academic_term_id',
        'school_class_id',
        'marks_obtained',
        'total_marks',
        'grade',
        'position',
        'teacher_comment',
        'is_published',
    ];

    protected $casts = [
        'marks_obtained' => 'decimal:2',
        'total_marks' => 'decimal:2',
        'is_published' => 'boolean',
    ];

    /**
     * Get the student that owns the academic record
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the subject that belongs to the academic record
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Get the academic term that belongs to the academic record
     */
    public function academicTerm(): BelongsTo
    {
        return $this->belongsTo(AcademicTerm::class);
    }

    /**
     * Get the school class that belongs to the academic record
     */
    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class);
    }

    /**
     * Calculate percentage
     */
    public function getPercentageAttribute(): float
    {
        if ($this->total_marks > 0) {
            return round(($this->marks_obtained / $this->total_marks) * 100, 2);
        }
        return 0;
    }
}



