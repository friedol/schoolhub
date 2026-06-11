<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimetableSlot extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'timetable_id',
        'day_of_week',
        'period_id',
        'subject_id',
        'teacher_id',
        'class_room_id',
    ];

    /**
     * Get the parent timetable header
     */
    public function timetable(): BelongsTo
    {
        return $this->belongsTo(Timetable::class);
    }

    /**
     * Get the period for this slot
     */
    public function period(): BelongsTo
    {
        return $this->belongsTo(Period::class);
    }

    /**
     * Get the subject for this slot
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Get the teacher assigned to this slot (references users.id)
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * Get the classroom assigned to this slot
     */
    public function classroom(): BelongsTo
    {
        return $this->belongsTo(ClassRoom::class, 'class_room_id');
    }
}
