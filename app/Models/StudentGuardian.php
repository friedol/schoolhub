<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentGuardian extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'guardian_name',
        'relationship',
        'phone_number',
        'email',
        'occupation',
        'employer',
        'address',
        'is_primary_contact',
        'is_emergency_contact',
        'is_active',
        'notes',
        'photo',
    ];

    protected $casts = [
        'is_primary_contact' => 'boolean',
        'is_emergency_contact' => 'boolean',
        'is_active' => 'boolean',
    ];

    const RELATIONSHIP_FATHER = 'father';
    const RELATIONSHIP_MOTHER = 'mother';
    const RELATIONSHIP_GRANDFATHER = 'grandfather';
    const RELATIONSHIP_GRANDMOTHER = 'grandmother';
    const RELATIONSHIP_UNCLE = 'uncle';
    const RELATIONSHIP_AUNT = 'aunt';
    const RELATIONSHIP_BROTHER = 'brother';
    const RELATIONSHIP_SISTER = 'sister';
    const RELATIONSHIP_GUARDIAN = 'guardian';
    const RELATIONSHIP_OTHER = 'other';

    /**
     * Get the student this guardian belongs to
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Check if this is the primary contact
     */
    public function isPrimaryContact(): bool
    {
        return $this->is_primary_contact;
    }

    /**
     * Check if this is an emergency contact
     */
    public function isEmergencyContact(): bool
    {
        return $this->is_emergency_contact;
    }

    /**
     * Get relationship display name
     */
    public function getRelationshipDisplayAttribute(): string
    {
        return match($this->relationship) {
            self::RELATIONSHIP_FATHER => 'Father',
            self::RELATIONSHIP_MOTHER => 'Mother',
            self::RELATIONSHIP_GRANDFATHER => 'Grandfather',
            self::RELATIONSHIP_GRANDMOTHER => 'Grandmother',
            self::RELATIONSHIP_UNCLE => 'Uncle',
            self::RELATIONSHIP_AUNT => 'Aunt',
            self::RELATIONSHIP_BROTHER => 'Brother',
            self::RELATIONSHIP_SISTER => 'Sister',
            self::RELATIONSHIP_GUARDIAN => 'Guardian',
            self::RELATIONSHIP_OTHER => 'Other',
            default => 'Unknown'
        };
    }

    /**
     * Get full contact information
     */
    public function getFullContactAttribute(): string
    {
        $contact = $this->guardian_name;
        if ($this->phone_number) {
            $contact .= " - {$this->phone_number}";
        }
        if ($this->email) {
            $contact .= " ({$this->email})";
        }
        return $contact;
    }
}



