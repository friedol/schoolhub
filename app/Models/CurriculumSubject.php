<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CurriculumSubject extends Model
{
    use HasFactory;

    protected $fillable = [
        'curriculum_id',
        'subject_id',
        'is_core',
        'is_elective',
        'credits',
        'weekly_periods',
        'is_compulsory',
        'passing_grade',
        'settings',
    ];

    protected $casts = [
        'is_core' => 'boolean',
        'is_elective' => 'boolean',
        'is_compulsory' => 'boolean',
        'credits' => 'integer',
        'weekly_periods' => 'integer',
        'passing_grade' => 'integer',
        'settings' => 'array',
    ];

    /**
     * Get the curriculum this subject belongs to
     */
    public function curriculum(): BelongsTo
    {
        return $this->belongsTo(Curriculum::class);
    }

    /**
     * Get the subject details
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Check if subject is core
     */
    public function isCore(): bool
    {
        return $this->is_core;
    }

    /**
     * Check if subject is elective
     */
    public function isElective(): bool
    {
        return $this->is_elective;
    }
}
