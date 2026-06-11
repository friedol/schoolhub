<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use App\Models\PurchaseOrder;
use App\Models\GoodsReceivedNote;
use App\Models\IssueNote;
use App\Models\AssetMaintenance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class InventoryReportsController extends Controller
{
    public function index()
    {
        return Inertia::render('Inventory/Reports/Index');
    }

    public function stockStatusReport(Request $request)
    {
        $query = InventoryItem::with(['category', 'supplier'])
            ->where('school_id', Auth::user()->school_id);

        // Apply filters
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('item_type')) {
            $query->where('item_type', $request->item_type);
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

        $items = $query->orderBy('name')->get();

        $summary = [
            'total_items' => $items->count(),
            'total_stock_value' => $items->sum(function ($item) {
                return $item->current_stock * $item->cost_price;
            }),
            'low_stock_items' => $items->filter(function ($item) {
                return $item->current_stock <= $item->min_stock_level;
            })->count(),
            'out_of_stock_items' => $items->filter(function ($item) {
                return $item->current_stock <= 0;
            })->count(),
            'overstocked_items' => $items->filter(function ($item) {
                return $item->max_stock_level && $item->current_stock > $item->max_stock_level;
            })->count(),
        ];

        return Inertia::render('Inventory/Reports/StockStatus', [
            'items' => $items,
            'summary' => $summary,
            'filters' => $request->only(['category_id', 'item_type', 'stock_status']),
        ]);
    }

    public function stockMovementReport(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'inventory_item_id' => 'nullable|exists:inventory_items,id',
        ]);

        $query = InventoryTransaction::with(['inventoryItem'])
            ->where('school_id', Auth::user()->school_id)
            ->whereBetween('transaction_date', [$request->start_date, $request->end_date]);

        if ($request->filled('inventory_item_id')) {
            $query->where('inventory_item_id', $request->inventory_item_id);
        }

        $transactions = $query->orderBy('transaction_date', 'desc')->get();

        // Group by item for summary
        $itemSummary = $transactions->groupBy('inventory_item_id')->map(function ($itemTransactions) {
            $item = $itemTransactions->first()->inventoryItem;
            $inQuantity = $itemTransactions->where('type', 'in')->sum('quantity');
            $outQuantity = $itemTransactions->where('type', 'out')->sum('quantity');
            
            return [
                'item' => $item,
                'in_quantity' => $inQuantity,
                'out_quantity' => $outQuantity,
                'net_movement' => $inQuantity - $outQuantity,
                'transactions_count' => $itemTransactions->count(),
            ];
        });

        return Inertia::render('Inventory/Reports/StockMovement', [
            'transactions' => $transactions,
            'itemSummary' => $itemSummary,
            'filters' => $request->only(['start_date', 'end_date', 'inventory_item_id']),
        ]);
    }

    public function slowMovingItemsReport(Request $request)
    {
        $request->validate([
            'days_threshold' => 'required|integer|min:30',
        ]);

        $thresholdDate = now()->subDays($request->days_threshold);

        // Get items that haven't been issued in the specified period
        $slowMovingItems = InventoryItem::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->whereDoesntHave('transactions', function ($query) use ($thresholdDate) {
                $query->where('type', 'out')
                      ->where('transaction_date', '>=', $thresholdDate);
            })
            ->with(['category', 'supplier'])
            ->orderBy('name')
            ->get();

        // Calculate days since last movement
        $slowMovingItems->each(function ($item) {
            $lastTransaction = $item->transactions()
                ->orderBy('transaction_date', 'desc')
                ->first();
            
            $item->days_since_last_movement = $lastTransaction 
                ? $lastTransaction->transaction_date->diffInDays(now())
                : null;
        });

        return Inertia::render('Inventory/Reports/SlowMovingItems', [
            'items' => $slowMovingItems,
            'threshold_days' => $request->days_threshold,
        ]);
    }

    public function assetRegisterReport(Request $request)
    {
        $query = InventoryItem::with(['category', 'supplier', 'assignments.assignedTo'])
            ->where('school_id', Auth::user()->school_id)
            ->where('item_type', InventoryItem::TYPE_ASSET);

        // Apply filters
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('status')) {
            switch ($request->status) {
                case 'in_store':
                    $query->whereDoesntHave('assignments', function ($q) {
                        $q->where('is_active', true);
                    });
                    break;
                case 'issued':
                    $query->whereHas('assignments', function ($q) {
                        $q->where('is_active', true);
                    });
                    break;
            }
        }

        $assets = $query->orderBy('name')->get();

        // Calculate depreciation (simplified straight-line method)
        $assets->each(function ($asset) {
            $asset->current_value = $asset->replacement_value;
            $asset->depreciation_rate = 0.1; // 10% per year (simplified)
            
            if ($asset->purchase_date) {
                $years = $asset->purchase_date->diffInYears(now());
                $depreciation = $asset->replacement_value * $asset->depreciation_rate * $years;
                $asset->current_value = max(0, $asset->replacement_value - $depreciation);
            }
        });

        $summary = [
            'total_assets' => $assets->count(),
            'total_replacement_value' => $assets->sum('replacement_value'),
            'total_current_value' => $assets->sum('current_value'),
            'assets_in_store' => $assets->where('status', 'In Store')->count(),
            'assets_issued' => $assets->where('status', 'Issued')->count(),
        ];

        return Inertia::render('Inventory/Reports/AssetRegister', [
            'assets' => $assets,
            'summary' => $summary,
            'filters' => $request->only(['category_id', 'status']),
        ]);
    }

    public function consumptionAnalysisReport(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'category_id' => 'nullable|exists:inventory_categories,id',
        ]);

        $query = InventoryTransaction::with(['inventoryItem.category'])
            ->where('school_id', Auth::user()->school_id)
            ->where('type', 'out')
            ->whereBetween('transaction_date', [$request->start_date, $request->end_date]);

        if ($request->filled('category_id')) {
            $query->whereHas('inventoryItem', function ($q) use ($request) {
                $q->where('category_id', $request->category_id);
            });
        }

        $transactions = $query->get();

        // Group by item and calculate consumption patterns
        $consumptionData = $transactions->groupBy('inventory_item_id')->map(function ($itemTransactions) {
            $item = $itemTransactions->first()->inventoryItem;
            $totalConsumed = $itemTransactions->sum('quantity');
            $days = Carbon::parse($request->start_date)->diffInDays(Carbon::parse($request->end_date)) + 1;
            $dailyAverage = $totalConsumed / $days;
            
            return [
                'item' => $item,
                'total_consumed' => $totalConsumed,
                'daily_average' => round($dailyAverage, 2),
                'monthly_projection' => round($dailyAverage * 30, 2),
                'transactions_count' => $itemTransactions->count(),
            ];
        })->sortByDesc('total_consumed');

        return Inertia::render('Inventory/Reports/ConsumptionAnalysis', [
            'consumptionData' => $consumptionData,
            'filters' => $request->only(['start_date', 'end_date', 'category_id']),
        ]);
    }

    public function purchaseOrderReport(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'status' => 'nullable|string',
        ]);

        $query = PurchaseOrder::with(['supplier', 'items.inventoryItem'])
            ->where('school_id', Auth::user()->school_id)
            ->whereBetween('po_date', [$request->start_date, $request->end_date]);

        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $purchaseOrders = $query->orderBy('po_date', 'desc')->get();

        $summary = [
            'total_orders' => $purchaseOrders->count(),
            'total_value' => $purchaseOrders->sum('total_amount'),
            'average_order_value' => $purchaseOrders->count() > 0 ? $purchaseOrders->sum('total_amount') / $purchaseOrders->count() : 0,
            'orders_by_status' => $purchaseOrders->groupBy('status')->map->count(),
        ];

        return Inertia::render('Inventory/Reports/PurchaseOrder', [
            'purchaseOrders' => $purchaseOrders,
            'summary' => $summary,
            'filters' => $request->only(['start_date', 'end_date', 'supplier_id', 'status']),
        ]);
    }

    public function maintenanceReport(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'maintenance_type' => 'nullable|string',
        ]);

        $query = AssetMaintenance::with(['inventoryItem', 'performedBy'])
            ->where('school_id', Auth::user()->school_id)
            ->whereBetween('maintenance_date', [$request->start_date, $request->end_date]);

        if ($request->filled('maintenance_type')) {
            $query->where('maintenance_type', $request->maintenance_type);
        }

        $maintenances = $query->orderBy('maintenance_date', 'desc')->get();

        $summary = [
            'total_maintenances' => $maintenances->count(),
            'total_cost' => $maintenances->sum('cost'),
            'average_cost' => $maintenances->count() > 0 ? $maintenances->sum('cost') / $maintenances->count() : 0,
            'maintenances_by_type' => $maintenances->groupBy('maintenance_type')->map->count(),
            'maintenances_by_status' => $maintenances->groupBy('status')->map->count(),
        ];

        return Inertia::render('Inventory/Reports/Maintenance', [
            'maintenances' => $maintenances,
            'summary' => $summary,
            'filters' => $request->only(['start_date', 'end_date', 'maintenance_type']),
        ]);
    }

    public function exportStockStatusReport(Request $request)
    {
        // Implementation for exporting stock status report to Excel/PDF
        // This would typically use Laravel Excel or similar package
        return response()->json(['message' => 'Export functionality to be implemented']);
    }

    public function exportAssetRegisterReport(Request $request)
    {
        // Implementation for exporting asset register report to Excel/PDF
        return response()->json(['message' => 'Export functionality to be implemented']);
    }
}



