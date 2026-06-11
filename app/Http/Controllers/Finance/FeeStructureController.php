<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\FeeStructure;
use App\Models\FeeItem;
use App\Models\SchoolClass;
use App\Models\AcademicTerm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FeeStructureController extends Controller
{
    public function index(Request $request)
    {
        $query = FeeStructure::with(['schoolClass', 'feeItem'])
            ->where('school_id', Auth::user()->school_id);

        // Apply filters
        if ($request->filled('academic_term_id')) {
            $term = AcademicTerm::find($request->academic_term_id);
            if ($term) {
                $query->where('academic_year', $term->academic_year)
                      ->where('term', $term->term);
            }
        }

        if ($request->filled('school_class_id')) {
            $query->where('school_class_id', $request->school_class_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('schoolClass', function ($classQuery) use ($search) {
                $classQuery->where('name', 'like', "%{$search}%");
            })->orWhereHas('feeItem', function ($itemQuery) use ($search) {
                $itemQuery->where('name', 'like', "%{$search}%");
            });
        }

        $feeStructures = $query->paginate(15)->withQueryString();

        $classes = SchoolClass::where('school_id', Auth::user()->school_id)
            ->orderBy('name')
            ->get();

        $feeItems = FeeItem::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Finance/FeeStructure/Index', [
            'feeStructures' => $feeStructures,
            'classes' => $classes,
            'feeItems' => $feeItems,
            'filters' => $request->only(['academic_term_id', 'school_class_id', 'search']),
        ]);
    }

    public function create()
    {
        $academicTerms = AcademicTerm::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('start_date', 'desc')
            ->get();

        $schoolClasses = SchoolClass::where('school_id', Auth::user()->school_id)
            ->orderBy('name')
            ->get();

        $feeItems = FeeItem::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Finance/FeeStructure/Create', [
            'academicTerms' => $academicTerms,
            'schoolClasses' => $schoolClasses,
            'feeItems' => $feeItems,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'academic_term_id' => 'required|exists:academic_terms,id',
            'school_class_id' => 'required|exists:school_classes,id',
            'fee_item_id' => 'required|exists:fee_items,id',
            'amount' => 'required|numeric|min:0',
            'day_student_amount' => 'nullable|numeric|min:0',
            'boarding_student_amount' => 'nullable|numeric|min:0',
            'effective_date' => 'required|date',
            'expiry_date' => 'nullable|date|after:effective_date',
        ]);

        $academicTerm = AcademicTerm::findOrFail($request->academic_term_id);

        FeeStructure::create([
            'school_id' => Auth::user()->school_id,
            'fee_item_id' => $request->fee_item_id,
            'school_class_id' => $request->school_class_id,
            'academic_year' => $academicTerm->academic_year,
            'term' => $academicTerm->term,
            'amount' => $request->amount,
            'day_student_amount' => $request->day_student_amount,
            'boarding_student_amount' => $request->boarding_student_amount,
            'effective_date' => $request->effective_date,
            'expiry_date' => $request->expiry_date,
            'is_active' => true,
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('finance.fee-structures.index')
            ->with('success', 'Fee structure created successfully.');
    }

    public function show(FeeStructure $feeStructure)
    {
        $this->authorize('view', $feeStructure);

        $feeStructure->load(['schoolClass', 'feeItem']);

        return Inertia::render('Finance/FeeStructure/Show', [
            'feeStructure' => $feeStructure,
        ]);
    }

    public function edit(FeeStructure $feeStructure)
    {
        $this->authorize('update', $feeStructure);

        $feeStructure->load(['schoolClass', 'feeItem']);

        $academicTerms = AcademicTerm::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('start_date', 'desc')
            ->get();

        $schoolClasses = SchoolClass::where('school_id', Auth::user()->school_id)
            ->orderBy('name')
            ->get();

        $feeItems = FeeItem::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Finance/FeeStructure/Edit', [
            'feeStructure' => $feeStructure,
            'academicTerms' => $academicTerms,
            'schoolClasses' => $schoolClasses,
            'feeItems' => $feeItems,
        ]);
    }

    public function update(Request $request, FeeStructure $feeStructure)
    {
        $this->authorize('update', $feeStructure);

        $request->validate([
            'academic_term_id' => 'required|exists:academic_terms,id',
            'school_class_id' => 'required|exists:school_classes,id',
            'fee_item_id' => 'required|exists:fee_items,id',
            'amount' => 'required|numeric|min:0',
            'day_student_amount' => 'nullable|numeric|min:0',
            'boarding_student_amount' => 'nullable|numeric|min:0',
            'effective_date' => 'required|date',
            'expiry_date' => 'nullable|date|after:effective_date',
        ]);

        $academicTerm = AcademicTerm::findOrFail($request->academic_term_id);

        $feeStructure->update([
            'fee_item_id' => $request->fee_item_id,
            'school_class_id' => $request->school_class_id,
            'academic_year' => $academicTerm->academic_year,
            'term' => $academicTerm->term,
            'amount' => $request->amount,
            'day_student_amount' => $request->day_student_amount,
            'boarding_student_amount' => $request->boarding_student_amount,
            'effective_date' => $request->effective_date,
            'expiry_date' => $request->expiry_date,
        ]);

        return redirect()->route('finance.fee-structures.index')
            ->with('success', 'Fee structure updated successfully.');
    }

    public function destroy(FeeStructure $feeStructure)
    {
        $this->authorize('delete', $feeStructure);

        // Check if fee structure is being used by any invoices
        if ($feeStructure->invoices()->exists()) {
            return redirect()->back()
                ->with('error', 'Cannot delete fee structure that is being used by invoices.');
        }

        $feeStructure->delete();

        return redirect()->route('finance.fee-structures.index')
            ->with('success', 'Fee structure deleted successfully.');
    }

    public function toggleStatus(FeeStructure $feeStructure)
    {
        $this->authorize('update', $feeStructure);

        $feeStructure->update([
            'is_active' => !$feeStructure->is_active,
        ]);

        $status = $feeStructure->is_active ? 'activated' : 'deactivated';

        return redirect()->back()
            ->with('success', "Fee structure {$status} successfully.");
    }

    public function duplicate(FeeStructure $feeStructure)
    {
        $this->authorize('view', $feeStructure);

        $newFeeStructure = $feeStructure->replicate();
        $newFeeStructure->is_active = false;
        $newFeeStructure->created_by = Auth::id();
        $newFeeStructure->save();

        return redirect()->route('finance.fee-structures.edit', $newFeeStructure)
            ->with('success', 'Fee structure duplicated successfully.');
    }

    public function getFeeStructureForClass(Request $request)
    {
        $request->validate([
            'academic_term_id' => 'required|exists:academic_terms,id',
            'school_class_id' => 'required|exists:school_classes,id',
        ]);

        $term = AcademicTerm::findOrFail($request->academic_term_id);

        $feeStructures = FeeStructure::with(['feeItem', 'schoolClass'])
            ->where('school_id', Auth::user()->school_id)
            ->where('academic_year', $term->academic_year)
            ->where('term', $term->term)
            ->where('school_class_id', $request->school_class_id)
            ->where('is_active', true)
            ->get();

        if ($feeStructures->isEmpty()) {
            return response()->json([
                'message' => 'No active fee structures found for the specified criteria.',
            ], 404);
        }

        return response()->json([
            'fee_structures' => $feeStructures,
            'total_amount' => $feeStructures->sum('amount'),
        ]);
    }
}



