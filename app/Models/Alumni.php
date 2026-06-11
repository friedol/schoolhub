<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Alumni extends Model
{
    use HasFactory;

    protected $table = 'alumni';

    protected $fillable = [
        'student_id',
        'graduation_id',
        'graduation_year',
        'final_class',
        'current_name',
        'email',
        'phone',
        'address',
        'city',
        'country',
        'occupation',
        'employer',
        'industry',
        'higher_education_institution',
        'higher_education_degree',
        'higher_education_year',
        'social_media_linkedin',
        'social_media_facebook',
        'social_media_twitter',
        'social_media_instagram',
        'is_mentor',
        'mentor_areas',
        'is_volunteer',
        'volunteer_areas',
        'newsletter_subscription',
        'event_notifications',
        'privacy_level',
        'last_contact_date',
        'notes',
    ];

    protected $casts = [
        'mentor_areas' => 'array',
        'volunteer_areas' => 'array',
        'is_mentor' => 'boolean',
        'is_volunteer' => 'boolean',
        'newsletter_subscription' => 'boolean',
        'event_notifications' => 'boolean',
        'last_contact_date' => 'date',
    ];

    const PRIVACY_LEVEL_PUBLIC = 'public';
    const PRIVACY_LEVEL_ALUMNI_ONLY = 'alumni_only';
    const PRIVACY_LEVEL_PRIVATE = 'private';

    /**
     * Get the student
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the graduation record
     */
    public function graduation(): BelongsTo
    {
        return $this->belongsTo(Graduation::class);
    }

    /**
     * Check if alumni is a mentor
     */
    public function isMentor(): bool
    {
        return $this->is_mentor;
    }

    /**
     * Check if alumni is a volunteer
     */
    public function isVolunteer(): bool
    {
        return $this->is_volunteer;
    }

    /**
     * Check if alumni subscribes to newsletter
     */
    public function subscribesToNewsletter(): bool
    {
        return $this->newsletter_subscription;
    }

    /**
     * Get privacy level display name
     */
    public function getPrivacyLevelDisplayAttribute(): string
    {
        return match($this->privacy_level) {
            self::PRIVACY_LEVEL_PUBLIC => 'Public',
            self::PRIVACY_LEVEL_ALUMNI_ONLY => 'Alumni Only',
            self::PRIVACY_LEVEL_PRIVATE => 'Private',
            default => 'Unknown'
        };
    }

    /**
     * Get full address
     */
    public function getFullAddressAttribute(): string
    {
        $address = $this->address;
        if ($this->city) {
            $address .= ", {$this->city}";
        }
        if ($this->country) {
            $address .= ", {$this->country}";
        }
        return $address;
    }

    /**
     * Get mentor areas as comma-separated string
     */
    public function getMentorAreasStringAttribute(): string
    {
        if (!$this->mentor_areas) {
            return 'None';
        }
        return implode(', ', $this->mentor_areas);
    }

    /**
     * Get volunteer areas as comma-separated string
     */
    public function getVolunteerAreasStringAttribute(): string
    {
        if (!$this->volunteer_areas) {
            return 'None';
        }
        return implode(', ', $this->volunteer_areas);
    }
}



