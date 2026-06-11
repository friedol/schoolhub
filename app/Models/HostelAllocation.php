<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;

class HostelAllocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'hostel_id',
        'floor_id',
        'room_id',
        'bed_id',
        'student_id',
        'allocation_date',
        'allocation_type',
        'academic_year',
        'term',
        'is_active',
        'allocation_notes',
        'allocated_by',
        'created_by',
    ];

    protected $casts = [
        'allocation_date' => 'date',
        'is_active' => 'boolean',
    ];

    // Allocation type constants
    const TYPE_NEW = 'new';
    const TYPE_TRANSFER = 'transfer';
    const TYPE_REALLOCATION = 'reallocation';

    const TYPE_OPTIONS = [
        self::TYPE_NEW => 'New Allocation',
        self::TYPE_TRANSFER => 'Transfer',
        self::TYPE_REALLOCATION => 'Reallocation',
    ];

    /**
     * Get the hostel for this allocation
     */
    public function hostel(): BelongsTo
    {
        return $this->belongsTo(Hostel::class);
    }

    /**
     * Get the floor for this allocation
     */
    public function floor(): BelongsTo
    {
        return $this->belongsTo(HostelFloor::class, 'floor_id');
    }

    /**
     * Get the room for this allocation
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(HostelRoom::class, 'room_id');
    }

    /**
     * Get the bed for this allocation
     */
    public function bed(): BelongsTo
    {
        return $this->belongsTo(HostelBed::class, 'bed_id');
    }

    /**
     * Get the student for this allocation
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the user who allocated this bed
     */
    public function allocatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'allocated_by');
    }

    /**
     * Get the user who created this allocation
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get leave applications for this allocation
     */
    public function leaveApplications(): HasMany
    {
        return $this->hasMany(HostelLeaveApplication::class, 'allocation_id');
    }

    /**
     * Get allocation history for this student
     */
    public function allocationHistory(): HasMany
    {
        return $this->hasMany(HostelAllocationHistory::class, 'allocation_id');
    }

    /**
     * Get current allocation for a student
     */
    public static function getCurrentAllocation($studentId)
    {
        return self::where('student_id', $studentId)
            ->where('is_active', true)
            ->with(['hostel', 'floor', 'room', 'bed'])
            ->first();
    }

    /**
     * Get allocation history for a student
     */
    public static function getAllocationHistory($studentId)
    {
        return self::where('student_id', $studentId)
            ->with(['hostel', 'floor', 'room', 'bed', 'allocatedBy'])
            ->orderBy('allocation_date', 'desc')
            ->get();
    }

    /**
     * Check if allocation is current
     */
    public function isCurrent(): bool
    {
        return $this->is_active;
    }

    /**
     * Get allocation duration in days
     */
    public function getDurationInDaysAttribute(): int
    {
        return $this->allocation_date->diffInDays(now());
    }

    /**
     * Get allocation display string
     */
    public function getDisplayStringAttribute(): string
    {
        return "{$this->hostel->name} - Floor {$this->floor->floor_number} - {$this->room->display_name} - Bed {$this->bed->bed_number}";
    }

    /**
     * Scope for current allocations
     */
    public function scopeCurrent($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for allocations by hostel
     */
    public function scopeByHostel($query, $hostelId)
    {
        return $query->where('hostel_id', $hostelId);
    }

    /**
     * Scope for allocations by academic year
     */
    public function scopeByAcademicYear($query, $academicYear)
    {
        return $query->where('academic_year', $academicYear);
    }

    /**
     * Scope for allocations by term
     */
    public function scopeByTerm($query, $term)
    {
        return $query->where('term', $term);
    }

    /**
     * Boot method to set created_by
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($allocation) {
            if (!$allocation->created_by) {
                $allocation->created_by = Auth::id();
            }
        });
    }
}



