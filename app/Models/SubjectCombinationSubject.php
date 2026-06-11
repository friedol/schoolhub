<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubjectCombinationSubject extends Model
{
    use HasFactory;

    protected $table = 'subject_combination_subjects';

    protected $fillable = [
        'subject_combination_id',
        'subject_id',
        'is_principal',
        'is_subsidiary',
        'is_compulsory',
    ];

    protected $casts = [
        'is_principal' => 'boolean',
        'is_subsidiary' => 'boolean',
        'is_compulsory' => 'boolean',
    ];

    /**
     * Get the subject combination
     */
    public function subjectCombination(): BelongsTo
    {
        return $this->belongsTo(SubjectCombination::class);
    }

    /**
     * Get the subject
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }
}



