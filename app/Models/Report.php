<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'name',
        'description',
        'category',
        'type',
        'data_source',
        'query_config',
        'filter_config',
        'output_config',
        'is_public',
        'is_scheduled',
        'schedule_config',
        'created_by',
        'last_run_at',
        'run_count',
        'is_active',
    ];

    protected $casts = [
        'query_config' => 'array',
        'filter_config' => 'array',
        'output_config' => 'array',
        'schedule_config' => 'array',
        'is_public' => 'boolean',
        'is_scheduled' => 'boolean',
        'last_run_at' => 'datetime',
        'run_count' => 'integer',
        'is_active' => 'boolean',
    ];

    const CATEGORY_OPTIONS = [
        'academic' => 'Academic Reports',
        'financial' => 'Financial Reports',
        'operational' => 'Operational Reports',
        'regulatory' => 'Regulatory Reports',
        'custom' => 'Custom Reports',
    ];

    const TYPE_OPTIONS = [
        'pre_built' => 'Pre-built Report',
        'custom' => 'Custom Report',
        'dashboard' => 'Dashboard Widget',
    ];

    const DATA_SOURCE_OPTIONS = [
        'students' => 'Students',
        'teachers' => 'Teachers',
        'attendance' => 'Attendance',
        'academic_records' => 'Academic Records',
        'fees' => 'Fees',
        'payments' => 'Payments',
        'inventory' => 'Inventory',
        'transport' => 'Transport',
        'hostel' => 'Hostel',
        'library' => 'Library',
        'events' => 'Events',
        'communications' => 'Communications',
    ];

    // Relationships
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reportRuns(): HasMany
    {
        return $this->hasMany(ReportRun::class);
    }

    public function reportShares(): HasMany
    {
        return $this->hasMany(ReportShare::class);
    }

    public function dashboardWidgets(): HasMany
    {
        return $this->hasMany(DashboardWidget::class);
    }

    // Scopes
    public function scopeForSchool($query, $schoolId)
    {
        return $query->where('school_id', $schoolId);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeScheduled($query)
    {
        return $query->where('is_scheduled', true);
    }

    // Accessors
    public function getCategoryDisplayAttribute(): string
    {
        return self::CATEGORY_OPTIONS[$this->category] ?? $this->category;
    }

    public function getTypeDisplayAttribute(): string
    {
        return self::TYPE_OPTIONS[$this->type] ?? $this->type;
    }

    public function getDataSourceDisplayAttribute(): string
    {
        return self::DATA_SOURCE_OPTIONS[$this->data_source] ?? $this->data_source;
    }

    public function getLastRunDisplayAttribute(): string
    {
        return $this->last_run_at ? $this->last_run_at->diffForHumans() : 'Never';
    }

    // Methods
    public function incrementRunCount(): void
    {
        $this->increment('run_count');
        $this->update(['last_run_at' => now()]);
    }

    public function getQueryConfig(): array
    {
        return $this->query_config ?? [];
    }

    public function getFilterConfig(): array
    {
        return $this->filter_config ?? [];
    }

    public function getOutputConfig(): array
    {
        return $this->output_config ?? [];
    }

    public function getScheduleConfig(): array
    {
        return $this->schedule_config ?? [];
    }

    public function canBeAccessedBy(User $user): bool
    {
        if ($this->is_public) {
            return true;
        }

        if ($this->created_by === $user->id) {
            return true;
        }

        return $this->reportShares()
            ->where('user_id', $user->id)
            ->exists();
    }

    public function shareWith(User $user, string $permission = 'view'): void
    {
        $this->reportShares()->updateOrCreate(
            ['user_id' => $user->id],
            ['permission' => $permission]
        );
    }

    public function unshareWith(User $user): void
    {
        $this->reportShares()->where('user_id', $user->id)->delete();
    }

    public function getSharedUsers()
    {
        return $this->reportShares()->with('user')->get();
    }
}



