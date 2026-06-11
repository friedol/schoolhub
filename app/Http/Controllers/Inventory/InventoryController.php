<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\InventoryCategory;
use App\Models\Supplier;
use App\Models\InventoryTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = InventoryItem::with(['category', 'supplier', 'transactions'])
            ->where('school_id', Auth::user()->school_id);

        // Apply filters
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('item_type')) {
            $query->where('item_type', $request->item_type);
        }

        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->filled('stock_status')) {
            switch ($request->stock_status) {
                case 'low_stock':
                    $query->lowStock();
                    break;
                case 'out_of_stock':
                    $query->where('current_stock', '<=', 0);
                    break;
                case 'overstocked':
                    $query->overstocked();
                    break;
                case 'needs_reorder':
                    $query->needsReorder();
                    break;
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('item_code', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%")
                  ->orWhere('serial_number', 'like', "%{$search}%");
            });
        }

        $items = $query->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        $categories = InventoryCategory::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $suppliers = Supplier::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Statistics
        $stats = [
            'total_items' => InventoryItem::where('school_id', Auth::user()->school_id)->count(),
            'consumable_items' => InventoryItem::where('school_id', Auth::user()->school_id)
                ->consumable()->count(),
            'asset_items' => InventoryItem::where('school_id', Auth::user()->school_id)
                ->asset()->count(),
            'low_stock_items' => InventoryItem::where('school_id', Auth::user()->school_id)
                ->lowStock()->count(),
            'out_of_stock_items' => InventoryItem::where('school_id', Auth::user()->school_id)
                ->where('current_stock', '<=', 0)->count(),
            'total_stock_value' => InventoryItem::where('school_id', Auth::user()->school_id)
                ->sum(DB::raw('current_stock * cost_price')),
        ];

        return Inertia::render('Inventory/Index', [
            'items' => $items,
            'categories' => $categories,
            'suppliers' => $suppliers,
            'stats' => $stats,
            'filters' => $request->only(['category_id', 'item_type', 'supplier_id', 'stock_status', 'search']),
        ]);
    }

    public function create()
    {
        $categories = InventoryCategory::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $suppliers = Supplier::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Inventory/Create', [
            'categories' => $categories,
            'suppliers' => $suppliers,
            'unitOptions' => InventoryItem::UNIT_OPTIONS,
            'itemTypeOptions' => [
                InventoryItem::TYPE_CONSUMABLE => 'Consumable',
                InventoryItem::TYPE_ASSET => 'Asset',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:inventory_categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'item_type' => 'required|in:' . InventoryItem::TYPE_CONSUMABLE . ',' . InventoryItem::TYPE_ASSET,
            'manufacturer' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'serial_number' => 'nullable|string|max:255',
            'unit_of_measure' => 'required|string|max:50',
            'cost_price' => 'required|numeric|min:0',
            'replacement_value' => 'nullable|numeric|min:0',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'current_stock' => 'required|integer|min:0',
            'min_stock_level' => 'required|integer|min:0',
            'reorder_level' => 'required|integer|min:0',
            'max_stock_level' => 'nullable|integer|min:0',
            'location' => 'nullable|string|max:255',
            'shelf_location' => 'nullable|string|max:255',
            'barcode' => 'nullable|string|max:255',
            'batch_number' => 'nullable|string|max:255',
            'expiry_date' => 'nullable|date|after:today',
        ]);

        $item = InventoryItem::create([
            'school_id' => Auth::user()->school_id,
            'category_id' => $request->category_id,
            'name' => $request->name,
            'description' => $request->description,
            'item_type' => $request->item_type,
            'manufacturer' => $request->manufacturer,
            'model' => $request->model,
            'serial_number' => $request->serial_number,
            'unit_of_measure' => $request->unit_of_measure,
            'cost_price' => $request->cost_price,
            'replacement_value' => $request->replacement_value,
            'supplier_id' => $request->supplier_id,
            'current_stock' => $request->current_stock,
            'min_stock_level' => $request->min_stock_level,
            'reorder_level' => $request->reorder_level,
            'max_stock_level' => $request->max_stock_level,
            'location' => $request->location,
            'shelf_location' => $request->shelf_location,
            'barcode' => $request->barcode,
            'batch_number' => $request->batch_number,
            'expiry_date' => $request->expiry_date,
        ]);

        // Create initial transaction record
        if ($request->current_stock > 0) {
            InventoryTransaction::create([
                'inventory_item_id' => $item->id,
                'school_id' => Auth::user()->school_id,
                'type' => InventoryTransaction::TYPE_IN,
                'quantity' => $request->current_stock,
                'transaction_date' => now(),
                'remarks' => 'Initial stock',
                'performed_by' => Auth::id(),
            ]);
        }

        return redirect()->route('inventory.index')
            ->with('success', 'Inventory item created successfully.');
    }

    public function show(InventoryItem $inventoryItem)
    {
        $this->authorize('view', $inventoryItem);

        $inventoryItem->load([
            'category',
            'supplier',
            'transactions' => function ($query) {
                $query->orderBy('transaction_date', 'desc')->limit(20);
            },
            'assignments' => function ($query) {
                $query->where('is_active', true)->with('assignedTo');
            },
            'maintenanceRecords' => function ($query) {
                $query->orderBy('maintenance_date', 'desc')->limit(10);
            }
        ]);

        return Inertia::render('Inventory/Show', [
            'item' => $inventoryItem,
        ]);
    }

    public function edit(InventoryItem $inventoryItem)
    {
        $this->authorize('update', $inventoryItem);

        $inventoryItem->load(['category', 'supplier']);

        $categories = InventoryCategory::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $suppliers = Supplier::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Inventory/Edit', [
            'item' => $inventoryItem,
            'categories' => $categories,
            'suppliers' => $suppliers,
            'unitOptions' => InventoryItem::UNIT_OPTIONS,
            'itemTypeOptions' => [
                InventoryItem::TYPE_CONSUMABLE => 'Consumable',
                InventoryItem::TYPE_ASSET => 'Asset',
            ],
        ]);
    }

    public function update(Request $request, InventoryItem $inventoryItem)
    {
        $this->authorize('update', $inventoryItem);

        $request->validate([
            'category_id' => 'required|exists:inventory_categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'item_type' => 'required|in:' . InventoryItem::TYPE_CONSUMABLE . ',' . InventoryItem::TYPE_ASSET,
            'manufacturer' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'serial_number' => 'nullable|string|max:255',
            'unit_of_measure' => 'required|string|max:50',
            'cost_price' => 'required|numeric|min:0',
            'replacement_value' => 'nullable|numeric|min:0',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'min_stock_level' => 'required|integer|min:0',
            'reorder_level' => 'required|integer|min:0',
            'max_stock_level' => 'nullable|integer|min:0',
            'location' => 'nullable|string|max:255',
            'shelf_location' => 'nullable|string|max:255',
            'barcode' => 'nullable|string|max:255',
            'batch_number' => 'nullable|string|max:255',
            'expiry_date' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $inventoryItem->update($request->all());

        return redirect()->route('inventory.index')
            ->with('success', 'Inventory item updated successfully.');
    }

    public function destroy(InventoryItem $inventoryItem)
    {
        $this->authorize('delete', $inventoryItem);

        // Check if item has transactions or assignments
        if ($inventoryItem->transactions()->exists() || $inventoryItem->assignments()->exists()) {
            return redirect()->back()
                ->with('error', 'Cannot delete item with existing transactions or assignments.');
        }

        $inventoryItem->delete();

        return redirect()->route('inventory.index')
            ->with('success', 'Inventory item deleted successfully.');
    }

    public function adjustStock(Request $request, InventoryItem $inventoryItem)
    {
        $this->authorize('update', $inventoryItem);

        $request->validate([
            'adjustment_type' => 'required|in:increase,decrease',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string|max:500',
        ]);

        $quantity = $request->adjustment_type === 'increase' 
            ? $request->quantity 
            : -$request->quantity;

        $inventoryItem->current_stock += $quantity;
        $inventoryItem->save();

        // Create transaction record
        InventoryTransaction::create([
            'inventory_item_id' => $inventoryItem->id,
            'school_id' => Auth::user()->school_id,
            'type' => $request->adjustment_type === 'increase' 
                ? InventoryTransaction::TYPE_IN 
                : InventoryTransaction::TYPE_OUT,
            'quantity' => abs($quantity),
            'transaction_date' => now(),
            'remarks' => $request->reason,
            'performed_by' => Auth::id(),
        ]);

        return redirect()->back()
            ->with('success', 'Stock adjusted successfully.');
    }

    public function getLowStockItems()
    {
        $items = InventoryItem::with(['category', 'supplier'])
            ->where('school_id', Auth::user()->school_id)
            ->lowStock()
            ->orderBy('current_stock')
            ->get();

        return response()->json($items);
    }

    public function getItemsNeedingReorder()
    {
        $items = InventoryItem::with(['category', 'supplier'])
            ->where('school_id', Auth::user()->school_id)
            ->needsReorder()
            ->orderBy('current_stock')
            ->get();

        return response()->json($items);
    }

    public function generateBarcode(InventoryItem $inventoryItem)
    {
        $this->authorize('view', $inventoryItem);

        // Generate barcode (simplified - in real implementation, use a barcode library)
        $barcode = 'BC' . str_pad($inventoryItem->id, 8, '0', STR_PAD_LEFT);
        
        $inventoryItem->update(['barcode' => $barcode]);

        return response()->json(['barcode' => $barcode]);
    }

    public function getStockMovement(InventoryItem $inventoryItem, Request $request)
    {
        $this->authorize('view', $inventoryItem);

        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        $transactions = InventoryTransaction::where('inventory_item_id', $inventoryItem->id)
            ->whereBetween('transaction_date', [$request->start_date, $request->end_date])
            ->orderBy('transaction_date')
            ->get();

        return response()->json($transactions);
    }
}
