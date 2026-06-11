<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubjectCombination extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'name',
        'code',
        'level',
        'description',
        'is_active',
        'necta_code',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the school this combination belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the subjects in this combination
     */
    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'subject_combination_subjects')
            ->withPivot(['is_principal', 'is_subsidiary', 'is_compulsory'])
            ->withTimestamps();
    }

    /**
     * Get students assigned to this combination
     */
    public function students(): HasMany
    {
        return $this->hasMany(User::class, 'subject_combination_id');
    }

    /**
     * Check if combination is for A-Level
     */
    public function isALevel(): bool
    {
        return $this->level === 'A-Level';
    }

    /**
     * Check if combination is for O-Level
     */
    public function isOLevel(): bool
    {
        return $this->level === 'O-Level';
    }

    /**
     * Get principal subjects
     */
    public function principalSubjects()
    {
        return $this->subjects()->wherePivot('is_principal', true);
    }

    /**
     * Get subsidiary subjects
     */
    public function subsidiarySubjects()
    {
        return $this->subjects()->wherePivot('is_subsidiary', true);
    }

    /**
     * Get compulsory subjects
     */
    public function compulsorySubjects()
    {
        return $this->subjects()->wherePivot('is_compulsory', true);
    }
}



