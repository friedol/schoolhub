<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\ReportRun;
use App\Models\ReportTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $query = Report::where('school_id', Auth::user()->school_id);

        // Apply filters
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('data_source')) {
            $query->where('data_source', $request->data_source);
        }

        if ($request->filled('is_public')) {
            $query->where('is_public', $request->is_public);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $reports = $query->with(['createdBy', 'reportRuns' => function ($query) {
            $query->latest()->limit(1);
        }])
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Statistics
        $stats = [
            'total_reports' => Report::where('school_id', Auth::user()->school_id)->count(),
            'pre_built_reports' => Report::where('school_id', Auth::user()->school_id)->where('type', 'pre_built')->count(),
            'custom_reports' => Report::where('school_id', Auth::user()->school_id)->where('type', 'custom')->count(),
            'scheduled_reports' => Report::where('school_id', Auth::user()->school_id)->where('is_scheduled', true)->count(),
            'public_reports' => Report::where('school_id', Auth::user()->school_id)->where('is_public', true)->count(),
        ];

        return Inertia::render('Reports/Index', [
            'reports' => $reports,
            'stats' => $stats,
            'categoryOptions' => Report::CATEGORY_OPTIONS,
            'typeOptions' => Report::TYPE_OPTIONS,
            'dataSourceOptions' => Report::DATA_SOURCE_OPTIONS,
            'filters' => $request->only(['category', 'type', 'data_source', 'is_public', 'search']),
        ]);
    }

    public function create()
    {
        $templates = ReportTemplate::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Reports/Create', [
            'templates' => $templates,
            'categoryOptions' => Report::CATEGORY_OPTIONS,
            'typeOptions' => Report::TYPE_OPTIONS,
            'dataSourceOptions' => Report::DATA_SOURCE_OPTIONS,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|in:' . implode(',', array_keys(Report::CATEGORY_OPTIONS)),
            'type' => 'required|in:' . implode(',', array_keys(Report::TYPE_OPTIONS)),
            'data_source' => 'required|in:' . implode(',', array_keys(Report::DATA_SOURCE_OPTIONS)),
            'query_config' => 'nullable|array',
            'filter_config' => 'nullable|array',
            'output_config' => 'nullable|array',
            'is_public' => 'boolean',
            'is_scheduled' => 'boolean',
            'schedule_config' => 'nullable|array',
        ]);

        $report = Report::create([
            'school_id' => Auth::user()->school_id,
            'name' => $request->name,
            'description' => $request->description,
            'category' => $request->category,
            'type' => $request->type,
            'data_source' => $request->data_source,
            'query_config' => $request->query_config ?? [],
            'filter_config' => $request->filter_config ?? [],
            'output_config' => $request->output_config ?? [],
            'is_public' => $request->is_public ?? false,
            'is_scheduled' => $request->is_scheduled ?? false,
            'schedule_config' => $request->schedule_config ?? [],
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('reports.index')
            ->with('success', 'Report created successfully.');
    }

    public function show(Report $report)
    {
        $this->authorize('view', $report);

        $report->load(['createdBy', 'reportRuns' => function ($query) {
            $query->latest()->limit(10);
        }]);

        return Inertia::render('Reports/Show', [
            'report' => $report,
        ]);
    }

    public function edit(Report $report)
    {
        $this->authorize('update', $report);

        $templates = ReportTemplate::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Reports/Edit', [
            'report' => $report,
            'templates' => $templates,
            'categoryOptions' => Report::CATEGORY_OPTIONS,
            'typeOptions' => Report::TYPE_OPTIONS,
            'dataSourceOptions' => Report::DATA_SOURCE_OPTIONS,
        ]);
    }

    public function update(Request $request, Report $report)
    {
        $this->authorize('update', $report);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|in:' . implode(',', array_keys(Report::CATEGORY_OPTIONS)),
            'type' => 'required|in:' . implode(',', array_keys(Report::TYPE_OPTIONS)),
            'data_source' => 'required|in:' . implode(',', array_keys(Report::DATA_SOURCE_OPTIONS)),
            'query_config' => 'nullable|array',
            'filter_config' => 'nullable|array',
            'output_config' => 'nullable|array',
            'is_public' => 'boolean',
            'is_scheduled' => 'boolean',
            'schedule_config' => 'nullable|array',
        ]);

        $report->update([
            'name' => $request->name,
            'description' => $request->description,
            'category' => $request->category,
            'type' => $request->type,
            'data_source' => $request->data_source,
            'query_config' => $request->query_config ?? [],
            'filter_config' => $request->filter_config ?? [],
            'output_config' => $request->output_config ?? [],
            'is_public' => $request->is_public ?? false,
            'is_scheduled' => $request->is_scheduled ?? false,
            'schedule_config' => $request->schedule_config ?? [],
        ]);

        return redirect()->route('reports.index')
            ->with('success', 'Report updated successfully.');
    }

    public function destroy(Report $report)
    {
        $this->authorize('delete', $report);

        $report->delete();

        return redirect()->route('reports.index')
            ->with('success', 'Report deleted successfully.');
    }

    public function run(Request $request, Report $report)
    {
        $this->authorize('view', $report);

        $request->validate([
            'parameters' => 'nullable|array',
            'output_format' => 'nullable|in:pdf,excel,csv,json',
        ]);

        DB::beginTransaction();

        try {
            $reportRun = ReportRun::create([
                'report_id' => $report->id,
                'run_by' => Auth::id(),
                'status' => 'pending',
                'parameters' => $request->parameters ?? [],
            ]);

            $reportRun->markAsRunning();

            // Execute the report
            $result = $this->executeReport($report, $reportRun, $request->parameters ?? []);

            if ($result['success']) {
                $reportRun->markAsCompleted(
                    $result['file_path'] ?? null,
                    $result['file_size'] ?? null,
                    $result['data'] ?? null
                );
            } else {
                $reportRun->markAsFailed($result['error'] ?? 'Unknown error');
            }

            $report->incrementRunCount();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Report executed successfully.',
                'run_id' => $reportRun->id,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            if (isset($reportRun)) {
                $reportRun->markAsFailed($e->getMessage());
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to execute report: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function download(ReportRun $reportRun)
    {
        $this->authorize('view', $reportRun->report);

        if (!$reportRun->is_completed || !$reportRun->file_path) {
            abort(404, 'File not found');
        }

        $filePath = storage_path('app/' . $reportRun->file_path);
        
        if (!file_exists($filePath)) {
            abort(404, 'File not found');
        }

        return response()->download($filePath);
    }

    public function getRunStatus(ReportRun $reportRun)
    {
        $this->authorize('view', $reportRun->report);

        return response()->json([
            'status' => $reportRun->status,
            'progress' => $this->getReportProgress($reportRun),
            'file_url' => $reportRun->is_completed ? $reportRun->getDownloadUrl() : null,
            'error_message' => $reportRun->error_message,
        ]);
    }

    public function share(Request $request, Report $report)
    {
        $this->authorize('update', $report);

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'permission' => 'required|in:view,run,edit,admin',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $report->shareWith(
            User::find($request->user_id),
            $request->permission
        );

        if ($request->expires_at) {
            $share = $report->reportShares()
                ->where('user_id', $request->user_id)
                ->first();
            $share->update(['expires_at' => $request->expires_at]);
        }

        return redirect()->back()
            ->with('success', 'Report shared successfully.');
    }

    public function unshare(Report $report, User $user)
    {
        $this->authorize('update', $report);

        $report->unshareWith($user);

        return redirect()->back()
            ->with('success', 'Report access revoked successfully.');
    }

    public function duplicate(Report $report)
    {
        $this->authorize('view', $report);

        $newReport = $report->replicate();
        $newReport->name = $report->name . ' (Copy)';
        $newReport->created_by = Auth::id();
        $newReport->run_count = 0;
        $newReport->last_run_at = null;
        $newReport->save();

        return redirect()->route('reports.edit', $newReport)
            ->with('success', 'Report duplicated successfully.');
    }

    private function executeReport(Report $report, ReportRun $reportRun, array $parameters): array
    {
        try {
            // This is a simplified implementation
            // In a real application, you would have a more sophisticated report execution engine
            
            $data = $this->getReportData($report, $parameters);
            $outputFormat = $parameters['output_format'] ?? 'json';
            
            if ($outputFormat === 'json') {
                return [
                    'success' => true,
                    'data' => $data,
                ];
            }

            // Generate file for other formats
            $fileName = 'report_' . $report->id . '_' . time() . '.' . $outputFormat;
            $filePath = 'reports/' . $fileName;
            
            $this->generateReportFile($data, $outputFormat, $filePath);
            
            return [
                'success' => true,
                'file_path' => $filePath,
                'file_size' => filesize(storage_path('app/' . $filePath)),
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    private function getReportData(Report $report, array $parameters): array
    {
        // This is a simplified data retrieval
        // In a real application, you would build dynamic queries based on the report configuration
        
        return match ($report->data_source) {
            'students' => $this->getStudentData($parameters),
            'teachers' => $this->getTeacherData($parameters),
            'attendance' => $this->getAttendanceData($parameters),
            'fees' => $this->getFeeData($parameters),
            'payments' => $this->getPaymentData($parameters),
            default => [],
        };
    }

    private function getStudentData(array $parameters): array
    {
        return [
            'total_students' => User::where('school_id', Auth::user()->school_id)
                ->where('role', 'student')
                ->count(),
            'active_students' => User::where('school_id', Auth::user()->school_id)
                ->where('role', 'student')
                ->where('is_active', true)
                ->count(),
            'by_class' => User::where('school_id', Auth::user()->school_id)
                ->where('role', 'student')
                ->with('schoolClass')
                ->get()
                ->groupBy('schoolClass.name')
                ->map->count(),
        ];
    }

    private function getTeacherData(array $parameters): array
    {
        return [
            'total_teachers' => User::where('school_id', Auth::user()->school_id)
                ->where('role', 'teacher')
                ->count(),
            'active_teachers' => User::where('school_id', Auth::user()->school_id)
                ->where('role', 'teacher')
                ->where('is_active', true)
                ->count(),
        ];
    }

    private function getAttendanceData(array $parameters): array
    {
        return [
            'total_attendance' => 0, // Implement based on your attendance system
            'attendance_rate' => 0,
        ];
    }

    private function getFeeData(array $parameters): array
    {
        return [
            'total_fees' => 0, // Implement based on your fee system
            'collected_fees' => 0,
            'outstanding_fees' => 0,
        ];
    }

    private function getPaymentData(array $parameters): array
    {
        return [
            'total_payments' => 0, // Implement based on your payment system
            'payment_rate' => 0,
        ];
    }

    private function generateReportFile(array $data, string $format, string $filePath): void
    {
        // Implement file generation based on format
        // This is a placeholder implementation
        Storage::put($filePath, json_encode($data, JSON_PRETTY_PRINT));
    }

    private function getReportProgress(ReportRun $reportRun): int
    {
        // This is a simplified progress calculation
        // In a real application, you would track actual progress
        
        return match ($reportRun->status) {
            'pending' => 0,
            'running' => 50,
            'completed' => 100,
            'failed' => 0,
            'cancelled' => 0,
            default => 0,
        };
    }
}
