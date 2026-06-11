<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DataBackup extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'backup_name',
        'backup_type',
        'backup_size',
        'file_path',
        'file_name',
        'backup_status',
        'backup_method',
        'compression_type',
        'encryption_enabled',
        'retention_until',
        'metadata',
        'created_by',
        'completed_at',
        'error_message',
    ];

    protected $casts = [
        'backup_size' => 'integer',
        'encryption_enabled' => 'boolean',
        'retention_until' => 'datetime',
        'metadata' => 'array',
        'completed_at' => 'datetime',
    ];

    const BACKUP_TYPES = [
        'full' => 'Full Backup',
        'incremental' => 'Incremental Backup',
        'differential' => 'Differential Backup',
        'module' => 'Module Backup',
        'custom' => 'Custom Backup',
    ];

    const BACKUP_STATUSES = [
        'pending' => 'Pending',
        'in_progress' => 'In Progress',
        'completed' => 'Completed',
        'failed' => 'Failed',
        'cancelled' => 'Cancelled',
        'expired' => 'Expired',
    ];

    const BACKUP_METHODS = [
        'automated' => 'Automated',
        'manual' => 'Manual',
        'scheduled' => 'Scheduled',
        'api' => 'API',
    ];

    const COMPRESSION_TYPES = [
        'none' => 'No Compression',
        'gzip' => 'GZIP',
        'zip' => 'ZIP',
        'tar' => 'TAR',
        'tar_gz' => 'TAR.GZ',
    ];

    const MODULES = [
        'academic' => 'Academic Management',
        'financial' => 'Financial Management',
        'hr' => 'Human Resources',
        'library' => 'Library Management',
        'inventory' => 'Inventory Management',
        'transport' => 'Transport Management',
        'hostel' => 'Hostel Management',
        'communication' => 'Communication',
        'reports' => 'Reports & Analytics',
        'system' => 'System Configuration',
        'users' => 'Users & Roles',
        'all' => 'All Modules',
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

    // Scopes
    public function scopeForSchool($query, $schoolId)
    {
        return $query->where('school_id', $schoolId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('backup_type', $type);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('backup_status', $status);
    }

    public function scopeByMethod($query, $method)
    {
        return $query->where('backup_method', $method);
    }

    public function scopeCompleted($query)
    {
        return $query->where('backup_status', 'completed');
    }

    public function scopeFailed($query)
    {
        return $query->where('backup_status', 'failed');
    }

    public function scopeInProgress($query)
    {
        return $query->where('backup_status', 'in_progress');
    }

    public function scopeExpired($query)
    {
        return $query->where('retention_until', '<', now());
    }

    public function scopeNotExpired($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('retention_until')
              ->orWhere('retention_until', '>', now());
        });
    }

    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    // Accessors
    public function getBackupTypeDisplayAttribute(): string
    {
        return self::BACKUP_TYPES[$this->backup_type] ?? $this->backup_type;
    }

    public function getBackupStatusDisplayAttribute(): string
    {
        return self::BACKUP_STATUSES[$this->backup_status] ?? $this->backup_status;
    }

    public function getBackupMethodDisplayAttribute(): string
    {
        return self::BACKUP_METHODS[$this->backup_method] ?? $this->backup_method;
    }

    public function getCompressionTypeDisplayAttribute(): string
    {
        return self::COMPRESSION_TYPES[$this->compression_type] ?? $this->compression_type;
    }

    public function getFormattedSizeAttribute(): string
    {
        return self::formatBytes($this->backup_size);
    }

    public function getIsExpiredAttribute(): bool
    {
        return $this->retention_until && $this->retention_until->isPast();
    }

    public function getIsCompletedAttribute(): bool
    {
        return $this->backup_status === 'completed';
    }

    public function getIsFailedAttribute(): bool
    {
        return $this->backup_status === 'failed';
    }

    public function getIsInProgressAttribute(): bool
    {
        return $this->backup_status === 'in_progress';
    }

    public function getDurationAttribute(): ?int
    {
        if ($this->completed_at) {
            return $this->created_at->diffInSeconds($this->completed_at);
        }
        
        return null;
    }

    public function getFormattedDurationAttribute(): ?string
    {
        $duration = $this->duration;
        
        if (!$duration) {
            return null;
        }

        $hours = floor($duration / 3600);
        $minutes = floor(($duration % 3600) / 60);
        $seconds = $duration % 60;

        if ($hours > 0) {
            return sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);
        }

        return sprintf('%02d:%02d', $minutes, $seconds);
    }

    // Methods

    public function markAsCompleted(): void
    {
        $this->update([
            'backup_status' => 'completed',
            'completed_at' => now(),
            'error_message' => null,
        ]);
    }

    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'backup_status' => 'failed',
            'completed_at' => now(),
            'error_message' => $errorMessage,
        ]);
    }

    public function markAsInProgress(): void
    {
        $this->update([
            'backup_status' => 'in_progress',
            'error_message' => null,
        ]);
    }

    public function markAsCancelled(): void
    {
        $this->update([
            'backup_status' => 'cancelled',
            'completed_at' => now(),
        ]);
    }

    public function setRetentionPeriod(int $days): void
    {
        $this->update([
            'retention_until' => now()->addDays($days),
        ]);
    }

    public function extendRetention(int $days): void
    {
        $newRetention = $this->retention_until 
            ? $this->retention_until->addDays($days)
            : now()->addDays($days);
            
        $this->update(['retention_until' => $newRetention]);
    }

    public function getFileUrl(): string
    {
        return route('backups.download', ['backup' => $this->id]);
    }

    public function getFileExistsAttribute(): bool
    {
        return $this->file_path && file_exists(storage_path('app/' . $this->file_path));
    }

    public function deleteFile(): bool
    {
        if ($this->file_path && file_exists(storage_path('app/' . $this->file_path))) {
            return unlink(storage_path('app/' . $this->file_path));
        }
        
        return false;
    }

    public static function createBackup(
        int $schoolId,
        string $backupType,
        string $backupName,
        array $modules = ['all'],
        int $createdBy,
        string $backupMethod = 'manual',
        int $retentionDays = 30
    ): self {
        return self::create([
            'school_id' => $schoolId,
            'backup_name' => $backupName,
            'backup_type' => $backupType,
            'backup_method' => $backupMethod,
            'backup_status' => 'pending',
            'compression_type' => 'gzip',
            'encryption_enabled' => true,
            'retention_until' => now()->addDays($retentionDays),
            'metadata' => [
                'modules' => $modules,
                'created_at' => now()->toISOString(),
                'version' => '1.0',
            ],
            'created_by' => $createdBy,
        ]);
    }

    public static function getBackupStatistics(int $schoolId, int $days = 30): array
    {
        $startDate = now()->subDays($days);
        
        $totalBackups = self::where('school_id', $schoolId)
            ->where('created_at', '>=', $startDate)
            ->count();

        $successfulBackups = self::where('school_id', $schoolId)
            ->where('created_at', '>=', $startDate)
            ->where('backup_status', 'completed')
            ->count();

        $failedBackups = self::where('school_id', $schoolId)
            ->where('created_at', '>=', $startDate)
            ->where('backup_status', 'failed')
            ->count();

        $totalSize = self::where('school_id', $schoolId)
            ->where('created_at', '>=', $startDate)
            ->where('backup_status', 'completed')
            ->sum('backup_size');

        $averageSize = $successfulBackups > 0 ? $totalSize / $successfulBackups : 0;

        $backupTypes = self::where('school_id', $schoolId)
            ->where('created_at', '>=', $startDate)
            ->selectRaw('backup_type, COUNT(*) as count')
            ->groupBy('backup_type')
            ->pluck('count', 'backup_type');

        $backupMethods = self::where('school_id', $schoolId)
            ->where('created_at', '>=', $startDate)
            ->selectRaw('backup_method, COUNT(*) as count')
            ->groupBy('backup_method')
            ->pluck('count', 'backup_method');

        return [
            'total_backups' => $totalBackups,
            'successful_backups' => $successfulBackups,
            'failed_backups' => $failedBackups,
            'success_rate' => $totalBackups > 0 ? round(($successfulBackups / $totalBackups) * 100, 2) : 0,
            'total_size' => $totalSize,
            'average_size' => round($averageSize),
            'formatted_total_size' => self::formatBytes($totalSize),
            'formatted_average_size' => self::formatBytes($averageSize),
            'backup_types' => $backupTypes,
            'backup_methods' => $backupMethods,
            'period_days' => $days,
        ];
    }

    public static function getBackupHistory(int $schoolId, int $limit = 50): \Illuminate\Database\Eloquent\Collection
    {
        return self::where('school_id', $schoolId)
            ->with('createdBy:id,name')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    public static function getExpiredBackups(int $schoolId): \Illuminate\Database\Eloquent\Collection
    {
        return self::where('school_id', $schoolId)
            ->where('retention_until', '<', now())
            ->where('backup_status', 'completed')
            ->get();
    }

    public static function cleanupExpiredBackups(int $schoolId): int
    {
        $expiredBackups = self::getExpiredBackups($schoolId);
        $deletedCount = 0;

        foreach ($expiredBackups as $backup) {
            if ($backup->deleteFile()) {
                $backup->update(['backup_status' => 'expired']);
                $deletedCount++;
            }
        }

        return $deletedCount;
    }

    public static function getBackupSchedule(int $schoolId): array
    {
        // This would integrate with your scheduling system
        return [
            'daily_backup' => [
                'enabled' => true,
                'time' => '02:00',
                'type' => 'incremental',
                'retention_days' => 7,
            ],
            'weekly_backup' => [
                'enabled' => true,
                'day' => 'sunday',
                'time' => '01:00',
                'type' => 'full',
                'retention_days' => 30,
            ],
            'monthly_backup' => [
                'enabled' => true,
                'day' => 1,
                'time' => '00:00',
                'type' => 'full',
                'retention_days' => 365,
            ],
        ];
    }

    public static function validateBackupIntegrity(self $backup): array
    {
        $issues = [];

        if (!$backup->file_exists) {
            $issues[] = 'Backup file not found';
        }

        if ($backup->backup_size === 0) {
            $issues[] = 'Backup file is empty';
        }

        if ($backup->is_failed) {
            $issues[] = 'Backup failed: ' . $backup->error_message;
        }

        if ($backup->is_expired) {
            $issues[] = 'Backup has expired';
        }

        return [
            'is_valid' => empty($issues),
            'issues' => $issues,
            'checked_at' => now()->toISOString(),
        ];
    }

    private static function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
