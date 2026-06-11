<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'room_number',
        'room_name',
        'room_type',
        'capacity',
        'rows',
        'columns',
        'floor',
        'building',
        'facilities',
        'is_active',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'rows' => 'integer',
        'columns' => 'integer',
        'facilities' => 'array',
        'is_active' => 'boolean',
    ];

    protected $appends = ['code', 'room_type_display', 'room_display'];

    public function getCodeAttribute(): string
    {
        return 'R' . str_pad($this->id, 6, '0', STR_PAD_LEFT);
    }

    const ROOM_TYPE_CLASSROOM = 'classroom';
    const ROOM_TYPE_LABORATORY = 'laboratory';
    const ROOM_TYPE_LIBRARY = 'library';
    const ROOM_TYPE_COMPUTER_LAB = 'computer_lab';
    const ROOM_TYPE_ART_ROOM = 'art_room';
    const ROOM_TYPE_MUSIC_ROOM = 'music_room';
    const ROOM_TYPE_PHYSICS_LAB = 'physics_lab';
    const ROOM_TYPE_CHEMISTRY_LAB = 'chemistry_lab';
    const ROOM_TYPE_BIOLOGY_LAB = 'biology_lab';
    const ROOM_TYPE_HALL = 'hall';
    const ROOM_TYPE_OFFICE = 'office';

    /**
     * Get the school this room belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get timetable entries for this room
     */
    public function timetableEntries(): HasMany
    {
        return $this->hasMany(Timetable::class, 'room_id');
    }

    /**
     * Check if room is active
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Get room type display name
     */
    public function getRoomTypeDisplayAttribute(): string
    {
        return match($this->room_type) {
            self::ROOM_TYPE_CLASSROOM => 'Classroom',
            self::ROOM_TYPE_LABORATORY => 'Laboratory',
            self::ROOM_TYPE_LIBRARY => 'Library',
            self::ROOM_TYPE_COMPUTER_LAB => 'Computer Lab',
            self::ROOM_TYPE_ART_ROOM => 'Art Room',
            self::ROOM_TYPE_MUSIC_ROOM => 'Music Room',
            self::ROOM_TYPE_PHYSICS_LAB => 'Physics Lab',
            self::ROOM_TYPE_CHEMISTRY_LAB => 'Chemistry Lab',
            self::ROOM_TYPE_BIOLOGY_LAB => 'Biology Lab',
            self::ROOM_TYPE_HALL => 'Hall',
            self::ROOM_TYPE_OFFICE => 'Office',
            default => 'Unknown'
        };
    }

    /**
     * Get room display name
     */
    public function getRoomDisplayAttribute(): string
    {
        return $this->room_name ?: "Room {$this->room_number}";
    }
}



