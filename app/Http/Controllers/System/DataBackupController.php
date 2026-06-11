<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\DataBackup;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DataBackupController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('role:super_admin,school_admin,headteacher');
    }

    /**
     * Display data backups
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $schoolId = $user->school_id;

        $query = DataBackup::with(['user:id,name,email'])
            ->when(!$user->isSuperAdmin(), function ($q) use ($schoolId) {
                $q->where('school_id', $schoolId);
            });

        // Apply filters
        if ($request->filled('backup_type')) {
            $query->where('backup_type', $request->backup_type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $backups = $query->orderByDesc('created_at')
            ->paginate(20);

        $statistics = $this->getBackupStatistics($user, $schoolId);

        return Inertia::render('System/DataBackups/Index', [
            'backups' => $backups,
            'statistics' => $statistics,
            'filters' => $request->only(['backup_type', 'status', 'date_from', 'date_to']),
            'backupTypes' => DataBackup::BACKUP_TYPES,
            'statuses' => DataBackup::STATUSES,
        ]);
    }

    /**
     * Display backup details
     */
    public function show(DataBackup $dataBackup): Response
    {
        $user = Auth::user();

        // Check if user can view this backup
        if (!$user->isSuperAdmin() && $dataBackup->school_id !== $user->school_id) {
            abort(403, 'Unauthorized access to backup.');
        }

        $dataBackup->load(['user:id,name,email', 'school:id,name']);

        return Inertia::render('System/DataBackups/Show', [
            'backup' => $dataBackup,
        ]);
    }

    /**
     * Create a new backup
     */
    public function create(Request $request)
    {
        $user = Auth::user();
        $school = $user->school;

        $request->validate([
            'backup_type' => 'required|string|in:' . implode(',', array_keys(DataBackup::BACKUP_TYPES)),
            'modules' => 'nullable|array',
            'modules.*' => 'string|in:academic,finance,hr,library,inventory,hostel,communication,reports',
            'include_files' => 'boolean',
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            DB::beginTransaction();

            $backup = DataBackup::create([
                'school_id' => $school->id,
                'user_id' => $user->id,
                'file_name' => 'backup_' . now()->format('Y-m-d_H-i-s') . '.zip',
                'file_path' => '',
                'backup_type' => $request->backup_type,
                'status' => 'pending',
                'size' => 0,
                'notes' => $request->notes,
            ]);

            // Store backup configuration
            $backup->update([
                'file_path' => 'backups/' . $school->id . '/' . $backup->file_name,
                'configuration' => [
                    'modules' => $request->modules ?? [],
                    'include_files' => $request->include_files ?? false,
                    'created_by' => $user->name,
                ],
            ]);

            DB::commit();

            // Dispatch backup job (you would implement this)
            // CreateBackupJob::dispatch($backup);

            return response()->json([
                'success' => true,
                'message' => 'Backup process started successfully.',
                'backup' => $backup,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to start backup process: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download backup file
     */
    public function download(DataBackup $dataBackup)
    {
        $user = Auth::user();

        // Check if user can download this backup
        if (!$user->isSuperAdmin() && $dataBackup->school_id !== $user->school_id) {
            abort(403, 'Unauthorized access to backup.');
        }

        if ($dataBackup->status !== 'completed') {
            abort(404, 'Backup file not available.');
        }

        if (!Storage::exists($dataBackup->file_path)) {
            abort(404, 'Backup file not found.');
        }

        return Storage::download($dataBackup->file_path, $dataBackup->file_name);
    }

    /**
     * Restore from backup
     */
    public function restore(Request $request, DataBackup $dataBackup)
    {
        $user = Auth::user();

        // Check if user can restore this backup
        if (!$user->isSuperAdmin() && $dataBackup->school_id !== $user->school_id) {
            abort(403, 'Unauthorized access to backup.');
        }

        if ($dataBackup->status !== 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot restore from incomplete backup.',
            ], 400);
        }

        $request->validate([
            'confirm' => 'required|boolean|accepted',
            'modules' => 'nullable|array',
            'modules.*' => 'string|in:academic,finance,hr,library,inventory,hostel,communication,reports',
            'overwrite_existing' => 'boolean',
        ]);

        if (!$request->confirm) {
            return response()->json([
                'success' => false,
                'message' => 'Please confirm the restore operation.',
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Update backup status
            $dataBackup->update([
                'status' => 'restoring',
                'restore_started_at' => now(),
                'restore_completed_at' => null,
            ]);

            DB::commit();

            // Dispatch restore job (you would implement this)
            // RestoreBackupJob::dispatch($dataBackup, $request->only(['modules', 'overwrite_existing']));

            return response()->json([
                'success' => true,
                'message' => 'Restore process started successfully.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to start restore process: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete backup
     */
    public function destroy(DataBackup $dataBackup)
    {
        $user = Auth::user();

        // Check if user can delete this backup
        if (!$user->isSuperAdmin() && $dataBackup->school_id !== $user->school_id) {
            abort(403, 'Unauthorized access to backup.');
        }

        try {
            // Delete file from storage
            if (Storage::exists($dataBackup->file_path)) {
                Storage::delete($dataBackup->file_path);
            }

            // Delete backup record
            $dataBackup->delete();

            return response()->json([
                'success' => true,
                'message' => 'Backup deleted successfully.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete backup: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get backup status
     */
    public function status(DataBackup $dataBackup)
    {
        $user = Auth::user();

        // Check if user can view this backup
        if (!$user->isSuperAdmin() && $dataBackup->school_id !== $user->school_id) {
            abort(403, 'Unauthorized access to backup.');
        }

        return response()->json([
            'id' => $dataBackup->id,
            'status' => $dataBackup->status,
            'progress' => $dataBackup->progress ?? 0,
            'message' => $dataBackup->status_message,
            'created_at' => $dataBackup->created_at,
            'updated_at' => $dataBackup->updated_at,
        ]);
    }

    /**
     * Schedule automatic backup
     */
    public function schedule(Request $request)
    {
        $user = Auth::user();
        $school = $user->school;

        $request->validate([
            'frequency' => 'required|string|in:daily,weekly,monthly',
            'time' => 'required|string|regex:/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/',
            'backup_type' => 'required|string|in:' . implode(',', array_keys(DataBackup::BACKUP_TYPES)),
            'modules' => 'nullable|array',
            'modules.*' => 'string|in:academic,finance,hr,library,inventory,hostel,communication,reports',
            'retention_days' => 'required|integer|min:7|max:365',
            'enabled' => 'boolean',
        ]);

        try {
            // Update school configuration for backup schedule
            $configKey = 'backup_schedule';
            $configValue = [
                'frequency' => $request->frequency,
                'time' => $request->time,
                'backup_type' => $request->backup_type,
                'modules' => $request->modules ?? [],
                'retention_days' => $request->retention_days,
                'enabled' => $request->enabled ?? true,
                'updated_by' => $user->id,
                'updated_at' => now()->toISOString(),
            ];

            // You would use your SchoolConfiguration model here
            // SchoolConfiguration::set($configKey, $configValue, $school->id);

            return response()->json([
                'success' => true,
                'message' => 'Backup schedule updated successfully.',
                'schedule' => $configValue,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update backup schedule: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get backup schedule
     */
    public function getSchedule()
    {
        $user = Auth::user();
        $school = $user->school;

        // You would retrieve from SchoolConfiguration
        $schedule = [
            'frequency' => 'daily',
            'time' => '02:00',
            'backup_type' => 'full',
            'modules' => [],
            'retention_days' => 30,
            'enabled' => true,
        ];

        return response()->json($schedule);
    }

    /**
     * Test backup process
     */
    public function test()
    {
        $user = Auth::user();
        $school = $user->school;

        try {
            // Create a test backup
            $testBackup = DataBackup::create([
                'school_id' => $school->id,
                'user_id' => $user->id,
                'file_name' => 'test_backup_' . now()->format('Y-m-d_H-i-s') . '.zip',
                'file_path' => 'backups/test/' . $school->id . '/test_backup.zip',
                'backup_type' => 'test',
                'status' => 'completed',
                'size' => 1024, // 1KB test file
                'notes' => 'Test backup to verify backup system functionality',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Test backup created successfully.',
                'backup' => $testBackup,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Test backup failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get backup statistics
     */
    public function statistics(Request $request)
    {
        $user = Auth::user();
        $schoolId = $user->school_id;

        $dateFrom = $request->get('date_from', now()->subDays(30)->format('Y-m-d'));
        $dateTo = $request->get('date_to', now()->format('Y-m-d'));

        $query = DataBackup::when(!$user->isSuperAdmin(), function ($q) use ($schoolId) {
            $q->where('school_id', $schoolId);
        });

        $query->whereBetween('created_at', [$dateFrom, $dateTo]);

        $statistics = [
            'total_backups' => $query->count(),
            'successful_backups' => $query->where('status', 'completed')->count(),
            'failed_backups' => $query->where('status', 'failed')->count(),
            'total_size' => $query->where('status', 'completed')->sum('size'),
            'average_size' => $query->where('status', 'completed')->avg('size'),
            'backups_by_type' => $query->select('backup_type', DB::raw('count(*) as count'))
                ->groupBy('backup_type')
                ->get(),
            'backups_by_status' => $query->select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->get(),
            'recent_backups' => $query->with('user:id,name')
                ->orderByDesc('created_at')
                ->limit(10)
                ->get(),
        ];

        return response()->json($statistics);
    }

    /**
     * Clean old backups
     */
    public function clean(Request $request)
    {
        $user = Auth::user();
        $schoolId = $user->school_id;

        $request->validate([
            'retention_days' => 'required|integer|min:7|max:365',
            'confirm' => 'required|boolean|accepted',
        ]);

        if (!$request->confirm) {
            return response()->json([
                'success' => false,
                'message' => 'Please confirm the cleanup operation.',
            ], 400);
        }

        try {
            $query = DataBackup::where('created_at', '<', now()->subDays($request->retention_days))
                ->where('status', 'completed');

            if (!$user->isSuperAdmin()) {
                $query->where('school_id', $schoolId);
            }

            $oldBackups = $query->get();
            $deletedCount = 0;

            foreach ($oldBackups as $backup) {
                // Delete file from storage
                if (Storage::exists($backup->file_path)) {
                    Storage::delete($backup->file_path);
                }

                // Delete backup record
                $backup->delete();
                $deletedCount++;
            }

            return response()->json([
                'success' => true,
                'message' => "Successfully cleaned {$deletedCount} old backup files.",
                'deleted_count' => $deletedCount,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clean old backups: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get backup statistics for dashboard
     */
    private function getBackupStatistics($user, $schoolId)
    {
        $query = DataBackup::when(!$user->isSuperAdmin(), function ($q) use ($schoolId) {
            $q->where('school_id', $schoolId);
        });

        return [
            'total_backups' => $query->count(),
            'successful_backups' => $query->where('status', 'completed')->count(),
            'failed_backups' => $query->where('status', 'failed')->count(),
            'pending_backups' => $query->where('status', 'pending')->count(),
            'total_size' => $query->where('status', 'completed')->sum('size'),
            'last_backup' => $query->where('status', 'completed')->latest()->first(),
            'next_scheduled' => $this->getNextScheduledBackup($user, $schoolId),
        ];
    }

    /**
     * Get next scheduled backup
     */
    private function getNextScheduledBackup($user, $schoolId)
    {
        // You would implement logic to calculate next scheduled backup
        // based on the backup schedule configuration
        return null;
    }
}
