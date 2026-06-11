<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\School;
use App\Models\FeeCategory;
use App\Models\StudentFee;
use App\Models\FeePayment;
use App\Models\AcademicTerm;
use App\Models\User;
use App\Models\SchoolClass;

class FinanceSeeder extends Seeder
{
    public function run()
    {
        $schools = School::all();
        
        foreach ($schools as $school) {
            $this->createFinanceDataForSchool($school);
        }
    }

    private function createFinanceDataForSchool($school)
    {
        // Get user for created_by/processed_by
        $bursar = User::where('school_id', $school->id)->where('role', 'bursar')->first()
            ?? User::where('school_id', $school->id)->where('role', 'school_admin')->first()
            ?? User::where('school_id', $school->id)->first();

        if (!$bursar) {
            return;
        }

        // 1. Create fee categories
        $categoriesData = [
            [
                'name' => 'Tuition Fees',
                'description' => 'Main academic tuition fees',
                'amount' => 500000.00,
                'currency' => 'TZS',
                'payment_frequency' => 'termly',
                'due_date' => now()->addMonths(2)->format('Y-m-d'),
                'is_mandatory' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Boarding Fees',
                'description' => 'Hostel and accommodation fees',
                'amount' => 300000.00,
                'currency' => 'TZS',
                'payment_frequency' => 'termly',
                'due_date' => now()->addMonths(1)->format('Y-m-d'),
                'is_mandatory' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Transport Fees',
                'description' => 'School bus transportation fees',
                'amount' => 150000.00,
                'currency' => 'TZS',
                'payment_frequency' => 'monthly',
                'due_date' => now()->addWeeks(2)->format('Y-m-d'),
                'is_mandatory' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Library Fees',
                'description' => 'Library access and book fees',
                'amount' => 50000.00,
                'currency' => 'TZS',
                'payment_frequency' => 'once',
                'due_date' => now()->addMonths(3)->format('Y-m-d'),
                'is_mandatory' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Examination Fees',
                'description' => 'Registration and paper fees',
                'amount' => 100000.00,
                'currency' => 'TZS',
                'payment_frequency' => 'once',
                'due_date' => now()->addMonths(2)->format('Y-m-d'),
                'is_mandatory' => true,
                'is_active' => true,
            ]
        ];

        $categories = [];
        foreach ($categoriesData as $catData) {
            $categories[] = FeeCategory::create(array_merge($catData, [
                'school_id' => $school->id,
            ]));
        }

        // Get academic terms
        $term = AcademicTerm::where('school_id', $school->id)->first()
            ?? AcademicTerm::first();
            
        $termId = $term ? $term->id : 1;

        // Get classes and students
        $classes = SchoolClass::where('school_id', $school->id)->get();
        $students = User::where('school_id', $school->id)->where('role', 'student')->get();

        if ($students->isEmpty() || $classes->isEmpty()) {
            return;
        }

        // 2. Create student fees and payments
        foreach ($students as $student) {
            // Assign student a profile if not exists
            $studentClass = $classes->random();
            
            // Query or create profile so ClassRoutine works via hasManyThrough
            $profile = \App\Models\StudentProfile::firstOrCreate(
                ['student_id' => $student->id],
                [
                    'class_id' => $studentClass->id,
                    'admission_number' => 'ADM' . rand(1000, 9999),
                    'admission_date' => now()->subYear(),
                ]
            );

            // Assign some fees to student
            foreach ($categories as $category) {
                // Determine random status
                $status = fake()->randomElement(['pending', 'paid', 'partial']);
                $amount = $category->amount;
                $paidAmount = 0.00;
                
                if ($status === 'paid') {
                    $paidAmount = $amount;
                } elseif ($status === 'partial') {
                    $paidAmount = round(fake()->numberBetween(10000, $amount - 10000), -3);
                }

                $balance = $amount - $paidAmount;

                $studentFee = StudentFee::create([
                    'school_id' => $school->id,
                    'student_id' => $student->id,
                    'fee_category_id' => $category->id,
                    'academic_term_id' => $termId,
                    'amount' => $amount,
                    'currency' => $category->currency,
                    'due_date' => $category->due_date,
                    'status' => $status,
                    'paid_amount' => $paidAmount,
                    'balance' => $balance,
                    'payment_plan' => 'standard',
                    'notes' => 'Generated by seeder',
                    'created_by' => $bursar->id,
                ]);

                // 3. Create fee payments for paid/partial fees
                if ($paidAmount > 0) {
                    $paymentMethods = ['cash', 'bank_transfer', 'mobile_money'];
                    $paymentMethod = fake()->randomElement($paymentMethods);

                    FeePayment::create([
                        'school_id' => $school->id,
                        'student_id' => $student->id,
                        'student_fee_id' => $studentFee->id,
                        'fee_category_id' => $category->id,
                        'amount' => $paidAmount,
                        'currency' => $category->currency,
                        'payment_method' => $paymentMethod,
                        'payment_reference' => 'REF' . rand(100000, 999999),
                        'payment_date' => fake()->dateTimeBetween('-2 months', 'now'),
                        'status' => 'completed',
                        'processed_by' => $bursar->id,
                        'processed_at' => now(),
                        'receipt_number' => 'RCP/' . date('Y') . '/' . rand(1000, 9999),
                    ]);
                }
            }
        }
    }
}
