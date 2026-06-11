<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventRSVP extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'event_id',
        'user_id',
        'response',
        'guests_count',
        'dietary_requirements',
        'special_needs',
        'notes',
        'responded_at',
        'metadata',
    ];

    protected $casts = [
        'guests_count' => 'integer',
        'responded_at' => 'datetime',
        'metadata' => 'array',
    ];

    const RESPONSE_OPTIONS = [
        'attending' => 'Attending',
        'not_attending' => 'Not Attending',
        'maybe' => 'Maybe',
        'no_response' => 'No Response',
    ];

    // Relationships
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeForSchool($query, $schoolId)
    {
        return $query->where('school_id', $schoolId);
    }

    public function scopeByEvent($query, $eventId)
    {
        return $query->where('event_id', $eventId);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByResponse($query, $response)
    {
        return $query->where('response', $response);
    }

    public function scopeAttending($query)
    {
        return $query->where('response', 'attending');
    }

    public function scopeNotAttending($query)
    {
        return $query->where('response', 'not_attending');
    }

    public function scopeMaybe($query)
    {
        return $query->where('response', 'maybe');
    }

    public function scopeNoResponse($query)
    {
        return $query->where('response', 'no_response');
    }

    public function scopeResponded($query)
    {
        return $query->whereNotNull('responded_at');
    }

    // Accessors
    public function getResponseDisplayAttribute(): string
    {
        return self::RESPONSE_OPTIONS[$this->response] ?? $this->response;
    }

    public function getIsAttendingAttribute(): bool
    {
        return $this->response === 'attending';
    }

    public function getIsNotAttendingAttribute(): bool
    {
        return $this->response === 'not_attending';
    }

    public function getIsMaybeAttribute(): bool
    {
        return $this->response === 'maybe';
    }

    public function getHasRespondedAttribute(): bool
    {
        return !is_null($this->responded_at);
    }

    // Methods
    public function respond(string $response, int $guestsCount = 0, string $dietaryRequirements = null, string $specialNeeds = null, string $notes = null): void
    {
        $this->update([
            'response' => $response,
            'guests_count' => $guestsCount,
            'dietary_requirements' => $dietaryRequirements,
            'special_needs' => $specialNeeds,
            'notes' => $notes,
            'responded_at' => now(),
        ]);
    }

    public function markAsAttending(int $guestsCount = 0, string $dietaryRequirements = null, string $specialNeeds = null, string $notes = null): void
    {
        $this->respond('attending', $guestsCount, $dietaryRequirements, $specialNeeds, $notes);
    }

    public function markAsNotAttending(string $notes = null): void
    {
        $this->respond('not_attending', 0, null, null, $notes);
    }

    public function markAsMaybe(int $guestsCount = 0, string $notes = null): void
    {
        $this->respond('maybe', $guestsCount, null, null, $notes);
    }

    public function getTotalAttendees(): int
    {
        return $this->is_attending ? 1 + $this->guests_count : 0;
    }

    public static function getEventStats(int $eventId): array
    {
        $rsvps = self::where('event_id', $eventId)->get();
        
        return [
            'total_invited' => $rsvps->count(),
            'attending' => $rsvps->where('response', 'attending')->count(),
            'not_attending' => $rsvps->where('response', 'not_attending')->count(),
            'maybe' => $rsvps->where('response', 'maybe')->count(),
            'no_response' => $rsvps->where('response', 'no_response')->count(),
            'total_attendees' => $rsvps->where('response', 'attending')->sum(function ($rsvp) {
                return 1 + $rsvp->guests_count;
            }),
            'response_rate' => $rsvps->whereNotNull('responded_at')->count() / max($rsvps->count(), 1) * 100,
        ];
    }
}



