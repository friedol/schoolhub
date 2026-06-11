<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DashboardWidget extends Model
{
    use HasFactory;

    protected $fillable = [
        'dashboard_id',
        'report_id',
        'name',
        'type',
        'size',
        'position',
        'config',
        'refresh_interval',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'position' => 'array',
        'config' => 'array',
        'refresh_interval' => 'integer',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    const TYPE_OPTIONS = [
        'metric_card' => 'Metric Card',
        'chart' => 'Chart',
        'table' => 'Data Table',
        'calendar' => 'Calendar',
        'list' => 'List',
        'gauge' => 'Gauge',
        'progress' => 'Progress Bar',
        'text' => 'Text Widget',
        'image' => 'Image Widget',
    ];

    const SIZE_OPTIONS = [
        'small' => 'Small (1x1)',
        'medium' => 'Medium (2x1)',
        'large' => 'Large (2x2)',
        'wide' => 'Wide (3x1)',
        'tall' => 'Tall (1x2)',
        'full' => 'Full Width (4x1)',
    ];

    // Relationships
    public function dashboard(): BelongsTo
    {
        return $this->belongsTo(Dashboard::class);
    }

    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    // Scopes
    public function scopeByDashboard($query, $dashboardId)
    {
        return $query->where('dashboard_id', $dashboardId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('position->y')->orderBy('position->x');
    }

    // Accessors
    public function getTypeDisplayAttribute(): string
    {
        return self::TYPE_OPTIONS[$this->type] ?? $this->type;
    }

    public function getSizeDisplayAttribute(): string
    {
        return self::SIZE_OPTIONS[$this->size] ?? $this->size;
    }

    public function getPositionAttribute($value): array
    {
        return json_decode($value, true) ?? ['x' => 0, 'y' => 0];
    }

    public function setPositionAttribute($value): void
    {
        $this->attributes['position'] = json_encode($value);
    }

    public function getConfigAttribute($value): array
    {
        return json_decode($value, true) ?? [];
    }

    public function setConfigAttribute($value): void
    {
        $this->attributes['config'] = json_encode($value);
    }

    // Methods
    public function getSizeDimensions(): array
    {
        return match ($this->size) {
            'small' => ['width' => 1, 'height' => 1],
            'medium' => ['width' => 2, 'height' => 1],
            'large' => ['width' => 2, 'height' => 2],
            'wide' => ['width' => 3, 'height' => 1],
            'tall' => ['width' => 1, 'height' => 2],
            'full' => ['width' => 4, 'height' => 1],
            default => ['width' => 1, 'height' => 1],
        };
    }

    public function updatePosition(int $x, int $y): void
    {
        $this->update(['position' => ['x' => $x, 'y' => $y]]);
    }

    public function updateConfig(array $config): void
    {
        $this->update(['config' => $config]);
    }

    public function getRefreshIntervalDisplay(): string
    {
        if (!$this->refresh_interval) {
            return 'Manual';
        }

        if ($this->refresh_interval < 60) {
            return $this->refresh_interval . ' seconds';
        }

        $minutes = floor($this->refresh_interval / 60);
        if ($minutes < 60) {
            return $minutes . ' minutes';
        }

        $hours = floor($minutes / 60);
        return $hours . ' hours';
    }

    public function shouldRefresh(): bool
    {
        if (!$this->refresh_interval) {
            return false;
        }

        $lastRefresh = $this->updated_at;
        return $lastRefresh->addSeconds($this->refresh_interval) <= now();
    }

    public function getData(): array
    {
        if (!$this->report) {
            return [];
        }

        // This would integrate with the report execution system
        // For now, return mock data based on widget type
        return match ($this->type) {
            'metric_card' => $this->getMetricCardData(),
            'chart' => $this->getChartData(),
            'table' => $this->getTableData(),
            'calendar' => $this->getCalendarData(),
            'list' => $this->getListData(),
            default => [],
        };
    }

    private function getMetricCardData(): array
    {
        return [
            'value' => rand(100, 1000),
            'label' => 'Total Students',
            'change' => rand(-10, 10),
            'change_type' => rand(0, 1) ? 'increase' : 'decrease',
        ];
    }

    private function getChartData(): array
    {
        return [
            'labels' => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            'datasets' => [
                [
                    'label' => 'Students',
                    'data' => [65, 59, 80, 81, 56, 55],
                    'backgroundColor' => 'rgba(54, 162, 235, 0.2)',
                    'borderColor' => 'rgba(54, 162, 235, 1)',
                ]
            ]
        ];
    }

    private function getTableData(): array
    {
        return [
            'headers' => ['Name', 'Class', 'Grade', 'Status'],
            'rows' => [
                ['John Doe', 'Form 1A', 'A', 'Active'],
                ['Jane Smith', 'Form 1B', 'B+', 'Active'],
                ['Bob Johnson', 'Form 2A', 'A-', 'Active'],
            ]
        ];
    }

    private function getCalendarData(): array
    {
        return [
            'events' => [
                [
                    'title' => 'Parent Meeting',
                    'date' => now()->addDays(3)->format('Y-m-d'),
                    'time' => '10:00',
                ],
                [
                    'title' => 'Exam Week',
                    'date' => now()->addDays(7)->format('Y-m-d'),
                    'time' => '09:00',
                ],
            ]
        ];
    }

    private function getListData(): array
    {
        return [
            'items' => [
                ['title' => 'New Student Registration', 'subtitle' => '5 pending'],
                ['title' => 'Fee Collection', 'subtitle' => '85% collected'],
                ['title' => 'Library Books', 'subtitle' => '12 overdue'],
            ]
        ];
    }
}



