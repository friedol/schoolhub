<?php

namespace App\Http\Controllers\Hostel;

use App\Http\Controllers\Controller;
use App\Models\HostelInventory;
use App\Models\Hostel;
use App\Models\InventoryItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class HostelInventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = HostelInventory::with(['hostel', 'inventoryItem', 'room'])
            ->whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            });

        // Apply filters
        if ($request->filled('hostel_id')) {
            $query->where('hostel_id', $request->hostel_id);
        }

        if ($request->filled('room_id')) {
            $query->where('room_id', $request->room_id);
        }

        if ($request->filled('condition')) {
            $query->where('condition', $request->condition);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('inventoryItem', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $inventory = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $hostels = Hostel::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Statistics
        $stats = [
            'total_items' => HostelInventory::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->sum('quantity'),
            'total_value' => HostelInventory::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->with('inventoryItem')->get()->sum(function ($item) {
                return $item->quantity * ($item->inventoryItem->unit_cost ?? 0);
            }),
            'items_by_condition' => HostelInventory::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })->selectRaw('`condition`, SUM(quantity) as total')
                ->groupBy('condition')
                ->pluck('total', 'condition'),
        ];

        return Inertia::render('Hostel/Inventory/Index', [
            'inventory' => $inventory,
            'hostels' => $hostels,
            'stats' => $stats,
            'conditionOptions' => HostelInventory::CONDITION_OPTIONS,
            'filters' => $request->only(['hostel_id', 'room_id', 'condition', 'search']),
        ]);
    }

    public function create()
    {
        $hostels = Hostel::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $inventoryItems = InventoryItem::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Hostel/Inventory/Create', [
            'hostels' => $hostels,
            'inventoryItems' => $inventoryItems,
            'conditionOptions' => HostelInventory::CONDITION_OPTIONS,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'hostel_id' => 'required|exists:hostels,id',
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'room_id' => 'nullable|exists:hostel_rooms,id',
            'quantity' => 'required|integer|min:1',
            'condition' => 'required|in:' . implode(',', array_keys(HostelInventory::CONDITION_OPTIONS)),
            'notes' => 'nullable|string|max:500',
        ]);

        // Check if item already exists in the same location
        $item = InventoryItem::findOrFail($request->inventory_item_id);
        $existingItem = HostelInventory::where('hostel_id', $request->hostel_id)
            ->where('item_code', $item->item_code)
            ->where('room_id', $request->room_id)
            ->where('condition', $request->condition)
            ->first();

        if ($existingItem) {
            // Update quantity instead of creating new record
            $existingItem->increment('quantity', $request->quantity);
            $existingItem->update(['notes' => $request->notes]);
        } else {
            // Create new inventory record
            HostelInventory::create([
                'hostel_id' => $request->hostel_id,
                'room_id' => $request->room_id,
                'quantity' => $request->quantity,
                'condition' => $request->condition,
                'notes' => $request->notes,
                'item_name' => $item->name,
                'item_type' => $this->mapItemType($item),
                'item_code' => $item->item_code,
                'purchase_cost' => $item->cost_price ?? 0,
            ]);
        }

        return redirect()->route('hostel.inventory.index')
            ->with('success', 'Inventory item added successfully.');
    }

    public function show(HostelInventory $hostelInventory)
    {
        $this->authorize('view', $hostelInventory);

        $hostelInventory->load(['hostel', 'inventoryItem', 'room']);

        return Inertia::render('Hostel/Inventory/Show', [
            'hostelInventory' => $hostelInventory,
        ]);
    }

    public function edit(HostelInventory $hostelInventory)
    {
        $this->authorize('update', $hostelInventory);

        $hostelInventory->load(['hostel', 'inventoryItem', 'room']);

        $hostels = Hostel::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $inventoryItems = InventoryItem::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Hostel/Inventory/Edit', [
            'hostelInventory' => $hostelInventory,
            'hostels' => $hostels,
            'inventoryItems' => $inventoryItems,
            'conditionOptions' => HostelInventory::CONDITION_OPTIONS,
        ]);
    }

    public function update(Request $request, HostelInventory $hostelInventory)
    {
        $this->authorize('update', $hostelInventory);

        $request->validate([
            'hostel_id' => 'required|exists:hostels,id',
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'room_id' => 'nullable|exists:hostel_rooms,id',
            'quantity' => 'required|integer|min:0',
            'condition' => 'required|in:' . implode(',', array_keys(HostelInventory::CONDITION_OPTIONS)),
            'notes' => 'nullable|string|max:500',
        ]);

        $item = InventoryItem::findOrFail($request->inventory_item_id);

        $hostelInventory->update([
            'hostel_id' => $request->hostel_id,
            'room_id' => $request->room_id,
            'quantity' => $request->quantity,
            'condition' => $request->condition,
            'notes' => $request->notes,
            'item_name' => $item->name,
            'item_type' => $this->mapItemType($item),
            'item_code' => $item->item_code,
            'purchase_cost' => $item->cost_price ?? 0,
        ]);

        return redirect()->route('hostel.inventory.index')
            ->with('success', 'Inventory item updated successfully.');
    }

    public function destroy(HostelInventory $hostelInventory)
    {
        $this->authorize('delete', $hostelInventory);

        $hostelInventory->delete();

        return redirect()->route('hostel.inventory.index')
            ->with('success', 'Inventory item removed successfully.');
    }

    public function adjustQuantity(Request $request, HostelInventory $hostelInventory)
    {
        $this->authorize('update', $hostelInventory);

        $request->validate([
            'adjustment_type' => 'required|in:add,remove',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string|max:255',
            'notes' => 'nullable|string|max:500',
        ]);

        $adjustmentQuantity = $request->adjustment_type === 'add' 
            ? $request->quantity 
            : -$request->quantity;

        $newQuantity = $hostelInventory->quantity + $adjustmentQuantity;

        if ($newQuantity < 0) {
            return redirect()->back()
                ->with('error', 'Cannot remove more items than available.');
        }

        $hostelInventory->update([
            'quantity' => $newQuantity,
            'notes' => $request->notes,
        ]);

        return redirect()->back()
            ->with('success', 'Quantity adjusted successfully.');
    }

    public function transfer(Request $request, HostelInventory $hostelInventory)
    {
        $this->authorize('update', $hostelInventory);

        $request->validate([
            'to_hostel_id' => 'required|exists:hostels,id',
            'to_room_id' => 'nullable|exists:hostel_rooms,id',
            'quantity' => 'required|integer|min:1|max:' . $hostelInventory->quantity,
            'reason' => 'required|string|max:255',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($request->quantity > $hostelInventory->quantity) {
            return redirect()->back()
                ->with('error', 'Cannot transfer more items than available.');
        }

        DB::transaction(function () use ($request, $hostelInventory) {
            // Reduce quantity from source
            $hostelInventory->decrement('quantity', $request->quantity);

            // Add to destination
            $existingItem = HostelInventory::where('hostel_id', $request->to_hostel_id)
                ->where('item_code', $hostelInventory->item_code)
                ->where('room_id', $request->to_room_id)
                ->where('condition', $hostelInventory->condition)
                ->first();

            if ($existingItem) {
                $existingItem->increment('quantity', $request->quantity);
            } else {
                HostelInventory::create([
                    'hostel_id' => $request->to_hostel_id,
                    'room_id' => $request->to_room_id,
                    'quantity' => $request->quantity,
                    'condition' => $hostelInventory->condition,
                    'notes' => $request->notes,
                    'item_name' => $hostelInventory->item_name,
                    'item_type' => $hostelInventory->item_type,
                    'item_code' => $hostelInventory->item_code,
                    'purchase_cost' => $hostelInventory->purchase_cost,
                ]);
            }
        });

        return redirect()->back()
            ->with('success', 'Items transferred successfully.');
    }

    public function getHostelInventory($hostelId)
    {
        $inventory = HostelInventory::where('hostel_id', $hostelId)
            ->with(['inventoryItem', 'room'])
            ->orderBy('item_code')
            ->get();

        return response()->json($inventory);
    }

    public function getRoomInventory($roomId)
    {
        $inventory = HostelInventory::where('room_id', $roomId)
            ->with(['inventoryItem'])
            ->orderBy('item_code')
            ->get();

        return response()->json($inventory);
    }

    public function getInventorySummary()
    {
        $summary = HostelInventory::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })
            ->with(['inventoryItem'])
            ->get()
            ->groupBy('inventory_item_id')
            ->map(function ($items) {
                $item = $items->first()->inventoryItem;
                return [
                    'item' => $item,
                    'total_quantity' => $items->sum('quantity'),
                    'total_value' => $items->sum(function ($i) use ($item) {
                        return $i->quantity * ($item->unit_cost ?? 0);
                    }),
                    'conditions' => $items->groupBy('condition')->map->sum('quantity'),
                ];
            });

        return response()->json($summary);
    }

    public function getLowStockItems()
    {
        $lowStockItems = HostelInventory::whereHas('hostel', function ($q) {
                $q->where('school_id', Auth::user()->school_id);
            })
            ->with(['inventoryItem', 'hostel', 'room'])
            ->get()
            ->filter(function ($item) {
                return $item->quantity <= ($item->inventoryItem->minimum_stock ?? 0);
            });

        return response()->json($lowStockItems);
    }

    /**
     * Helper to map general inventory item categories/names to hostel inventory type enum values
     */
    private function mapItemType($item): string
    {
        $categoryName = strtolower($item->category?->name ?? '');
        $itemName = strtolower($item->name ?? '');
        $haystack = $categoryName . ' ' . $itemName;

        if (str_contains($haystack, 'bed') || str_contains($haystack, 'linen') || str_contains($haystack, 'sheet') || str_contains($haystack, 'pillow') || str_contains($haystack, 'blanket')) {
            return 'bedding';
        }
        if (str_contains($haystack, 'chair') || str_contains($haystack, 'table') || str_contains($haystack, 'desk') || str_contains($haystack, 'furniture') || str_contains($haystack, 'cupboard') || str_contains($haystack, 'cabinet') || str_contains($haystack, 'wardrobe')) {
            return 'furniture';
        }
        if (str_contains($haystack, 'computer') || str_contains($haystack, 'screen') || str_contains($haystack, 'electronic') || str_contains($haystack, 'bulb') || str_contains($haystack, 'light') || str_contains($haystack, 'fan') || str_contains($haystack, 'tv') || str_contains($haystack, 'ac') || str_contains($haystack, 'projector')) {
            return 'electronics';
        }
        if (str_contains($haystack, 'cook') || str_contains($haystack, 'fridge') || str_contains($haystack, 'microwave') || str_contains($haystack, 'kettle') || str_contains($haystack, 'appliance') || str_contains($haystack, 'stove') || str_contains($haystack, 'oven')) {
            return 'appliances';
        }
        if (str_contains($haystack, 'extinguisher') || str_contains($haystack, 'fire') || str_contains($haystack, 'safety') || str_contains($haystack, 'lock') || str_contains($haystack, 'smoke') || str_contains($haystack, 'first aid')) {
            return 'safety';
        }

        return 'furniture'; // Default fallback
    }
}



