<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\InventoryItem;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PurchaseOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchaseOrder::with(['supplier', 'requestedBy', 'approvedBy', 'items.inventoryItem'])
            ->where('school_id', Auth::user()->school_id);

        // Apply filters
        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->where('po_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('po_date', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('po_number', 'like', "%{$search}%")
                  ->orWhereHas('supplier', function ($supplierQuery) use ($search) {
                      $supplierQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $purchaseOrders = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $suppliers = Supplier::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Statistics
        $stats = [
            'total_orders' => PurchaseOrder::where('school_id', Auth::user()->school_id)->count(),
            'pending_orders' => PurchaseOrder::where('school_id', Auth::user()->school_id)
                ->whereIn('status', ['draft', 'pending_approval'])->count(),
            'approved_orders' => PurchaseOrder::where('school_id', Auth::user()->school_id)
                ->where('status', 'approved')->count(),
            'overdue_orders' => PurchaseOrder::where('school_id', Auth::user()->school_id)
                ->overdue()->count(),
            'total_value' => PurchaseOrder::where('school_id', Auth::user()->school_id)
                ->sum('total_amount'),
        ];

        return Inertia::render('Inventory/PurchaseOrders/Index', [
            'purchaseOrders' => $purchaseOrders,
            'suppliers' => $suppliers,
            'stats' => $stats,
            'statusOptions' => PurchaseOrder::STATUS_OPTIONS,
            'filters' => $request->only(['supplier_id', 'status', 'date_from', 'date_to', 'search']),
        ]);
    }

    public function create()
    {
        $suppliers = Supplier::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $inventoryItems = InventoryItem::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Inventory/PurchaseOrders/Create', [
            'suppliers' => $suppliers,
            'inventoryItems' => $inventoryItems,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'requested_by' => 'nullable|exists:users,id',
            'po_date' => 'required|date',
            'expected_delivery_date' => 'nullable|date|after:po_date',
            'notes' => 'nullable|string|max:1000',
            'terms_conditions' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.description' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($request) {
            $purchaseOrder = PurchaseOrder::create([
                'school_id' => Auth::user()->school_id,
                'supplier_id' => $request->supplier_id,
                'requested_by' => $request->requested_by,
                'po_date' => $request->po_date,
                'expected_delivery_date' => $request->expected_delivery_date,
                'notes' => $request->notes,
                'terms_conditions' => $request->terms_conditions,
                'status' => PurchaseOrder::STATUS_DRAFT,
            ]);

            // Create purchase order items
            foreach ($request->items as $itemData) {
                PurchaseOrderItem::create([
                    'purchase_order_id' => $purchaseOrder->id,
                    'inventory_item_id' => $itemData['inventory_item_id'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'description' => $itemData['description'] ?? null,
                ]);
            }

            // Calculate totals
            $purchaseOrder->calculateTotal();
        });

        return redirect()->route('inventory.purchase-orders.index')
            ->with('success', 'Purchase order created successfully.');
    }

    public function show(PurchaseOrder $purchaseOrder)
    {
        $this->authorize('view', $purchaseOrder);

        $purchaseOrder->load([
            'supplier',
            'requestedBy',
            'approvedBy',
            'createdBy',
            'items.inventoryItem',
            'goodsReceivedNotes.items'
        ]);

        return Inertia::render('Inventory/PurchaseOrders/Show', [
            'purchaseOrder' => $purchaseOrder,
        ]);
    }

    public function edit(PurchaseOrder $purchaseOrder)
    {
        $this->authorize('update', $purchaseOrder);

        if (!$purchaseOrder->canBeEdited()) {
            return redirect()->back()
                ->with('error', 'Cannot edit purchase order that is not in draft or pending approval status.');
        }

        $purchaseOrder->load(['items.inventoryItem']);

        $suppliers = Supplier::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $inventoryItems = InventoryItem::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Inventory/PurchaseOrders/Edit', [
            'purchaseOrder' => $purchaseOrder,
            'suppliers' => $suppliers,
            'inventoryItems' => $inventoryItems,
        ]);
    }

    public function update(Request $request, PurchaseOrder $purchaseOrder)
    {
        $this->authorize('update', $purchaseOrder);

        if (!$purchaseOrder->canBeEdited()) {
            return redirect()->back()
                ->with('error', 'Cannot edit purchase order that is not in draft or pending approval status.');
        }

        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'requested_by' => 'nullable|exists:users,id',
            'po_date' => 'required|date',
            'expected_delivery_date' => 'nullable|date|after:po_date',
            'notes' => 'nullable|string|max:1000',
            'terms_conditions' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.id' => 'nullable|exists:purchase_order_items,id',
            'items.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.description' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($request, $purchaseOrder) {
            $purchaseOrder->update([
                'supplier_id' => $request->supplier_id,
                'requested_by' => $request->requested_by,
                'po_date' => $request->po_date,
                'expected_delivery_date' => $request->expected_delivery_date,
                'notes' => $request->notes,
                'terms_conditions' => $request->terms_conditions,
            ]);

            // Update or create items
            $existingItemIds = [];
            foreach ($request->items as $itemData) {
                if (isset($itemData['id'])) {
                    // Update existing item
                    $item = PurchaseOrderItem::find($itemData['id']);
                    $item->update([
                        'inventory_item_id' => $itemData['inventory_item_id'],
                        'quantity' => $itemData['quantity'],
                        'unit_price' => $itemData['unit_price'],
                        'description' => $itemData['description'] ?? null,
                    ]);
                    $existingItemIds[] = $item->id;
                } else {
                    // Create new item
                    $newItem = PurchaseOrderItem::create([
                        'purchase_order_id' => $purchaseOrder->id,
                        'inventory_item_id' => $itemData['inventory_item_id'],
                        'quantity' => $itemData['quantity'],
                        'unit_price' => $itemData['unit_price'],
                        'description' => $itemData['description'] ?? null,
                    ]);
                    $existingItemIds[] = $newItem->id;
                }
            }

            // Delete removed items
            $purchaseOrder->items()->whereNotIn('id', $existingItemIds)->delete();

            // Recalculate totals
            $purchaseOrder->calculateTotal();
        });

        return redirect()->route('inventory.purchase-orders.index')
            ->with('success', 'Purchase order updated successfully.');
    }

    public function destroy(PurchaseOrder $purchaseOrder)
    {
        $this->authorize('delete', $purchaseOrder);

        if (!$purchaseOrder->canBeEdited()) {
            return redirect()->back()
                ->with('error', 'Cannot delete purchase order that is not in draft or pending approval status.');
        }

        $purchaseOrder->delete();

        return redirect()->route('inventory.purchase-orders.index')
            ->with('success', 'Purchase order deleted successfully.');
    }

    public function approve(PurchaseOrder $purchaseOrder)
    {
        $this->authorize('approve', $purchaseOrder);

        if ($purchaseOrder->status !== PurchaseOrder::STATUS_PENDING_APPROVAL) {
            return redirect()->back()
                ->with('error', 'Only pending approval purchase orders can be approved.');
        }

        $purchaseOrder->update([
            'status' => PurchaseOrder::STATUS_APPROVED,
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        return redirect()->back()
            ->with('success', 'Purchase order approved successfully.');
    }

    public function send(PurchaseOrder $purchaseOrder)
    {
        $this->authorize('update', $purchaseOrder);

        if ($purchaseOrder->status !== PurchaseOrder::STATUS_APPROVED) {
            return redirect()->back()
                ->with('error', 'Only approved purchase orders can be sent.');
        }

        $purchaseOrder->update([
            'status' => PurchaseOrder::STATUS_SENT,
        ]);

        return redirect()->back()
            ->with('success', 'Purchase order sent to supplier successfully.');
    }

    public function cancel(PurchaseOrder $purchaseOrder)
    {
        $this->authorize('update', $purchaseOrder);

        if (!$purchaseOrder->canBeCancelled()) {
            return redirect()->back()
                ->with('error', 'Cannot cancel this purchase order.');
        }

        $purchaseOrder->update([
            'status' => PurchaseOrder::STATUS_CANCELLED,
        ]);

        return redirect()->back()
            ->with('success', 'Purchase order cancelled successfully.');
    }

    public function getPendingOrders()
    {
        $orders = PurchaseOrder::with(['supplier', 'items.inventoryItem'])
            ->where('school_id', Auth::user()->school_id)
            ->pending()
            ->orderBy('expected_delivery_date')
            ->get();

        return response()->json($orders);
    }

    public function getOverdueOrders()
    {
        $orders = PurchaseOrder::with(['supplier', 'items.inventoryItem'])
            ->where('school_id', Auth::user()->school_id)
            ->overdue()
            ->orderBy('expected_delivery_date')
            ->get();

        return response()->json($orders);
    }

    public function print(PurchaseOrder $purchaseOrder)
    {
        $this->authorize('view', $purchaseOrder);

        $purchaseOrder->load([
            'supplier',
            'requestedBy',
            'approvedBy',
            'items.inventoryItem'
        ]);

        return Inertia::render('Inventory/PurchaseOrders/Print', [
            'purchaseOrder' => $purchaseOrder,
        ]);
    }
}



