<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReportTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'name',
        'description',
        'category',
        'data_source',
        'query_template',
        'filter_template',
        'output_template',
        'is_system',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'query_template' => 'array',
        'filter_template' => 'array',
        'output_template' => 'array',
        'is_system' => 'boolean',
        'is_active' => 'boolean',
    ];

    const CATEGORY_OPTIONS = [
        'academic' => 'Academic Reports',
        'financial' => 'Financial Reports',
        'operational' => 'Operational Reports',
        'regulatory' => 'Regulatory Reports',
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

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class, 'template_id');
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

    public function scopeByDataSource($query, $dataSource)
    {
        return $query->where('data_source', $dataSource);
    }

    public function scopeSystem($query)
    {
        return $query->where('is_system', true);
    }

    public function scopeCustom($query)
    {
        return $query->where('is_system', false);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Accessors
    public function getCategoryDisplayAttribute(): string
    {
        return self::CATEGORY_OPTIONS[$this->category] ?? $this->category;
    }

    public function getDataSourceDisplayAttribute(): string
    {
        return self::DATA_SOURCE_OPTIONS[$this->data_source] ?? $this->data_source;
    }

    public function getQueryTemplateAttribute($value): array
    {
        return json_decode($value, true) ?? [];
    }

    public function setQueryTemplateAttribute($value): void
    {
        $this->attributes['query_template'] = json_encode($value);
    }

    public function getFilterTemplateAttribute($value): array
    {
        return json_decode($value, true) ?? [];
    }

    public function setFilterTemplateAttribute($value): void
    {
        $this->attributes['filter_template'] = json_encode($value);
    }

    public function getOutputTemplateAttribute($value): array
    {
        return json_decode($value, true) ?? [];
    }

    public function setOutputTemplateAttribute($value): void
    {
        $this->attributes['output_template'] = json_encode($value);
    }

    // Methods
    public function createReport(array $config, int $userId): Report
    {
        return Report::create([
            'school_id' => $this->school_id,
            'name' => $config['name'] ?? $this->name,
            'description' => $config['description'] ?? $this->description,
            'category' => $this->category,
            'type' => 'custom',
            'data_source' => $this->data_source,
            'query_config' => array_merge($this->query_template, $config['query'] ?? []),
            'filter_config' => array_merge($this->filter_template, $config['filters'] ?? []),
            'output_config' => array_merge($this->output_template, $config['output'] ?? []),
            'is_public' => $config['is_public'] ?? false,
            'is_scheduled' => $config['is_scheduled'] ?? false,
            'schedule_config' => $config['schedule'] ?? [],
            'created_by' => $userId,
            'is_active' => true,
        ]);
    }

    public function getUsageCount(): int
    {
        return $this->reports()->count();
    }

    public function canBeDeleted(): bool
    {
        return !$this->is_system && $this->getUsageCount() === 0;
    }

    public function duplicate(int $userId): self
    {
        return self::create([
            'school_id' => $this->school_id,
            'name' => $this->name . ' (Copy)',
            'description' => $this->description,
            'category' => $this->category,
            'data_source' => $this->data_source,
            'query_template' => $this->query_template,
            'filter_template' => $this->filter_template,
            'output_template' => $this->output_template,
            'is_system' => false,
            'is_active' => true,
            'created_by' => $userId,
        ]);
    }
}



