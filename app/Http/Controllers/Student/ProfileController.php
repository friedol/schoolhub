<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\StudentGuardian;
use App\Models\StudentMedicalRecord;
use App\Models\StudentDisciplinaryRecord;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Display a listing of student profiles
     */
    public function index()
    {
        $students = User::where('school_id', Auth::user()->school_id)
            ->where('role', 'student')
            ->with([
                'guardians',
                'medicalRecords',
                'disciplinaryRecords',
                'studentProfile',
                'studentProfile.schoolClass',
            ])
            ->withSum('invoices as outstanding_balance', 'balance_amount')
            ->orderBy('created_at', 'desc')
            ->paginate(100); // Larger pagination page to accommodate lists nicely

        $classes = SchoolClass::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'level']);

        $feeCategories = \App\Models\FeeCategory::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->get(['id', 'name', 'amount']);

        $feeItems = \App\Models\FeeItem::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->get(['id', 'name', 'category']);

        return Inertia::render('Student/Profiles/Index', [
            'students' => $students,
            'classes'  => $classes,
            'feeCategories' => $feeCategories,
            'feeItems' => $feeItems,
        ]);
    }

    /**
     * Show the form for creating a new student profile
     */
    public function create()
    {
        $classes = SchoolClass::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->get();

        return Inertia::render('Student/Profiles/Create', [
            'classes' => $classes
        ]);
    }

    /**
     * Store a newly created student profile
     */
    public function store(Request $request)
    {
        $request->validate([
            // Personal
            'first_name'                    => 'required|string|max:255',
            'middle_name'                   => 'nullable|string|max:255',
            'last_name'                     => 'required|string|max:255',
            'email'                         => 'nullable|email|unique:users,email',
            'phone'                         => 'nullable|string|max:20',
            'date_of_birth'                 => 'required|date|before:today',
            'gender'                        => 'required|in:male,female',
            'nationality'                   => 'nullable|string|max:100',
            'religion'                      => 'nullable|string|max:100',
            'address'                       => 'required|string|max:500',
            'region'                        => 'nullable|string|max:100',
            'district'                      => 'nullable|string|max:100',
            'ward'                          => 'nullable|string|max:100',
            // Academic
            'school_class_id'               => 'required|exists:school_classes,id',
            'stream'                        => 'nullable|string|max:100',
            'admission_date'                => 'required|date',
            'boarding_status'               => 'required|in:day,boarding,semi_boarding',
            'transport_route'               => 'nullable|string|max:255',
            'previous_school'               => 'nullable|string|max:255',
            'previous_class'                => 'nullable|string|max:100',
            'transfer_reason'               => 'nullable|string|max:1000',
            // Medical
            'allergies'                     => 'nullable|string|max:1000',
            'medications'                   => 'nullable|string|max:1000',
            'medical_conditions'            => 'nullable|string|max:1000',
            'special_needs'                 => 'nullable|string|max:1000',
            'emergency_contact_name'        => 'nullable|string|max:255',
            'emergency_contact_phone'       => 'nullable|string|max:20',
            'emergency_contact_relationship'=> 'nullable|string|max:100',
            // Additional
            'scholarship_status'            => 'nullable|string|max:50',
            'scholarship_amount'            => 'nullable|numeric|min:0',
            'family_income_range'           => 'nullable|string|max:50',
            'extracurricular_activities'    => 'nullable|string|max:1000',
            'notes'                         => 'nullable|string|max:2000',
            // Guardians
            'guardians'                             => 'required|array|min:1',
            'guardians.*.guardian_name'             => 'required|string|max:255',
            'guardians.*.relationship'              => 'required|string|max:100',
            'guardians.*.phone_number'              => 'required|string|max:20',
            'guardians.*.email'                     => 'nullable|email',
            'guardians.*.occupation'                => 'nullable|string|max:255',
            'guardians.*.employer'                  => 'nullable|string|max:255',
            'guardians.*.is_primary_contact'        => 'nullable',
            'guardians.*.is_emergency_contact'      => 'nullable',
            'guardians.*.password'                  => 'nullable|string|min:8|same:guardians.*.password_confirm',
            'guardians.*.password_confirm'          => 'nullable|string|min:8',
            
            // New extra fields validation
            'father_name'                    => 'nullable|string|max:255',
            'mother_name'                    => 'nullable|string|max:255',
            'father_occupation'              => 'nullable|string|max:255',
            'mother_occupation'              => 'nullable|string|max:255',
            'father_income_range'            => 'nullable|string|max:255',
            'blood_group'                    => 'nullable|string|max:10',
            'country'                        => 'nullable|string|max:100',
            'village'                        => 'nullable|string|max:100',
            'address_details'                => 'nullable|string|max:500',
            'submitted_documents'            => 'nullable|array',
            'profile_photo'                  => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
            'documents'                      => 'nullable|array',
            'documents.*'                    => 'nullable|file|mimes:pdf|max:10240',
            'guardians.*.photo'              => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
        ]);

        $studentNumber = $this->generateStudentNumber();

        $fullName = trim(implode(' ', array_filter([
            $request->first_name,
            $request->middle_name,
            $request->last_name,
        ])));

        // Handle student profile photo
        $profilePhotoPath = null;
        if ($request->hasFile('profile_photo')) {
            $profilePhotoPath = $request->file('profile_photo')->store('student_photos', 'public');
        }

        // Create student user
        $student = User::create([
            'name'           => $fullName,
            'email'          => $request->email ?: ('student_' . time() . '_' . rand(1000, 9999) . '@noemail.local'),
            'phone'          => $request->phone,
            'role'           => 'student',
            'school_id'      => Auth::user()->school_id,
            'student_number' => $studentNumber,
            'date_of_birth'  => $request->date_of_birth,
            'gender'         => $request->gender,
            'address'        => $request->address,
            'profile_photo'  => $profilePhotoPath,
            'is_active'      => true,
            'password'       => bcrypt($studentNumber), // default password = student number
        ]);

        // Handle PDF document uploads
        $uploadedDocs = [];
        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $file) {
                $fileName = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('student_documents', $fileName, 'public');
                $uploadedDocs[] = [
                    'name' => $file->getClientOriginalName(),
                    'path' => $path
                ];
            }
        }

        // Create student profile with ALL fields
        $student->studentProfile()->create([
            'admission_number'               => $studentNumber,
            'admission_date'                 => $request->admission_date,
            'class_id'                       => $request->school_class_id,
            'stream'                         => $request->stream,
            'boarding_status'                => $request->boarding_status ?? 'day',
            'transport_route'                => $request->transport_route,
            'previous_school'                => $request->previous_school,
            'previous_class'                 => $request->previous_class,
            'transfer_reason'                => $request->transfer_reason,
            'allergies'                      => $request->allergies,
            'medications'                    => $request->medications,
            'emergency_contact_name'         => $request->emergency_contact_name,
            'emergency_contact_phone'        => $request->emergency_contact_phone,
            'emergency_contact_relationship' => $request->emergency_contact_relationship,
            'special_needs'                  => $request->special_needs ? ['description' => $request->special_needs] : null,
            'medical_info'                   => $request->medical_conditions ? ['conditions' => $request->medical_conditions] : null,
            'scholarship_status'             => $request->scholarship_status ?? 'none',
            'scholarship_amount'             => $request->scholarship_amount ?? 0,
            'family_income_range'            => $request->family_income_range,
            'extracurricular_activities'     => $request->extracurricular_activities ? ['activities' => $request->extracurricular_activities] : null,
            'notes'                          => $request->notes,

            // New extra fields
            'father_name'                    => $request->father_name,
            'mother_name'                    => $request->mother_name,
            'father_occupation'              => $request->father_occupation,
            'mother_occupation'              => $request->mother_occupation,
            'father_income_range'            => $request->father_income_range,
            'blood_group'                    => $request->blood_group,
            'religion'                       => $request->religion,
            'nationality'                    => $request->nationality,
            'country'                        => $request->country,
            'region'                         => $request->region,
            'district'                       => $request->district,
            'ward'                           => $request->ward,
            'village'                        => $request->village,
            'address_details'                => $request->address_details,
            'submitted_documents'            => $request->submitted_documents ?? [],
            'uploaded_documents'             => $uploadedDocs,
        ]);

        // Create guardians
        $primaryParentId = null;
        foreach ($request->guardians as $index => $g) {
            $guardianPhotoPath = null;
            if ($request->hasFile("guardians.{$index}.photo")) {
                $guardianPhotoPath = $request->file("guardians.{$index}.photo")->store('guardian_photos', 'public');
            }

            $guardianUserId = null;
            if (!empty($g['email'])) {
                $existingUser = User::where('email', strtolower($g['email']))->first();
                if ($existingUser) {
                    $guardianUserId = $existingUser->id;
                    if ($existingUser->role !== 'parent') {
                        $existingUser->update(['role' => 'parent']);
                    }
                } else {
                    $parentUser = User::create([
                        'name'           => $g['guardian_name'],
                        'email'          => strtolower($g['email']),
                        'phone'          => $g['phone_number'],
                        'role'           => 'parent',
                        'school_id'      => Auth::user()->school_id,
                        'address'        => $g['address'] ?? null,
                        'profile_photo'  => $guardianPhotoPath,
                        'is_active'      => true,
                        'password'       => bcrypt($g['password'] ?? 'OpenSCParent'),
                    ]);
                    $guardianUserId = $parentUser->id;
                }
            }

            if (filter_var($g['is_primary_contact'] ?? false, FILTER_VALIDATE_BOOLEAN) && $guardianUserId) {
                $primaryParentId = $guardianUserId;
            }

            StudentGuardian::create([
                'student_id'          => $student->id,
                'guardian_name'       => $g['guardian_name'],
                'relationship'        => $g['relationship'],
                'phone_number'        => $g['phone_number'],
                'email'               => $g['email'] ?? null,
                'occupation'          => $g['occupation'] ?? null,
                'employer'            => $g['employer'] ?? null,
                'address'             => $g['address'] ?? null,
                'is_primary_contact'  => filter_var($g['is_primary_contact'] ?? false, FILTER_VALIDATE_BOOLEAN),
                'is_emergency_contact'=> filter_var($g['is_emergency_contact'] ?? false, FILTER_VALIDATE_BOOLEAN),
                'is_active'           => true,
                'photo'               => $guardianPhotoPath,
            ]);
        }

        if ($primaryParentId) {
            $student->update(['parent_id' => $primaryParentId]);
        }

        return redirect()->route('student.profiles.index')
            ->with('success', "Student '{$fullName}' registered successfully. Student number: {$studentNumber}");
    }

    /**
     * Display the specified student profile
     */
    public function show(User $student)
    {
        $student->load([
            'guardians',
            'medicalRecords',
            'disciplinaryRecords',
            'disciplinaryRecords.teacher',
            'studentProfile',
            'studentProfile.schoolClass',
        ]);

        // Only show students from the same school
        abort_if($student->school_id !== Auth::user()->school_id, 403);

        return Inertia::render('Student/Profiles/Show', [
            'student' => $student,
        ]);
    }

    /**
     * Show the form for editing the student profile
     */
    public function edit(User $student)
    {
        $student->load(['guardians', 'medicalRecords', 'studentProfile']);

        $classes = SchoolClass::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->get();

        return Inertia::render('Student/Profiles/Edit', [
            'student' => $student,
            'classes' => $classes
        ]);
    }

    /**
     * Update the specified student profile
     */
    public function update(Request $request, User $student)
    {
        $request->validate([
            'first_name'                    => 'required|string|max:255',
            'middle_name'                   => 'nullable|string|max:255',
            'last_name'                     => 'required|string|max:255',
            'email'                         => 'nullable|email|unique:users,email,' . $student->id,
            'phone'                         => 'nullable|string|max:20',
            'date_of_birth'                 => 'required|date',
            'gender'                        => 'required|in:male,female',
            'nationality'                   => 'nullable|string|max:100',
            'religion'                      => 'nullable|string|max:100',
            'address'                       => 'required|string|max:500',
            'region'                        => 'nullable|string|max:100',
            'district'                      => 'nullable|string|max:100',
            'ward'                          => 'nullable|string|max:100',
            'school_class_id'               => 'required|exists:school_classes,id',
            'stream'                        => 'nullable|string|max:100',
            'boarding_status'               => 'nullable|in:day,boarding,semi_boarding',
            'transport_route'               => 'nullable|string|max:255',
            'previous_school'               => 'nullable|string|max:255',
            'previous_class'                => 'nullable|string|max:100',
            'transfer_reason'               => 'nullable|string|max:1000',
            'allergies'                     => 'nullable|string|max:1000',
            'medications'                   => 'nullable|string|max:1000',
            'medical_conditions'            => 'nullable|string|max:1000',
            'special_needs'                 => 'nullable|string|max:1000',
            'emergency_contact_name'        => 'nullable|string|max:255',
            'emergency_contact_phone'       => 'nullable|string|max:20',
            'emergency_contact_relationship'=> 'nullable|string|max:100',
            'scholarship_status'            => 'nullable|string|max:50',
            'scholarship_amount'            => 'nullable|numeric|min:0',
            'family_income_range'           => 'nullable|string|max:50',
            'extracurricular_activities'    => 'nullable|string|max:1000',
            'notes'                         => 'nullable|string|max:2000',

            // New extra fields validation in update
            'father_name'                    => 'nullable|string|max:255',
            'mother_name'                    => 'nullable|string|max:255',
            'father_occupation'              => 'nullable|string|max:255',
            'mother_occupation'              => 'nullable|string|max:255',
            'father_income_range'            => 'nullable|string|max:255',
            'blood_group'                    => 'nullable|string|max:10',
            'country'                        => 'nullable|string|max:100',
            'village'                        => 'nullable|string|max:100',
            'address_details'                => 'nullable|string|max:500',
            'submitted_documents'            => 'nullable|array',
            'profile_photo'                  => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
            'documents'                      => 'nullable|array',
            'documents.*'                    => 'nullable|file|mimes:pdf|max:10240',
        ]);

        $fullName = trim(implode(' ', array_filter([
            $request->first_name,
            $request->middle_name,
            $request->last_name,
        ])));

        // Handle profile photo update
        $profilePhoto = $student->profile_photo;
        if ($request->hasFile('profile_photo')) {
            if ($profilePhoto) {
                Storage::disk('public')->delete($profilePhoto);
            }
            $profilePhoto = $request->file('profile_photo')->store('student_photos', 'public');
        }

        $student->update([
            'name'          => $fullName,
            'email'         => $request->email ?: $student->email,
            'phone'         => $request->phone,
            'date_of_birth' => $request->date_of_birth,
            'gender'        => $request->gender,
            'address'       => $request->address,
            'profile_photo' => $profilePhoto,
        ]);

        // Handle PDF document updates (appends to existing)
        $uploadedDocs = $student->studentProfile?->uploaded_documents ?? [];
        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $file) {
                $fileName = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('student_documents', $fileName, 'public');
                $uploadedDocs[] = [
                    'name' => $file->getClientOriginalName(),
                    'path' => $path
                ];
            }
        }

        if ($student->studentProfile) {
            $student->studentProfile->update([
                'class_id'                       => $request->school_class_id,
                'stream'                         => $request->stream,
                'boarding_status'                => $request->boarding_status ?? 'day',
                'transport_route'                => $request->transport_route,
                'previous_school'                => $request->previous_school,
                'previous_class'                 => $request->previous_class,
                'transfer_reason'                => $request->transfer_reason,
                'allergies'                      => $request->allergies,
                'medications'                    => $request->medications,
                'emergency_contact_name'         => $request->emergency_contact_name,
                'emergency_contact_phone'        => $request->emergency_contact_phone,
                'emergency_contact_relationship' => $request->emergency_contact_relationship,
                'special_needs'                  => $request->special_needs ? ['description' => $request->special_needs] : null,
                'medical_info'                   => $request->medical_conditions ? ['conditions' => $request->medical_conditions] : null,
                'scholarship_status'             => $request->scholarship_status,
                'scholarship_amount'             => $request->scholarship_amount ?? 0,
                'family_income_range'            => $request->family_income_range,
                'extracurricular_activities'     => $request->extracurricular_activities ? ['activities' => $request->extracurricular_activities] : null,
                'notes'                          => $request->notes,

                // New extra fields
                'father_name'                    => $request->father_name,
                'mother_name'                    => $request->mother_name,
                'father_occupation'              => $request->father_occupation,
                'mother_occupation'              => $request->mother_occupation,
                'father_income_range'            => $request->father_income_range,
                'blood_group'                    => $request->blood_group,
                'religion'                       => $request->religion,
                'nationality'                    => $request->nationality,
                'country'                        => $request->country,
                'region'                         => $request->region,
                'district'                       => $request->district,
                'ward'                           => $request->ward,
                'village'                        => $request->village,
                'address_details'                => $request->address_details,
                'submitted_documents'            => $request->submitted_documents ?? [],
                'uploaded_documents'             => $uploadedDocs,
            ]);
        } else {
            $student->studentProfile()->create([
                'admission_number'               => $student->student_number,
                'admission_date'                 => now()->toDateString(),
                'class_id'                       => $request->school_class_id,
                'father_name'                    => $request->father_name,
                'mother_name'                    => $request->mother_name,
                'father_occupation'              => $request->father_occupation,
                'mother_occupation'              => $request->mother_occupation,
                'father_income_range'            => $request->father_income_range,
                'blood_group'                    => $request->blood_group,
                'religion'                       => $request->religion,
                'nationality'                    => $request->nationality,
                'country'                        => $request->country,
                'region'                         => $request->region,
                'district'                       => $request->district,
                'ward'                           => $request->ward,
                'village'                        => $request->village,
                'address_details'                => $request->address_details,
                'submitted_documents'            => $request->submitted_documents ?? [],
                'uploaded_documents'             => $uploadedDocs,
            ]);
        }

        return redirect()->route('student.profiles.show', $student)
            ->with('success', 'Student profile updated successfully.');
    }

    /**
     * Add guardian to student
     */
    public function addGuardian(Request $request, User $student)
    {
        $request->validate([
            'guardian_name' => 'required|string|max:255',
            'relationship' => 'required|string',
            'phone_number' => 'required|string|max:20',
            'email' => 'nullable|email',
            'occupation' => 'nullable|string|max:255',
            'employer' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
            'is_primary_contact' => 'boolean',
            'is_emergency_contact' => 'boolean',
        ]);

        StudentGuardian::create([
            'student_id' => $student->id,
            'guardian_name' => $request->guardian_name,
            'relationship' => $request->relationship,
            'phone_number' => $request->phone_number,
            'email' => $request->email,
            'occupation' => $request->occupation,
            'employer' => $request->employer,
            'address' => $request->address,
            'is_primary_contact' => $request->is_primary_contact ?? false,
            'is_emergency_contact' => $request->is_emergency_contact ?? false,
        ]);

        return redirect()->route('student.profiles.show', $student)
            ->with('success', 'Guardian added successfully.');
    }

    /**
     * Add medical record to student
     */
    public function addMedicalRecord(Request $request, User $student)
    {
        $request->validate([
            'record_type' => 'required|string',
            'condition_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'severity' => 'nullable|string',
            'diagnosis_date' => 'nullable|date',
            'treatment' => 'nullable|string',
            'medications' => 'nullable|array',
            'allergies' => 'nullable|array',
            'dietary_restrictions' => 'nullable|array',
            'emergency_instructions' => 'nullable|string',
            'doctor_name' => 'nullable|string|max:255',
            'doctor_contact' => 'nullable|string|max:255',
        ]);

        StudentMedicalRecord::create([
            'student_id' => $student->id,
            'record_type' => $request->record_type,
            'condition_name' => $request->condition_name,
            'description' => $request->description,
            'severity' => $request->severity,
            'diagnosis_date' => $request->diagnosis_date,
            'treatment' => $request->treatment,
            'medications' => $request->medications,
            'allergies' => $request->allergies,
            'dietary_restrictions' => $request->dietary_restrictions,
            'emergency_instructions' => $request->emergency_instructions,
            'doctor_name' => $request->doctor_name,
            'doctor_contact' => $request->doctor_contact,
        ]);

        return redirect()->route('student.profiles.show', $student)
            ->with('success', 'Medical record added successfully.');
    }

    /**
     * Add disciplinary record to student
     */
    public function addDisciplinaryRecord(Request $request, User $student)
    {
        $request->validate([
            'incident_date' => 'required|date',
            'incident_type' => 'required|string',
            'description' => 'required|string',
            'severity' => 'required|string',
            'action_taken' => 'required|string',
            'witnesses' => 'nullable|array',
            'parent_notified' => 'boolean',
            'follow_up_required' => 'boolean',
            'follow_up_date' => 'nullable|date|after:today',
        ]);

        StudentDisciplinaryRecord::create([
            'student_id' => $student->id,
            'incident_date' => $request->incident_date,
            'incident_type' => $request->incident_type,
            'description' => $request->description,
            'severity' => $request->severity,
            'action_taken' => $request->action_taken,
            'teacher_id' => Auth::id(),
            'witnesses' => $request->witnesses,
            'parent_notified' => $request->parent_notified ?? false,
            'follow_up_required' => $request->follow_up_required ?? false,
            'follow_up_date' => $request->follow_up_date,
        ]);

        return redirect()->route('student.profiles.show', $student)
            ->with('success', 'Disciplinary record added successfully.');
    }

    /**
     * Display a listing of parents/guardians
     */
    public function parentsIndex()
    {
        $schoolId = Auth::user()->school_id;

        $guardians = StudentGuardian::with([
                'student',
                'student.studentProfile',
                'student.studentProfile.schoolClass',
            ])
            ->whereHas('student', function ($q) use ($schoolId) {
                $q->where('school_id', $schoolId)->where('role', 'student');
            })
            ->get()
            ->map(function ($guardian) {
                $student = $guardian->student;
                $profile = $student?->studentProfile;
                $class   = $profile?->schoolClass;

                return [
                    'id'           => $guardian->id,
                    'name'         => $guardian->guardian_name,
                    'email'        => $guardian->email ?? '',
                    'phone'        => $guardian->phone_number ?? '',
                    'relationship' => $guardian->relationship,
                    'is_active'    => $guardian->is_active ?? true,
                    'student'      => [
                        'name'       => $student?->name ?? 'Unknown',
                        'class_name' => $class?->name ?? '—',
                        'section'    => $class?->stream ?? '',
                    ],
                ];
            });

        // Paginate manually so the frontend pagination shape is preserved
        $page     = request()->get('page', 1);
        $perPage  = 15;
        $total    = $guardians->count();
        $items    = $guardians->forPage($page, $perPage)->values();

        $parentsData = [
            'data'  => $items,
            'links' => [],
            'meta'  => [
                'current_page' => $page,
                'per_page'     => $perPage,
                'total'        => $total,
                'last_page'    => (int) ceil($total / $perPage),
            ],
        ];

        $classes = SchoolClass::where('school_id', $schoolId)
            ->where('is_active', true)
            ->get()
            ->map(fn($c) => [
                'id'       => $c->id,
                'name'     => $c->name,
                'sections' => $c->stream ? [['id' => $c->id, 'name' => $c->stream]] : [],
            ]);

        return Inertia::render('Student/Parents/Index', [
            'parents' => $parentsData,
            'classes' => $classes,
        ]);
    }

    /**
     * Remove the specified student profile
     */
    public function destroy(User $student)
    {
        try {
            $student->studentProfile()?->delete();
            $student->guardians()?->delete();
            $student->medicalRecords()?->delete();
            $student->disciplinaryRecords()?->delete();
            $student->delete();

            return redirect()->route('student.profiles.index')
                ->with('success', 'Student profile deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Cannot delete student profile. This student may have related records (e.g. attendance, marks, invoices).');
        }
    }

    public function toggleStatus(User $student)
    {
        $student->update([
            'is_active' => !$student->is_active
        ]);

        $statusText = $student->is_active ? 'enabled' : 'disabled';
        return redirect()->back()
            ->with('success', "Student '{$student->name}' has been {$statusText} successfully.");
    }

    /**
     * Generate unique student number
     */
    private function generateStudentNumber(): string
    {
        $school = Auth::user()->school;
        $year = date('Y');
        $prefix = $school->code ?? 'SCH';
        
        $lastStudent = User::where('school_id', $school->id)
            ->where('role', 'student')
            ->where('student_number', 'like', $prefix . '/' . $year . '/%')
            ->orderBy('student_number', 'desc')
            ->first();

        if ($lastStudent) {
            $lastNumber = (int) substr($lastStudent->student_number, -3);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . '/' . $year . '/' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
    }
}



