<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\ReportTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReportTemplateController extends Controller
{
    public function index(Request $request)
    {
        $query = ReportTemplate::where('school_id', Auth::user()->school_id);

        // Apply filters
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('data_source')) {
            $query->where('data_source', $request->data_source);
        }

        if ($request->filled('is_system')) {
            $query->where('is_system', $request->is_system);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $templates = $query->with(['createdBy'])
            ->orderBy('is_system', 'desc')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        // Statistics
        $stats = [
            'total_templates' => ReportTemplate::where('school_id', Auth::user()->school_id)->count(),
            'system_templates' => ReportTemplate::where('school_id', Auth::user()->school_id)->where('is_system', true)->count(),
            'custom_templates' => ReportTemplate::where('school_id', Auth::user()->school_id)->where('is_system', false)->count(),
            'my_templates' => ReportTemplate::where('school_id', Auth::user()->school_id)->where('created_by', Auth::id())->count(),
        ];

        return Inertia::render('Reports/Templates/Index', [
            'templates' => $templates,
            'stats' => $stats,
            'categoryOptions' => ReportTemplate::CATEGORY_OPTIONS,
            'dataSourceOptions' => ReportTemplate::DATA_SOURCE_OPTIONS,
            'filters' => $request->only(['category', 'data_source', 'is_system', 'search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Reports/Templates/Create', [
            'categoryOptions' => ReportTemplate::CATEGORY_OPTIONS,
            'dataSourceOptions' => ReportTemplate::DATA_SOURCE_OPTIONS,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|in:' . implode(',', array_keys(ReportTemplate::CATEGORY_OPTIONS)),
            'data_source' => 'required|in:' . implode(',', array_keys(ReportTemplate::DATA_SOURCE_OPTIONS)),
            'query_template' => 'nullable|array',
            'filter_template' => 'nullable|array',
            'output_template' => 'nullable|array',
        ]);

        $template = ReportTemplate::create([
            'school_id' => Auth::user()->school_id,
            'name' => $request->name,
            'description' => $request->description,
            'category' => $request->category,
            'data_source' => $request->data_source,
            'query_template' => $request->query_template ?? [],
            'filter_template' => $request->filter_template ?? [],
            'output_template' => $request->output_template ?? [],
            'is_system' => false,
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('reports.templates.index')
            ->with('success', 'Report template created successfully.');
    }

    public function show(ReportTemplate $template)
    {
        $this->authorize('view', $template);

        $template->load(['createdBy', 'reports']);

        return Inertia::render('Reports/Templates/Show', [
            'template' => $template,
        ]);
    }

    public function edit(ReportTemplate $template)
    {
        $this->authorize('update', $template);

        return Inertia::render('Reports/Templates/Edit', [
            'template' => $template,
            'categoryOptions' => ReportTemplate::CATEGORY_OPTIONS,
            'dataSourceOptions' => ReportTemplate::DATA_SOURCE_OPTIONS,
        ]);
    }

    public function update(Request $request, ReportTemplate $template)
    {
        $this->authorize('update', $template);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|in:' . implode(',', array_keys(ReportTemplate::CATEGORY_OPTIONS)),
            'data_source' => 'required|in:' . implode(',', array_keys(ReportTemplate::DATA_SOURCE_OPTIONS)),
            'query_template' => 'nullable|array',
            'filter_template' => 'nullable|array',
            'output_template' => 'nullable|array',
        ]);

        $template->update([
            'name' => $request->name,
            'description' => $request->description,
            'category' => $request->category,
            'data_source' => $request->data_source,
            'query_template' => $request->query_template ?? [],
            'filter_template' => $request->filter_template ?? [],
            'output_template' => $request->output_template ?? [],
        ]);

        return redirect()->route('reports.templates.index')
            ->with('success', 'Report template updated successfully.');
    }

    public function destroy(ReportTemplate $template)
    {
        $this->authorize('delete', $template);

        if (!$template->canBeDeleted()) {
            return redirect()->back()
                ->with('error', 'Cannot delete template that is in use or is a system template.');
        }

        $template->delete();

        return redirect()->route('reports.templates.index')
            ->with('success', 'Report template deleted successfully.');
    }

    public function duplicate(ReportTemplate $template)
    {
        $this->authorize('view', $template);

        $newTemplate = $template->duplicate(Auth::id());

        return redirect()->route('reports.templates.edit', $newTemplate)
            ->with('success', 'Report template duplicated successfully.');
    }

    public function createReportFromTemplate(Request $request, ReportTemplate $template)
    {
        $this->authorize('view', $template);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_public' => 'boolean',
            'is_scheduled' => 'boolean',
            'schedule_config' => 'nullable|array',
        ]);

        $report = $template->createReport([
            'name' => $request->name,
            'description' => $request->description,
            'is_public' => $request->is_public ?? false,
            'is_scheduled' => $request->is_scheduled ?? false,
            'schedule' => $request->schedule_config ?? [],
        ], Auth::id());

        return redirect()->route('reports.show', $report)
            ->with('success', 'Report created from template successfully.');
    }

    public function getTemplateFields(ReportTemplate $template)
    {
        $this->authorize('view', $template);

        return response()->json([
            'query_fields' => $template->query_template,
            'filter_fields' => $template->filter_template,
            'output_fields' => $template->output_template,
        ]);
    }

    public function preview(Request $request, ReportTemplate $template)
    {
        $this->authorize('view', $template);

        $request->validate([
            'parameters' => 'nullable|array',
        ]);

        // Create a temporary report to preview
        $tempReport = $template->createReport([
            'name' => 'Preview Report',
            'description' => 'Temporary preview report',
            'is_public' => false,
            'is_scheduled' => false,
        ], Auth::id());

        // Execute the report with preview parameters
        $data = $this->getPreviewData($tempReport, $request->parameters ?? []);

        // Delete the temporary report
        $tempReport->delete();

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    private function getPreviewData($report, array $parameters): array
    {
        // This is a simplified preview implementation
        // In a real application, you would have a more sophisticated preview system
        
        return match ($report->data_source) {
            'students' => [
                'total_students' => 150,
                'active_students' => 145,
                'by_class' => [
                    'Form 1A' => 25,
                    'Form 1B' => 24,
                    'Form 2A' => 26,
                    'Form 2B' => 25,
                    'Form 3A' => 25,
                    'Form 3B' => 25,
                ],
            ],
            'teachers' => [
                'total_teachers' => 15,
                'active_teachers' => 14,
                'by_subject' => [
                    'Mathematics' => 3,
                    'English' => 2,
                    'Science' => 4,
                    'History' => 2,
                    'Geography' => 2,
                    'Kiswahili' => 2,
                ],
            ],
            'fees' => [
                'total_fees' => 5000000,
                'collected_fees' => 4250000,
                'outstanding_fees' => 750000,
                'collection_rate' => 85,
            ],
            default => [],
        };
    }
}



