<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SeatingArrangement extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_session_id',
        'student_id',
        'seat_number',
        'row_number',
        'column_number',
        'room_id',
        'is_absent',
        'is_reserved',
        'notes',
    ];

    protected $casts = [
        'is_absent' => 'boolean',
        'is_reserved' => 'boolean',
    ];

    /**
     * Get the exam session
     */
    public function examSession(): BelongsTo
    {
        return $this->belongsTo(ExamSession::class);
    }

    /**
     * Get the student
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the room
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * Check if student is absent
     */
    public function isAbsent(): bool
    {
        return $this->is_absent;
    }

    /**
     * Get seat display name
     */
    public function getSeatDisplayAttribute(): string
    {
        return "Seat {$this->seat_number} (Row {$this->row_number}, Column {$this->column_number})";
    }
}



