<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\StudentGuardian;
use App\Models\SchoolClass;
use App\Models\School;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SampleStudentSeeder extends Seeder
{
    /**
     * Run the database seeds — creates 10 realistic sample students
     * with full profiles, guardians, and academic placements.
     */
    public function run(): void
    {
        $school = School::first();
        if (!$school) {
            $this->command->error('No school found. Run SchoolSeeder first.');
            return;
        }

        // Get a class to use for Form 3 or fallback to any available
        $form3 = SchoolClass::where('school_id', $school->id)
            ->where('is_active', true)
            ->where('name', 'LIKE', '%Form 3%')
            ->first();

        $form1 = SchoolClass::where('school_id', $school->id)
            ->where('is_active', true)
            ->where('name', 'LIKE', '%Form 1%')
            ->first();

        $form4 = SchoolClass::where('school_id', $school->id)
            ->where('is_active', true)
            ->where('name', 'LIKE', '%Form 4%')
            ->first();

        $standard5 = SchoolClass::where('school_id', $school->id)
            ->where('is_active', true)
            ->first(); // fallback to first available

        $classes = [
            $form3 ?? $standard5,
            $form1 ?? $standard5,
            $form4 ?? $standard5,
            $form3 ?? $standard5,
            $form1 ?? $standard5,
        ];

        $students = [
            [
                'first_name'    => 'Amina',
                'middle_name'   => 'Rashid',
                'last_name'     => 'Mwangi',
                'gender'        => 'female',
                'date_of_birth' => '2009-03-14',
                'phone'         => '+255712345678',
                'email'         => 'amina.mwangi.student@edutanzania.ac.tz',
                'address'       => 'Kinondoni, Sinza, Dar es Salaam',
                'region'        => 'Dar es Salaam',
                'district'      => 'Kinondoni',
                'ward'          => 'Sinza',
                'village'       => 'Sinza Palestina',
                'religion'      => 'Islam',
                'nationality'   => 'Tanzanian',
                'blood_group'   => 'O+',
                'father_name'   => 'Rashid Omar Mwangi',
                'mother_name'   => 'Fatuma Juma Mwangi',
                'father_occupation' => 'Accountant',
                'mother_occupation' => 'Nurse',
                'father_income_range' => '1,000,000 - 2,000,000 TZS',
                'boarding_status' => 'day',
                'stream'        => 'A',
                'previous_school' => 'Makini Primary School',
                'previous_class'  => 'Standard VII',
                'admission_date'  => '2022-01-10',
                'submitted_documents' => ['previous_certificate', 'tc', 'nbc'],
                'notes'         => 'Excellent academic performance. Interested in sciences and mathematics.',
                'scholarship_status' => 'none',
                'guardian' => [
                    'guardian_name' => 'Rashid Omar Mwangi',
                    'relationship'  => 'father',
                    'phone_number'  => '0712345678',
                    'email'         => 'rashid.mwangi@gmail.com',
                    'occupation'    => 'Accountant',
                    'employer'      => 'NMB Bank Tanzania',
                    'is_primary_contact' => true,
                    'is_emergency_contact' => true,
                    'password'      => 'Mwangi@2024',
                ],
            ],
            [
                'first_name'    => 'Emmanuel',
                'middle_name'   => 'Joseph',
                'last_name'     => 'Kimaro',
                'gender'        => 'male',
                'date_of_birth' => '2008-07-22',
                'phone'         => '+255756789012',
                'email'         => 'emmanuel.kimaro.student@edutanzania.ac.tz',
                'address'       => 'Moshi Urban, Rau, Kilimanjaro',
                'region'        => 'Kilimanjaro',
                'district'      => 'Moshi Urban',
                'ward'          => 'Rau',
                'village'       => 'Rau Forest Area',
                'religion'      => 'Christianity',
                'nationality'   => 'Tanzanian',
                'blood_group'   => 'A+',
                'father_name'   => 'Joseph Peter Kimaro',
                'mother_name'   => 'Grace Michael Kimaro',
                'father_occupation' => 'Farmer',
                'mother_occupation' => 'Teacher',
                'father_income_range' => '500,000 - 1,000,000 TZS',
                'boarding_status' => 'boarding',
                'stream'        => 'B',
                'previous_school' => 'St. Joseph Primary School',
                'previous_class'  => 'Standard VII',
                'admission_date'  => '2023-01-09',
                'submitted_documents' => ['previous_certificate', 'tc', 'nbc', 'testimonial'],
                'notes'         => 'Active in sports, especially football. Needs support in English composition.',
                'scholarship_status' => 'partial',
                'scholarship_amount' => '200000',
                'guardian' => [
                    'guardian_name' => 'Joseph Peter Kimaro',
                    'relationship'  => 'father',
                    'phone_number'  => '0756789012',
                    'email'         => 'joseph.kimaro@yahoo.com',
                    'occupation'    => 'Farmer',
                    'employer'      => 'Self-employed',
                    'is_primary_contact' => true,
                    'is_emergency_contact' => true,
                    'password'      => 'Kimaro@2024',
                ],
            ],
            [
                'first_name'    => 'Neema',
                'middle_name'   => 'William',
                'last_name'     => 'Lyimo',
                'gender'        => 'female',
                'date_of_birth' => '2007-11-05',
                'phone'         => '+255765432109',
                'email'         => 'neema.lyimo.student@edutanzania.ac.tz',
                'address'       => 'Ilala, Kariakoo, Dar es Salaam',
                'region'        => 'Dar es Salaam',
                'district'      => 'Ilala',
                'ward'          => 'Kariakoo',
                'village'       => 'Kariakoo Market Area',
                'religion'      => 'Christianity',
                'nationality'   => 'Tanzanian',
                'blood_group'   => 'B+',
                'father_name'   => 'William Lyimo',
                'mother_name'   => 'Mary Lyimo',
                'father_occupation' => 'Business Person',
                'mother_occupation' => 'Housewife',
                'father_income_range' => '2,000,000 - 5,000,000 TZS',
                'boarding_status' => 'day',
                'stream'        => 'A',
                'previous_school' => 'Shule ya Msingi Kariakoo',
                'previous_class'  => 'Standard VII',
                'admission_date'  => '2021-01-11',
                'submitted_documents' => ['previous_certificate', 'nbc', 'at'],
                'notes'         => 'Student council member. Strong leadership qualities.',
                'scholarship_status' => 'none',
                'guardian' => [
                    'guardian_name' => 'William Lyimo',
                    'relationship'  => 'father',
                    'phone_number'  => '0765432109',
                    'email'         => 'william.lyimo@hotmail.com',
                    'occupation'    => 'Business Person',
                    'employer'      => 'Lyimo Traders Ltd.',
                    'is_primary_contact' => true,
                    'is_emergency_contact' => true,
                    'password'      => 'Lyimo@2024',
                ],
            ],
            [
                'first_name'    => 'Mohamed',
                'middle_name'   => 'Ali',
                'last_name'     => 'Salim',
                'gender'        => 'male',
                'date_of_birth' => '2009-05-18',
                'phone'         => '+255699876543',
                'email'         => 'mohamed.salim.student@edutanzania.ac.tz',
                'address'       => 'Temeke, Mbagala, Dar es Salaam',
                'region'        => 'Dar es Salaam',
                'district'      => 'Temeke',
                'ward'          => 'Mbagala',
                'village'       => 'Mbagala Kizuiani',
                'religion'      => 'Islam',
                'nationality'   => 'Tanzanian',
                'blood_group'   => 'AB+',
                'father_name'   => 'Ali Juma Salim',
                'mother_name'   => 'Mwanahamisi Ali',
                'father_occupation' => 'Driver',
                'mother_occupation' => 'Merchant',
                'father_income_range' => 'Below 500,000 TZS',
                'boarding_status' => 'day',
                'stream'        => 'C',
                'previous_school' => 'Mbagala Primary School',
                'previous_class'  => 'Standard VII',
                'admission_date'  => '2022-01-10',
                'submitted_documents' => ['previous_certificate', 'nbc'],
                'notes'         => 'Enjoys art and creative activities. Requires extra attention in Mathematics.',
                'scholarship_status' => 'full',
                'scholarship_amount' => '500000',
                'guardian' => [
                    'guardian_name' => 'Ali Juma Salim',
                    'relationship'  => 'father',
                    'phone_number'  => '0699876543',
                    'email'         => 'ali.salim.tz@gmail.com',
                    'occupation'    => 'Driver',
                    'employer'      => 'Dar Rapid Transit',
                    'is_primary_contact' => true,
                    'is_emergency_contact' => true,
                    'password'      => 'Salim@2024',
                ],
            ],
            [
                'first_name'    => 'Happiness',
                'middle_name'   => 'Robert',
                'last_name'     => 'Mushi',
                'gender'        => 'female',
                'date_of_birth' => '2008-02-28',
                'phone'         => '+255784567890',
                'email'         => 'happiness.mushi.student@edutanzania.ac.tz',
                'address'       => 'Arusha City, Arusha Rural, Arusha',
                'region'        => 'Arusha',
                'district'      => 'Arusha City',
                'ward'          => 'Arusha Rural',
                'village'       => 'Lemara Village',
                'religion'      => 'Christianity',
                'nationality'   => 'Tanzanian',
                'blood_group'   => 'O-',
                'father_name'   => 'Robert John Mushi',
                'mother_name'   => 'Prisca Robert Mushi',
                'father_occupation' => 'Engineer',
                'mother_occupation' => 'Doctor',
                'father_income_range' => 'Above 5,000,000 TZS',
                'boarding_status' => 'semi_boarding',
                'stream'        => 'A',
                'previous_school' => 'Arusha International School',
                'previous_class'  => 'Grade 7',
                'admission_date'  => '2023-01-09',
                'submitted_documents' => ['previous_certificate', 'tc', 'nbc', 'at', 'testimonial'],
                'notes'         => 'Top performer academically. Excels in science subjects. Participates in robotics club.',
                'scholarship_status' => 'none',
                'guardian' => [
                    'guardian_name' => 'Robert John Mushi',
                    'relationship'  => 'father',
                    'phone_number'  => '0784567890',
                    'email'         => 'robert.mushi@engtz.com',
                    'occupation'    => 'Civil Engineer',
                    'employer'      => 'TANROADS',
                    'is_primary_contact' => true,
                    'is_emergency_contact' => true,
                    'password'      => 'Mushi@2024',
                ],
            ],
            [
                'first_name'    => 'Baraka',
                'middle_name'   => 'Daniel',
                'last_name'     => 'Mwalimu',
                'gender'        => 'male',
                'date_of_birth' => '2007-09-12',
                'phone'         => '+255723456789',
                'email'         => 'baraka.mwalimu.student@edutanzania.ac.tz',
                'address'       => 'Dodoma Municipal, Dodoma',
                'region'        => 'Dodoma',
                'district'      => 'Dodoma Municipal',
                'ward'          => 'Chamwino',
                'village'       => 'Nzuguni',
                'religion'      => 'Christianity',
                'nationality'   => 'Tanzanian',
                'blood_group'   => 'A-',
                'father_name'   => 'Daniel Baraka Mwalimu',
                'mother_name'   => 'Agnes Baraka Mwalimu',
                'father_occupation' => 'Government Officer',
                'mother_occupation' => 'Businesswoman',
                'father_income_range' => '1,000,000 - 2,000,000 TZS',
                'boarding_status' => 'boarding',
                'stream'        => 'B',
                'previous_school' => 'Dodoma Primary School',
                'previous_class'  => 'Standard VII',
                'admission_date'  => '2020-01-13',
                'submitted_documents' => ['previous_certificate', 'tc', 'nbc'],
                'notes'         => 'Excellent debater. Represents school in inter-school debates.',
                'scholarship_status' => 'none',
                'guardian' => [
                    'guardian_name' => 'Daniel Baraka Mwalimu',
                    'relationship'  => 'father',
                    'phone_number'  => '0723456789',
                    'email'         => 'daniel.mwalimu.gov@tz.go.tz',
                    'occupation'    => 'Government Officer',
                    'employer'      => 'Ministry of Education',
                    'is_primary_contact' => true,
                    'is_emergency_contact' => true,
                    'password'      => 'Mwalimu@2024',
                ],
            ],
            [
                'first_name'    => 'Grace',
                'middle_name'   => 'Peter',
                'last_name'     => 'Makundi',
                'gender'        => 'female',
                'date_of_birth' => '2009-12-01',
                'phone'         => '+255745678901',
                'email'         => 'grace.makundi.student@edutanzania.ac.tz',
                'address'       => 'Mwanza, Nyamagana, Mwanza',
                'region'        => 'Mwanza',
                'district'      => 'Nyamagana',
                'ward'          => 'Nyamagana',
                'village'       => 'Buswelu',
                'religion'      => 'Christianity',
                'nationality'   => 'Tanzanian',
                'blood_group'   => 'B-',
                'father_name'   => 'Peter Makundi',
                'mother_name'   => 'Dorothy Peter Makundi',
                'father_occupation' => 'Fisherman',
                'mother_occupation' => 'Seamstress',
                'father_income_range' => 'Below 500,000 TZS',
                'boarding_status' => 'boarding',
                'stream'        => 'A',
                'previous_school' => 'Nyamagana Primary School',
                'previous_class'  => 'Standard VII',
                'admission_date'  => '2022-01-10',
                'submitted_documents' => ['previous_certificate', 'nbc'],
                'notes'         => 'Hardworking student from humble background. Requires financial support.',
                'scholarship_status' => 'partial',
                'scholarship_amount' => '350000',
                'guardian' => [
                    'guardian_name' => 'Peter Makundi',
                    'relationship'  => 'father',
                    'phone_number'  => '0745678901',
                    'email'         => null,
                    'occupation'    => 'Fisherman',
                    'employer'      => 'Self-employed',
                    'is_primary_contact' => true,
                    'is_emergency_contact' => true,
                    'password'      => 'Makundi@2024',
                ],
            ],
            [
                'first_name'    => 'Juma',
                'middle_name'   => 'Hassan',
                'last_name'     => 'Omari',
                'gender'        => 'male',
                'date_of_birth' => '2008-04-30',
                'phone'         => '+255787654321',
                'email'         => 'juma.omari.student@edutanzania.ac.tz',
                'address'       => 'Tanga City, Tanga',
                'region'        => 'Tanga',
                'district'      => 'Tanga City',
                'ward'          => 'Tanga City',
                'village'       => 'Nguvumali',
                'religion'      => 'Islam',
                'nationality'   => 'Tanzanian',
                'blood_group'   => 'O+',
                'father_name'   => 'Hassan Juma Omari',
                'mother_name'   => 'Saumu Hassan Omari',
                'father_occupation' => 'Port Worker',
                'mother_occupation' => 'Saleswoman',
                'father_income_range' => '500,000 - 1,000,000 TZS',
                'boarding_status' => 'boarding',
                'stream'        => 'C',
                'previous_school' => 'Tanga Primary School',
                'previous_class'  => 'Standard VII',
                'admission_date'  => '2021-01-11',
                'submitted_documents' => ['previous_certificate', 'nbc', 'testimonial'],
                'notes'         => 'Excellent in Kiswahili literature. Participates in cultural activities.',
                'scholarship_status' => 'none',
                'guardian' => [
                    'guardian_name' => 'Hassan Juma Omari',
                    'relationship'  => 'father',
                    'phone_number'  => '0787654321',
                    'email'         => 'hassan.omari@tanga.co.tz',
                    'occupation'    => 'Port Worker',
                    'employer'      => 'Tanzania Ports Authority',
                    'is_primary_contact' => true,
                    'is_emergency_contact' => true,
                    'password'      => 'Omari@2024',
                ],
            ],
            [
                'first_name'    => 'Rehema',
                'middle_name'   => 'Abdallah',
                'last_name'     => 'Kiondo',
                'gender'        => 'female',
                'date_of_birth' => '2007-08-15',
                'phone'         => '+255756789345',
                'email'         => 'rehema.kiondo.student@edutanzania.ac.tz',
                'address'       => 'Iringa Municipal, Iringa',
                'region'        => 'Iringa',
                'district'      => 'Iringa Municipal',
                'ward'          => 'Iringa Municipal',
                'village'       => 'Gangilonga',
                'religion'      => 'Christianity',
                'nationality'   => 'Tanzanian',
                'blood_group'   => 'A+',
                'father_name'   => 'Abdallah Kiondo',
                'mother_name'   => 'Maria Kiondo',
                'father_occupation' => 'Shopkeeper',
                'mother_occupation' => 'Farmer',
                'father_income_range' => '500,000 - 1,000,000 TZS',
                'boarding_status' => 'boarding',
                'stream'        => 'A',
                'previous_school' => 'Iringa Primary School',
                'previous_class'  => 'Standard VII',
                'admission_date'  => '2020-01-13',
                'submitted_documents' => ['previous_certificate', 'tc', 'nbc'],
                'notes'         => 'Great musician. Plays guitar and participates in school choir.',
                'scholarship_status' => 'none',
                'guardian' => [
                    'guardian_name' => 'Abdallah Kiondo',
                    'relationship'  => 'father',
                    'phone_number'  => '0756789345',
                    'email'         => null,
                    'occupation'    => 'Shopkeeper',
                    'employer'      => 'Self-employed',
                    'is_primary_contact' => true,
                    'is_emergency_contact' => true,
                    'password'      => 'Kiondo@2024',
                ],
            ],
            [
                'first_name'    => 'Samuel',
                'middle_name'   => 'Elias',
                'last_name'     => 'Nkosi',
                'gender'        => 'male',
                'date_of_birth' => '2010-01-20',
                'phone'         => '+255712378945',
                'email'         => 'samuel.nkosi.student@edutanzania.ac.tz',
                'address'       => 'Mbeya City, Mbeya',
                'region'        => 'Mbeya',
                'district'      => 'Mbeya City',
                'ward'          => 'Mbeya City',
                'village'       => 'Mwanjelwa',
                'religion'      => 'Christianity',
                'nationality'   => 'Tanzanian',
                'blood_group'   => 'B+',
                'father_name'   => 'Elias Nkosi',
                'mother_name'   => 'Florence Elias Nkosi',
                'father_occupation' => 'Police Officer',
                'mother_occupation' => 'Secondary School Teacher',
                'father_income_range' => '1,000,000 - 2,000,000 TZS',
                'boarding_status' => 'day',
                'stream'        => 'B',
                'previous_school' => 'Mbeya Primary School',
                'previous_class'  => 'Standard VII',
                'admission_date'  => '2023-01-09',
                'submitted_documents' => ['previous_certificate', 'nbc', 'at'],
                'notes'         => 'Youngest in class but very bright. Top 5 in school exams.',
                'scholarship_status' => 'none',
                'guardian' => [
                    'guardian_name' => 'Elias Nkosi',
                    'relationship'  => 'father',
                    'phone_number'  => '0712378945',
                    'email'         => 'elias.nkosi.police@tz.go.tz',
                    'occupation'    => 'Police Officer',
                    'employer'      => 'Tanzania Police Force',
                    'is_primary_contact' => true,
                    'is_emergency_contact' => true,
                    'password'      => 'Nkosi@2024',
                ],
            ],
        ];

        foreach ($students as $index => $studentData) {
            $classToUse = $classes[$index % count($classes)] ?? SchoolClass::where('school_id', $school->id)->first();
            if (!$classToUse) {
                $this->command->warn("No class found. Skipping student {$studentData['first_name']}");
                continue;
            }

            // Generate student number
            $studentNumber = 'TZ' . date('Y') . str_pad($school->id, 2, '0', STR_PAD_LEFT) . str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT);

            $fullName = trim(implode(' ', array_filter([
                $studentData['first_name'],
                $studentData['middle_name'],
                $studentData['last_name'],
            ])));

            // Create student user (avoid duplicate emails)
            if (User::where('email', $studentData['email'])->exists()) {
                $this->command->line("Skipping {$fullName} — email already exists.");
                continue;
            }

            $student = User::create([
                'name'           => $fullName,
                'email'          => $studentData['email'],
                'phone'          => $studentData['phone'],
                'role'           => 'student',
                'school_id'      => $school->id,
                'student_number' => $studentNumber,
                'date_of_birth'  => $studentData['date_of_birth'],
                'gender'         => $studentData['gender'],
                'address'        => $studentData['address'],
                'profile_photo'  => null,
                'is_active'      => true,
                'password'       => Hash::make($studentNumber),
            ]);

            // Create student profile
            $student->studentProfile()->create([
                'admission_number'               => $studentNumber,
                'admission_date'                 => $studentData['admission_date'],
                'class_id'                       => $classToUse->id,
                'stream'                         => $studentData['stream'],
                'boarding_status'                => $studentData['boarding_status'],
                'transport_route'                => null,
                'previous_school'                => $studentData['previous_school'],
                'previous_class'                 => $studentData['previous_class'],
                'transfer_reason'                => null,
                'allergies'                      => null,
                'medications'                    => null,
                'emergency_contact_name'         => $studentData['guardian']['guardian_name'],
                'emergency_contact_phone'        => '+255' . ltrim($studentData['guardian']['phone_number'], '0'),
                'emergency_contact_relationship' => $studentData['guardian']['relationship'],
                'special_needs'                  => null,
                'medical_info'                   => null,
                'scholarship_status'             => $studentData['scholarship_status'],
                'scholarship_amount'             => $studentData['scholarship_amount'] ?? 0,
                'family_income_range'            => $studentData['father_income_range'],
                'extracurricular_activities'     => null,
                'notes'                          => $studentData['notes'],
                'father_name'                    => $studentData['father_name'],
                'mother_name'                    => $studentData['mother_name'],
                'father_occupation'              => $studentData['father_occupation'],
                'mother_occupation'              => $studentData['mother_occupation'],
                'father_income_range'            => $studentData['father_income_range'],
                'blood_group'                    => $studentData['blood_group'],
                'religion'                       => $studentData['religion'],
                'nationality'                    => $studentData['nationality'],
                'country'                        => 'Tanzania',
                'region'                         => $studentData['region'],
                'district'                       => $studentData['district'],
                'ward'                           => $studentData['ward'],
                'village'                        => $studentData['village'],
                'address_details'                => null,
                'submitted_documents'            => $studentData['submitted_documents'],
                'uploaded_documents'             => [],
            ]);

            // Create guardian
            $guardianData = $studentData['guardian'];
            $guardianUserId = null;

            if (!empty($guardianData['email'])) {
                $existingGuardianUser = User::where('email', $guardianData['email'])->first();
                if ($existingGuardianUser) {
                    $guardianUserId = $existingGuardianUser->id;
                } else {
                    $parentUser = User::create([
                        'name'           => $guardianData['guardian_name'],
                        'email'          => $guardianData['email'],
                        'phone'          => '+255' . ltrim($guardianData['phone_number'], '0'),
                        'role'           => 'parent',
                        'school_id'      => $school->id,
                        'address'        => $studentData['address'],
                        'profile_photo'  => null,
                        'is_active'      => true,
                        'password'       => Hash::make($guardianData['password']),
                    ]);
                    $guardianUserId = $parentUser->id;
                }
            }

            StudentGuardian::create([
                'student_id'           => $student->id,
                'guardian_name'        => $guardianData['guardian_name'],
                'relationship'         => $guardianData['relationship'],
                'phone_number'         => $guardianData['phone_number'],
                'email'                => $guardianData['email'],
                'occupation'           => $guardianData['occupation'],
                'employer'             => $guardianData['employer'],
                'address'              => $studentData['address'],
                'is_primary_contact'   => $guardianData['is_primary_contact'],
                'is_emergency_contact' => $guardianData['is_emergency_contact'],
                'is_active'            => true,
                'photo'                => null,
            ]);

            if ($guardianUserId) {
                $student->update(['parent_id' => $guardianUserId]);
            }

            $this->command->line("✓ Created student: {$fullName} [{$studentNumber}] — Class: {$classToUse->name}/{$studentData['stream']}");
        }

        $this->command->info('✅ SampleStudentSeeder completed. ' . count($students) . ' sample students seeded.');
    }
}
