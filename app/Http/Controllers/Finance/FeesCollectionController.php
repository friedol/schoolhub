<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\FeesMaster;
use App\Models\FeesGroup;
use App\Models\FeesType;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class FeesCollectionController extends Controller
{
    private function schoolId(): int
    {
        $user   = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;
        return $school?->id ?? $user->school_id;
    }

    private function fmtCode(int $id): string
    {
        return 'FG' . str_pad($id, 5, '0', STR_PAD_LEFT);
    }

    /* ═══════════════════════ FEES GROUP ══════════════════════════ */

    public function feesGroup(Request $request): Response
    {
        $sid = $this->schoolId();

        $q = FeesGroup::where('school_id', $sid)
            ->when($request->status === 'active',   fn($q) => $q->where('is_active', true))
            ->when($request->status === 'inactive', fn($q) => $q->where('is_active', false))
            ->when($request->name,   fn($q, $v) => $q->where('name', 'like', "%{$v}%"))
            ->orderByDesc('id');

        $groups = $q->paginate(10)->through(fn($g) => [
            'id'          => $g->id,
            'code'        => $this->fmtCode($g->id),
            'name'        => $g->name,
            'description' => $g->description,
            'is_active'   => $g->is_active,
        ]);

        return Inertia::render('Finance/FeesCollection/FeesGroup/Index', [
            'groups'  => $groups,
            'filters' => $request->only(['status', 'name']),
        ]);
    }

    public function storeFeesGroup(Request $request): RedirectResponse
    {
        $v = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);
        FeesGroup::create(array_merge($v, ['school_id' => $this->schoolId()]));
        return back()->with('success', 'Fees group added successfully.');
    }

    public function updateFeesGroup(Request $request, int $id): RedirectResponse
    {
        $g = FeesGroup::where('school_id', $this->schoolId())->findOrFail($id);
        $v = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);
        $g->update($v);
        return back()->with('success', 'Fees group updated.');
    }

    public function destroyFeesGroup(int $id): RedirectResponse
    {
        FeesGroup::where('school_id', $this->schoolId())->findOrFail($id)->delete();
        return back()->with('success', 'Fees group deleted.');
    }

    /* ═══════════════════════ FEES TYPE ═══════════════════════════ */

    public function feesType(Request $request): Response
    {
        $sid = $this->schoolId();

        $types = FeesType::where('school_id', $sid)
            ->with('feesGroup')
            ->when($request->status === 'active',   fn($q) => $q->where('is_active', true))
            ->when($request->status === 'inactive', fn($q) => $q->where('is_active', false))
            ->when($request->fees_group_id, fn($q, $v) => $q->where('fees_group_id', $v))
            ->orderByDesc('id')
            ->paginate(10)
            ->through(fn($t) => [
                'id'          => $t->id,
                'code'        => $this->fmtCode($t->id),
                'name'        => $t->name,
                'fees_code'   => $t->code,
                'fees_group'  => $t->feesGroup?->name ?? '—',
                'description' => $t->description,
                'is_active'   => $t->is_active,
            ]);

        $groups = FeesGroup::where('school_id', $sid)->where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Finance/FeesCollection/FeesType/Index', [
            'types'   => $types,
            'groups'  => $groups,
            'filters' => $request->only(['status', 'fees_group_id']),
        ]);
    }

    public function storeFeesType(Request $request): RedirectResponse
    {
        $v = $request->validate([
            'name'          => 'required|string|max:255',
            'fees_group_id' => 'required|exists:fees_groups,id',
            'description'   => 'nullable|string',
            'is_active'     => 'boolean',
        ]);
        $v['code'] = \Illuminate\Support\Str::slug($v['name']);
        FeesType::create(array_merge($v, ['school_id' => $this->schoolId()]));
        return back()->with('success', 'Fees type added successfully.');
    }

    public function updateFeesType(Request $request, int $id): RedirectResponse
    {
        $t = FeesType::where('school_id', $this->schoolId())->findOrFail($id);
        $v = $request->validate([
            'name'          => 'required|string|max:255',
            'fees_group_id' => 'required|exists:fees_groups,id',
            'description'   => 'nullable|string',
            'is_active'     => 'boolean',
        ]);
        $v['code'] = \Illuminate\Support\Str::slug($v['name']);
        $t->update($v);
        return back()->with('success', 'Fees type updated.');
    }

    public function destroyFeesType(int $id): RedirectResponse
    {
        FeesType::where('school_id', $this->schoolId())->findOrFail($id)->delete();
        return back()->with('success', 'Fees type deleted.');
    }

    /* ═══════════════════════ FEES MASTER ═════════════════════════ */

    public function feesMaster(Request $request): Response
    {
        $sid = $this->schoolId();

        $masters = FeesMaster::where('school_id', $sid)
            ->with(['feesGroup', 'feesType'])
            ->when($request->fees_group_id, fn($q, $v) => $q->where('fees_group_id', $v))
            ->when($request->fees_type_id,  fn($q, $v) => $q->where('fees_type_id', $v))
            ->when($request->fine_type,     fn($q, $v) => $q->where('fine_type', $v))
            ->when($request->status === 'active',   fn($q) => $q->where('is_active', true))
            ->when($request->status === 'inactive', fn($q) => $q->where('is_active', false))
            ->when($request->due_date,      fn($q, $v) => $q->whereDate('due_date', $v))
            ->orderByDesc('id')
            ->paginate(10)
            ->through(fn($m) => [
                'id'          => $m->id,
                'code'        => $this->fmtCode($m->id),
                'fees_group'  => $m->feesGroup?->name ?? '—',
                'fees_type'   => $m->feesType?->name  ?? '—',
                'due_date'    => $m->due_date?->format('d M Y') ?? '—',
                'amount'      => (float) $m->amount,
                'fine_type'   => $m->fine_type,
                'fine_amount' => (float) $m->fine_amount,
                'is_active'   => $m->is_active,
            ]);

        $groups = FeesGroup::where('school_id', $sid)->where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $types  = FeesType::where('school_id', $sid)->where('is_active', true)->orderBy('name')->get(['id', 'name', 'fees_group_id']);

        return Inertia::render('Finance/FeesCollection/FeesMaster/Index', [
            'masters' => $masters,
            'groups'  => $groups,
            'types'   => $types,
            'filters' => $request->only(['fees_group_id', 'fees_type_id', 'fine_type', 'status', 'due_date']),
        ]);
    }

    public function storeFeesMaster(Request $request): RedirectResponse
    {
        $v = $request->validate([
            'fees_group_id' => 'required|exists:fees_groups,id',
            'fees_type_id'  => 'required|exists:fees_types,id',
            'due_date'      => 'nullable|date',
            'amount'        => 'required|numeric|min:0',
            'fine_type'     => 'required|in:none,percentage,fixed',
            'fine_amount'   => 'nullable|numeric|min:0',
            'is_active'     => 'boolean',
        ]);
        FeesMaster::create(array_merge($v, ['school_id' => $this->schoolId()]));
        return back()->with('success', 'Fees master added successfully.');
    }

    public function updateFeesMaster(Request $request, int $id): RedirectResponse
    {
        $m = FeesMaster::where('school_id', $this->schoolId())->findOrFail($id);
        $v = $request->validate([
            'fees_group_id' => 'required|exists:fees_groups,id',
            'fees_type_id'  => 'required|exists:fees_types,id',
            'due_date'      => 'nullable|date',
            'amount'        => 'required|numeric|min:0',
            'fine_type'     => 'required|in:none,percentage,fixed',
            'fine_amount'   => 'nullable|numeric|min:0',
            'is_active'     => 'boolean',
        ]);
        $m->update($v);
        return back()->with('success', 'Fees master updated.');
    }

    public function destroyFeesMaster(int $id): RedirectResponse
    {
        FeesMaster::where('school_id', $this->schoolId())->findOrFail($id)->delete();
        return back()->with('success', 'Fees master deleted.');
    }
}
