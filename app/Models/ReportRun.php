<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportRun extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_id',
        'run_by',
        'status',
        'started_at',
        'completed_at',
        'parameters',
        'result_data',
        'file_path',
        'file_size',
        'error_message',
        'execution_time',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'parameters' => 'array',
        'result_data' => 'array',
        'file_size' => 'integer',
        'execution_time' => 'integer',
    ];

    const STATUS_OPTIONS = [
        'pending' => 'Pending',
        'running' => 'Running',
        'completed' => 'Completed',
        'failed' => 'Failed',
        'cancelled' => 'Cancelled',
    ];

    // Relationships
    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    public function runBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'run_by');
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('run_by', $userId);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('started_at', '>=', now()->subDays($days));
    }

    // Accessors
    public function getStatusDisplayAttribute(): string
    {
        return self::STATUS_OPTIONS[$this->status] ?? $this->status;
    }

    public function getIsCompletedAttribute(): bool
    {
        return $this->status === 'completed';
    }

    public function getIsFailedAttribute(): bool
    {
        return $this->status === 'failed';
    }

    public function getIsRunningAttribute(): bool
    {
        return $this->status === 'running';
    }

    public function getExecutionTimeDisplayAttribute(): string
    {
        if (!$this->execution_time) {
            return 'N/A';
        }

        if ($this->execution_time < 60) {
            return $this->execution_time . 's';
        }

        $minutes = floor($this->execution_time / 60);
        $seconds = $this->execution_time % 60;
        return $minutes . 'm ' . $seconds . 's';
    }

    public function getFileSizeDisplayAttribute(): string
    {
        if (!$this->file_size) {
            return 'N/A';
        }

        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    // Methods
    public function markAsRunning(): void
    {
        $this->update([
            'status' => 'running',
            'started_at' => now(),
        ]);
    }

    public function markAsCompleted(string $filePath = null, int $fileSize = null, array $resultData = null): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
            'file_path' => $filePath,
            'file_size' => $fileSize,
            'result_data' => $resultData,
            'execution_time' => $this->started_at ? now()->diffInSeconds($this->started_at) : null,
        ]);
    }

    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'status' => 'failed',
            'completed_at' => now(),
            'error_message' => $errorMessage,
            'execution_time' => $this->started_at ? now()->diffInSeconds($this->started_at) : null,
        ]);
    }

    public function markAsCancelled(): void
    {
        $this->update([
            'status' => 'cancelled',
            'completed_at' => now(),
            'execution_time' => $this->started_at ? now()->diffInSeconds($this->started_at) : null,
        ]);
    }

    public function getDownloadUrl(): string
    {
        if (!$this->file_path) {
            return '';
        }

        return route('reports.download', $this->id);
    }

    public function deleteFile(): bool
    {
        if (!$this->file_path || !file_exists(storage_path('app/' . $this->file_path))) {
            return false;
        }

        return unlink(storage_path('app/' . $this->file_path));
    }
}



