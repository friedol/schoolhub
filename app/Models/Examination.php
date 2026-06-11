<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Examination extends Model
{
    use HasFactory;

    protected $table = 'exams';

    protected $fillable = [
        'school_id',
        'academic_term_id',
        'name',
        'exam_type',
        'start_date',
        'end_date',
        'is_published',
        'created_by',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_published' => 'boolean',
    ];

    /**
     * Get the school that owns the examination
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the academic term that belongs to the examination
     */
    public function academicTerm(): BelongsTo
    {
        return $this->belongsTo(AcademicTerm::class);
    }

    /**
     * Get the user who created the examination
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the exam sessions for this examination
     */
    public function examSessions(): HasMany
    {
        return $this->hasMany(ExamSession::class, 'exam_id');
    }

    /**
     * Get examination duration in days
     */
    public function getDurationAttribute(): int
    {
        return $this->start_date->diffInDays($this->end_date) + 1;
    }
}



