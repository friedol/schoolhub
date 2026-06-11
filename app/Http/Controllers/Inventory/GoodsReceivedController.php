<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\GoodsReceivedNote;
use App\Models\GoodsReceivedItem;
use App\Models\PurchaseOrder;
use App\Models\InventoryItem;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class GoodsReceivedController extends Controller
{
    public function index(Request $request)
    {
        $query = GoodsReceivedNote::with(['supplier', 'purchaseOrder', 'receivedBy', 'items.inventoryItem'])
            ->where('school_id', Auth::user()->school_id);

        // Apply filters
        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->where('received_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('received_date', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('grn_number', 'like', "%{$search}%")
                  ->orWhere('delivery_note_number', 'like', "%{$search}%")
                  ->orWhereHas('supplier', function ($supplierQuery) use ($search) {
                      $supplierQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $grns = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $suppliers = Supplier::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Statistics
        $stats = [
            'total_grns' => GoodsReceivedNote::where('school_id', Auth::user()->school_id)->count(),
            'pending_grns' => GoodsReceivedNote::where('school_id', Auth::user()->school_id)
                ->where('status', 'pending')->count(),
            'accepted_grns' => GoodsReceivedNote::where('school_id', Auth::user()->school_id)
                ->where('status', 'accepted')->count(),
            'rejected_grns' => GoodsReceivedNote::where('school_id', Auth::user()->school_id)
                ->where('status', 'rejected')->count(),
        ];

        return Inertia::render('Inventory/GoodsReceived/Index', [
            'grns' => $grns,
            'suppliers' => $suppliers,
            'stats' => $stats,
            'statusOptions' => GoodsReceivedNote::STATUS_OPTIONS,
            'filters' => $request->only(['supplier_id', 'status', 'date_from', 'date_to', 'search']),
        ]);
    }

    public function create(Request $request)
    {
        $purchaseOrder = null;
        if ($request->filled('purchase_order_id')) {
            $purchaseOrder = PurchaseOrder::with(['supplier', 'items.inventoryItem'])
                ->where('school_id', Auth::user()->school_id)
                ->findOrFail($request->purchase_order_id);
        }

        $suppliers = Supplier::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $purchaseOrders = PurchaseOrder::with(['supplier'])
            ->where('school_id', Auth::user()->school_id)
            ->whereIn('status', ['approved', 'sent', 'acknowledged'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Inventory/GoodsReceived/Create', [
            'purchaseOrder' => $purchaseOrder,
            'suppliers' => $suppliers,
            'purchaseOrders' => $purchaseOrders,
            'conditionOptions' => GoodsReceivedItem::CONDITION_OPTIONS,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'purchase_order_id' => 'nullable|exists:purchase_orders,id',
            'supplier_id' => 'required|exists:suppliers,id',
            'received_date' => 'required|date',
            'received_by' => 'nullable|exists:users,id',
            'delivery_note_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'items.*.quantity_ordered' => 'required|integer|min:0',
            'items.*.quantity_received' => 'required|integer|min:0',
            'items.*.quantity_accepted' => 'required|integer|min:0',
            'items.*.quantity_rejected' => 'required|integer|min:0',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.condition' => 'required|in:' . implode(',', array_keys(GoodsReceivedItem::CONDITION_OPTIONS)),
            'items.*.notes' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($request) {
            $grn = GoodsReceivedNote::create([
                'school_id' => Auth::user()->school_id,
                'purchase_order_id' => $request->purchase_order_id,
                'supplier_id' => $request->supplier_id,
                'received_date' => $request->received_date,
                'received_by' => $request->received_by,
                'delivery_note_number' => $request->delivery_note_number,
                'notes' => $request->notes,
                'status' => GoodsReceivedNote::STATUS_PENDING,
            ]);

            // Create GRN items
            foreach ($request->items as $itemData) {
                GoodsReceivedItem::create([
                    'grn_id' => $grn->id,
                    'inventory_item_id' => $itemData['inventory_item_id'],
                    'quantity_ordered' => $itemData['quantity_ordered'],
                    'quantity_received' => $itemData['quantity_received'],
                    'quantity_accepted' => $itemData['quantity_accepted'],
                    'quantity_rejected' => $itemData['quantity_rejected'],
                    'unit_price' => $itemData['unit_price'],
                    'condition' => $itemData['condition'],
                    'notes' => $itemData['notes'] ?? null,
                ]);
            }
        });

        return redirect()->route('inventory.goods-received.index')
            ->with('success', 'Goods Received Note created successfully.');
    }

    public function show(GoodsReceivedNote $goodsReceivedNote)
    {
        $this->authorize('view', $goodsReceivedNote);

        $goodsReceivedNote->load([
            'supplier',
            'purchaseOrder',
            'receivedBy',
            'createdBy',
            'items.inventoryItem'
        ]);

        return Inertia::render('Inventory/GoodsReceived/Show', [
            'grn' => $goodsReceivedNote,
        ]);
    }

    public function edit(GoodsReceivedNote $goodsReceivedNote)
    {
        $this->authorize('update', $goodsReceivedNote);

        if (!$goodsReceivedNote->canBeEdited()) {
            return redirect()->back()
                ->with('error', 'Cannot edit GRN that is not in pending status.');
        }

        $goodsReceivedNote->load(['items.inventoryItem']);

        $suppliers = Supplier::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $purchaseOrders = PurchaseOrder::with(['supplier'])
            ->where('school_id', Auth::user()->school_id)
            ->whereIn('status', ['approved', 'sent', 'acknowledged'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Inventory/GoodsReceived/Edit', [
            'grn' => $goodsReceivedNote,
            'suppliers' => $suppliers,
            'purchaseOrders' => $purchaseOrders,
            'conditionOptions' => GoodsReceivedItem::CONDITION_OPTIONS,
        ]);
    }

    public function update(Request $request, GoodsReceivedNote $goodsReceivedNote)
    {
        $this->authorize('update', $goodsReceivedNote);

        if (!$goodsReceivedNote->canBeEdited()) {
            return redirect()->back()
                ->with('error', 'Cannot edit GRN that is not in pending status.');
        }

        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'received_date' => 'required|date',
            'received_by' => 'nullable|exists:users,id',
            'delivery_note_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.id' => 'nullable|exists:goods_received_items,id',
            'items.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'items.*.quantity_ordered' => 'required|integer|min:0',
            'items.*.quantity_received' => 'required|integer|min:0',
            'items.*.quantity_accepted' => 'required|integer|min:0',
            'items.*.quantity_rejected' => 'required|integer|min:0',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.condition' => 'required|in:' . implode(',', array_keys(GoodsReceivedItem::CONDITION_OPTIONS)),
            'items.*.notes' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($request, $goodsReceivedNote) {
            $goodsReceivedNote->update([
                'supplier_id' => $request->supplier_id,
                'received_date' => $request->received_date,
                'received_by' => $request->received_by,
                'delivery_note_number' => $request->delivery_note_number,
                'notes' => $request->notes,
            ]);

            // Update or create items
            $existingItemIds = [];
            foreach ($request->items as $itemData) {
                if (isset($itemData['id'])) {
                    // Update existing item
                    $item = GoodsReceivedItem::find($itemData['id']);
                    $item->update([
                        'inventory_item_id' => $itemData['inventory_item_id'],
                        'quantity_ordered' => $itemData['quantity_ordered'],
                        'quantity_received' => $itemData['quantity_received'],
                        'quantity_accepted' => $itemData['quantity_accepted'],
                        'quantity_rejected' => $itemData['quantity_rejected'],
                        'unit_price' => $itemData['unit_price'],
                        'condition' => $itemData['condition'],
                        'notes' => $itemData['notes'] ?? null,
                    ]);
                    $existingItemIds[] = $item->id;
                } else {
                    // Create new item
                    $newItem = GoodsReceivedItem::create([
                        'grn_id' => $goodsReceivedNote->id,
                        'inventory_item_id' => $itemData['inventory_item_id'],
                        'quantity_ordered' => $itemData['quantity_ordered'],
                        'quantity_received' => $itemData['quantity_received'],
                        'quantity_accepted' => $itemData['quantity_accepted'],
                        'quantity_rejected' => $itemData['quantity_rejected'],
                        'unit_price' => $itemData['unit_price'],
                        'condition' => $itemData['condition'],
                        'notes' => $itemData['notes'] ?? null,
                    ]);
                    $existingItemIds[] = $newItem->id;
                }
            }

            // Delete removed items
            $goodsReceivedNote->items()->whereNotIn('id', $existingItemIds)->delete();
        });

        return redirect()->route('inventory.goods-received.index')
            ->with('success', 'Goods Received Note updated successfully.');
    }

    public function accept(GoodsReceivedNote $goodsReceivedNote)
    {
        $this->authorize('update', $goodsReceivedNote);

        if ($goodsReceivedNote->status !== GoodsReceivedNote::STATUS_PENDING) {
            return redirect()->back()
                ->with('error', 'Only pending GRNs can be accepted.');
        }

        DB::transaction(function () use ($goodsReceivedNote) {
            // Accept the GRN
            $goodsReceivedNote->accept();

            // Update purchase order status if applicable
            if ($goodsReceivedNote->purchase_order_id) {
                $purchaseOrder = $goodsReceivedNote->purchaseOrder;
                $deliveryProgress = $purchaseOrder->delivery_progress;
                
                if ($deliveryProgress >= 100) {
                    $purchaseOrder->update(['status' => PurchaseOrder::STATUS_FULLY_DELIVERED]);
                } else {
                    $purchaseOrder->update(['status' => PurchaseOrder::STATUS_PARTIALLY_DELIVERED]);
                }
            }
        });

        return redirect()->back()
            ->with('success', 'GRN accepted and stock updated successfully.');
    }

    public function reject(GoodsReceivedNote $goodsReceivedNote)
    {
        $this->authorize('update', $goodsReceivedNote);

        if ($goodsReceivedNote->status !== GoodsReceivedNote::STATUS_PENDING) {
            return redirect()->back()
                ->with('error', 'Only pending GRNs can be rejected.');
        }

        $goodsReceivedNote->reject();

        return redirect()->back()
            ->with('success', 'GRN rejected successfully.');
    }

    public function getPurchaseOrderItems(PurchaseOrder $purchaseOrder)
    {
        $this->authorize('view', $purchaseOrder);

        $items = $purchaseOrder->items()->with('inventoryItem')->get();

        return response()->json($items);
    }

    public function print(GoodsReceivedNote $goodsReceivedNote)
    {
        $this->authorize('view', $goodsReceivedNote);

        $goodsReceivedNote->load([
            'supplier',
            'purchaseOrder',
            'receivedBy',
            'items.inventoryItem'
        ]);

        return Inertia::render('Inventory/GoodsReceived/Print', [
            'grn' => $goodsReceivedNote,
        ]);
    }
}



