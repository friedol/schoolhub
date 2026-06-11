<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Grade extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'name',
        'code',
        'level',
        'description',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    const LEVEL_OPTIONS = [
        'pre_primary' => 'Pre-Primary',
        'primary' => 'Primary',
        'o_level' => 'O-Level',
        'a_level' => 'A-Level',
    ];

    // Relationships
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function classes(): HasMany
    {
        return $this->hasMany(SchoolClass::class);
    }

    public function students(): HasMany
    {
        return $this->hasMany(User::class, 'grade_id');
    }

    public function announcements(): BelongsToMany
    {
        return $this->belongsToMany(Announcement::class, 'announcement_target_grades');
    }

    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'event_target_grades');
    }

    // Scopes
    public function scopeForSchool($query, $schoolId)
    {
        return $query->where('school_id', $schoolId);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByLevel($query, $level)
    {
        return $query->where('level', $level);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    // Accessors
    public function getLevelDisplayAttribute(): string
    {
        return self::LEVEL_OPTIONS[$this->level] ?? $this->level;
    }

    // Methods
    public function getStudentsCount(): int
    {
        return $this->students()->where('role', 'student')->count();
    }

    public function getClassesCount(): int
    {
        return $this->classes()->count();
    }

    public static function getByLevel($level)
    {
        return self::where('level', $level)
                  ->where('is_active', true)
                  ->orderBy('sort_order')
                  ->orderBy('name')
                  ->get();
    }

    public static function getPrimaryGrades()
    {
        return self::getByLevel('primary');
    }

    public static function getOLevelGrades()
    {
        return self::getByLevel('o_level');
    }

    public static function getALevelGrades()
    {
        return self::getByLevel('a_level');
    }
}



