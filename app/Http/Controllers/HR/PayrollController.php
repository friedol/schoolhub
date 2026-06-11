<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Payroll;
use App\Models\PayrollRecord;
use App\Models\Payslip;
use App\Models\SalaryStructure;
use App\Models\User;
use App\Models\AcademicTerm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PayrollController extends Controller
{
    public function index(Request $request)
    {
        $query = Payroll::with(['academicTerm', 'processedBy', 'approvedBy'])
            ->where('school_id', Auth::user()->school_id);

        // Apply filters
        if ($request->filled('academic_term_id')) {
            $query->where('academic_term_id', $request->academic_term_id);
        }

        if ($request->filled('month')) {
            $query->where('month', $request->month);
        }

        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $payrolls = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $academicTerms = AcademicTerm::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('start_date', 'desc')
            ->get();

        // Statistics
        $currentYear = now()->year;
        $currentMonth = now()->month;

        $stats = [
            'total_payrolls' => Payroll::where('school_id', Auth::user()->school_id)->count(),
            'pending_payrolls' => Payroll::where('school_id', Auth::user()->school_id)
                ->where('status', 'pending')->count(),
            'approved_payrolls' => Payroll::where('school_id', Auth::user()->school_id)
                ->where('status', 'approved')->count(),
            'paid_payrolls' => Payroll::where('school_id', Auth::user()->school_id)
                ->where('status', 'paid')->count(),
            'current_month_total' => PayrollRecord::whereHas('payroll', function ($query) use ($currentYear, $currentMonth) {
                $query->where('school_id', Auth::user()->school_id)
                      ->where('year', $currentYear)
                      ->where('month', $currentMonth);
            })->sum('net_pay'),
        ];

        return Inertia::render('HR/Payroll/Index', [
            'payrolls' => $payrolls,
            'academicTerms' => $academicTerms,
            'stats' => $stats,
            'filters' => $request->only(['academic_term_id', 'month', 'year', 'status']),
        ]);
    }

    public function create()
    {
        $academicTerms = AcademicTerm::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('start_date', 'desc')
            ->get();

        $salaryStructures = SalaryStructure::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('HR/Payroll/Create', [
            'academicTerms' => $academicTerms,
            'salaryStructures' => $salaryStructures,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'academic_term_id' => 'required|exists:academic_terms,id',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2030',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Check if payroll already exists for this month/year
        $existingPayroll = Payroll::where('school_id', Auth::user()->school_id)
            ->where('academic_term_id', $request->academic_term_id)
            ->where('month', $request->month)
            ->where('year', $request->year)
            ->first();

        if ($existingPayroll) {
            return redirect()->back()
                ->with('error', 'Payroll for this month and year already exists.');
        }

        DB::transaction(function () use ($request) {
            $payroll = Payroll::create([
                'school_id' => Auth::user()->school_id,
                'academic_term_id' => $request->academic_term_id,
                'month' => $request->month,
                'year' => $request->year,
                'status' => 'pending',
                'processed_by' => Auth::id(),
                'processed_at' => now(),
                'notes' => $request->notes,
            ]);

            // Get all active staff
            $staff = User::with(['staffProfile', 'salaryStructure'])
                ->where('school_id', Auth::user()->school_id)
                ->whereIn('role', ['teacher', 'headteacher', 'bursar', 'librarian', 'dormitory_manager', 'academic_master'])
                ->where('is_active', true)
                ->get();

            // Create payroll records for each staff member
            foreach ($staff as $staffMember) {
                if ($staffMember->salaryStructure) {
                    $this->createPayrollRecord($payroll, $staffMember);
                }
            }
        });

        return redirect()->route('hr.payroll.index')
            ->with('success', 'Payroll created successfully.');
    }

    public function show(Payroll $payroll)
    {
        $this->authorize('view', $payroll);

        $payroll->load([
            'academicTerm',
            'processedBy',
            'approvedBy',
            'payrollRecords.staff.staffProfile',
            'payrollRecords.salaryStructure'
        ]);

        return Inertia::render('HR/Payroll/Show', [
            'payroll' => $payroll,
        ]);
    }

    public function edit(Payroll $payroll)
    {
        $this->authorize('update', $payroll);

        if ($payroll->status !== 'pending') {
            return redirect()->back()
                ->with('error', 'Cannot edit payroll that is not pending.');
        }

        $payroll->load([
            'academicTerm',
            'payrollRecords.staff.staffProfile',
            'payrollRecords.salaryStructure'
        ]);

        $salaryStructures = SalaryStructure::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('HR/Payroll/Edit', [
            'payroll' => $payroll,
            'salaryStructures' => $salaryStructures,
        ]);
    }

    public function update(Request $request, Payroll $payroll)
    {
        $this->authorize('update', $payroll);

        if ($payroll->status !== 'pending') {
            return redirect()->back()
                ->with('error', 'Cannot edit payroll that is not pending.');
        }

        $request->validate([
            'notes' => 'nullable|string|max:1000',
            'payroll_records' => 'required|array',
            'payroll_records.*.id' => 'required|exists:payroll_records,id',
            'payroll_records.*.gross_pay' => 'required|numeric|min:0',
            'payroll_records.*.total_deductions' => 'required|numeric|min:0',
            'payroll_records.*.net_pay' => 'required|numeric|min:0',
            'payroll_records.*.payment_method' => 'required|in:bank_transfer,cash,cheque',
        ]);

        DB::transaction(function () use ($request, $payroll) {
            $payroll->update([
                'notes' => $request->notes,
            ]);

            // Update payroll records
            foreach ($request->payroll_records as $recordData) {
                PayrollRecord::where('id', $recordData['id'])
                    ->where('payroll_id', $payroll->id)
                    ->update([
                        'gross_pay' => $recordData['gross_pay'],
                        'total_deductions' => $recordData['total_deductions'],
                        'net_pay' => $recordData['net_pay'],
                        'payment_method' => $recordData['payment_method'],
                    ]);
            }
        });

        return redirect()->route('hr.payroll.index')
            ->with('success', 'Payroll updated successfully.');
    }

    public function destroy(Payroll $payroll)
    {
        $this->authorize('delete', $payroll);

        if ($payroll->status !== 'pending') {
            return redirect()->back()
                ->with('error', 'Cannot delete payroll that is not pending.');
        }

        $payroll->delete();

        return redirect()->route('hr.payroll.index')
            ->with('success', 'Payroll deleted successfully.');
    }

    public function approve(Payroll $payroll)
    {
        $this->authorize('approve', $payroll);

        if ($payroll->status !== 'pending') {
            return redirect()->back()
                ->with('error', 'Only pending payrolls can be approved.');
        }

        $payroll->update([
            'status' => 'approved',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        return redirect()->back()
            ->with('success', 'Payroll approved successfully.');
    }

    public function markAsPaid(Payroll $payroll)
    {
        $this->authorize('approve', $payroll);

        if ($payroll->status !== 'approved') {
            return redirect()->back()
                ->with('error', 'Only approved payrolls can be marked as paid.');
        }

        DB::transaction(function () use ($payroll) {
            $payroll->update([
                'status' => 'paid',
            ]);

            // Update all payroll records
            $payroll->payrollRecords()->update([
                'status' => 'paid',
                'payment_date' => now(),
            ]);

            // Generate payslips
            $this->generatePayslips($payroll);
        });

        return redirect()->back()
            ->with('success', 'Payroll marked as paid and payslips generated.');
    }

    public function generatePayslips(Payroll $payroll)
    {
        $this->authorize('view', $payroll);

        $payroll->load('payrollRecords.staff');

        foreach ($payroll->payrollRecords as $record) {
            if (!$record->payslip) {
                $this->createPayslip($record);
            }
        }

        return redirect()->back()
            ->with('success', 'Payslips generated successfully.');
    }

    public function downloadPayslip(Payslip $payslip)
    {
        $this->authorize('view', $payslip->payrollRecord->payroll);

        if (!Storage::disk('public')->exists($payslip->file_path)) {
            return redirect()->back()
                ->with('error', 'Payslip file not found.');
        }

        return Storage::disk('public')->download($payslip->file_path, "payslip_{$payslip->staff->employee_id}_{$payslip->created_at->format('Y-m')}.pdf");
    }

    public function addStaffToPayroll(Request $request, Payroll $payroll)
    {
        $this->authorize('update', $payroll);

        if ($payroll->status !== 'pending') {
            return redirect()->back()
                ->with('error', 'Cannot add staff to payroll that is not pending.');
        }

        $request->validate([
            'staff_id' => 'required|exists:users,id',
            'salary_structure_id' => 'required|exists:salary_structures,id',
        ]);

        $staff = User::with(['salaryStructure'])
            ->where('school_id', Auth::user()->school_id)
            ->findOrFail($request->staff_id);

        // Check if staff already has a payroll record
        if ($payroll->payrollRecords()->where('staff_id', $staff->id)->exists()) {
            return redirect()->back()
                ->with('error', 'Staff member already exists in this payroll.');
        }

        $this->createPayrollRecord($payroll, $staff, $request->salary_structure_id);

        return redirect()->back()
            ->with('success', 'Staff member added to payroll successfully.');
    }

    public function removeStaffFromPayroll(PayrollRecord $payrollRecord)
    {
        $this->authorize('update', $payrollRecord->payroll);

        if ($payrollRecord->payroll->status !== 'pending') {
            return redirect()->back()
                ->with('error', 'Cannot remove staff from payroll that is not pending.');
        }

        $payrollRecord->delete();

        return redirect()->back()
            ->with('success', 'Staff member removed from payroll successfully.');
    }

    public function getPayrollSummary(Payroll $payroll)
    {
        $this->authorize('view', $payroll);

        $payroll->load('payrollRecords');

        $summary = [
            'total_staff' => $payroll->payrollRecords->count(),
            'total_gross_pay' => $payroll->payrollRecords->sum('gross_pay'),
            'total_deductions' => $payroll->payrollRecords->sum('total_deductions'),
            'total_net_pay' => $payroll->payrollRecords->sum('net_pay'),
            'average_gross_pay' => $payroll->payrollRecords->avg('gross_pay'),
            'average_net_pay' => $payroll->payrollRecords->avg('net_pay'),
            'deduction_breakdown' => $this->getDeductionBreakdown($payroll),
        ];

        return response()->json($summary);
    }

    private function createPayrollRecord(Payroll $payroll, User $staff, $salaryStructureId = null)
    {
        $salaryStructure = $salaryStructureId 
            ? SalaryStructure::find($salaryStructureId)
            : $staff->salaryStructure;

        if (!$salaryStructure) {
            return;
        }

        // Calculate gross pay
        $grossPay = $salaryStructure->basic_salary + 
                   $salaryStructure->house_allowance + 
                   $salaryStructure->transport_allowance + 
                   $salaryStructure->risk_allowance;

        // Calculate deductions
        $nssf = $grossPay * ($salaryStructure->nssf_percentage / 100);
        $sdl = $grossPay * ($salaryStructure->sdl_percentage / 100);
        
        // Calculate PAYE (simplified calculation)
        $paye = $this->calculatePAYE($grossPay, $salaryStructure->paye_bands);
        
        $totalDeductions = $nssf + $sdl + $paye;
        $netPay = $grossPay - $totalDeductions;

        PayrollRecord::create([
            'payroll_id' => $payroll->id,
            'staff_id' => $staff->id,
            'salary_structure_id' => $salaryStructure->id,
            'gross_pay' => $grossPay,
            'total_deductions' => $totalDeductions,
            'net_pay' => $netPay,
            'payment_method' => 'bank_transfer',
            'status' => 'pending',
        ]);
    }

    private function calculatePAYE($grossPay, $payeBands)
    {
        // Simplified PAYE calculation
        // In a real system, this would be more complex based on tax brackets
        if ($grossPay <= 270000) {
            return 0; // Tax-free threshold
        } elseif ($grossPay <= 520000) {
            return ($grossPay - 270000) * 0.08; // 8% on amount above 270,000
        } elseif ($grossPay <= 760000) {
            return 20000 + (($grossPay - 520000) * 0.20); // 20% on amount above 520,000
        } else {
            return 68000 + (($grossPay - 760000) * 0.25); // 25% on amount above 760,000
        }
    }

    private function createPayslip(PayrollRecord $payrollRecord)
    {
        // Generate payslip content (simplified)
        $payslipContent = $this->generatePayslipContent($payrollRecord);
        
        // Save payslip file (in a real system, this would generate a PDF)
        $fileName = "payslip_{$payrollRecord->staff->id}_{$payrollRecord->payroll->year}_{$payrollRecord->payroll->month}.txt";
        $filePath = "payslips/{$fileName}";
        
        Storage::disk('public')->put($filePath, $payslipContent);

        Payslip::create([
            'payroll_record_id' => $payrollRecord->id,
            'staff_id' => $payrollRecord->staff_id,
            'file_path' => $filePath,
            'generated_at' => now(),
            'is_viewed' => false,
        ]);
    }

    private function generatePayslipContent(PayrollRecord $payrollRecord)
    {
        $staff = $payrollRecord->staff;
        $payroll = $payrollRecord->payroll;
        
        $content = "PAYSLIP\n";
        $content .= "================\n\n";
        $content .= "Employee: {$staff->first_name} {$staff->last_name}\n";
        $content .= "Employee ID: {$staff->staffProfile->employee_id}\n";
        $content .= "Period: {$payroll->month}/{$payroll->year}\n\n";
        $content .= "Earnings:\n";
        $content .= "Basic Salary: TZS " . number_format($payrollRecord->gross_pay) . "\n\n";
        $content .= "Deductions:\n";
        $content .= "Total Deductions: TZS " . number_format($payrollRecord->total_deductions) . "\n\n";
        $content .= "Net Pay: TZS " . number_format($payrollRecord->net_pay) . "\n";
        
        return $content;
    }

    private function getDeductionBreakdown(Payroll $payroll)
    {
        // This would typically come from the salary structure calculations
        return [
            'nssf' => $payroll->payrollRecords->sum('gross_pay') * 0.10, // 10% NSSF
            'paye' => $payroll->payrollRecords->sum('gross_pay') * 0.15, // 15% PAYE (simplified)
            'sdl' => $payroll->payrollRecords->sum('gross_pay') * 0.01, // 1% SDL
        ];
    }
}



