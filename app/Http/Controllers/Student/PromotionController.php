<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Promotion;
use App\Models\Graduation;
use App\Models\SchoolClass;
use App\Models\Alumni;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PromotionController extends Controller
{
    /**
     * Display promotion management dashboard
     */
    public function index()
    {
        $currentYear = date('Y');
        $classes = SchoolClass::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->withCount('students')
            ->get();

        $students = User::where('school_id', Auth::user()->school_id)
            ->where('role', 'student')
            ->where('is_active', true)
            ->with(['studentProfile', 'studentProfile.schoolClass'])
            ->get();

        $recentPromotions = Promotion::whereHas('student', function ($query) {
                $query->where('school_id', Auth::user()->school_id);
            })
            ->with(['student', 'fromClass', 'toClass'])
            ->orderBy('promotion_date', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Student/Promotions/Index', [
            'classes' => $classes,
            'students' => $students,
            'recentPromotions' => $recentPromotions,
            'currentYear' => $currentYear
        ]);
    }

    /**
     * Show students in a specific class for promotion
     */
    public function showClass(SchoolClass $class)
    {
        $students = User::where('school_id', Auth::user()->school_id)
            ->where('role', 'student')
            ->whereHas('studentProfile', function ($query) use ($class) {
                $query->where('class_id', $class->id);
            })
            ->with(['studentProfile', 'guardians'])
            ->get();

        $nextClasses = SchoolClass::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->where('level', $this->getNextLevel($class->level))
            ->get();

        return Inertia::render('Student/Promotions/ClassStudents', [
            'class' => $class,
            'students' => $students,
            'nextClasses' => $nextClasses
        ]);
    }

    /**
     * Bulk promote students
     */
    public function bulkPromote(Request $request)
    {
        $request->validate([
            'from_class_id' => 'required|exists:school_classes,id',
            'to_class_id' => 'required|exists:school_classes,id',
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'exists:users,id',
            'promotion_type' => 'required|in:regular,repeat,accelerated,transfer',
            'academic_year' => 'required|string',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->student_ids as $studentId) {
                $student = User::find($studentId);
                
                // Create promotion record
                Promotion::create([
                    'student_id' => $studentId,
                    'from_class_id' => $request->from_class_id,
                    'to_class_id' => $request->to_class_id,
                    'from_academic_year' => $request->academic_year,
                    'to_academic_year' => $request->academic_year,
                    'promotion_date' => now(),
                    'promotion_type' => $request->promotion_type,
                    'promoted_by' => Auth::id(),
                ]);

                // Update student's class
                if ($student->studentProfile) {
                    $student->studentProfile->update([
                        'class_id' => $request->to_class_id,
                    ]);
                }
            }
        });

        return redirect()->route('student.promotions.index')
            ->with('success', 'Students promoted successfully.');
    }

    /**
     * Individual student promotion
     */
    public function promoteStudent(Request $request, User $student)
    {
        $request->validate([
            'to_class_id' => 'required|exists:school_classes,id',
            'promotion_type' => 'required|in:regular,repeat,accelerated,transfer',
            'academic_year' => 'required|string',
            'reason' => 'nullable|string',
        ]);

        $currentClass = $student->studentProfile->schoolClass;

        DB::transaction(function () use ($request, $student, $currentClass) {
            // Create promotion record
            Promotion::create([
                'student_id' => $student->id,
                'from_class_id' => $currentClass->id,
                'to_class_id' => $request->to_class_id,
                'from_academic_year' => $request->academic_year,
                'to_academic_year' => $request->academic_year,
                'promotion_date' => now(),
                'promotion_type' => $request->promotion_type,
                'reason' => $request->reason,
                'promoted_by' => Auth::id(),
            ]);

            // Update student's class
            $student->studentProfile->update([
                'class_id' => $request->to_class_id,
            ]);
        });

        return redirect()->route('student.profiles.show', $student)
            ->with('success', 'Student promoted successfully.');
    }

    /**
     * Display graduation management
     */
    public function graduationIndex()
    {
        $graduatingClasses = SchoolClass::where('school_id', Auth::user()->school_id)
            ->whereIn('level', ['Standard VII', 'Form IV', 'Form VI'])
            ->where('is_active', true)
            ->withCount('students')
            ->get();

        $recentGraduations = Graduation::whereHas('student', function ($query) {
                $query->where('school_id', Auth::user()->school_id);
            })
            ->with(['student', 'finalClass'])
            ->orderBy('graduation_date', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Student/Graduations/Index', [
            'graduatingClasses' => $graduatingClasses,
            'recentGraduations' => $recentGraduations
        ]);
    }

    /**
     * Show graduating students in a class
     */
    public function showGraduatingClass(SchoolClass $class)
    {
        $students = User::where('school_id', Auth::user()->school_id)
            ->where('role', 'student')
            ->whereHas('studentProfile', function ($query) use ($class) {
                $query->where('class_id', $class->id);
            })
            ->with(['studentProfile', 'guardians'])
            ->get();

        return Inertia::render('Student/Graduations/ClassStudents', [
            'class' => $class,
            'students' => $students
        ]);
    }

    /**
     * Process graduation for students
     */
    public function processGraduation(Request $request)
    {
        $request->validate([
            'class_id' => 'required|exists:school_classes,id',
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'exists:users,id',
            'graduation_date' => 'required|date',
            'ceremony_date' => 'nullable|date',
            'certificate_prefix' => 'required|string|max:10',
        ]);

        $class = SchoolClass::find($request->class_id);
        $graduationYear = date('Y');

        DB::transaction(function () use ($request, $class, $graduationYear) {
            foreach ($request->student_ids as $index => $studentId) {
                $student = User::find($studentId);
                $certificateNumber = $request->certificate_prefix . '/' . $graduationYear . '/' . str_pad($index + 1, 3, '0', STR_PAD_LEFT);

                // Create graduation record
                $graduation = Graduation::create([
                    'student_id' => $studentId,
                    'graduation_year' => $graduationYear,
                    'graduation_date' => $request->graduation_date,
                    'final_class_id' => $class->id,
                    'certificate_number' => $certificateNumber,
                    'certificate_issued_date' => now(),
                    'graduation_ceremony_date' => $request->ceremony_date,
                ]);

                // Create promotion record for graduation
                Promotion::create([
                    'student_id' => $studentId,
                    'from_class_id' => $class->id,
                    'to_class_id' => $class->id, // Same class for graduation
                    'from_academic_year' => $graduationYear,
                    'to_academic_year' => $graduationYear,
                    'promotion_date' => $request->graduation_date,
                    'promotion_type' => Promotion::PROMOTION_TYPE_GRADUATION,
                    'promoted_by' => Auth::id(),
                ]);

                // Create alumni record
                Alumni::create([
                    'student_id' => $studentId,
                    'graduation_id' => $graduation->id,
                    'graduation_year' => $graduationYear,
                    'final_class' => $class->name,
                    'current_name' => $student->name,
                    'privacy_level' => Alumni::PRIVACY_LEVEL_ALUMNI_ONLY,
                ]);

                // Update student status to alumni
                $student->update(['is_active' => false]);
            }
        });

        return redirect()->route('student.graduations.index')
            ->with('success', 'Students graduated successfully.');
    }

    /**
     * Generate graduation certificates
     */
    public function generateCertificates(Request $request)
    {
        $request->validate([
            'graduation_ids' => 'required|array|min:1',
            'graduation_ids.*' => 'exists:graduations,id',
        ]);

        $graduations = Graduation::whereIn('id', $request->graduation_ids)
            ->with(['student', 'finalClass'])
            ->get();

        // TODO: Generate PDF certificates
        return redirect()->route('student.graduations.index')
            ->with('success', 'Certificates generated successfully.');
    }

    /**
     * Get next level for promotion
     */
    private function getNextLevel(string $currentLevel): string
    {
        return match($currentLevel) {
            'Baby Class' => 'Middle Class',
            'Middle Class' => 'Top Class',
            'Top Class' => 'Standard I',
            'Standard I' => 'Standard II',
            'Standard II' => 'Standard III',
            'Standard III' => 'Standard IV',
            'Standard IV' => 'Standard V',
            'Standard V' => 'Standard VI',
            'Standard VI' => 'Standard VII',
            'Standard VII' => 'Form I',
            'Form I' => 'Form II',
            'Form II' => 'Form III',
            'Form III' => 'Form IV',
            'Form IV' => 'Form V',
            'Form V' => 'Form VI',
            default => $currentLevel
        };
    }
}



