<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\School;
use App\Models\StaffProfile;
use App\Models\SalaryStructure;
use App\Models\Payroll;
use App\Models\PayrollRecord;
use App\Models\LeaveApplication;
use App\Models\LeaveType;
use App\Models\User;

class HRSeeder extends Seeder
{
    public function run()
    {
        $schools = School::all();
        
        foreach ($schools as $school) {
            $this->createHRDataForSchool($school);
        }
    }

    private function createHRDataForSchool($school)
    {
        // Create staff profiles
        $this->createStaffProfiles($school);

        // Create salary structures
        $this->createSalaryStructures($school);

        // Create payroll records
        $this->createPayrollRecords($school);

        // Create leave types
        $this->createLeaveTypes($school);

        // Create leave applications
        $this->createLeaveApplications($school);
    }

    private function createStaffProfiles($school)
    {
        $staff = User::where('school_id', $school->id)
                    ->whereIn('role', ['teacher', 'headteacher', 'bursar', 'librarian', 'dormitory_manager', 'academic_master'])
                    ->get();

        foreach ($staff as $user) {
            StaffProfile::create([
                'school_id' => $school->id,
                'user_id' => $user->id,
                'employee_id' => $this->generateEmployeeId($school->id, $user->id),
                'position' => $this->getPositionForRole($user->role),
                'department' => $this->getDepartmentForRole($user->role),
                'employment_type' => fake()->randomElement(['full_time', 'part_time', 'contract']),
                'hire_date' => fake()->dateTimeBetween('-5 years', '-1 year'),
                'salary' => $this->getSalaryForRole($user->role),
                'qualifications' => json_encode($this->generateQualifications($user->role)),
                'emergency_contact' => json_encode([
                    'name' => fake()->name(),
                    'relationship' => fake()->randomElement(['spouse', 'parent', 'sibling', 'friend']),
                    'phone' => fake()->phoneNumber(),
                    'email' => fake()->email()
                ]),
                'bank_details' => json_encode([
                    'bank_name' => fake()->randomElement(['CRDB Bank', 'NMB Bank', 'Equity Bank', 'Exim Bank']),
                    'account_number' => fake()->numerify('##########'),
                    'account_name' => $user->name
                ]),
                'is_active' => true
            ]);
        }
    }

    private function generateEmployeeId($schoolId, $userId)
    {
        return 'EMP' . str_pad($schoolId, 2, '0', STR_PAD_LEFT) . str_pad($userId, 3, '0', STR_PAD_LEFT);
    }

    private function getPositionForRole($role)
    {
        return match($role) {
            'headteacher' => 'Headteacher',
            'bursar' => 'Finance Manager',
            'librarian' => 'Librarian',
            'dormitory_manager' => 'Dormitory Manager',
            'academic_master' => 'Academic Master',
            'teacher' => 'Subject Teacher',
            default => 'Staff Member'
        };
    }

    private function getDepartmentForRole($role)
    {
        return match($role) {
            'headteacher' => 'Administration',
            'bursar' => 'Finance',
            'librarian' => 'Library',
            'dormitory_manager' => 'Boarding',
            'academic_master' => 'Academic',
            'teacher' => 'Academic',
            default => 'General'
        };
    }

    private function getSalaryForRole($role)
    {
        return match($role) {
            'headteacher' => fake()->numberBetween(1500000, 2500000), // 1.5M - 2.5M TZS
            'bursar' => fake()->numberBetween(800000, 1200000), // 800K - 1.2M TZS
            'librarian' => fake()->numberBetween(600000, 900000), // 600K - 900K TZS
            'dormitory_manager' => fake()->numberBetween(700000, 1000000), // 700K - 1M TZS
            'academic_master' => fake()->numberBetween(1000000, 1500000), // 1M - 1.5M TZS
            'teacher' => fake()->numberBetween(500000, 800000), // 500K - 800K TZS
            default => fake()->numberBetween(400000, 600000) // 400K - 600K TZS
        };
    }

    private function generateQualifications($role)
    {
        $qualifications = [
            'headteacher' => [
                ['degree' => 'Master of Education', 'institution' => 'University of Dar es Salaam', 'year' => fake()->numberBetween(2010, 2020)],
                ['degree' => 'Bachelor of Education', 'institution' => 'University of Dar es Salaam', 'year' => fake()->numberBetween(2005, 2015)]
            ],
            'teacher' => [
                ['degree' => 'Bachelor of Education', 'institution' => 'University of Dar es Salaam', 'year' => fake()->numberBetween(2015, 2023)],
                ['degree' => 'Diploma in Education', 'institution' => 'Dar es Salaam Teachers College', 'year' => fake()->numberBetween(2010, 2020)]
            ],
            'bursar' => [
                ['degree' => 'Bachelor of Commerce', 'institution' => 'University of Dar es Salaam', 'year' => fake()->numberBetween(2010, 2020)],
                ['certificate' => 'CPA', 'institution' => 'NBAA', 'year' => fake()->numberBetween(2015, 2023)]
            ],
            'librarian' => [
                ['degree' => 'Bachelor of Library Science', 'institution' => 'University of Dar es Salaam', 'year' => fake()->numberBetween(2015, 2023)],
                ['diploma' => 'Library Management', 'institution' => 'Dar es Salaam Institute of Technology', 'year' => fake()->numberBetween(2010, 2020)]
            ]
        ];

        return $qualifications[$role] ?? [
            ['degree' => 'Bachelor Degree', 'institution' => 'University', 'year' => fake()->numberBetween(2010, 2023)]
        ];
    }

    private function createSalaryStructures($school)
    {
        $staff = StaffProfile::where('school_id', $school->id)->get();

        foreach ($staff as $profile) {
            SalaryStructure::create([
                'school_id' => $school->id,
                'name' => 'Salary Structure for ' . $profile->position,
                'description' => 'Salary structure for ' . $profile->position . ' position',
                'basic_salary' => $profile->salary,
                'house_allowance' => fake()->numberBetween(100000, 300000),
                'transport_allowance' => fake()->numberBetween(50000, 150000),
                'risk_allowance' => fake()->numberBetween(20000, 80000),
                'medical_allowance' => fake()->numberBetween(30000, 100000),
                'other_allowances' => fake()->numberBetween(20000, 50000),
                'nssf_percentage' => 10.00,
                'paye_rate' => $this->calculatePAYERate($profile->salary),
                'sdl_percentage' => 1.00,
                'effective_date' => fake()->dateTimeBetween('-1 year', 'now'),
                'is_active' => true,
                'created_by' => $profile->user_id
            ]);
        }
    }

    private function calculatePAYERate($salary)
    {
        // Simplified PAYE rate calculation for Tanzania
        if ($salary <= 270000) return 0;
        if ($salary <= 520000) return 8.00; // 8%
        if ($salary <= 760000) return 20.00; // 20%
        return 25.00; // 25%
    }

    private function createPayrollRecords($school)
    {
        $staff = StaffProfile::where('school_id', $school->id)->get();
        $months = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'];

        foreach ($months as $month) {
            // Create a payroll for each month
            $monthParts = explode('-', $month);
            $year = $monthParts[0];
            $monthNumber = (int)$monthParts[1];
            
            $payroll = Payroll::create([
                'school_id' => $school->id,
                'payroll_period' => $month,
                'month' => $monthNumber,
                'year' => $year,
                'status' => 'completed',
                'total_staff' => 0,
                'total_gross_pay' => 0,
                'total_deductions' => 0,
                'total_net_pay' => 0,
                'processed_by' => User::where('school_id', $school->id)->where('role', 'bursar')->first()->id,
                'processed_at' => fake()->dateTimeBetween($month . '-01', $month . '-31')
            ]);

            foreach ($staff as $profile) {
                $salaryStructure = SalaryStructure::where('school_id', $school->id)
                    ->where('created_by', $profile->user_id)
                    ->first();
                
                if ($salaryStructure) {
                    $basicSalary = $salaryStructure->basic_salary;
                    $houseAllowance = $salaryStructure->house_allowance;
                    $transportAllowance = $salaryStructure->transport_allowance;
                    $riskAllowance = $salaryStructure->risk_allowance;
                    $medicalAllowance = $salaryStructure->medical_allowance;
                    $otherAllowances = $salaryStructure->other_allowances;
                    
                    $grossPay = $basicSalary + $houseAllowance + $transportAllowance + 
                               $riskAllowance + $medicalAllowance + $otherAllowances;
                    
                    $nssfDeduction = $basicSalary * ($salaryStructure->nssf_percentage / 100);
                    $payeDeduction = $basicSalary * ($salaryStructure->paye_rate / 100);
                    $sdlDeduction = $basicSalary * ($salaryStructure->sdl_percentage / 100);
                    $totalDeductions = $nssfDeduction + $payeDeduction + $sdlDeduction;
                    
                    $netPay = $grossPay - $totalDeductions;
                    
                    PayrollRecord::create([
                        'payroll_id' => $payroll->id,
                        'staff_id' => $profile->user_id,
                        'basic_salary' => $basicSalary,
                        'house_allowance' => $houseAllowance,
                        'transport_allowance' => $transportAllowance,
                        'risk_allowance' => $riskAllowance,
                        'medical_allowance' => $medicalAllowance,
                        'other_allowances' => $otherAllowances,
                        'gross_pay' => $grossPay,
                        'nssf_deduction' => $nssfDeduction,
                        'paye_deduction' => $payeDeduction,
                        'sdl_deduction' => $sdlDeduction,
                        'total_deductions' => $totalDeductions,
                        'net_pay' => $netPay,
                        'attendance_days' => fake()->numberBetween(20, 30),
                        'working_days' => 30,
                        'leave_days' => fake()->numberBetween(0, 5),
                        'absent_days' => fake()->numberBetween(0, 3),
                        'notes' => fake()->optional(0.3)->sentence()
                    ]);
                }
            }
        }
    }

    private function calculateNetSalary($salaryStructure)
    {
        $basic = $salaryStructure->basic_salary;
        $allowances = $salaryStructure->house_allowance + 
                     $salaryStructure->transport_allowance + 
                     $salaryStructure->risk_allowance + 
                     $salaryStructure->medical_allowance + 
                     $salaryStructure->other_allowances;
        
        $nssf = $basic * ($salaryStructure->nssf_percentage / 100);
        $paye = $basic * ($salaryStructure->paye_rate / 100);
        $sdl = $basic * ($salaryStructure->sdl_percentage / 100);
        $deductions = $nssf + $paye + $sdl;
        
        return $basic + $allowances - $deductions;
    }

    private function createLeaveTypes($school)
    {
        $leaveTypes = [
            ['name' => 'Annual Leave', 'description' => 'Annual vacation leave', 'max_days_per_year' => 30, 'max_days_per_request' => 30, 'is_paid' => true],
            ['name' => 'Sick Leave', 'description' => 'Medical leave for illness', 'max_days_per_year' => 15, 'max_days_per_request' => 15, 'is_paid' => true],
            ['name' => 'Maternity Leave', 'description' => 'Maternity leave for new mothers', 'max_days_per_year' => 90, 'max_days_per_request' => 90, 'is_paid' => true],
            ['name' => 'Paternity Leave', 'description' => 'Paternity leave for new fathers', 'max_days_per_year' => 14, 'max_days_per_request' => 14, 'is_paid' => true],
            ['name' => 'Study Leave', 'description' => 'Leave for professional development', 'max_days_per_year' => 7, 'max_days_per_request' => 7, 'is_paid' => false],
            ['name' => 'Emergency Leave', 'description' => 'Emergency personal leave', 'max_days_per_year' => 3, 'max_days_per_request' => 3, 'is_paid' => false],
        ];

        foreach ($leaveTypes as $leaveTypeData) {
            LeaveType::create([
                'school_id' => $school->id,
                'name' => $leaveTypeData['name'],
                'description' => $leaveTypeData['description'],
                'max_days_per_year' => $leaveTypeData['max_days_per_year'],
                'max_days_per_request' => $leaveTypeData['max_days_per_request'],
                'is_paid' => $leaveTypeData['is_paid'],
                'requires_approval' => true,
                'requires_documentation' => $leaveTypeData['name'] === 'Sick Leave' || $leaveTypeData['name'] === 'Maternity Leave',
                'is_active' => true
            ]);
        }
    }

    private function createLeaveApplications($school)
    {
        $staff = User::where('school_id', $school->id)
                    ->whereIn('role', ['teacher', 'headteacher', 'bursar', 'librarian', 'dormitory_manager', 'academic_master'])
                    ->get();

        $leaveTypes = ['annual', 'sick', 'maternity', 'paternity', 'compassionate', 'study'];
        $statuses = ['pending', 'approved', 'rejected', 'taken'];

        foreach ($staff as $user) {
            // Create 2-5 leave applications per staff member
            $leaveCount = fake()->numberBetween(2, 5);
            
            for ($i = 0; $i < $leaveCount; $i++) {
                $leaveType = fake()->randomElement($leaveTypes);
                $startDate = fake()->dateTimeBetween('-6 months', '+3 months');
                $endDate = fake()->dateTimeBetween($startDate, $startDate->modify('+14 days'));
                $status = fake()->randomElement($statuses);

                // Get leave type ID (assuming leave types exist)
                $leaveTypeRecord = \App\Models\LeaveType::where('name', $leaveType)->first();
                if ($leaveTypeRecord) {
                    LeaveApplication::create([
                        'staff_id' => $user->id,
                        'leave_type_id' => $leaveTypeRecord->id,
                        'start_date' => $startDate->format('Y-m-d'),
                        'end_date' => $endDate->format('Y-m-d'),
                        'total_days' => $startDate->diff($endDate)->days + 1,
                        'reason' => $this->generateLeaveReason($leaveType),
                        'status' => $status,
                        'applied_at' => fake()->dateTimeBetween($startDate, '-7 days'),
                        'approved_by' => $status === 'approved' ? User::where('school_id', $school->id)->where('role', 'headteacher')->first()->id : null,
                        'approved_at' => $status === 'approved' ? fake()->dateTimeBetween($startDate, '-1 day') : null,
                        'notes' => fake()->optional()->sentence()
                    ]);
                }
            }
        }
    }

    private function generateLeaveReason($leaveType)
    {
        $reasons = [
            'annual' => 'Annual leave for rest and recreation',
            'sick' => 'Medical leave due to illness',
            'maternity' => 'Maternity leave for childbirth',
            'paternity' => 'Paternity leave to support family',
            'compassionate' => 'Compassionate leave for family emergency',
            'study' => 'Study leave for professional development'
        ];

        return $reasons[$leaveType] ?? 'Personal leave request';
    }
}
