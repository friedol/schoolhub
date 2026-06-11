<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'user_id',
        'action',
        'auditable_type',
        'auditable_id',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
        'session_id',
        'request_id',
        'metadata',
        'created_at',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    const ACTIONS = [
        'created' => 'Created',
        'updated' => 'Updated',
        'deleted' => 'Deleted',
        'viewed' => 'Viewed',
        'exported' => 'Exported',
        'imported' => 'Imported',
        'logged_in' => 'Logged In',
        'logged_out' => 'Logged Out',
        'password_changed' => 'Password Changed',
        'role_assigned' => 'Role Assigned',
        'role_revoked' => 'Role Revoked',
        'permission_granted' => 'Permission Granted',
        'permission_revoked' => 'Permission Revoked',
        'backup_created' => 'Backup Created',
        'backup_restored' => 'Backup Restored',
        'configuration_changed' => 'Configuration Changed',
        'bulk_action' => 'Bulk Action',
        'approval_granted' => 'Approval Granted',
        'approval_denied' => 'Approval Denied',
        'file_uploaded' => 'File Uploaded',
        'file_downloaded' => 'File Downloaded',
        'file_deleted' => 'File Deleted',
        'report_generated' => 'Report Generated',
        'data_exported' => 'Data Exported',
        'data_imported' => 'Data Imported',
        'system_error' => 'System Error',
        'security_violation' => 'Security Violation',
        'failed_login' => 'Failed Login',
        'account_locked' => 'Account Locked',
        'account_unlocked' => 'Account Unlocked',
    ];

    const RESOURCE_TYPES = [
        'User' => 'User',
        'Role' => 'Role',
        'Permission' => 'Permission',
        'School' => 'School',
        'SchoolConfiguration' => 'School Configuration',
        'Student' => 'Student',
        'Teacher' => 'Teacher',
        'Class' => 'Class',
        'Subject' => 'Subject',
        'Assessment' => 'Assessment',
        'Attendance' => 'Attendance',
        'Fee' => 'Fee',
        'Payment' => 'Payment',
        'Invoice' => 'Invoice',
        'Staff' => 'Staff',
        'Payroll' => 'Payroll',
        'Leave' => 'Leave',
        'Book' => 'Book',
        'BookIssuance' => 'Book Issuance',
        'InventoryItem' => 'Inventory Item',
        'PurchaseOrder' => 'Purchase Order',
        'Vehicle' => 'Vehicle',
        'Route' => 'Route',
        'Hostel' => 'Hostel',
        'HostelAllocation' => 'Hostel Allocation',
        'Message' => 'Message',
        'Announcement' => 'Announcement',
        'Event' => 'Event',
        'Report' => 'Report',
        'Dashboard' => 'Dashboard',
        'Backup' => 'Backup',
    ];

    // Relationships
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function auditable(): MorphTo
    {
        return $this->morphTo();
    }

    // Scopes
    public function scopeForSchool($query, $schoolId)
    {
        return $query->where('school_id', $schoolId);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByAction($query, $action)
    {
        return $query->where('action', $action);
    }

    public function scopeByAuditableType($query, $auditableType)
    {
        return $query->where('auditable_type', $auditableType);
    }

    public function scopeByAuditableId($query, $auditableId)
    {
        return $query->where('auditable_id', $auditableId);
    }

    public function scopeByIpAddress($query, $ipAddress)
    {
        return $query->where('ip_address', $ipAddress);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    public function scopeSecurityEvents($query)
    {
        return $query->whereIn('action', [
            'logged_in',
            'logged_out',
            'password_changed',
            'failed_login',
            'account_locked',
            'account_unlocked',
            'security_violation',
        ]);
    }

    public function scopeDataChanges($query)
    {
        return $query->whereIn('action', [
            'created',
            'updated',
            'deleted',
            'bulk_action',
        ]);
    }

    public function scopeSystemEvents($query)
    {
        return $query->whereIn('action', [
            'backup_created',
            'backup_restored',
            'configuration_changed',
            'system_error',
        ]);
    }

    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // Accessors
    public function getActionDisplayAttribute(): string
    {
        return self::ACTIONS[$this->action] ?? $this->action;
    }

    public function getResourceTypeDisplayAttribute(): string
    {
        return self::RESOURCE_TYPES[$this->auditable_type] ?? $this->auditable_type;
    }

    public function getChangesAttribute(): array
    {
        if ($this->action === 'created') {
            return ['created' => $this->new_values];
        }

        if ($this->action === 'deleted') {
            return ['deleted' => $this->old_values];
        }

        if ($this->action === 'updated') {
            $changes = [];
            foreach ($this->new_values as $key => $newValue) {
                $oldValue = $this->old_values[$key] ?? null;
                if ($oldValue !== $newValue) {
                    $changes[$key] = [
                        'old' => $oldValue,
                        'new' => $newValue,
                    ];
                }
            }
            return $changes;
        }

        return [];
    }

    public function getFormattedChangesAttribute(): string
    {
        $changes = $this->changes;
        $formatted = [];

        foreach ($changes as $field => $change) {
            if (is_array($change) && isset($change['old'], $change['new'])) {
                $formatted[] = "{$field}: '{$change['old']}' → '{$change['new']}'";
            } else {
                $formatted[] = "{$field}: " . (is_array($change) ? json_encode($change) : $change);
            }
        }

        return implode(', ', $formatted);
    }

    // Methods
    public static function log(
        string $action,
        string $auditableType,
        $auditableId = null,
        array $oldValues = [],
        array $newValues = [],
        array $metadata = [],
        ?int $userId = null,
        ?int $schoolId = null
    ): self {
        $request = request();
        
        return self::create([
            'school_id' => $schoolId ?? auth()->user()?->school_id,
            'user_id' => $userId ?? auth()->id(),
            'action' => $action,
            'auditable_type' => $auditableType,
            'auditable_id' => $auditableId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'session_id' => session()->getId(),
            'request_id' => $request?->header('X-Request-ID'),
            'metadata' => $metadata,
        ]);
    }

    public static function logUserAction(
        string $action,
        int $userId,
        array $metadata = [],
        ?int $schoolId = null
    ): self {
        return self::log($action, 'App\Models\User', $userId, [], [], $metadata, $userId, $schoolId);
    }

    public static function logDataChange(
        string $action,
        string $auditableType,
        $auditableId,
        array $oldValues = [],
        array $newValues = [],
        array $metadata = []
    ): self {
        return self::log($action, $auditableType, $auditableId, $oldValues, $newValues, $metadata);
    }

    public static function logSecurityEvent(
        string $action,
        ?int $userId = null,
        array $metadata = [],
        ?int $schoolId = null
    ): self {
        return self::log($action, 'App\Models\User', $userId, [], [], $metadata, $userId, $schoolId);
    }

    public static function logSystemEvent(
        string $action,
        string $auditableType = 'System',
        $auditableId = null,
        array $metadata = []
    ): self {
        return self::log($action, $auditableType, $auditableId, [], [], $metadata);
    }

    public static function getActivitySummary(int $schoolId, int $days = 30): array
    {
        $startDate = now()->subDays($days);
        
        $summary = self::where('school_id', $schoolId)
            ->where('created_at', '>=', $startDate)
            ->selectRaw('
                action,
                COUNT(*) as count,
                COUNT(DISTINCT user_id) as unique_users
            ')
            ->groupBy('action')
            ->orderByDesc('count')
            ->get()
            ->keyBy('action');

        $totalEvents = $summary->sum('count');
        $totalUsers = self::where('school_id', $schoolId)
            ->where('created_at', '>=', $startDate)
            ->distinct('user_id')
            ->count();

        return [
            'total_events' => $totalEvents,
            'total_users' => $totalUsers,
            'period_days' => $days,
            'action_summary' => $summary->toArray(),
            'daily_activity' => self::getDailyActivity($schoolId, $days),
            'top_users' => self::getTopActiveUsers($schoolId, $days),
            'security_events' => self::getSecurityEventsSummary($schoolId, $days),
        ];
    }

    public static function getDailyActivity(int $schoolId, int $days = 30): array
    {
        return self::where('school_id', $schoolId)
            ->where('created_at', '>=', now()->subDays($days))
            ->selectRaw('
                DATE(created_at) as date,
                COUNT(*) as events,
                COUNT(DISTINCT user_id) as active_users
            ')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();
    }

    public static function getTopActiveUsers(int $schoolId, int $days = 30, int $limit = 10): array
    {
        return self::where('school_id', $schoolId)
            ->where('created_at', '>=', now()->subDays($days))
            ->selectRaw('
                user_id,
                COUNT(*) as activity_count,
                COUNT(DISTINCT action) as unique_actions
            ')
            ->groupBy('user_id')
            ->orderByDesc('activity_count')
            ->limit($limit)
            ->with('user:id,name,email')
            ->get()
            ->toArray();
    }

    public static function getSecurityEventsSummary(int $schoolId, int $days = 30): array
    {
        $securityActions = [
            'logged_in',
            'logged_out',
            'password_changed',
            'failed_login',
            'account_locked',
            'account_unlocked',
            'security_violation',
        ];

        return self::where('school_id', $schoolId)
            ->where('created_at', '>=', now()->subDays($days))
            ->whereIn('action', $securityActions)
            ->selectRaw('
                action,
                COUNT(*) as count,
                COUNT(DISTINCT user_id) as unique_users,
                COUNT(DISTINCT ip_address) as unique_ips
            ')
            ->groupBy('action')
            ->get()
            ->keyBy('action')
            ->toArray();
    }

    public static function getComplianceReport(int $schoolId, int $days = 30): array
    {
        $startDate = now()->subDays($days);
        
        return [
            'period' => [
                'start' => $startDate->toDateString(),
                'end' => now()->toDateString(),
                'days' => $days,
            ],
            'data_access' => self::getDataAccessReport($schoolId, $startDate),
            'user_activity' => self::getUserActivityReport($schoolId, $startDate),
            'security_events' => self::getSecurityEventsSummary($schoolId, $days),
            'system_changes' => self::getSystemChangesReport($schoolId, $startDate),
            'data_retention' => self::getDataRetentionReport($schoolId),
        ];
    }

    private static function getDataAccessReport(int $schoolId, $startDate): array
    {
        return self::where('school_id', $schoolId)
            ->where('created_at', '>=', $startDate)
            ->whereIn('action', ['viewed', 'exported', 'downloaded'])
            ->selectRaw('
                auditable_type,
                COUNT(*) as access_count,
                COUNT(DISTINCT user_id) as unique_users
            ')
            ->groupBy('auditable_type')
            ->orderByDesc('access_count')
            ->get()
            ->toArray();
    }

    private static function getUserActivityReport(int $schoolId, $startDate): array
    {
        return self::where('school_id', $schoolId)
            ->where('created_at', '>=', $startDate)
            ->selectRaw('
                user_id,
                COUNT(*) as total_actions,
                COUNT(DISTINCT action) as unique_actions,
                MIN(created_at) as first_activity,
                MAX(created_at) as last_activity
            ')
            ->groupBy('user_id')
            ->with('user:id,name,email,role')
            ->orderByDesc('total_actions')
            ->get()
            ->toArray();
    }

    private static function getSystemChangesReport(int $schoolId, $startDate): array
    {
        return self::where('school_id', $schoolId)
            ->where('created_at', '>=', $startDate)
            ->whereIn('action', ['created', 'updated', 'deleted', 'configuration_changed'])
            ->selectRaw('
                auditable_type,
                action,
                COUNT(*) as change_count
            ')
            ->groupBy('auditable_type', 'action')
            ->orderByDesc('change_count')
            ->get()
            ->toArray();
    }

    private static function getDataRetentionReport(int $schoolId): array
    {
        $totalLogs = self::where('school_id', $schoolId)->count();
        $oldestLog = self::where('school_id', $schoolId)->min('created_at');
        $newestLog = self::where('school_id', $schoolId)->max('created_at');

        return [
            'total_logs' => $totalLogs,
            'oldest_log' => $oldestLog,
            'newest_log' => $newestLog,
            'retention_period_days' => $oldestLog ? now()->diffInDays($oldestLog) : 0,
        ];
    }

    public static function cleanupOldLogs(int $retentionDays = 365): int
    {
        return self::where('created_at', '<', now()->subDays($retentionDays))->delete();
    }
}
