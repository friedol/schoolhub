<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\StudentApplication;
use App\Models\ApplicationDocument;
use App\Models\ApplicationPayment;
use App\Models\Interview;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ApplicationController extends Controller
{
    /**
     * Display a listing of student applications
     */
    public function index()
    {
        $paginator = StudentApplication::where('school_id', Auth::user()->school_id)
            ->withCount(['documents', 'payments', 'interviews'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Student/Applications/Index', [
            'applications' => [
                'data'  => $paginator->items(),
                'links' => $paginator->linkCollection()->toArray(),
                'meta'  => [
                    'current_page' => $paginator->currentPage(),
                    'per_page'     => $paginator->perPage(),
                    'total'        => $paginator->total(),
                    'last_page'    => $paginator->lastPage(),
                ],
            ],
        ]);
    }

    /**
     * Show the form for creating a new application
     */
    public function create()
    {
        $classes = SchoolClass::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->get();

        return Inertia::render('Student/Applications/Create', [
            'classes' => $classes
        ]);
    }

    /**
     * Store a newly created application
     */
    public function store(Request $request)
    {
        $request->validate([
            'first_name'        => 'required|string|max:255',
            'middle_name'       => 'nullable|string|max:255',
            'last_name'         => 'required|string|max:255',
            'date_of_birth'     => 'required|date',
            'gender'            => 'required|in:male,female',
            'nationality'       => 'nullable|string|max:255',
            'applied_class'     => 'required|string|max:255',
            'applied_academic_year' => 'required|string|max:10',
            'parent_name'       => 'required|string|max:255',
            'parent_phone'      => 'required|string|max:20',
            'parent_email'      => 'required|email|max:255',
            'parent_occupation' => 'nullable|string|max:255',
            'parent_address'    => 'required|string|max:500',
            'documents'         => 'nullable|array',
            'documents.*.type'  => 'required_with:documents|string',
            'documents.*.file'  => 'required_with:documents|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        $school = Auth::user()->school;

        $application = StudentApplication::create([
            'school_id'             => Auth::user()->school_id,
            'application_number'    => StudentApplication::generateApplicationNumber($school),
            'first_name'            => $request->first_name,
            'middle_name'           => $request->middle_name,
            'last_name'             => $request->last_name,
            'date_of_birth'         => $request->date_of_birth,
            'gender'                => $request->gender,
            'nationality'           => $request->nationality ?? 'Tanzanian',
            'applied_class'         => $request->applied_class,
            'applied_academic_year' => $request->applied_academic_year,
            'parent_name'           => $request->parent_name,
            'parent_phone'          => $request->parent_phone,
            'parent_email'          => $request->parent_email,
            'parent_occupation'     => $request->parent_occupation,
            'parent_address'        => $request->parent_address,
            'status'                => StudentApplication::STATUS_PENDING,
            'address'               => $request->parent_address, // use parent address as default
            'region'                => '',
            'district'              => '',
            'emergency_contact_name'         => $request->parent_name,
            'emergency_contact_phone'        => $request->parent_phone,
            'emergency_contact_relationship' => 'Parent',
        ]);

        // Handle document uploads
        if ($request->has('documents') && is_array($request->documents)) {
            foreach ($request->documents as $documentData) {
                $file = $documentData['file'];
                $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('application-documents', $fileName, 'public');

                ApplicationDocument::create([
                    'student_application_id' => $application->id,
                    'document_type' => $documentData['type'],
                    'file_path'     => $filePath,
                    'file_name'     => $file->getClientOriginalName(),
                    'file_size'     => $file->getSize(),
                    'mime_type'     => $file->getMimeType(),
                ]);
            }
        }

        return redirect()->route('student.applications.index')
            ->with('success', 'Application submitted successfully.');
    }


    /**
     * Display the specified application
     */
    public function show(StudentApplication $application)
    {
        $application->load(['documents', 'payments', 'interviews', 'interviews.interviewer']);

        return Inertia::render('Student/Applications/Show', [
            'application' => $application
        ]);
    }

    /**
     * Show the form for editing an application
     */
    public function edit(StudentApplication $application)
    {
        $classes = SchoolClass::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->get();

        return Inertia::render('Student/Applications/Edit', [
            'application' => $application,
            'classes'     => $classes,
        ]);
    }

    /**
     * Update the specified application
     */
    public function update(Request $request, StudentApplication $application)
    {
        $request->validate([
            'first_name'                     => 'required|string|max:255',
            'middle_name'                    => 'nullable|string|max:255',
            'last_name'                      => 'required|string|max:255',
            'date_of_birth'                  => 'required|date',
            'gender'                         => 'required|in:male,female',
            'nationality'                    => 'nullable|string|max:255',
            'religion'                       => 'nullable|string|max:255',
            'phone'                          => 'nullable|string|max:20',
            'email'                          => 'nullable|email|max:255',
            'address'                        => 'nullable|string|max:500',
            'region'                         => 'nullable|string|max:255',
            'district'                       => 'nullable|string|max:255',
            'ward'                           => 'nullable|string|max:255',
            'previous_school'                => 'nullable|string|max:255',
            'previous_class'                 => 'nullable|string|max:255',
            'reason_for_transfer'            => 'nullable|string|max:500',
            'parent_name'                    => 'required|string|max:255',
            'parent_phone'                   => 'required|string|max:20',
            'parent_email'                   => 'required|email|max:255',
            'parent_occupation'              => 'nullable|string|max:255',
            'parent_address'                 => 'required|string|max:500',
            'guardian_name'                  => 'nullable|string|max:255',
            'guardian_phone'                 => 'nullable|string|max:20',
            'guardian_email'                 => 'nullable|email|max:255',
            'guardian_relationship'          => 'nullable|string|max:255',
            'medical_conditions'             => 'nullable|string|max:1000',
            'allergies'                      => 'nullable|string|max:500',
            'emergency_contact_name'         => 'nullable|string|max:255',
            'emergency_contact_phone'        => 'nullable|string|max:20',
            'emergency_contact_relationship' => 'nullable|string|max:255',
            'applied_class'                  => 'required|string|max:255',
            'applied_academic_year'          => 'required|string|max:10',
            'notes'                          => 'nullable|string|max:2000',
        ]);

        $application->update($request->only([
            'first_name', 'middle_name', 'last_name', 'date_of_birth', 'gender',
            'nationality', 'religion', 'phone', 'email', 'address',
            'region', 'district', 'ward',
            'previous_school', 'previous_class', 'reason_for_transfer',
            'parent_name', 'parent_phone', 'parent_email', 'parent_occupation', 'parent_address',
            'guardian_name', 'guardian_phone', 'guardian_email', 'guardian_relationship',
            'medical_conditions', 'allergies',
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship',
            'applied_class', 'applied_academic_year', 'notes',
        ]));

        return redirect()->route('student.applications.show', $application)
            ->with('success', 'Application updated successfully.');
    }


    public function updateStatus(Request $request, StudentApplication $application)
    {
        $request->validate([
            'status' => 'required|in:pending,under_review,approved,rejected,withdrawn',
            'notes' => 'nullable|string',
        ]);

        $application->update([
            'status' => $request->status,
            'notes' => $request->notes,
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
        ]);

        // Send notification to parent if status changed
        if (in_array($request->status, ['approved', 'rejected'])) {
            // TODO: Send SMS/Email notification
        }

        return redirect()->route('student.applications.show', $application)
            ->with('success', 'Application status updated successfully.');
    }

    /**
     * Schedule interview
     */
    public function scheduleInterview(Request $request, StudentApplication $application)
    {
        $request->validate([
            'interview_date' => 'required|date|after:today',
            'interview_time' => 'required|date_format:H:i',
            'interviewer_id' => 'required|exists:users,id',
            'interview_type' => 'required|string',
            'location' => 'nullable|string|max:255',
        ]);

        Interview::create([
            'student_application_id' => $application->id,
            'interview_date' => $request->interview_date,
            'interview_time' => $request->interview_time,
            'interviewer_id' => $request->interviewer_id,
            'interview_type' => $request->interview_type,
            'location' => $request->location,
            'status' => Interview::STATUS_SCHEDULED,
        ]);

        return redirect()->route('student.applications.show', $application)
            ->with('success', 'Interview scheduled successfully.');
    }

    /**
     * Record interview results
     */
    public function recordInterview(Request $request, Interview $interview)
    {
        $request->validate([
            'score' => 'required|numeric|min:0|max:100',
            'max_score' => 'required|numeric|min:1',
            'comments' => 'nullable|string',
            'recommendation' => 'required|in:accept,reject,waitlist,conditional',
            'notes' => 'nullable|string',
        ]);

        $interview->update([
            'score' => $request->score,
            'max_score' => $request->max_score,
            'comments' => $request->comments,
            'recommendation' => $request->recommendation,
            'notes' => $request->notes,
            'status' => Interview::STATUS_COMPLETED,
        ]);

        return redirect()->route('student.applications.show', $interview->studentApplication)
            ->with('success', 'Interview results recorded successfully.');
    }

    /**
     * Process application payment
     */
    public function processPayment(Request $request, StudentApplication $application)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
            'transaction_id' => 'nullable|string',
            'payment_reference' => 'nullable|string',
        ]);

        ApplicationPayment::create([
            'student_application_id' => $application->id,
            'amount' => $request->amount,
            'payment_method' => $request->payment_method,
            'transaction_id' => $request->transaction_id,
            'payment_reference' => $request->payment_reference,
            'status' => ApplicationPayment::STATUS_PAID,
            'paid_at' => now(),
        ]);

        return redirect()->route('student.applications.show', $application)
            ->with('success', 'Payment recorded successfully.');
    }

    /**
     * Verify application payment
     */
    public function verifyPayment(Request $request, ApplicationPayment $payment)
    {
        $request->validate([
            'status' => 'required|in:verified,failed,refunded',
            'notes' => 'nullable|string',
        ]);

        $payment->update([
            'status' => $request->status,
            'verified_by' => Auth::id(),
            'verified_at' => now(),
            'notes' => $request->notes,
        ]);

        return redirect()->route('student.applications.show', $payment->studentApplication)
            ->with('success', 'Payment verification updated successfully.');
    }

    /**
     * Download application document
     */
    public function downloadDocument(ApplicationDocument $document)
    {
        if (!Storage::disk('public')->exists($document->file_path)) {
            abort(404, 'File not found');
        }

        return Storage::disk('public')->download($document->file_path, $document->file_name);
    }

    /**
     * Verify application document
     */
    public function verifyDocument(Request $request, ApplicationDocument $document)
    {
        $request->validate([
            'is_verified' => 'required|boolean',
            'notes' => 'nullable|string',
        ]);

        $document->update([
            'is_verified' => $request->is_verified,
            'verified_by' => Auth::id(),
            'verified_at' => now(),
            'notes' => $request->notes,
        ]);

        return redirect()->route('student.applications.show', $document->studentApplication)
            ->with('success', 'Document verification updated successfully.');
    }

    /**
     * Generate admission letter
     */
    public function generateAdmissionLetter(StudentApplication $application)
    {
        if ($application->status !== StudentApplication::STATUS_APPROVED) {
            return redirect()->route('student.applications.show', $application)
                ->with('error', 'Can only generate admission letter for approved applications.');
        }

        // TODO: Generate PDF admission letter
        return redirect()->route('student.applications.show', $application)
            ->with('success', 'Admission letter generated successfully.');
    }
}
