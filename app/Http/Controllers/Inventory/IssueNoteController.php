<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\IssueNote;
use App\Models\IssueNoteItem;
use App\Models\InventoryItem;
use App\Models\User;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class IssueNoteController extends Controller
{
    public function index(Request $request)
    {
        $query = IssueNote::with(['issuedTo', 'issuedBy', 'items.inventoryItem'])
            ->where('school_id', Auth::user()->school_id);

        // Apply filters
        if ($request->filled('issued_to_type')) {
            $query->where('issued_to_type', $request->issued_to_type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->where('issue_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('issue_date', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('issue_number', 'like', "%{$search}%")
                  ->orWhere('purpose', 'like', "%{$search}%");
            });
        }

        $issueNotes = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Statistics
        $stats = [
            'total_issues' => IssueNote::where('school_id', Auth::user()->school_id)->count(),
            'pending_issues' => IssueNote::where('school_id', Auth::user()->school_id)
                ->where('status', 'pending')->count(),
            'issued_items' => IssueNote::where('school_id', Auth::user()->school_id)
                ->where('status', 'issued')->count(),
            'returned_items' => IssueNote::where('school_id', Auth::user()->school_id)
                ->where('status', 'returned')->count(),
        ];

        return Inertia::render('Inventory/IssueNotes/Index', [
            'issueNotes' => $issueNotes,
            'stats' => $stats,
            'statusOptions' => IssueNote::STATUS_OPTIONS,
            'filters' => $request->only(['issued_to_type', 'status', 'date_from', 'date_to', 'search']),
        ]);
    }

    public function create()
    {
        $inventoryItems = InventoryItem::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $teachers = User::where('school_id', Auth::user()->school_id)
            ->where('role', 'teacher')
            ->orderBy('name')
            ->get();

        $classes = SchoolClass::where('school_id', Auth::user()->school_id)
            ->orderBy('name')
            ->get();

        return Inertia::render('Inventory/IssueNotes/Create', [
            'inventoryItems' => $inventoryItems,
            'teachers' => $teachers,
            'classes' => $classes,
            'conditionOptions' => IssueNoteItem::CONDITION_OPTIONS,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'issued_to_id' => 'required|integer',
            'issued_to_type' => 'required|string',
            'issued_by' => 'nullable|exists:users,id',
            'issue_date' => 'required|date',
            'purpose' => 'required|string|max:500',
            'notes' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'items.*.quantity_issued' => 'required|integer|min:1',
            'items.*.condition' => 'required|in:' . implode(',', array_keys(IssueNoteItem::CONDITION_OPTIONS)),
            'items.*.notes' => 'nullable|string|max:500',
        ]);

        // Validate issued_to based on type
        if ($request->issued_to_type === 'App\\Models\\User') {
            $request->validate(['issued_to_id' => 'exists:users,id']);
        } elseif ($request->issued_to_type === 'App\\Models\\SchoolClass') {
            $request->validate(['issued_to_id' => 'exists:school_classes,id']);
        }

        DB::transaction(function () use ($request) {
            $issueNote = IssueNote::create([
                'school_id' => Auth::user()->school_id,
                'issued_to_id' => $request->issued_to_id,
                'issued_to_type' => $request->issued_to_type,
                'issued_by' => $request->issued_by,
                'issue_date' => $request->issue_date,
                'purpose' => $request->purpose,
                'notes' => $request->notes,
                'status' => IssueNote::STATUS_PENDING,
            ]);

            // Create issue note items
            foreach ($request->items as $itemData) {
                $inventoryItem = InventoryItem::find($itemData['inventory_item_id']);
                
                IssueNoteItem::create([
                    'issue_note_id' => $issueNote->id,
                    'inventory_item_id' => $itemData['inventory_item_id'],
                    'quantity_issued' => $itemData['quantity_issued'],
                    'unit_price' => $inventoryItem->cost_price,
                    'condition' => $itemData['condition'],
                    'notes' => $itemData['notes'] ?? null,
                ]);
            }
        });

        return redirect()->route('inventory.issue-notes.index')
            ->with('success', 'Issue note created successfully.');
    }

    public function show(IssueNote $issueNote)
    {
        $this->authorize('view', $issueNote);

        $issueNote->load([
            'issuedTo',
            'issuedBy',
            'createdBy',
            'items.inventoryItem'
        ]);

        return Inertia::render('Inventory/IssueNotes/Show', [
            'issueNote' => $issueNote,
        ]);
    }

    public function edit(IssueNote $issueNote)
    {
        $this->authorize('update', $issueNote);

        if (!$issueNote->canBeEdited()) {
            return redirect()->back()
                ->with('error', 'Cannot edit issue note that is not in pending status.');
        }

        $issueNote->load(['items.inventoryItem']);

        $inventoryItems = InventoryItem::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $teachers = User::where('school_id', Auth::user()->school_id)
            ->where('role', 'teacher')
            ->orderBy('name')
            ->get();

        $classes = SchoolClass::where('school_id', Auth::user()->school_id)
            ->orderBy('name')
            ->get();

        return Inertia::render('Inventory/IssueNotes/Edit', [
            'issueNote' => $issueNote,
            'inventoryItems' => $inventoryItems,
            'teachers' => $teachers,
            'classes' => $classes,
            'conditionOptions' => IssueNoteItem::CONDITION_OPTIONS,
        ]);
    }

    public function update(Request $request, IssueNote $issueNote)
    {
        $this->authorize('update', $issueNote);

        if (!$issueNote->canBeEdited()) {
            return redirect()->back()
                ->with('error', 'Cannot edit issue note that is not in pending status.');
        }

        $request->validate([
            'issued_to_id' => 'required|integer',
            'issued_to_type' => 'required|string',
            'issued_by' => 'nullable|exists:users,id',
            'issue_date' => 'required|date',
            'purpose' => 'required|string|max:500',
            'notes' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.id' => 'nullable|exists:issue_note_items,id',
            'items.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'items.*.quantity_issued' => 'required|integer|min:1',
            'items.*.condition' => 'required|in:' . implode(',', array_keys(IssueNoteItem::CONDITION_OPTIONS)),
            'items.*.notes' => 'nullable|string|max:500',
        ]);

        // Validate issued_to based on type
        if ($request->issued_to_type === 'App\\Models\\User') {
            $request->validate(['issued_to_id' => 'exists:users,id']);
        } elseif ($request->issued_to_type === 'App\\Models\\SchoolClass') {
            $request->validate(['issued_to_id' => 'exists:school_classes,id']);
        }

        DB::transaction(function () use ($request, $issueNote) {
            $issueNote->update([
                'issued_to_id' => $request->issued_to_id,
                'issued_to_type' => $request->issued_to_type,
                'issued_by' => $request->issued_by,
                'issue_date' => $request->issue_date,
                'purpose' => $request->purpose,
                'notes' => $request->notes,
            ]);

            // Update or create items
            $existingItemIds = [];
            foreach ($request->items as $itemData) {
                if (isset($itemData['id'])) {
                    // Update existing item
                    $item = IssueNoteItem::find($itemData['id']);
                    $item->update([
                        'inventory_item_id' => $itemData['inventory_item_id'],
                        'quantity_issued' => $itemData['quantity_issued'],
                        'condition' => $itemData['condition'],
                        'notes' => $itemData['notes'] ?? null,
                    ]);
                    $existingItemIds[] = $item->id;
                } else {
                    // Create new item
                    $inventoryItem = InventoryItem::find($itemData['inventory_item_id']);
                    $newItem = IssueNoteItem::create([
                        'issue_note_id' => $issueNote->id,
                        'inventory_item_id' => $itemData['inventory_item_id'],
                        'quantity_issued' => $itemData['quantity_issued'],
                        'unit_price' => $inventoryItem->cost_price,
                        'condition' => $itemData['condition'],
                        'notes' => $itemData['notes'] ?? null,
                    ]);
                    $existingItemIds[] = $newItem->id;
                }
            }

            // Delete removed items
            $issueNote->items()->whereNotIn('id', $existingItemIds)->delete();
        });

        return redirect()->route('inventory.issue-notes.index')
            ->with('success', 'Issue note updated successfully.');
    }

    public function issue(IssueNote $issueNote)
    {
        $this->authorize('update', $issueNote);

        if ($issueNote->status !== IssueNote::STATUS_PENDING) {
            return redirect()->back()
                ->with('error', 'Only pending issue notes can be issued.');
        }

        // Check stock availability for consumable items
        foreach ($issueNote->items as $item) {
            $inventoryItem = $item->inventoryItem;
            if ($inventoryItem->item_type === InventoryItem::TYPE_CONSUMABLE) {
                if ($inventoryItem->current_stock < $item->quantity_issued) {
                    return redirect()->back()
                        ->with('error', "Insufficient stock for {$inventoryItem->name}. Available: {$inventoryItem->current_stock}, Required: {$item->quantity_issued}");
                }
            }
        }

        DB::transaction(function () use ($issueNote) {
            // Issue the items
            $issueNote->issue();
        });

        return redirect()->back()
            ->with('success', 'Items issued successfully.');
    }

    public function return(IssueNote $issueNote)
    {
        $this->authorize('update', $issueNote);

        if ($issueNote->status !== IssueNote::STATUS_ISSUED) {
            return redirect()->back()
                ->with('error', 'Only issued items can be returned.');
        }

        $issueNote->update(['status' => IssueNote::STATUS_RETURNED]);

        return redirect()->back()
            ->with('success', 'Items marked as returned successfully.');
    }

    public function getAvailableStock(InventoryItem $inventoryItem)
    {
        $this->authorize('view', $inventoryItem);

        return response()->json([
            'current_stock' => $inventoryItem->current_stock,
            'available_for_issue' => $inventoryItem->item_type === InventoryItem::TYPE_CONSUMABLE 
                ? $inventoryItem->current_stock 
                : 1, // For assets, only 1 can be issued at a time
        ]);
    }

    public function print(IssueNote $issueNote)
    {
        $this->authorize('view', $issueNote);

        $issueNote->load([
            'issuedTo',
            'issuedBy',
            'items.inventoryItem'
        ]);

        return Inertia::render('Inventory/IssueNotes/Print', [
            'issueNote' => $issueNote,
        ]);
    }
}



