<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('role:super_admin,school_admin,headteacher');
    }

    /**
     * Display audit logs
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $schoolId = $user->school_id;

        $query = AuditLog::with(['user:id,name,email', 'auditable'])
            ->when(!$user->isSuperAdmin(), function ($q) use ($schoolId) {
                $q->where('school_id', $schoolId);
            });

        // Apply filters
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('auditable_type')) {
            $query->where('auditable_type', $request->auditable_type);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->filled('ip_address')) {
            $query->where('ip_address', 'like', '%' . $request->ip_address . '%');
        }

        $auditLogs = $query->orderByDesc('created_at')
            ->paginate(20);

        // Get filter options
        $users = \App\Models\User::when(!$user->isSuperAdmin(), function ($q) use ($schoolId) {
                $q->where('school_id', $schoolId);
            })
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        $actions = AuditLog::when(!$user->isSuperAdmin(), function ($q) use ($schoolId) {
                $q->where('school_id', $schoolId);
            })
            ->distinct()
            ->pluck('action')
            ->sort()
            ->values();

        $auditableTypes = AuditLog::when(!$user->isSuperAdmin(), function ($q) use ($schoolId) {
                $q->where('school_id', $schoolId);
            })
            ->distinct()
            ->pluck('auditable_type')
            ->filter()
            ->sort()
            ->values();

        return Inertia::render('System/AuditLogs/Index', [
            'auditLogs' => $auditLogs,
            'users' => $users,
            'actions' => $actions,
            'auditableTypes' => $auditableTypes,
            'filters' => $request->only(['user_id', 'action', 'auditable_type', 'date_from', 'date_to', 'ip_address']),
        ]);
    }

    /**
     * Display audit log details
     */
    public function show(AuditLog $auditLog): Response
    {
        $user = Auth::user();

        // Check if user can view this audit log
        if (!$user->isSuperAdmin() && $auditLog->school_id !== $user->school_id) {
            abort(403, 'Unauthorized access to audit log.');
        }

        $auditLog->load(['user:id,name,email', 'auditable']);

        return Inertia::render('System/AuditLogs/Show', [
            'auditLog' => $auditLog,
        ]);
    }

    /**
     * Get audit statistics
     */
    public function statistics(Request $request)
    {
        $user = Auth::user();
        $schoolId = $user->school_id;

        $query = AuditLog::when(!$user->isSuperAdmin(), function ($q) use ($schoolId) {
            $q->where('school_id', $schoolId);
        });

        // Date range filter
        $dateFrom = $request->get('date_from', now()->subDays(30)->format('Y-m-d'));
        $dateTo = $request->get('date_to', now()->format('Y-m-d'));

        $query->whereBetween('created_at', [$dateFrom, $dateTo]);

        $statistics = [
            'total_activities' => $query->count(),
            'unique_users' => $query->distinct('user_id')->count('user_id'),
            'activities_by_action' => $query->select('action', DB::raw('count(*) as count'))
                ->groupBy('action')
                ->orderByDesc('count')
                ->get(),
            'activities_by_user' => $query->with('user:id,name')
                ->select('user_id', DB::raw('count(*) as count'))
                ->groupBy('user_id')
                ->orderByDesc('count')
                ->limit(10)
                ->get(),
            'activities_by_model' => $query->select('auditable_type', DB::raw('count(*) as count'))
                ->whereNotNull('auditable_type')
                ->groupBy('auditable_type')
                ->orderByDesc('count')
                ->get(),
            'activities_by_hour' => $query->select(DB::raw('HOUR(created_at) as hour'), DB::raw('count(*) as count'))
                ->groupBy(DB::raw('HOUR(created_at)'))
                ->orderBy('hour')
                ->get(),
            'activities_by_day' => $query->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
                ->groupBy(DB::raw('DATE(created_at)'))
                ->orderBy('date')
                ->get(),
        ];

        return response()->json($statistics);
    }

    /**
     * Get user activity summary
     */
    public function userActivity(Request $request, \App\Models\User $user)
    {
        $authUser = Auth::user();

        // Check if user can view this user's activity
        if (!$authUser->isSuperAdmin() && $user->school_id !== $authUser->school_id) {
            abort(403, 'Unauthorized access to user activity.');
        }

        $dateFrom = $request->get('date_from', now()->subDays(30)->format('Y-m-d'));
        $dateTo = $request->get('date_to', now()->format('Y-m-d'));

        $activities = AuditLog::where('user_id', $user->id)
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->with('auditable')
            ->orderByDesc('created_at')
            ->paginate(20);

        $summary = [
            'total_activities' => $activities->total(),
            'first_activity' => AuditLog::where('user_id', $user->id)->min('created_at'),
            'last_activity' => AuditLog::where('user_id', $user->id)->max('created_at'),
            'most_common_actions' => AuditLog::where('user_id', $user->id)
                ->select('action', DB::raw('count(*) as count'))
                ->groupBy('action')
                ->orderByDesc('count')
                ->limit(5)
                ->get(),
            'ip_addresses' => AuditLog::where('user_id', $user->id)
                ->distinct()
                ->pluck('ip_address')
                ->filter()
                ->values(),
        ];

        return Inertia::render('System/AuditLogs/UserActivity', [
            'user' => $user,
            'activities' => $activities,
            'summary' => $summary,
            'filters' => $request->only(['date_from', 'date_to']),
        ]);
    }

    /**
     * Get model activity history
     */
    public function modelActivity(Request $request)
    {
        $user = Auth::user();
        $schoolId = $user->school_id;

        $request->validate([
            'model_type' => 'required|string',
            'model_id' => 'required|integer',
        ]);

        $activities = AuditLog::where('auditable_type', $request->model_type)
            ->where('auditable_id', $request->model_id)
            ->when(!$user->isSuperAdmin(), function ($q) use ($schoolId) {
                $q->where('school_id', $schoolId);
            })
            ->with('user:id,name,email')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($activities);
    }

    /**
     * Export audit logs
     */
    public function export(Request $request)
    {
        $user = Auth::user();
        $schoolId = $user->school_id;

        $request->validate([
            'format' => 'required|string|in:csv,excel',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'user_id' => 'nullable|exists:users,id',
            'action' => 'nullable|string',
            'auditable_type' => 'nullable|string',
        ]);

        $query = AuditLog::with(['user:id,name,email'])
            ->when(!$user->isSuperAdmin(), function ($q) use ($schoolId) {
                $q->where('school_id', $schoolId);
            });

        // Apply filters
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('auditable_type')) {
            $query->where('auditable_type', $request->auditable_type);
        }

        $auditLogs = $query->orderByDesc('created_at')->get();

        $filename = 'audit_logs_' . now()->format('Y-m-d_H-i-s') . '.' . $request->format;

        if ($request->format === 'csv') {
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ];

            $callback = function () use ($auditLogs) {
                $file = fopen('php://output', 'w');
                fputcsv($file, [
                    'Date/Time',
                    'User',
                    'Action',
                    'Model Type',
                    'Model ID',
                    'IP Address',
                    'User Agent',
                    'URL',
                    'Old Values',
                    'New Values'
                ]);

                foreach ($auditLogs as $log) {
                    fputcsv($file, [
                        $log->created_at->format('Y-m-d H:i:s'),
                        $log->user ? $log->user->name : 'System',
                        $log->action,
                        $log->auditable_type,
                        $log->auditable_id,
                        $log->ip_address,
                        $log->user_agent,
                        $log->url,
                        json_encode($log->old_values),
                        json_encode($log->new_values),
                    ]);
                }

                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        }

        // For Excel format, you would typically use a package like Laravel Excel
        // This is a simplified version
        return response()->json([
            'message' => 'Excel export not implemented yet. Please use CSV format.',
            'data' => $auditLogs,
        ]);
    }

    /**
     * Clean old audit logs
     */
    public function clean(Request $request)
    {
        $user = Auth::user();

        if (!$user->isSuperAdmin()) {
            abort(403, 'Only super administrators can clean audit logs.');
        }

        $request->validate([
            'days' => 'required|integer|min:30|max:365',
            'confirm' => 'required|boolean|accepted',
        ]);

        if (!$request->confirm) {
            return back()->withErrors(['error' => 'Please confirm the cleanup operation.']);
        }

        try {
            $deletedCount = AuditLog::where('created_at', '<', now()->subDays($request->days))->delete();

            return back()->with('success', "Successfully cleaned {$deletedCount} old audit log entries.");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to clean audit logs: ' . $e->getMessage()]);
        }
    }

    /**
     * Get security alerts
     */
    public function securityAlerts(Request $request)
    {
        $user = Auth::user();
        $schoolId = $user->school_id;

        $dateFrom = $request->get('date_from', now()->subDays(7)->format('Y-m-d'));
        $dateTo = $request->get('date_to', now()->format('Y-m-d'));

        $query = AuditLog::when(!$user->isSuperAdmin(), function ($q) use ($schoolId) {
            $q->where('school_id', $schoolId);
        });

        $query->whereBetween('created_at', [$dateFrom, $dateTo]);

        $alerts = [
            'failed_logins' => $query->where('action', 'failed_login')
                ->with('user:id,name,email')
                ->orderByDesc('created_at')
                ->get(),
            'multiple_ips' => $this->getMultipleIpAlerts($query),
            'unusual_activity' => $this->getUnusualActivityAlerts($query),
            'admin_actions' => $query->whereIn('action', ['created', 'updated', 'deleted'])
                ->whereHas('user', function ($q) {
                    $q->whereIn('role', ['super_admin', 'school_admin']);
                })
                ->with('user:id,name,email')
                ->orderByDesc('created_at')
                ->limit(20)
                ->get(),
        ];

        return response()->json($alerts);
    }

    /**
     * Get users with multiple IP addresses
     */
    private function getMultipleIpAlerts($query)
    {
        return $query->select('user_id', 'ip_address', DB::raw('count(*) as count'))
            ->groupBy('user_id', 'ip_address')
            ->having('count', '>', 1)
            ->with('user:id,name,email')
            ->get()
            ->groupBy('user_id')
            ->filter(function ($ips) {
                return $ips->count() > 1;
            })
            ->map(function ($ips) {
                return [
                    'user' => $ips->first()->user,
                    'ip_addresses' => $ips->pluck('ip_address')->unique()->values(),
                    'total_activities' => $ips->sum('count'),
                ];
            })
            ->values();
    }

    /**
     * Get unusual activity alerts
     */
    private function getUnusualActivityAlerts($query)
    {
        // Users with unusually high activity
        $highActivity = $query->select('user_id', DB::raw('count(*) as count'))
            ->groupBy('user_id')
            ->having('count', '>', 100) // More than 100 activities in the period
            ->with('user:id,name,email')
            ->get();

        // Users with activities outside normal hours (9 AM - 5 PM)
        $offHours = $query->whereRaw('HOUR(created_at) NOT BETWEEN 9 AND 17')
            ->select('user_id', DB::raw('count(*) as count'))
            ->groupBy('user_id')
            ->having('count', '>', 10) // More than 10 activities outside hours
            ->with('user:id,name,email')
            ->get();

        return [
            'high_activity' => $highActivity,
            'off_hours_activity' => $offHours,
        ];
    }

    /**
     * Get audit log dashboard data
     */
    public function dashboard()
    {
        $user = Auth::user();
        $schoolId = $user->school_id;

        $query = AuditLog::when(!$user->isSuperAdmin(), function ($q) use ($schoolId) {
            $q->where('school_id', $schoolId);
        });

        $dashboard = [
            'today_activities' => $query->whereDate('created_at', today())->count(),
            'this_week_activities' => $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'this_month_activities' => $query->whereMonth('created_at', now()->month)->count(),
            'active_users_today' => $query->whereDate('created_at', today())->distinct('user_id')->count('user_id'),
            'recent_activities' => $query->with('user:id,name,email')
                ->orderByDesc('created_at')
                ->limit(10)
                ->get(),
            'top_actions' => $query->select('action', DB::raw('count(*) as count'))
                ->groupBy('action')
                ->orderByDesc('count')
                ->limit(5)
                ->get(),
        ];

        return response()->json($dashboard);
    }
}
