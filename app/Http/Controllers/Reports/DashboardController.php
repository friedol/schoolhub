<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Dashboard;
use App\Models\DashboardWidget;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $query = Dashboard::where('school_id', Auth::user()->school_id);

        // Apply filters
        if ($request->filled('role')) {
            $query->where('role', $request->role);
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

        $dashboards = $query->with(['user', 'widgets'])
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Statistics
        $stats = [
            'total_dashboards' => Dashboard::where('school_id', Auth::user()->school_id)->count(),
            'default_dashboards' => Dashboard::where('school_id', Auth::user()->school_id)->where('is_default', true)->count(),
            'public_dashboards' => Dashboard::where('school_id', Auth::user()->school_id)->where('is_public', true)->count(),
            'my_dashboards' => Dashboard::where('school_id', Auth::user()->school_id)->where('user_id', Auth::id())->count(),
        ];

        return Inertia::render('Reports/Dashboards/Index', [
            'dashboards' => $dashboards,
            'stats' => $stats,
            'roleOptions' => Dashboard::ROLE_OPTIONS,
            'filters' => $request->only(['role', 'is_public', 'search']),
        ]);
    }

    public function show(Dashboard $dashboard)
    {
        $this->authorize('view', $dashboard);

        $dashboard->load(['widgets.report', 'user']);

        return Inertia::render('Reports/Dashboards/Show', [
            'dashboard' => $dashboard,
        ]);
    }

    public function create()
    {
        $reports = Report::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Reports/Dashboards/Create', [
            'reports' => $reports,
            'roleOptions' => Dashboard::ROLE_OPTIONS,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'role' => 'required|in:' . implode(',', array_keys(Dashboard::ROLE_OPTIONS)),
            'is_public' => 'boolean',
            'layout_config' => 'nullable|array',
        ]);

        $dashboard = Dashboard::create([
            'school_id' => Auth::user()->school_id,
            'user_id' => Auth::id(),
            'name' => $request->name,
            'description' => $request->description,
            'role' => $request->role,
            'is_public' => $request->is_public ?? false,
            'layout_config' => $request->layout_config ?? [],
        ]);

        return redirect()->route('reports.dashboards.show', $dashboard)
            ->with('success', 'Dashboard created successfully.');
    }

    public function edit(Dashboard $dashboard)
    {
        $this->authorize('update', $dashboard);

        $dashboard->load(['widgets.report']);

        $reports = Report::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Reports/Dashboards/Edit', [
            'dashboard' => $dashboard,
            'reports' => $reports,
            'roleOptions' => Dashboard::ROLE_OPTIONS,
        ]);
    }

    public function update(Request $request, Dashboard $dashboard)
    {
        $this->authorize('update', $dashboard);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'role' => 'required|in:' . implode(',', array_keys(Dashboard::ROLE_OPTIONS)),
            'is_public' => 'boolean',
            'layout_config' => 'nullable|array',
        ]);

        $dashboard->update([
            'name' => $request->name,
            'description' => $request->description,
            'role' => $request->role,
            'is_public' => $request->is_public ?? false,
            'layout_config' => $request->layout_config ?? [],
        ]);

        return redirect()->route('reports.dashboards.show', $dashboard)
            ->with('success', 'Dashboard updated successfully.');
    }

    public function destroy(Dashboard $dashboard)
    {
        $this->authorize('delete', $dashboard);

        $dashboard->delete();

        return redirect()->route('reports.dashboards.index')
            ->with('success', 'Dashboard deleted successfully.');
    }

    public function addWidget(Request $request, Dashboard $dashboard)
    {
        $this->authorize('update', $dashboard);

        $request->validate([
            'report_id' => 'nullable|exists:reports,id',
            'name' => 'required|string|max:255',
            'type' => 'required|in:' . implode(',', array_keys(DashboardWidget::TYPE_OPTIONS)),
            'size' => 'required|in:' . implode(',', array_keys(DashboardWidget::SIZE_OPTIONS)),
            'config' => 'nullable|array',
            'position' => 'nullable|array',
        ]);

        $widget = DashboardWidget::create([
            'dashboard_id' => $dashboard->id,
            'report_id' => $request->report_id,
            'name' => $request->name,
            'type' => $request->type,
            'size' => $request->size,
            'config' => $request->config ?? [],
            'position' => $request->position ?? $dashboard->getNextPosition(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Widget added successfully.',
            'widget' => $widget,
        ]);
    }

    public function updateWidget(Request $request, DashboardWidget $widget)
    {
        $this->authorize('update', $widget->dashboard);

        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:' . implode(',', array_keys(DashboardWidget::TYPE_OPTIONS)),
            'size' => 'required|in:' . implode(',', array_keys(DashboardWidget::SIZE_OPTIONS)),
            'config' => 'nullable|array',
            'position' => 'nullable|array',
            'refresh_interval' => 'nullable|integer|min:0',
        ]);

        $widget->update([
            'name' => $request->name,
            'type' => $request->type,
            'size' => $request->size,
            'config' => $request->config ?? [],
            'position' => $request->position ?? $widget->position,
            'refresh_interval' => $request->refresh_interval,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Widget updated successfully.',
        ]);
    }

    public function removeWidget(DashboardWidget $widget)
    {
        $this->authorize('update', $widget->dashboard);

        $widget->delete();

        return response()->json([
            'success' => true,
            'message' => 'Widget removed successfully.',
        ]);
    }

    public function updateLayout(Request $request, Dashboard $dashboard)
    {
        $this->authorize('update', $dashboard);

        $request->validate([
            'layout' => 'required|array',
        ]);

        $dashboard->updateLayout($request->layout);

        return response()->json([
            'success' => true,
            'message' => 'Layout updated successfully.',
        ]);
    }

    public function getWidgetData(DashboardWidget $widget)
    {
        $this->authorize('view', $widget->dashboard);

        $data = $widget->getData();

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function share(Request $request, Dashboard $dashboard)
    {
        $this->authorize('update', $dashboard);

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'permission' => 'required|in:view,edit,admin',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $dashboard->shareWith(
            User::find($request->user_id),
            $request->permission
        );

        if ($request->expires_at) {
            $share = $dashboard->shares()
                ->where('user_id', $request->user_id)
                ->first();
            $share->update(['expires_at' => $request->expires_at]);
        }

        return redirect()->back()
            ->with('success', 'Dashboard shared successfully.');
    }

    public function unshare(Dashboard $dashboard, User $user)
    {
        $this->authorize('update', $dashboard);

        $dashboard->unshareWith($user);

        return redirect()->back()
            ->with('success', 'Dashboard access revoked successfully.');
    }

    public function duplicate(Dashboard $dashboard)
    {
        $this->authorize('view', $dashboard);

        $newDashboard = $dashboard->replicate();
        $newDashboard->name = $dashboard->name . ' (Copy)';
        $newDashboard->user_id = Auth::id();
        $newDashboard->is_default = false;
        $newDashboard->save();

        // Copy widgets
        foreach ($dashboard->widgets as $widget) {
            $newWidget = $widget->replicate();
            $newWidget->dashboard_id = $newDashboard->id;
            $newWidget->save();
        }

        return redirect()->route('reports.dashboards.show', $newDashboard)
            ->with('success', 'Dashboard duplicated successfully.');
    }

    public function getDefaultDashboard(Request $request)
    {
        $role = $request->get('role', Auth::user()->role);
        
        $dashboard = Dashboard::getDefaultForRole($role, Auth::user()->school_id);
        
        if (!$dashboard) {
            $dashboard = Dashboard::createDefaultForRole($role, Auth::user()->school_id, Auth::id());
        }

        return redirect()->route('reports.dashboards.show', $dashboard);
    }

    public function setAsDefault(Dashboard $dashboard)
    {
        $this->authorize('update', $dashboard);

        // Remove default flag from other dashboards of the same role
        Dashboard::where('school_id', Auth::user()->school_id)
            ->where('role', $dashboard->role)
            ->where('is_default', true)
            ->update(['is_default' => false]);

        $dashboard->update(['is_default' => true]);

        return redirect()->back()
            ->with('success', 'Dashboard set as default successfully.');
    }
}



