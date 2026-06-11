<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentDisciplinaryRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'incident_date',
        'incident_type',
        'description',
        'severity',
        'action_taken',
        'teacher_id',
        'witnesses',
        'parent_notified',
        'parent_notification_date',
        'follow_up_required',
        'follow_up_date',
        'resolved',
        'resolved_date',
        'notes',
    ];

    protected $casts = [
        'incident_date' => 'date',
        'witnesses' => 'array',
        'parent_notified' => 'boolean',
        'parent_notification_date' => 'date',
        'follow_up_required' => 'boolean',
        'follow_up_date' => 'date',
        'resolved' => 'boolean',
        'resolved_date' => 'date',
    ];

    const INCIDENT_TYPE_ACADEMIC_MISCONDUCT = 'academic_misconduct';
    const INCIDENT_TYPE_BEHAVIORAL_ISSUE = 'behavioral_issue';
    const INCIDENT_TYPE_ATTENDANCE_ISSUE = 'attendance_issue';
    const INCIDENT_TYPE_BULLYING = 'bullying';
    const INCIDENT_TYPE_DAMAGE_TO_PROPERTY = 'damage_to_property';
    const INCIDENT_TYPE_DRUG_ALCOHOL = 'drug_alcohol';
    const INCIDENT_TYPE_FIGHTING = 'fighting';
    const INCIDENT_TYPE_THEFT = 'theft';
    const INCIDENT_TYPE_OTHER = 'other';

    const SEVERITY_MINOR = 'minor';
    const SEVERITY_MODERATE = 'moderate';
    const SEVERITY_MAJOR = 'major';
    const SEVERITY_SEVERE = 'severe';

    const ACTION_VERBAL_WARNING = 'verbal_warning';
    const ACTION_WRITTEN_WARNING = 'written_warning';
    const ACTION_DETENTION = 'detention';
    const ACTION_SUSPENSION = 'suspension';
    const ACTION_EXPULSION = 'expulsion';
    const ACTION_PARENT_MEETING = 'parent_meeting';
    const ACTION_COUNSELING = 'counseling';
    const ACTION_OTHER = 'other';

    /**
     * Get the student this disciplinary record belongs to
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the teacher who reported this incident
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * Check if incident is resolved
     */
    public function isResolved(): bool
    {
        return $this->resolved;
    }

    /**
     * Get incident type display name
     */
    public function getIncidentTypeDisplayAttribute(): string
    {
        return match($this->incident_type) {
            self::INCIDENT_TYPE_ACADEMIC_MISCONDUCT => 'Academic Misconduct',
            self::INCIDENT_TYPE_BEHAVIORAL_ISSUE => 'Behavioral Issue',
            self::INCIDENT_TYPE_ATTENDANCE_ISSUE => 'Attendance Issue',
            self::INCIDENT_TYPE_BULLYING => 'Bullying',
            self::INCIDENT_TYPE_DAMAGE_TO_PROPERTY => 'Damage to Property',
            self::INCIDENT_TYPE_DRUG_ALCOHOL => 'Drug/Alcohol',
            self::INCIDENT_TYPE_FIGHTING => 'Fighting',
            self::INCIDENT_TYPE_THEFT => 'Theft',
            self::INCIDENT_TYPE_OTHER => 'Other',
            default => 'Unknown'
        };
    }

    /**
     * Get severity display name
     */
    public function getSeverityDisplayAttribute(): string
    {
        return match($this->severity) {
            self::SEVERITY_MINOR => 'Minor',
            self::SEVERITY_MODERATE => 'Moderate',
            self::SEVERITY_MAJOR => 'Major',
            self::SEVERITY_SEVERE => 'Severe',
            default => 'Unknown'
        };
    }

    /**
     * Get action taken display name
     */
    public function getActionTakenDisplayAttribute(): string
    {
        return match($this->action_taken) {
            self::ACTION_VERBAL_WARNING => 'Verbal Warning',
            self::ACTION_WRITTEN_WARNING => 'Written Warning',
            self::ACTION_DETENTION => 'Detention',
            self::ACTION_SUSPENSION => 'Suspension',
            self::ACTION_EXPULSION => 'Expulsion',
            self::ACTION_PARENT_MEETING => 'Parent Meeting',
            self::ACTION_COUNSELING => 'Counseling',
            self::ACTION_OTHER => 'Other',
            default => 'Unknown'
        };
    }

    /**
     * Get severity color for UI
     */
    public function getSeverityColorAttribute(): string
    {
        return match($this->severity) {
            self::SEVERITY_MINOR => 'green',
            self::SEVERITY_MODERATE => 'yellow',
            self::SEVERITY_MAJOR => 'orange',
            self::SEVERITY_SEVERE => 'red',
            default => 'gray'
        };
    }
}



