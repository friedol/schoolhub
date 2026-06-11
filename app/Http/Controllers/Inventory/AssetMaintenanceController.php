<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\AssetMaintenance;
use App\Models\InventoryItem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AssetMaintenanceController extends Controller
{
    public function index(Request $request)
    {
        $query = AssetMaintenance::with(['inventoryItem', 'performedBy', 'createdBy'])
            ->where('school_id', Auth::user()->school_id);

        // Apply filters
        if ($request->filled('inventory_item_id')) {
            $query->where('inventory_item_id', $request->inventory_item_id);
        }

        if ($request->filled('maintenance_type')) {
            $query->where('maintenance_type', $request->maintenance_type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->where('maintenance_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('maintenance_date', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhereHas('inventoryItem', function ($itemQuery) use ($search) {
                      $itemQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $maintenances = $query->orderBy('maintenance_date', 'desc')
            ->paginate(15)
            ->withQueryString();

        $inventoryItems = InventoryItem::where('school_id', Auth::user()->school_id)
            ->where('item_type', InventoryItem::TYPE_ASSET)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Statistics
        $stats = [
            'total_maintenances' => AssetMaintenance::where('school_id', Auth::user()->school_id)->count(),
            'scheduled_maintenances' => AssetMaintenance::where('school_id', Auth::user()->school_id)
                ->where('status', 'scheduled')->count(),
            'completed_maintenances' => AssetMaintenance::where('school_id', Auth::user()->school_id)
                ->where('status', 'completed')->count(),
            'overdue_maintenances' => AssetMaintenance::where('school_id', Auth::user()->school_id)
                ->overdue()->count(),
            'due_soon_maintenances' => AssetMaintenance::where('school_id', Auth::user()->school_id)
                ->dueSoon()->count(),
        ];

        return Inertia::render('Inventory/AssetMaintenance/Index', [
            'maintenances' => $maintenances,
            'inventoryItems' => $inventoryItems,
            'stats' => $stats,
            'typeOptions' => AssetMaintenance::TYPE_OPTIONS,
            'statusOptions' => AssetMaintenance::STATUS_OPTIONS,
            'filters' => $request->only(['inventory_item_id', 'maintenance_type', 'status', 'date_from', 'date_to', 'search']),
        ]);
    }

    public function create()
    {
        $inventoryItems = InventoryItem::where('school_id', Auth::user()->school_id)
            ->where('item_type', InventoryItem::TYPE_ASSET)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $staff = User::where('school_id', Auth::user()->school_id)
            ->whereIn('role', ['teacher', 'staff'])
            ->orderBy('name')
            ->get();

        return Inertia::render('Inventory/AssetMaintenance/Create', [
            'inventoryItems' => $inventoryItems,
            'staff' => $staff,
            'typeOptions' => AssetMaintenance::TYPE_OPTIONS,
            'statusOptions' => AssetMaintenance::STATUS_OPTIONS,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'maintenance_type' => 'required|in:' . implode(',', array_keys(AssetMaintenance::TYPE_OPTIONS)),
            'maintenance_date' => 'required|date',
            'next_maintenance_date' => 'nullable|date|after:maintenance_date',
            'description' => 'required|string|max:1000',
            'cost' => 'required|numeric|min:0',
            'performed_by' => 'nullable|exists:users,id',
            'status' => 'required|in:' . implode(',', array_keys(AssetMaintenance::STATUS_OPTIONS)),
            'notes' => 'nullable|string|max:1000',
        ]);

        $inventoryItem = InventoryItem::findOrFail($request->inventory_item_id);
        
        // Ensure the item belongs to the user's school and is an asset
        if ($inventoryItem->school_id !== Auth::user()->school_id || 
            $inventoryItem->item_type !== InventoryItem::TYPE_ASSET) {
            return redirect()->back()
                ->with('error', 'Invalid inventory item selected.');
        }

        AssetMaintenance::create([
            'inventory_item_id' => $request->inventory_item_id,
            'school_id' => Auth::user()->school_id,
            'maintenance_type' => $request->maintenance_type,
            'maintenance_date' => $request->maintenance_date,
            'next_maintenance_date' => $request->next_maintenance_date,
            'description' => $request->description,
            'cost' => $request->cost,
            'performed_by' => $request->performed_by,
            'status' => $request->status,
            'notes' => $request->notes,
        ]);

        return redirect()->route('inventory.asset-maintenance.index')
            ->with('success', 'Asset maintenance record created successfully.');
    }

    public function show(AssetMaintenance $assetMaintenance)
    {
        $this->authorize('view', $assetMaintenance);

        $assetMaintenance->load([
            'inventoryItem',
            'performedBy',
            'createdBy'
        ]);

        return Inertia::render('Inventory/AssetMaintenance/Show', [
            'maintenance' => $assetMaintenance,
        ]);
    }

    public function edit(AssetMaintenance $assetMaintenance)
    {
        $this->authorize('update', $assetMaintenance);

        $inventoryItems = InventoryItem::where('school_id', Auth::user()->school_id)
            ->where('item_type', InventoryItem::TYPE_ASSET)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $staff = User::where('school_id', Auth::user()->school_id)
            ->whereIn('role', ['teacher', 'staff'])
            ->orderBy('name')
            ->get();

        return Inertia::render('Inventory/AssetMaintenance/Edit', [
            'maintenance' => $assetMaintenance,
            'inventoryItems' => $inventoryItems,
            'staff' => $staff,
            'typeOptions' => AssetMaintenance::TYPE_OPTIONS,
            'statusOptions' => AssetMaintenance::STATUS_OPTIONS,
        ]);
    }

    public function update(Request $request, AssetMaintenance $assetMaintenance)
    {
        $this->authorize('update', $assetMaintenance);

        $request->validate([
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'maintenance_type' => 'required|in:' . implode(',', array_keys(AssetMaintenance::TYPE_OPTIONS)),
            'maintenance_date' => 'required|date',
            'next_maintenance_date' => 'nullable|date|after:maintenance_date',
            'description' => 'required|string|max:1000',
            'cost' => 'required|numeric|min:0',
            'performed_by' => 'nullable|exists:users,id',
            'status' => 'required|in:' . implode(',', array_keys(AssetMaintenance::STATUS_OPTIONS)),
            'notes' => 'nullable|string|max:1000',
        ]);

        $inventoryItem = InventoryItem::findOrFail($request->inventory_item_id);
        
        // Ensure the item belongs to the user's school and is an asset
        if ($inventoryItem->school_id !== Auth::user()->school_id || 
            $inventoryItem->item_type !== InventoryItem::TYPE_ASSET) {
            return redirect()->back()
                ->with('error', 'Invalid inventory item selected.');
        }

        $assetMaintenance->update($request->all());

        return redirect()->route('inventory.asset-maintenance.index')
            ->with('success', 'Asset maintenance record updated successfully.');
    }

    public function destroy(AssetMaintenance $assetMaintenance)
    {
        $this->authorize('delete', $assetMaintenance);

        $assetMaintenance->delete();

        return redirect()->route('inventory.asset-maintenance.index')
            ->with('success', 'Asset maintenance record deleted successfully.');
    }

    public function getOverdueMaintenances()
    {
        $maintenances = AssetMaintenance::with(['inventoryItem', 'performedBy'])
            ->where('school_id', Auth::user()->school_id)
            ->overdue()
            ->orderBy('next_maintenance_date')
            ->get();

        return response()->json($maintenances);
    }

    public function getDueSoonMaintenances()
    {
        $maintenances = AssetMaintenance::with(['inventoryItem', 'performedBy'])
            ->where('school_id', Auth::user()->school_id)
            ->dueSoon()
            ->orderBy('next_maintenance_date')
            ->get();

        return response()->json($maintenances);
    }

    public function getAssetMaintenanceHistory(InventoryItem $inventoryItem)
    {
        $this->authorize('view', $inventoryItem);

        $maintenances = AssetMaintenance::where('inventory_item_id', $inventoryItem->id)
            ->orderBy('maintenance_date', 'desc')
            ->get();

        return response()->json($maintenances);
    }

    public function schedulePreventiveMaintenance(Request $request)
    {
        $request->validate([
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'maintenance_interval_days' => 'required|integer|min:1',
            'description' => 'required|string|max:1000',
            'cost_estimate' => 'nullable|numeric|min:0',
        ]);

        $inventoryItem = InventoryItem::findOrFail($request->inventory_item_id);
        
        // Ensure the item belongs to the user's school and is an asset
        if ($inventoryItem->school_id !== Auth::user()->school_id || 
            $inventoryItem->item_type !== InventoryItem::TYPE_ASSET) {
            return redirect()->back()
                ->with('error', 'Invalid inventory item selected.');
        }

        $nextMaintenanceDate = now()->addDays($request->maintenance_interval_days);

        AssetMaintenance::create([
            'inventory_item_id' => $request->inventory_item_id,
            'school_id' => Auth::user()->school_id,
            'maintenance_type' => AssetMaintenance::TYPE_PREVENTIVE,
            'maintenance_date' => now(),
            'next_maintenance_date' => $nextMaintenanceDate,
            'description' => $request->description,
            'cost' => $request->cost_estimate ?? 0,
            'status' => AssetMaintenance::STATUS_SCHEDULED,
        ]);

        return redirect()->back()
            ->with('success', 'Preventive maintenance scheduled successfully.');
    }
}
