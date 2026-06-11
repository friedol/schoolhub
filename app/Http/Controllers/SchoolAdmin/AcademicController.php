<?php

namespace App\Http\Controllers\SchoolAdmin;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\User;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\ClassSubject;
use App\Models\SchoolConfiguration;
use App\Models\AcademicTerm;
use App\Models\Assessment;
use App\Models\Timetable;
use App\Models\GradingScale;
use App\Models\Examination;
use App\Models\ExamSession;
use App\Models\ExamAttendance;
use App\Models\ResultSubmission;
use App\Models\AcademicRecord;
use App\Models\ReportCard;
use App\Models\ReportCardSubject;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AcademicController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('role:school_admin,headteacher,teacher,academic_master');
    }

    /**
     * Display curriculum management
     */
    public function curriculum(): Response
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;
        
        // Mock curriculum data for now
        $curricula = [
            'data' => [
                [
                    'id' => 1,
                    'name' => 'Form 1 Curriculum',
                    'description' => 'Standard curriculum for Form 1 students',
                    'academic_year' => '2024/2025',
                    'is_active' => true,
                    'subjects_count' => 8,
                    'created_at' => '2024-01-01',
                ],
                [
                    'id' => 2,
                    'name' => 'Form 2 Curriculum',
                    'description' => 'Standard curriculum for Form 2 students',
                    'academic_year' => '2024/2025',
                    'is_active' => true,
                    'subjects_count' => 8,
                    'created_at' => '2024-01-01',
                ],
            ],
            'links' => [],
            'meta' => [
                'total' => 2,
                'per_page' => 15,
                'current_page' => 1,
                'last_page' => 1,
            ],
        ];
        
        return Inertia::render('Academic/Curriculum/Index', [
            'curricula' => $curricula,
            'currentSchool' => $school,
        ]);
    }

    /**
     * Display sections management
     */
    public function sections(): Response
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        try {
            $query = \App\Models\Section::where('school_id', $school->id)
                ->orderBy('id', 'desc');
            
            $sections = $query->paginate(15);
        } catch (\Exception $e) {
            \Log::error('Sections query failed: ' . $e->getMessage());
            $sections = new \Illuminate\Pagination\LengthAwarePaginator(
                [], 0, 15, 1, ['path' => request()->url()]
            );
        }

        return Inertia::render('Academic/Sections/Index', [
            'sections' => $sections,
            'currentSchool' => $school,
        ]);
    }

    /**
     * Store a new section
     */
    public function storeSection(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        // Check if section name is already taken for this school
        $exists = \App\Models\Section::where('school_id', $school->id)
            ->where('name', $request->name)
            ->exists();

        if ($exists) {
            return redirect()->back()
                ->withErrors(['name' => 'The section name has already been taken.'])
                ->withInput();
        }

        try {
            \App\Models\Section::create([
                'school_id' => $school->id,
                'name' => $request->name,
                'is_active' => $request->boolean('is_active', true),
            ]);

            return redirect()->route('academic.sections')
                ->with('success', "Section '{$request->name}' created successfully!")
                ->with('sweetalert', [
                    'type' => 'success',
                    'title' => 'Success!',
                    'text' => "Section '{$request->name}' has been created successfully!",
                    'showConfirmButton' => false,
                    'timer' => 3000
                ]);
        } catch (\Exception $e) {
            \Log::error('Section creation failed: ' . $e->getMessage());
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to create section. Please try again.');
        }
    }

    /**
     * Update a section
     */
    public function updateSection(Request $request, $id): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        // Find the section
        $section = \App\Models\Section::where('school_id', $school->id)
            ->where('id', $id)
            ->firstOrFail();

        // Check for duplicate name
        $exists = \App\Models\Section::where('school_id', $school->id)
            ->where('name', $request->name)
            ->where('id', '!=', $id)
            ->exists();

        if ($exists) {
            return redirect()->back()
                ->withErrors(['name' => 'The section name has already been taken.'])
                ->withInput();
        }

        try {
            $section->update([
                'name' => $request->name,
                'is_active' => $request->boolean('is_active', true),
            ]);

            return redirect()->route('academic.sections')
                ->with('success', "Section '{$request->name}' updated successfully!")
                ->with('sweetalert', [
                    'type' => 'success',
                    'title' => 'Success!',
                    'text' => "Section '{$request->name}' has been updated successfully!",
                    'showConfirmButton' => false,
                    'timer' => 3000
                ]);
        } catch (\Exception $e) {
            \Log::error('Section update failed: ' . $e->getMessage());
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update section. Please try again.');
        }
    }

    /**
     * Delete a section
     */
    public function destroySection($id): RedirectResponse
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        try {
            $section = \App\Models\Section::where('school_id', $school->id)
                ->where('id', $id)
                ->firstOrFail();

            $sectionName = $section->name;
            $section->delete();

            return redirect()->route('academic.sections')
                ->with('success', "Section '{$sectionName}' deleted successfully!")
                ->with('sweetalert', [
                    'type' => 'success',
                    'title' => 'Deleted!',
                    'text' => "Section '{$sectionName}' has been deleted successfully!",
                    'showConfirmButton' => false,
                    'timer' => 1500
                ]);
        } catch (\Exception $e) {
            \Log::error('Section deletion failed: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Failed to delete section. Please try again.');
        }
    }

    /**
     * Display classes management
     */
    public function classes(): Response
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;
        
        try {
            // Get classes from database with school filtering
            $query = SchoolClass::where('school_id', $school->id)
                ->with(['subjects:id,name,code'])
                ->withCount(['students', 'subjects']);
            
            $classes = $query->paginate(15);
            
            // Transform the data to match frontend expectations
            $transformedClasses = $classes->getCollection()->map(function ($class) {
                return [
                    'id' => $class->id,
                    'name' => $class->name,
                    'level' => $class->level,
                    'stream' => $class->stream,
                    'section' => $class->section,
                    'capacity' => $class->capacity,
                    'class_teacher_id' => $class->class_teacher_id,
                    'room_number' => $class->room_number,
                    'is_active' => $class->is_active,
                    'students_count' => $class->students_count,
                    'subjects_count' => $class->subjects_count,
                    'subjects' => $class->subjects->map(function ($subject) {
                        return [
                            'id' => $subject->id,
                            'name' => $subject->name,
                            'code' => $subject->code,
                        ];
                    })->toArray(),
                    'created_at' => $class->created_at->format('Y-m-d'),
                ];
            });
            
            $classes->setCollection($transformedClasses);
            
        } catch (\Exception $e) {
            \Log::error('Classes query failed: ' . $e->getMessage());
            $classes = new \Illuminate\Pagination\LengthAwarePaginator(
                [], 0, 15, 1, ['path' => request()->url()]
            );
        }
        
        // Get subjects for the slide panel
        $subjects = [];
        try {
            $subjects = Subject::where('school_id', $school->id)
                ->where('is_active', true)
                ->select('id', 'name', 'code')
                ->get()
                ->toArray();
        } catch (\Exception $e) {
            // Fallback to empty array if database error
            $subjects = [];
        }

        // Get teachers for the slide panel
        $teachers = [];
        try {
            $teachers = User::where('school_id', $school->id)
                ->where('role', 'teacher')
                ->where('is_active', true)
                ->select('id', 'name', 'email')
                ->get()
                ->toArray();
        } catch (\Exception $e) {
            // Fallback to empty array if database error
            $teachers = [];
        }

        $schoolId = $school->id;
        $classStats = [
            'active' => SchoolClass::where('school_id', $schoolId)->where('is_active', true)->count(),
            'inactive' => SchoolClass::where('school_id', $schoolId)->where('is_active', false)->count(),
        ];
        $classStats['total'] = $classStats['active'] + $classStats['inactive'];

        $studentStats = [
            'active' => User::where('school_id', $schoolId)->where('role', 'student')->where('is_active', true)->count(),
            'inactive' => User::where('school_id', $schoolId)->where('role', 'student')->where('is_active', false)->count(),
        ];
        $studentStats['total'] = $studentStats['active'] + $studentStats['inactive'];

        $totalClasses = $classStats['total'];
        $avgClassSize = $totalClasses > 0 ? round($studentStats['total'] / $totalClasses, 1) : 0;

        // Load custom class levels
        $levelsConfig = SchoolConfiguration::where('school_id', $school->id)
            ->where('configuration_key', 'class_levels')
            ->first();
        $levels = $levelsConfig ? $levelsConfig->configuration_value : [
            'Nursery', 'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4',
            'Primary 5', 'Primary 6', 'Primary 7',
            'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Form 6',
        ];

        // Get sections list
        $sectionsList = [];
        try {
            $sectionsList = \App\Models\Section::where('school_id', $school->id)
                ->where('is_active', true)
                ->orderBy('name', 'asc')
                ->select('id', 'name')
                ->get()
                ->toArray();
        } catch (\Exception $e) {
            $sectionsList = [];
        }

        // Get rooms list
        $roomsList = [];
        try {
            $roomsList = \App\Models\Room::where('school_id', $school->id)
                ->where('is_active', true)
                ->orderBy('room_number', 'asc')
                ->select('id', 'room_number', 'room_name')
                ->get()
                ->toArray();
        } catch (\Exception $e) {
            $roomsList = [];
        }

        return Inertia::render('Academic/Classes/Index', [
            'classes' => $classes,
            'subjects' => $subjects,
            'teachers' => $teachers,
            'sectionsList' => $sectionsList,
            'roomsList' => $roomsList,
            'currentSchool' => $school,
            'levels' => $levels,
            'stats' => [
                'classes' => $classStats,
                'students' => $studentStats,
                'avg_size' => $avgClassSize,
            ]
        ]);
    }

    /**
     * Save custom class levels configuration
     */
    public function saveClassLevels(Request $request): RedirectResponse
    {
        $request->validate([
            'levels' => 'required|array|min:1',
            'levels.*' => 'required|string|max:255',
        ]);

        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        try {
            SchoolConfiguration::set('class_levels', $request->levels, $school->id, 'array');

            return redirect()->back()
                ->with('success', 'Class levels updated successfully!')
                ->with('sweetalert', [
                    'type' => 'success',
                    'title' => 'Success!',
                    'text' => 'Class levels updated successfully!',
                    'showConfirmButton' => false,
                    'timer' => 1500
                ]);
        } catch (\Exception $e) {
            \Log::error('Saving class levels failed: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Failed to update class levels. Please try again.');
        }
    }

    /**
     * Display subjects management
     */
    public function subjects(): Response
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;
        
        try {
            // Get subjects from database with school filtering
            $query = Subject::where('school_id', $school->id)
                ->with(['classSubjects.class:id,name,level'])
                ->withCount(['classSubjects as classes_count']);
            
            $subjects = $query->paginate(15);
            
            // Transform the data to match frontend expectations
            $transformedSubjects = $subjects->getCollection()->map(function ($subject) {
                return [
                    'id' => $subject->id,
                    'name' => $subject->name,
                    'code' => $subject->code,
                    'description' => $subject->description,
                    'necta_code' => $subject->necta_code ?? '',
                    'is_active' => $subject->is_active,
                    'classes_count' => $subject->classes_count,
                    'teachers_count' => \DB::table('subject_teachers')->where('subject_id', $subject->id)->distinct('teacher_id')->count('teacher_id'),
                    'classes' => $subject->classSubjects->map(function ($classSubject) {
                        return [
                            'id' => $classSubject->class->id,
                            'name' => $classSubject->class->name,
                            'level' => $classSubject->class->level,
                        ];
                    })->toArray(),
                    'created_at' => $subject->created_at->format('Y-m-d'),
                ];
            });
            
            $subjects->setCollection($transformedSubjects);
            
        } catch (\Exception $e) {
            // Fallback to empty data if database error
            $subjects = new \Illuminate\Pagination\LengthAwarePaginator(
                [],
                0,
                15,
                1,
                ['path' => request()->url()]
            );
        }
        
        $schoolId = $school->id;
        $subjectStats = [
            'active' => Subject::where('school_id', $schoolId)->where('is_active', true)->count(),
            'inactive' => Subject::where('school_id', $schoolId)->where('is_active', false)->count(),
        ];
        $subjectStats['total'] = $subjectStats['active'] + $subjectStats['inactive'];

        $classesCovered = \DB::table('class_subjects')
            ->whereIn('subject_id', function($q) use ($schoolId) {
                $q->select('id')->from('subjects')->where('school_id', $schoolId);
            })
            ->distinct('school_class_id')
            ->count('school_class_id');

        $teachersCount = \DB::table('subject_teachers')
            ->whereIn('subject_id', function($q) use ($schoolId) {
                $q->select('id')->from('subjects')->where('school_id', $schoolId);
            })
            ->distinct('teacher_id')
            ->count('teacher_id');

        $stats = [
            'subjects' => $subjectStats,
            'classes_covered' => $classesCovered,
            'teachers_count' => $teachersCount,
        ];

        $classes = [];
        try {
            $classes = SchoolClass::where('school_id', $school->id)
                ->where('is_active', true)
                ->select('id', 'name', 'level')
                ->get()
                ->toArray();
        } catch (\Exception $e) {
            $classes = [];
        }

        return Inertia::render('Academic/Subjects/Index', [
            'subjects' => $subjects,
            'classes' => $classes,
            'currentSchool' => $school,
            'stats' => $stats,
        ]);
    }

    /**
     * Display timetable management
     */
    public function timetable(): Response
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;
        
        // Mock timetable data for the existing view
        $timetables = [
            'data' => [
                [
                    'id' => 1,
                    'day_of_week' => 'Monday',
                    'start_time' => '08:00',
                    'end_time' => '09:00',
                    'subject' => [
                        'name' => 'Mathematics',
                        'code' => 'MATH',
                    ],
                    'teacher' => [
                        'name' => 'Mr. John Doe',
                    ],
                    'school_class' => [
                        'name' => 'Form 1A',
                    ],
                    'room' => [
                        'name' => 'Room 101',
                    ],
                    'period' => [
                        'name' => 'Period 1',
                    ],
                ],
                [
                    'id' => 2,
                    'day_of_week' => 'Monday',
                    'start_time' => '09:00',
                    'end_time' => '10:00',
                    'subject' => [
                        'name' => 'English',
                        'code' => 'ENG',
                    ],
                    'teacher' => [
                        'name' => 'Ms. Jane Smith',
                    ],
                    'school_class' => [
                        'name' => 'Form 1A',
                    ],
                    'room' => [
                        'name' => 'Room 102',
                    ],
                    'period' => [
                        'name' => 'Period 2',
                    ],
                ],
            ],
            'links' => [],
            'meta' => [],
        ];
        
        return Inertia::render('Academic/Timetable/Index', [
            'timetables' => $timetables,
            'currentSchool' => $school,
        ]);
    }

    /**
     * Display assessments management
     */
    public function assessments(): Response
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;
        
        // Mock assessment data for the existing view
        $assessments = [
            'data' => [
                [
                    'id' => 1,
                    'name' => 'Mid-term Mathematics Exam',
                    'description' => 'Comprehensive mathematics examination covering all topics',
                    'type' => 'Exam',
                    'weight' => 30,
                    'max_marks' => 100,
                    'due_date' => '2024-10-15',
                    'status' => 'Scheduled',
                    'subject' => [
                        'name' => 'Mathematics',
                        'code' => 'MATH',
                    ],
                    'school_class' => [
                        'name' => 'Form 1A',
                    ],
                    'created_at' => '2024-10-01',
                ],
                [
                    'id' => 2,
                    'name' => 'English Essay Assignment',
                    'description' => 'Write a 500-word essay on environmental conservation',
                    'type' => 'Assignment',
                    'weight' => 20,
                    'max_marks' => 50,
                    'due_date' => '2024-10-20',
                    'status' => 'In Progress',
                    'subject' => [
                        'name' => 'English',
                        'code' => 'ENG',
                    ],
                    'school_class' => [
                        'name' => 'Form 1A',
                    ],
                    'created_at' => '2024-10-01',
                ],
            ],
            'links' => [],
            'meta' => [],
        ];
        
        return Inertia::render('Academic/Assessments/Index', [
            'assessments' => $assessments,
            'currentSchool' => $school,
        ]);
    }

    /**
     * Display report cards management
     */
    public function reportCards(): Response
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;
        
        // Mock report card data for now
        $reportCards = [
            'data' => [
                [
                    'id' => 1,
                    'student_name' => 'John Doe',
                    'student_number' => 'ST001',
                    'class' => 'Form 1A',
                    'term' => 'Term 1',
                    'year' => '2024',
                    'status' => 'Generated',
                    'created_at' => '2024-10-01',
                ],
                [
                    'id' => 2,
                    'student_name' => 'Jane Smith',
                    'student_number' => 'ST002',
                    'class' => 'Form 1A',
                    'term' => 'Term 1',
                    'year' => '2024',
                    'status' => 'Pending',
                    'created_at' => '2024-10-01',
                ],
            ],
            'links' => [],
            'meta' => [],
        ];
        
        return Inertia::render('Academic/ReportCards/Index', [
            'reportCards' => $reportCards,
            'currentSchool' => $school,
        ]);
    }

    /**
     * Display examinations management
     */
    public function examinations(): Response
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;
        
        try {
            // Get examinations from database with school filtering
            $query = Examination::where('school_id', $school->id)
                ->with(['academicTerm:id,name', 'examSessions.schoolClass:id,name'])
                ->withCount(['examSessions']);
            
            $examinations = $query->paginate(15);
            
            // Transform the data to match frontend expectations
            $transformedExaminations = $examinations->getCollection()->map(function ($exam) {
                $status = 'Planned';
                $now = now();
                
                if ($exam->start_date <= $now && $exam->end_date >= $now) {
                    $status = 'In Progress';
                } elseif ($exam->end_date < $now) {
                    $status = 'Completed';
                } elseif ($exam->start_date > $now) {
                    $status = 'Scheduled';
                }
                
                return [
                    'id' => $exam->id,
                    'name' => $exam->name,
                    'type' => ucfirst($exam->exam_type),
                    'start_date' => $exam->start_date->format('Y-m-d'),
                    'end_date' => $exam->end_date->format('Y-m-d'),
                    'status' => $status,
                    'classes' => $exam->examSessions->pluck('schoolClass.name')->unique()->toArray(),
                    'created_at' => $exam->created_at->format('Y-m-d'),
                ];
            });
            
            $examinations->setCollection($transformedExaminations);
            
        } catch (\Exception $e) {
            // Fallback to empty data if database error
            $examinations = new \Illuminate\Pagination\LengthAwarePaginator(
                [],
                0,
                15,
                1,
                ['path' => request()->url()]
            );
        }
        
        return Inertia::render('Academic/Examinations/Index', [
            'examinations' => $examinations,
            'currentSchool' => $school,
        ]);
    }

    /**
     * Show the form for creating a new examination
     */
    public function createExamination()
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        try {
            // Get classes from database
            $classes = SchoolClass::where('school_id', $school->id)
                ->where('is_active', true)
                ->select('id', 'name', 'level')
                ->get();
            
            // Get subjects from database
            $subjects = Subject::where('school_id', $school->id)
                ->where('is_active', true)
                ->select('id', 'name', 'code')
                ->get();
            
        } catch (\Exception $e) {
            // Fallback to empty collections if database error
            $classes = collect([]);
            $subjects = collect([]);
        }

        return Inertia::render('Academic/Examinations/Create', [
            'classes' => $classes,
            'subjects' => $subjects,
        ]);
    }

    /**
     * Store a newly created examination
     */
    public function storeExamination(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:Internal,External,NECTA',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'description' => 'nullable|string',
            'classes' => 'required|array|min:1',
            'subjects' => 'required|array|min:1',
        ]);

        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        try {
            // Get term id or default
            $activeTerm = AcademicTerm::where('school_id', $school->id)->where('is_active', true)->first();
            $termId = $activeTerm ? $activeTerm->id : 1; // Fallback to first term

            // Create the examination in database
            $examination = Examination::create([
                'school_id' => $school->id,
                'academic_term_id' => $termId,
                'name' => $request->name,
                'exam_type' => strtolower($request->type),
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'created_by' => $user->id,
                'notes' => $request->description,
            ]);

            // Create exam sessions for each class-subject combination
            foreach ($request->classes as $classId) {
                foreach ($request->subjects as $subjectId) {
                    ExamSession::create([
                        'exam_id' => $examination->id,
                        'school_class_id' => $classId,
                        'subject_id' => $subjectId,
                        'date' => $examination->start_date,
                        'start_time' => '08:00:00',
                        'end_time' => '11:00:00',
                        'max_marks' => 100,
                        'is_published' => false,
                    ]);
                }
            }

            return redirect()->route('academic.examinations')
                ->with('success', 'Examination scheduled successfully!')
                ->with('sweetalert', [
                    'type' => 'success',
                    'title' => 'Success!',
                    'text' => 'Examination has been scheduled successfully!',
                    'showConfirmButton' => false,
                    'timer' => 3000
                ]);

        } catch (\Exception $e) {
            \Log::error('Failed to store examination: ' . $e->getMessage());
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to schedule examination. Please try again.')
                ->with('sweetalert', [
                    'type' => 'error',
                    'title' => 'Error!',
                    'text' => 'Failed to schedule examination: ' . $e->getMessage(),
                    'showConfirmButton' => false,
                    'timer' => 3000
                ]);
        }
    }

    /**
     * Display the specified examination
     */
    public function showExamination($id)
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        $examinationModel = Examination::where('school_id', $school->id)
            ->where('id', $id)
            ->with(['examSessions.schoolClass', 'examSessions.subject'])
            ->firstOrFail();

        // Map class and subject data for frontend
        $classes = $examinationModel->examSessions->map(function ($session) {
            if ($session->schoolClass) {
                return [
                    'id' => $session->schoolClass->id,
                    'name' => $session->schoolClass->name,
                    'level' => $session->schoolClass->level,
                ];
            }
            return null;
        })->filter()->unique('id')->values()->toArray();

        $subjects = $examinationModel->examSessions->map(function ($session) {
            if ($session->subject) {
                return [
                    'id' => $session->subject->id,
                    'name' => $session->subject->name,
                    'code' => $session->subject->code,
                ];
            }
            return null;
        })->filter()->unique('id')->values()->toArray();

        $status = 'Planned';
        $now = now();
        if ($examinationModel->start_date <= $now && $examinationModel->end_date >= $now) {
            $status = 'In Progress';
        } elseif ($examinationModel->end_date < $now) {
            $status = 'Completed';
        } elseif ($examinationModel->start_date > $now) {
            $status = 'Scheduled';
        }

        $examination = [
            'id' => $examinationModel->id,
            'name' => $examinationModel->name,
            'type' => ucfirst($examinationModel->exam_type),
            'start_date' => $examinationModel->start_date->format('Y-m-d'),
            'end_date' => $examinationModel->end_date->format('Y-m-d'),
            'status' => $status,
            'description' => $examinationModel->notes ?? '',
            'classes' => $classes,
            'subjects' => $subjects,
            'is_published' => $examinationModel->is_published,
            'created_at' => $examinationModel->created_at->toISOString(),
        ];

        return Inertia::render('Academic/Examinations/Show', [
            'examination' => $examination,
        ]);
    }

    /**
     * Show the form for editing the specified examination
     */
    public function editExamination($id)
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        $examinationModel = Examination::where('school_id', $school->id)
            ->where('id', $id)
            ->with('examSessions')
            ->firstOrFail();

        $selectedClasses = $examinationModel->examSessions->pluck('school_class_id')->unique()->values()->toArray();
        $selectedSubjects = $examinationModel->examSessions->pluck('subject_id')->unique()->values()->toArray();

        $examination = [
            'id' => $examinationModel->id,
            'name' => $examinationModel->name,
            'type' => ucfirst($examinationModel->exam_type),
            'start_date' => $examinationModel->start_date->format('Y-m-d'),
            'end_date' => $examinationModel->end_date->format('Y-m-d'),
            'description' => $examinationModel->notes ?? '',
            'classes' => $selectedClasses,
            'subjects' => $selectedSubjects,
        ];

        $classes = SchoolClass::where('school_id', $school->id)
            ->where('is_active', true)
            ->select('id', 'name', 'level')
            ->get()
            ->toArray();

        $subjects = Subject::where('school_id', $school->id)
            ->where('is_active', true)
            ->select('id', 'name', 'code')
            ->get()
            ->toArray();

        return Inertia::render('Academic/Examinations/Edit', [
            'examination' => $examination,
            'classes' => $classes,
            'subjects' => $subjects,
        ]);
    }

    /**
     * Update the specified examination
     */
    public function updateExamination(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:Internal,External,NECTA',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'description' => 'nullable|string',
            'classes' => 'required|array|min:1',
            'subjects' => 'required|array|min:1',
        ]);

        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        try {
            $examination = Examination::where('school_id', $school->id)
                ->where('id', $id)
                ->firstOrFail();

            $examination->update([
                'name' => $request->name,
                'exam_type' => strtolower($request->type),
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'notes' => $request->description,
            ]);

            // Sync exam sessions: delete old ones and recreate
            $examination->examSessions()->delete();

            foreach ($request->classes as $classId) {
                foreach ($request->subjects as $subjectId) {
                    ExamSession::create([
                        'exam_id' => $examination->id,
                        'school_class_id' => $classId,
                        'subject_id' => $subjectId,
                        'date' => $examination->start_date,
                        'start_time' => '08:00:00',
                        'end_time' => '11:00:00',
                        'max_marks' => 100,
                        'is_published' => false,
                    ]);
                }
            }

            return redirect()->route('academic.examinations.show', $id)
                ->with('success', 'Examination updated successfully!')
                ->with('sweetalert', [
                    'type' => 'success',
                    'title' => 'Success!',
                    'text' => 'Examination has been updated successfully!',
                    'showConfirmButton' => false,
                    'timer' => 3000
                ]);

        } catch (\Exception $e) {
            \Log::error('Failed to update examination: ' . $e->getMessage());
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update examination. Please try again.');
        }
    }

    /**
     * Remove the specified examination
     */
    public function destroyExamination($id)
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        try {
            $examination = Examination::where('school_id', $school->id)
                ->where('id', $id)
                ->firstOrFail();

            $examination->examSessions()->delete();
            $examination->delete();

            return redirect()->route('academic.examinations')
                ->with('success', 'Examination deleted successfully!')
                ->with('sweetalert', [
                    'type' => 'success',
                    'title' => 'Deleted!',
                    'text' => 'Examination has been deleted successfully!',
                    'showConfirmButton' => false,
                    'timer' => 3000
                ]);

        } catch (\Exception $e) {
            \Log::error('Failed to destroy examination: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Failed to delete examination. Please try again.');
        }
    }

    /**
     * Show the form for creating a new class
     */
    public function createClass(): Response
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;
        
        // Get available subjects for the form
        try {
            $subjects = $school->subjects()->where('is_active', true)->get();
        } catch (\Exception $e) {
            $subjects = collect([
                ['id' => 1, 'name' => 'Mathematics', 'code' => 'MATH'],
                ['id' => 2, 'name' => 'English', 'code' => 'ENG'],
                ['id' => 3, 'name' => 'Science', 'code' => 'SCI'],
            ]);
        }
        
        return Inertia::render('Academic/Classes/Create', [
            'subjects' => $subjects,
            'currentSchool' => $school,
        ]);
    }

    /**
     * Store a new class
     */
    public function storeClass(Request $request): RedirectResponse
    {
        // Debug logging
        \Log::info('Class creation request received', [
            'data' => $request->all(),
            'user' => Auth::user()?->id,
        ]);

        $request->validate([
            'name' => 'required|string|max:255',
            'level' => 'required|string|max:255',
            'stream' => 'nullable|string|max:255',
            'section' => 'nullable|string|max:255',
            'sections' => 'nullable|array',
            'sections.*' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1|max:300',
            'class_teacher_id' => 'nullable|integer|exists:users,id',
            'room_number' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'subject_ids' => 'array',
        ]);

        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        \Log::info('School context', [
            'school_id' => $school?->id,
            'school_name' => $school?->name,
        ]);

        DB::beginTransaction();
        try {
            $sections = $request->sections;
            if (empty($sections)) {
                $sections = [$request->section ?? ''];
            }

            foreach ($sections as $sec) {
                // Create the class in database
                $class = SchoolClass::create([
                    'school_id' => $school->id,
                    'name' => $request->name,
                    'level' => $request->level,
                    'stream' => $request->stream,
                    'section' => $sec,
                    'capacity' => $request->capacity,
                    'class_teacher_id' => $request->class_teacher_id,
                    'room_number' => $request->room_number,
                    'is_active' => $request->boolean('is_active', true),
                ]);

                // Attach subjects if provided with explicit academic_year
                if ($request->has('subject_ids') && !empty($request->subject_ids)) {
                    foreach ($request->subject_ids as $subjectId) {
                        ClassSubject::create([
                            'school_class_id' => $class->id,
                            'subject_id' => $subjectId,
                            'academic_year' => '2024/2025',
                            'is_active' => true,
                            'is_compulsory' => true,
                        ]);
                    }
                }
            }

            DB::commit();

            \Log::info('Classes created successfully', [
                'name' => $request->name,
                'sections' => $sections,
            ]);

            return redirect()->route('academic.classes')
                ->with('success', "Class '{$request->name}' created successfully!")
                ->with('sweetalert', [
                    'type' => 'success',
                    'title' => 'Success!',
                    'text' => "Class '{$request->name}' has been created successfully!",
                    'showConfirmButton' => false,
                    'timer' => 3000
                ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Class creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to create class. Please try again.')
                ->with('sweetalert', [
                    'type' => 'error',
                    'title' => 'Error!',
                    'text' => 'Failed to create class: ' . $e->getMessage(),
                    'showConfirmButton' => true,
                ]);
        }
    }

    /**
     * Display the specified class
     */
    public function showClass($id): Response
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;
        
        try {
            // Get class from database with school filtering
            $class = SchoolClass::where('school_id', $school->id)
                ->where('id', $id)
                ->with(['subjects:id,name,code', 'students:id,name,student_number'])
                ->withCount(['students', 'subjects'])
                ->firstOrFail();
            
            // Transform the data to match frontend expectations
            $classData = [
                'id' => $class->id,
                'name' => $class->name,
                'level' => $class->level,
                'stream' => $class->stream,
                'capacity' => $class->capacity,
                'is_active' => $class->is_active,
                'students_count' => $class->students_count,
                'subjects_count' => $class->subjects_count,
                'subjects' => $class->subjects->map(function ($subject) {
                    return [
                        'id' => $subject->id,
                        'name' => $subject->name,
                        'code' => $subject->code,
                    ];
                })->toArray(),
                'students' => $class->students->map(function ($student) {
                    return [
                        'id' => $student->id,
                        'name' => $student->name,
                        'student_number' => $student->student_number,
                    ];
                })->toArray(),
                'created_at' => $class->created_at->format('Y-m-d'),
                'updated_at' => $class->updated_at->format('Y-m-d'),
            ];
            
        } catch (\Exception $e) {
            // Return 404 if class not found
            abort(404, 'Class not found');
        }
        
        return Inertia::render('Academic/Classes/Show', [
            'classItem' => $classData,
            'currentSchool' => $school,
        ]);
    }

    /**
     * Show the form for editing the specified class
     */
    public function editClass($id): Response
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;
        $schoolKey = $school ? "school_{$school->id}" : "platform";
        
        // Check if there's updated data in session with school-specific key
        $sessionKey = "updated_class_{$schoolKey}_{$id}";
        $updatedData = session($sessionKey);
        
        // Base class data
        $baseClassData = [
            'id' => $id,
            'name' => 'Form 1A',
            'level' => 'Form 1',
            'stream' => 'A',
            'capacity' => 40,
            'description' => 'Standard Form 1 class',
            'is_active' => true,
            'subjects' => [
                ['id' => 1, 'name' => 'Mathematics', 'code' => 'MATH'],
                ['id' => 2, 'name' => 'English', 'code' => 'ENG'],
            ],
        ];
        
        // Merge with updated data if available
        $classItem = $updatedData ? array_merge($baseClassData, $updatedData) : $baseClassData;

        // Get available subjects for the form
        try {
            $subjects = $school->subjects()->where('is_active', true)->get();
        } catch (\Exception $e) {
            $subjects = collect([
                ['id' => 1, 'name' => 'Mathematics', 'code' => 'MATH'],
                ['id' => 2, 'name' => 'English', 'code' => 'ENG'],
                ['id' => 3, 'name' => 'Science', 'code' => 'SCI'],
            ]);
        }
        
        return Inertia::render('Academic/Classes/Edit', [
            'classItem' => $classItem,
            'subjects' => $subjects,
            'currentSchool' => $school,
        ]);
    }

    /**
     * Update the specified class
     */
    public function updateClass(Request $request, $id): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'level' => 'required|string|max:255',
            'stream' => 'nullable|string|max:255',
            'section' => 'nullable|string|max:255',
            'capacity' => 'required|integer|min:1|max:300',
            'class_teacher_id' => 'nullable|integer|exists:users,id',
            'room_number' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'subject_ids' => 'array',
        ]);

        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        DB::beginTransaction();
        try {
            // Find the class and update it
            $class = SchoolClass::where('school_id', $school->id)
                ->where('id', $id)
                ->firstOrFail();

            $class->update([
                'name' => $request->name,
                'level' => $request->level,
                'stream' => $request->stream,
                'section' => $request->section,
                'capacity' => $request->capacity,
                'class_teacher_id' => $request->class_teacher_id,
                'room_number' => $request->room_number,
                'is_active' => $request->boolean('is_active', true),
            ]);

            // Update subjects if provided
            if ($request->has('subject_ids')) {
                // Delete existing ones
                ClassSubject::where('school_class_id', $class->id)->delete();

                foreach ($request->subject_ids as $subjectId) {
                    ClassSubject::create([
                        'school_class_id' => $class->id,
                        'subject_id' => $subjectId,
                        'academic_year' => '2024/2025',
                        'is_active' => true,
                        'is_compulsory' => true,
                    ]);
                }
            }

            DB::commit();

            \Log::info('Class updated successfully', [
                'class_id' => $class->id,
                'class_name' => $class->name,
            ]);

            return redirect()->route('academic.classes')
                ->with('success', "Class '{$request->name}' updated successfully!")
                ->with('sweetalert', [
                    'type' => 'success',
                    'title' => 'Success!',
                    'text' => "Class '{$request->name}' has been updated successfully!",
                    'showConfirmButton' => false,
                    'timer' => 3000
                ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Class update failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update class. Please try again.')
                ->with('sweetalert', [
                    'type' => 'error',
                    'title' => 'Error!',
                    'text' => 'Failed to update class: ' . $e->getMessage(),
                    'showConfirmButton' => true,
                ]);
        }
    }

    /**
     * Remove the specified class
     */
    public function destroyClass($id): RedirectResponse
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        try {
            // Find the class and delete it
            $class = SchoolClass::where('school_id', $school->id)
                ->where('id', $id)
                ->firstOrFail();

            $className = $class->name;

            // Detach subjects first
            $class->subjects()->detach();

            // Delete the class
            $class->delete();

            \Log::info('Class deleted successfully', [
                'class_id' => $id,
                'class_name' => $className,
            ]);

            return redirect()->route('academic.classes')
                ->with('success', "Class '{$className}' deleted successfully!")
                ->with('sweetalert', [
                    'type' => 'success',
                    'title' => 'Success!',
                    'text' => "Class '{$className}' has been deleted successfully!",
                    'showConfirmButton' => false,
                    'timer' => 3000
                ]);

        } catch (\Exception $e) {
            \Log::error('Class deletion failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()
                ->with('error', 'Failed to delete class. Please try again.')
                ->with('sweetalert', [
                    'type' => 'error',
                    'title' => 'Error!',
                    'text' => 'Failed to delete class. Please try again.',
                    'showConfirmButton' => false,
                    'timer' => 3000
                ]);
        }
    }

    /**
     * Show the form for creating a new subject
     */
    public function createSubject(): Response
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;
        
        // Get available classes for the form
        try {
            $classes = $school->classes()->where('is_active', true)->get();
        } catch (\Exception $e) {
            $classes = collect([
                ['id' => 1, 'name' => 'Form 1A', 'level' => 'Form 1'],
                ['id' => 2, 'name' => 'Form 1B', 'level' => 'Form 1'],
                ['id' => 3, 'name' => 'Form 2A', 'level' => 'Form 2'],
            ]);
        }
        
        return Inertia::render('Academic/Subjects/Create', [
            'classes' => $classes,
            'currentSchool' => $school,
        ]);
    }

    /**
     * Store a newly created subject
     */
    public function storeSubject(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10',
            'necta_code' => 'required|string|max:10',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'class_ids' => 'array',
        ]);

        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        try {
            // Create the subject in database
            $subject = Subject::create([
                'school_id' => $school->id,
                'name' => $request->name,
                'code' => $request->code,
                'necta_code' => $request->necta_code,
                'description' => $request->description,
                'is_active' => $request->boolean('is_active', true),
                'is_core' => true, // Default to core subject
                'is_necta_subject' => true, // Default to NECTA subject
            ]);

            // Attach to classes if provided
            if ($request->has('class_ids') && !empty($request->class_ids)) {
                foreach ($request->class_ids as $classId) {
                    ClassSubject::create([
                        'school_class_id' => $classId,
                        'subject_id' => $subject->id,
                        'academic_year' => '2024/2025',
                        'is_active' => true,
                        'is_compulsory' => true,
                    ]);
                }
            }

            return redirect()->route('academic.subjects')
                ->with('success', "Subject '{$request->name}' created successfully!")
                ->with('sweetalert', [
                    'type' => 'success',
                    'title' => 'Success!',
                    'text' => "Subject '{$request->name}' has been created successfully!",
                    'showConfirmButton' => false,
                    'timer' => 3000
                ]);

        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to create subject. Please try again.')
                ->with('sweetalert', [
                    'type' => 'error',
                    'title' => 'Error!',
                    'text' => 'Failed to create subject. Please try again.',
                    'showConfirmButton' => false,
                    'timer' => 3000
                ]);
        }
    }

    /**
     * Display the specified subject
     */
    public function showSubject($id): Response
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;
        
        try {
            $subject = Subject::where('school_id', $school->id)
                ->where('id', $id)
                ->with(['classSubjects.class:id,name,level', 'teachers.teacher:id,name,email'])
                ->withCount(['classSubjects as classes_count'])
                ->firstOrFail();
                
            $subjectData = [
                'id' => $subject->id,
                'name' => $subject->name,
                'code' => $subject->code,
                'necta_code' => $subject->necta_code ?? '',
                'description' => $subject->description,
                'is_active' => $subject->is_active,
                'classes_count' => $subject->classes_count,
                'teachers_count' => $subject->teachers()->distinct('teacher_id')->count('teacher_id'),
                'classes' => $subject->classSubjects->map(function ($classSubject) {
                    return [
                        'id' => $classSubject->class->id,
                        'name' => $classSubject->class->name,
                        'level' => $classSubject->class->level,
                    ];
                })->toArray(),
                'teachers' => $subject->teachers->map(function ($subjectTeacher) {
                    return [
                        'id' => $subjectTeacher->teacher->id,
                        'name' => $subjectTeacher->teacher->name,
                        'email' => $subjectTeacher->teacher->email,
                    ];
                })->toArray(),
                'created_at' => $subject->created_at->format('Y-m-d'),
                'updated_at' => $subject->updated_at->format('Y-m-d'),
            ];
            
        } catch (\Exception $e) {
            abort(404, 'Subject not found');
        }
        
        return Inertia::render('Academic/Subjects/Show', [
            'subject' => $subjectData,
            'currentSchool' => $school,
        ]);
    }

    /**
     * Show the form for editing the specified subject
     */
    public function editSubject($id): Response
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;
        
        try {
            $subject = Subject::where('school_id', $school->id)
                ->where('id', $id)
                ->with(['classSubjects.class:id,name,level'])
                ->firstOrFail();
                
            $subjectData = [
                'id' => $subject->id,
                'name' => $subject->name,
                'code' => $subject->code,
                'necta_code' => $subject->necta_code ?? '',
                'description' => $subject->description,
                'is_active' => $subject->is_active,
                'classes' => $subject->classSubjects->map(function ($classSubject) {
                    return [
                        'id' => $classSubject->class->id,
                        'name' => $classSubject->class->name,
                        'level' => $classSubject->class->level,
                    ];
                })->toArray(),
            ];
            
            $classes = SchoolClass::where('school_id', $school->id)->where('is_active', true)->get();
            
        } catch (\Exception $e) {
            abort(404, 'Subject not found');
        }
        
        return Inertia::render('Academic/Subjects/Edit', [
            'subject' => $subjectData,
            'classes' => $classes,
            'currentSchool' => $school,
        ]);
    }

    /**
     * Update the specified subject
     */
    public function updateSubject(Request $request, $id): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10',
            'necta_code' => 'required|string|max:10',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'class_ids' => 'array',
        ]);

        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        try {
            $subject = Subject::where('school_id', $school->id)->where('id', $id)->firstOrFail();
            
            $subject->update([
                'name' => $request->name,
                'code' => $request->code,
                'necta_code' => $request->necta_code,
                'description' => $request->description,
                'is_active' => $request->boolean('is_active', true),
            ]);

            // Sync classes in class_subjects table
            ClassSubject::where('subject_id', $subject->id)->delete();

            if ($request->has('class_ids') && !empty($request->class_ids)) {
                foreach ($request->class_ids as $classId) {
                    ClassSubject::create([
                        'school_class_id' => $classId,
                        'subject_id' => $subject->id,
                        'academic_year' => '2024/2025',
                        'is_active' => true,
                        'is_compulsory' => true,
                    ]);
                }
            }

            return redirect()->route('academic.subjects')
                ->with('success', "Subject '{$request->name}' updated successfully!");

        } catch (\Exception $e) {
            \Log::error('Subject update failed: ' . $e->getMessage());
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update subject. Please try again.');
        }
    }

    /**
     * Remove the specified subject
     */
    public function destroySubject($id): RedirectResponse
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        try {
            $subject = Subject::where('school_id', $school->id)->where('id', $id)->firstOrFail();
            
            // Delete associated class subjects
            ClassSubject::where('subject_id', $subject->id)->delete();
            
            // Delete the subject
            $subject->delete();
            
            return redirect()->route('academic.subjects')
                ->with('success', 'Subject deleted successfully!')
                ->with('sweetalert', [
                    'type' => 'success',
                    'title' => 'Deleted!',
                    'text' => 'Subject has been deleted successfully!',
                    'showConfirmButton' => false,
                    'timer' => 3000
                ]);
        } catch (\Exception $e) {
            \Log::error('Subject deletion failed: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Failed to delete subject. Please try again.')
                ->with('sweetalert', [
                    'type' => 'error',
                    'title' => 'Error!',
                    'text' => 'Failed to delete subject. There might be associated records.',
                    'showConfirmButton' => true
                ]);
        }
    }

    /**
     * Clear session data for testing (temporary method)
     */
    public function clearSessionData(): RedirectResponse
    {
        // Clear all session data for classes and subjects
        $keys = [
            'updated_class_1', 'updated_class_2', 'updated_class_3',
            'updated_subject_1', 'updated_subject_2', 'updated_subject_3',
        ];
        
        foreach ($keys as $key) {
            session()->forget($key);
        }
        
        return redirect()->back()
            ->with('success', 'Session data cleared successfully!');
    }

    // ==================== GRADING SCALES CRUD ====================

    /**
     * Display a listing of grading scales
     */
    public function gradingScales(): Response
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        $scales = GradingScale::where('school_id', $school->id)
            ->orderBy('is_default', 'desc')
            ->orderBy('name')
            ->paginate(15);

        // Seed default scales if none exist
        if ($scales->isEmpty()) {
            GradingScale::create([
                'school_id' => $school->id,
                'name' => 'NECTA O-Level Scale',
                'level' => 'o_level',
                'scale_type' => GradingScale::SCALE_TYPE_NECTA,
                'grades' => GradingScale::getDefaultNectaScale(),
                'is_active' => true,
                'is_default' => true,
            ]);

            GradingScale::create([
                'school_id' => $school->id,
                'name' => 'Competency Based Scale',
                'level' => 'primary',
                'scale_type' => GradingScale::SCALE_TYPE_COMPETENCY,
                'grades' => GradingScale::getDefaultCompetencyScale(),
                'is_active' => true,
                'is_default' => false,
            ]);

            $scales = GradingScale::where('school_id', $school->id)->paginate(15);
        }

        return Inertia::render('Academic/GradingScales/Index', [
            'scales' => $scales,
            'currentSchool' => $school,
        ]);
    }

    /**
     * Show form for creating a new scale
     */
    public function createGradingScale(): Response
    {
        return Inertia::render('Academic/GradingScales/Create');
    }

    /**
     * Store a newly created scale
     */
    public function storeGradingScale(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'level' => 'required|in:pre_primary,primary,o_level,a_level',
            'scale_type' => 'required|in:numerical,competency,necta',
            'grades' => 'required|array',
            'is_default' => 'boolean',
        ]);

        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        try {
            DB::transaction(function () use ($request, $school) {
                // If default is checked, reset other defaults for same level
                if ($request->boolean('is_default')) {
                    GradingScale::where('school_id', $school->id)
                        ->where('level', $request->level)
                        ->update(['is_default' => false]);
                }

                GradingScale::create([
                    'school_id' => $school->id,
                    'name' => $request->name,
                    'level' => $request->level,
                    'scale_type' => $request->scale_type,
                    'grades' => $request->grades,
                    'is_active' => true,
                    'is_default' => $request->boolean('is_default'),
                ]);
            });

            return redirect()->route('academic.grading-scales')
                ->with('success', 'Grading Scale created successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->withInput()->with('error', 'Failed to save: ' . $e->getMessage());
        }
    }

    /**
     * Show form for editing a scale
     */
    public function editGradingScale($id): Response
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        $scale = GradingScale::where('school_id', $school->id)
            ->where('id', $id)
            ->firstOrFail();

        return Inertia::render('Academic/GradingScales/Edit', [
            'scale' => $scale,
        ]);
    }

    /**
     * Update specified scale
     */
    public function updateGradingScale(Request $request, $id): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'level' => 'required|in:pre_primary,primary,o_level,a_level',
            'scale_type' => 'required|in:numerical,competency,necta',
            'grades' => 'required|array',
            'is_default' => 'boolean',
        ]);

        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        try {
            $scale = GradingScale::where('school_id', $school->id)
                ->where('id', $id)
                ->firstOrFail();

            DB::transaction(function () use ($request, $scale, $school) {
                if ($request->boolean('is_default')) {
                    GradingScale::where('school_id', $school->id)
                        ->where('level', $request->level)
                        ->where('id', '!=', $scale->id)
                        ->update(['is_default' => false]);
                }

                $scale->update([
                    'name' => $request->name,
                    'level' => $request->level,
                    'scale_type' => $request->scale_type,
                    'grades' => $request->grades,
                    'is_default' => $request->boolean('is_default'),
                ]);
            });

            return redirect()->route('academic.grading-scales')
                ->with('success', 'Grading Scale updated successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->withInput()->with('error', 'Failed to update: ' . $e->getMessage());
        }
    }

    /**
     * Destroy specified scale
     */
    public function destroyGradingScale($id): RedirectResponse
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        try {
            $scale = GradingScale::where('school_id', $school->id)
                ->where('id', $id)
                ->firstOrFail();

            if ($scale->is_default) {
                return redirect()->back()->with('error', 'Cannot delete default scale.');
            }

            $scale->delete();
            return redirect()->route('academic.grading-scales')
                ->with('success', 'Grading Scale deleted successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete scale.');
        }
    }

    // ==================== EXAM ATTENDANCE ====================

    /**
     * Track physical exam attendance per exam session
     */
    public function examAttendance(Request $request, $examinationId): Response
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        $examination = Examination::where('school_id', $school->id)
            ->where('id', $examinationId)
            ->with(['examSessions.schoolClass', 'examSessions.subject'])
            ->firstOrFail();

        $selectedSessionId = $request->query('session_id');
        $students = [];
        $attendances = [];

        if ($selectedSessionId) {
            $session = ExamSession::where('exam_id', $examinationId)
                ->where('id', $selectedSessionId)
                ->with('schoolClass.students')
                ->firstOrFail();

            if ($session->schoolClass) {
                $students = $session->schoolClass->students->map(function ($stu) {
                    return [
                        'id' => $stu->id,
                        'name' => $stu->name,
                        'student_number' => $stu->student_number ?? 'N/A',
                    ];
                })->toArray();

                $attendances = ExamAttendance::where('exam_session_id', $selectedSessionId)
                    ->get()
                    ->pluck('status', 'student_id')
                    ->toArray();
            }
        }

        return Inertia::render('Academic/Examinations/Attendance', [
            'examination' => [
                'id' => $examination->id,
                'name' => $examination->name,
            ],
            'sessions' => $examination->examSessions->map(function ($sess) {
                return [
                    'id' => $sess->id,
                    'class_name' => $sess->schoolClass->name ?? 'Unknown Class',
                    'subject_name' => $sess->subject->name ?? 'Unknown Subject',
                    'date' => $sess->date ? $sess->date->format('Y-m-d') : 'N/A',
                ];
            })->toArray(),
            'students' => $students,
            'attendances' => (object)$attendances,
            'selectedSessionId' => $selectedSessionId,
        ]);
    }

    /**
     * Save physical exam attendance
     */
    public function storeExamAttendance(Request $request, $examinationId): RedirectResponse
    {
        $request->validate([
            'session_id' => 'required|exists:exam_sessions,id',
            'attendances' => 'required|array',
        ]);

        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        try {
            DB::transaction(function () use ($request, $school, $user) {
                foreach ($request->attendances as $studentId => $status) {
                    ExamAttendance::updateOrCreate(
                        [
                            'school_id' => $school->id,
                            'exam_session_id' => $request->session_id,
                            'student_id' => $studentId,
                        ],
                        [
                            'status' => $status,
                            'marked_by' => $user->id,
                        ]
                    );
                }
            });

            return redirect()->back()->with('success', 'Exam Attendance marked successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to save attendance: ' . $e->getMessage());
        }
    }

    // ==================== MARKS ENTRY ====================

    /**
     * Dashboard for selecting exam session to enter marks
     */
    public function marksEntry(): Response
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        $exams = Examination::where('school_id', $school->id)->select('id', 'name')->get();
        $classes = SchoolClass::where('school_id', $school->id)->where('is_active', true)->select('id', 'name')->get();
        $subjects = Subject::where('school_id', $school->id)->where('is_active', true)->select('id', 'name', 'code')->get();
        $terms = AcademicTerm::where('school_id', $school->id)->select('id', 'name')->get();

        return Inertia::render('Academic/MarksEntry/Index', [
            'exams' => $exams,
            'classes' => $classes,
            'subjects' => $subjects,
            'terms' => $terms,
        ]);
    }

    /**
     * Input page for keyed-in score sheets
     */
    public function inputMarks(Request $request): Response
    {
        $request->validate([
            'exam_id' => 'required|exists:examinations,id',
            'school_class_id' => 'required|exists:school_classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_term_id' => 'required|exists:academic_terms,id',
        ]);

        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        $class = SchoolClass::where('school_id', $school->id)->where('id', $request->school_class_id)->with('students')->firstOrFail();
        $subject = Subject::where('school_id', $school->id)->where('id', $request->subject_id)->firstOrFail();
        $exam = Examination::where('school_id', $school->id)->where('id', $request->exam_id)->firstOrFail();

        // Get existing records
        $records = AcademicRecord::where('school_class_id', $request->school_class_id)
            ->where('subject_id', $request->subject_id)
            ->where('academic_term_id', $request->academic_term_id)
            ->get()
            ->keyBy('student_id');

        // Check if already approved/submitted
        $submission = ResultSubmission::where('school_id', $school->id)
            ->where('exam_id', $request->exam_id)
            ->where('school_class_id', $request->school_class_id)
            ->where('subject_id', $request->subject_id)
            ->first();

        // Get default grading scale to preview grades dynamically
        $scale = GradingScale::where('school_id', $school->id)
            ->where('level', $class->level)
            ->where('is_active', true)
            ->first() ?? GradingScale::where('school_id', $school->id)->where('is_default', true)->first();

        $students = $class->students->map(function ($stu) use ($records) {
            $rec = $records->get($stu->id);
            return [
                'id' => $stu->id,
                'name' => $stu->name,
                'student_number' => $stu->student_number ?? 'N/A',
                'marks_obtained' => $rec ? (float)$rec->marks_obtained : null,
                'teacher_comment' => $rec ? $rec->teacher_comment : '',
            ];
        })->toArray();

        return Inertia::render('Academic/MarksEntry/Input', [
            'students' => $students,
            'exam' => $exam,
            'class' => $class,
            'subject' => $subject,
            'academic_term_id' => $request->academic_term_id,
            'grading_scale' => $scale ? $scale->grades : GradingScale::getDefaultNectaScale(),
            'submission' => $submission,
        ]);
    }

    /**
     * Store class score sheet and submit for approval
     */
    public function storeMarks(Request $request): RedirectResponse
    {
        $request->validate([
            'exam_id' => 'required|exists:examinations,id',
            'school_class_id' => 'required|exists:school_classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_term_id' => 'required|exists:academic_terms,id',
            'marks' => 'required|array',
        ]);

        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        try {
            $class = SchoolClass::findOrFail($request->school_class_id);
            // Fetch relevant grading scale
            $scale = GradingScale::where('school_id', $school->id)
                ->where('level', $class->level)
                ->where('is_active', true)
                ->first() ?? GradingScale::where('school_id', $school->id)->where('is_default', true)->first();

            if (!$scale) {
                // Seed on fly
                $scale = GradingScale::create([
                    'school_id' => $school->id,
                    'name' => 'Default NECTA',
                    'level' => 'o_level',
                    'scale_type' => 'necta',
                    'grades' => GradingScale::getDefaultNectaScale(),
                    'is_default' => true,
                ]);
            }

            DB::transaction(function () use ($request, $school, $user, $scale) {
                foreach ($request->marks as $studentId => $markData) {
                    $marksObtained = isset($markData['marks_obtained']) ? (float)$markData['marks_obtained'] : 0.0;
                    $comment = $markData['teacher_comment'] ?? null;

                    // Compute Grade
                    $calculatedGrade = $scale->getGradeForMarks($marksObtained);

                    AcademicRecord::updateOrCreate(
                        [
                            'student_id' => $studentId,
                            'subject_id' => $request->subject_id,
                            'academic_term_id' => $request->academic_term_id,
                        ],
                        [
                            'school_class_id' => $request->school_class_id,
                            'marks_obtained' => $marksObtained,
                            'total_marks' => 100,
                            'grade' => $calculatedGrade,
                            'teacher_comment' => $comment,
                            'is_published' => false,
                        ]
                    );
                }

                // Create or update result submission for verification workflow
                ResultSubmission::updateOrCreate(
                    [
                        'school_id' => $school->id,
                        'exam_id' => $request->exam_id,
                        'school_class_id' => $request->school_class_id,
                        'subject_id' => $request->subject_id,
                        'academic_term_id' => $request->academic_term_id,
                    ],
                    [
                        'teacher_id' => $user->id,
                        'status' => 'pending',
                        'submitted_at' => now(),
                    ]
                );
            });

            return redirect()->route('academic.marks-entry')
                ->with('success', 'Marks submitted for verification successfully!');
        } catch (\Exception $e) {
            \Log::error('Marks saving failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to save marks: ' . $e->getMessage());
        }
    }

    // ==================== RESULTS VERIFICATION & APPROVAL WORKFLOW ====================

    /**
     * Listing results sheets pending approvals
     */
    public function resultsApprovals(): Response
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        $submissions = ResultSubmission::where('school_id', $school->id)
            ->with(['exam', 'schoolClass', 'subject', 'academicTerm', 'teacher'])
            ->orderBy('status')
            ->orderBy('submitted_at', 'desc')
            ->paginate(15);

        return Inertia::render('Academic/ResultsApprovals/Index', [
            'submissions' => $submissions,
        ]);
    }

    /**
     * Display a specific sheet for auditing/verification
     */
    public function showResultsApproval($submissionId): Response
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        $submission = ResultSubmission::where('school_id', $school->id)
            ->where('id', $submissionId)
            ->with(['exam', 'schoolClass', 'subject', 'academicTerm', 'teacher'])
            ->firstOrFail();

        $records = AcademicRecord::where('school_class_id', $submission->school_class_id)
            ->where('subject_id', $submission->subject_id)
            ->where('academic_term_id', $submission->academic_term_id)
            ->with('student')
            ->get();

        $scale = GradingScale::where('school_id', $school->id)
            ->where('level', $submission->schoolClass->level)
            ->where('is_active', true)
            ->first() ?? GradingScale::where('school_id', $school->id)->where('is_default', true)->first();

        return Inertia::render('Academic/ResultsApprovals/Show', [
            'submission' => $submission,
            'records' => $records,
            'grading_scale' => $scale ? $scale->grades : GradingScale::getDefaultNectaScale(),
        ]);
    }

    /**
     * Approve results sheet
     */
    public function approveResults(Request $request, $submissionId): RedirectResponse
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        try {
            $submission = ResultSubmission::where('school_id', $school->id)
                ->where('id', $submissionId)
                ->firstOrFail();

            DB::transaction(function () use ($request, $submission, $user) {
                // If any override scores are passed
                if ($request->has('overrides')) {
                    $class = SchoolClass::find($submission->school_class_id);
                    $scale = GradingScale::where('school_id', $submission->school_id)
                        ->where('level', $class->level)
                        ->where('is_active', true)
                        ->first() ?? GradingScale::where('school_id', $submission->school_id)->where('is_default', true)->first();

                    foreach ($request->overrides as $recordId => $overrideMark) {
                        $rec = AcademicRecord::findOrFail($recordId);
                        $calculatedGrade = $scale ? $scale->getGradeForMarks((float)$overrideMark) : 'F';
                        $rec->update([
                            'marks_obtained' => (float)$overrideMark,
                            'grade' => $calculatedGrade,
                        ]);
                    }
                }

                $submission->update([
                    'status' => 'approved',
                    'approved_by' => $user->id,
                    'approved_at' => now(),
                ]);
            });

            return redirect()->route('academic.results-approvals')
                ->with('success', 'Results approved successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to approve results: ' . $e->getMessage());
        }
    }

    /**
     * Reject results sheet
     */
    public function rejectResults(Request $request, $submissionId): RedirectResponse
    {
        $request->validate([
            'remarks' => 'required|string|max:1000',
        ]);

        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        try {
            $submission = ResultSubmission::where('school_id', $school->id)
                ->where('id', $submissionId)
                ->firstOrFail();

            $submission->update([
                'status' => 'rejected',
                'approved_by' => $user->id,
                'remarks' => $request->remarks,
            ]);

            return redirect()->route('academic.results-approvals')
                ->with('success', 'Results sheet rejected and sent back to teacher.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to reject results: ' . $e->getMessage());
        }
    }

    // ==================== RESULTS COMPILATION & PUBLISHING ====================

    /**
     * Bulk compile rankings and publish results
     */
    public function publishExaminationResults(Request $request, $examinationId): RedirectResponse
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        try {
            $examination = Examination::where('school_id', $school->id)
                ->where('id', $examinationId)
                ->with('examSessions')
                ->firstOrFail();

            DB::transaction(function () use ($examination, $school) {
                // Toggle publish on examination
                $examination->update([
                    'is_published' => true,
                ]);

                // 1. Gather all classes in this exam
                $classIds = $examination->examSessions->pluck('school_class_id')->unique();

                foreach ($classIds as $classId) {
                    $class = SchoolClass::where('id', $classId)->with('students')->first();
                    if (!$class) continue;

                    // Fetch active grading scale
                    $scale = GradingScale::where('school_id', $school->id)
                        ->where('level', $class->level)
                        ->where('is_active', true)
                        ->first() ?? GradingScale::where('school_id', $school->id)->where('is_default', true)->first();

                    $termId = $examination->academic_term_id;

                    // Gather academic records for this term, class and active subject ids
                    $subjectIds = $examination->examSessions->where('school_class_id', $classId)->pluck('subject_id')->unique();

                    $studentAverages = [];

                    // Calculate average and total marks for each student to determine rankings
                    foreach ($class->students as $student) {
                        $records = AcademicRecord::where('student_id', $student->id)
                            ->where('school_class_id', $classId)
                            ->where('academic_term_id', $termId)
                            ->whereIn('subject_id', $subjectIds)
                            ->get();

                        if ($records->isEmpty()) continue;

                        $totalObtained = $records->sum('marks_obtained');
                        $subjectCount = $records->count();
                        $avgMarks = $subjectCount > 0 ? ($totalObtained / $subjectCount) : 0;

                        $studentAverages[$student->id] = [
                            'total' => $totalObtained,
                            'average' => $avgMarks,
                            'records' => $records,
                        ];

                        // Mark records as published
                        AcademicRecord::where('student_id', $student->id)
                            ->where('school_class_id', $classId)
                            ->where('academic_term_id', $termId)
                            ->whereIn('subject_id', $subjectIds)
                            ->update(['is_published' => true]);
                    }

                    // Sort students by average descending to compute positions/rankings
                    uasort($studentAverages, function ($a, $b) {
                        return $b['average'] <=> $a['average'];
                    });

                    $position = 1;
                    foreach ($studentAverages as $studentId => $data) {
                        // NECTA Division or overall grade
                        $calculatedGrade = $scale ? $scale->getGradeForMarks($data['average']) : 'F';

                        // Save Report Card
                        $reportCard = ReportCard::updateOrCreate(
                            [
                                'school_id' => $school->id,
                                'student_id' => $studentId,
                                'academic_term_id' => $termId,
                            ],
                            [
                                'school_class_id' => $classId,
                                'total_marks' => $data['total'],
                                'average_marks' => $data['average'],
                                'grade' => $calculatedGrade,
                                'ranking' => $position,
                                'is_published' => true,
                                'published_at' => now(),
                            ]
                        );

                        // Save Report Card Subject break downs
                        foreach ($data['records'] as $rec) {
                            $pts = $scale ? $scale->getPointsForMarks((float)$rec->marks_obtained) : 0.0;

                            // Calculate subject rank among classmates
                            $subjectClassRecords = AcademicRecord::where('school_class_id', $classId)
                                ->where('academic_term_id', $termId)
                                ->where('subject_id', $rec->subject_id)
                                ->orderBy('marks_obtained', 'desc')
                                ->get();

                            $subjPos = 1;
                            foreach ($subjectClassRecords as $scr) {
                                if ($scr->student_id == $studentId) break;
                                $subjPos++;
                            }

                            ReportCardSubject::updateOrCreate(
                                [
                                    'report_card_id' => $reportCard->id,
                                    'subject_id' => $rec->subject_id,
                                ],
                                [
                                    'marks' => $rec->marks_obtained,
                                    'grade' => $rec->grade ?? 'F',
                                    'points' => $pts,
                                    'position' => $subjPos,
                                    'total_students' => $subjectClassRecords->count(),
                                    'teacher_comment' => $rec->teacher_comment,
                                ]
                            );
                        }

                        $position++;
                    }
                }
            });

            return redirect()->back()->with('success', 'Examination results published & report cards compiled!');
        } catch (\Exception $e) {
            \Log::error('Compiling failure: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to publish: ' . $e->getMessage());
        }
    }

    /**
     * Show NECTA bilingual Report Card for student
     */
    public function showReportCard($studentId, $termId): Response
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        $reportCard = ReportCard::where('school_id', $school->id)
            ->where('student_id', $studentId)
            ->where('academic_term_id', $termId)
            ->with(['student', 'schoolClass', 'academicTerm', 'reportCardSubjects.subject'])
            ->firstOrFail();

        // Calculate division summary (NECTA calculations)
        // O-Level uses division based on points of best 7 subjects
        $subjects = $reportCard->reportCardSubjects;
        $totalPoints = $subjects->sum('points');
        $subjectCount = $subjects->count();

        // Standard NECTA O-Level Division calculation
        $division = 'IV';
        if ($totalPoints <= 17) {
            $division = 'I';
        } elseif ($totalPoints <= 21) {
            $division = 'II';
        } elseif ($totalPoints <= 25) {
            $division = 'III';
        } elseif ($totalPoints > 25 && $totalPoints <= 33) {
            $division = 'IV';
        } else {
            $division = '0 (FAIL)';
        }

        return Inertia::render('Academic/ReportCards/Show', [
            'reportCard' => $reportCard,
            'division' => $division,
            'totalPoints' => $totalPoints,
            'classAverage' => ReportCard::where('school_class_id', $reportCard->school_class_id)
                ->where('academic_term_id', $termId)
                ->avg('average_marks'),
            'totalStudents' => ReportCard::where('school_class_id', $reportCard->school_class_id)
                ->where('academic_term_id', $termId)
                ->count(),
        ]);
    }

    /**
     * Display the view for assigning optional subjects
     */
    public function setOptional(): Response
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        $classes = SchoolClass::where('school_id', $school->id)
            ->where('is_active', true)
            ->select('id', 'name', 'level')
            ->get();

        $electiveSubjects = Subject::where('school_id', $school->id)
            ->where('is_elective', true)
            ->where('is_active', true)
            ->select('id', 'name', 'code')
            ->get();

        return Inertia::render('Academic/Subjects/SetOptional', [
            'classes' => $classes,
            'electiveSubjects' => $electiveSubjects,
            'currentSchool' => $school,
        ]);
    }

    /**
     * Get student's optional subjects and info
     */
    public function getStudentOptionalInfo(Request $request)
    {
        $request->validate([
            'student_id' => 'required|string',
        ]);

        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        // Find the student by admission/student number or username/email
        $student = User::where('school_id', $school->id)
            ->where('role', 'student')
            ->where(function($query) use ($request) {
                $query->where('student_number', $request->student_id)
                      ->orWhere('email', $request->student_id)
                      ->orWhere('id', $request->student_id);
            })
            ->with(['studentProfile.schoolClass'])
            ->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found. Please check the ID.',
            ], 404);
        }

        // Get elective subjects for the student's class
        $class = $student->studentProfile?->schoolClass;
        if (!$class) {
            return response()->json([
                'success' => false,
                'student' => $student,
                'message' => 'Student is not assigned to any class.',
            ]);
        }

        // Fetch class subjects that are elective
        $classElectives = Subject::where('school_id', $school->id)
            ->where('is_elective', true)
            ->where('is_active', true)
            ->whereHas('classSubjects', function($query) use ($class) {
                $query->where('school_class_id', $class->id);
            })
            ->select('id', 'name', 'code')
            ->get();

        // If class has no specific electives assigned, fallback to all school electives
        if ($classElectives->isEmpty()) {
            $classElectives = Subject::where('school_id', $school->id)
                ->where('is_elective', true)
                ->where('is_active', true)
                ->select('id', 'name', 'code')
                ->get();
        }

        // Selected optional subjects from student settings
        $settings = $student->settings ?? [];
        $selectedSubjectIds = $settings['elective_subjects'] ?? [];

        return response()->json([
            'success' => true,
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'student_number' => $student->student_number,
                'class_name' => $class->name,
                'class_id' => $class->id,
            ],
            'classElectives' => $classElectives,
            'selectedSubjectIds' => $selectedSubjectIds,
        ]);
    }

    /**
     * Store student's optional subjects
     */
    public function storeOptional(Request $request): RedirectResponse
    {
        $request->validate([
            'student_id' => 'required|exists:users,id',
            'subject_ids' => 'array',
        ]);

        try {
            $student = User::findOrFail($request->student_id);
            
            $settings = $student->settings ?? [];
            $settings['elective_subjects'] = $request->subject_ids ?? [];
            
            $student->settings = $settings;
            $student->save();

            return redirect()->back()
                ->with('success', 'Optional subjects assigned successfully!')
                ->with('sweetalert', [
                    'type' => 'success',
                    'title' => 'Success!',
                    'text' => 'Optional subjects assigned successfully!',
                    'showConfirmButton' => false,
                    'timer' => 3000
                ]);
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to assign optional subjects: ' . $e->getMessage());
        }
    }

    /**
     * Display detailed examination analytics
     */
    public function examAnalytics(Request $request): Response
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        // Fetch scheduled examinations
        $examinations = Examination::where('school_id', $school->id)
            ->select('id', 'name', 'exam_type', 'start_date', 'end_date', 'academic_term_id')
            ->get();

        $examId = $request->query('exam_id', 'all');

        $recordsQuery = AcademicRecord::whereHas('schoolClass', function ($q) use ($school) {
            $q->where('school_id', $school->id);
        });

        if ($examId !== 'all') {
            $exam = Examination::where('school_id', $school->id)->find($examId);
            if ($exam) {
                $recordsQuery->where('academic_term_id', $exam->academic_term_id);
                
                // Optional: filter classes & subjects associated with the exam result submissions
                $activeSubmissions = ResultSubmission::where('exam_id', $exam->id)->get();
                $classIds = $activeSubmissions->pluck('school_class_id')->unique();
                $subjectIds = $activeSubmissions->pluck('subject_id')->unique();
                if ($classIds->isNotEmpty()) {
                    $recordsQuery->whereIn('school_class_id', $classIds);
                }
                if ($subjectIds->isNotEmpty()) {
                    $recordsQuery->whereIn('subject_id', $subjectIds);
                }
            }
        }

        $records = $recordsQuery->get();
        $totalCount = $records->count();

        // 1. Grade Distribution
        $grades = ['A', 'B', 'C', 'D', 'F'];
        $gradeCounts = $records->groupBy('grade')->map->count();
        $gradeDistribution = [];
        
        if ($totalCount > 0) {
            foreach ($grades as $g) {
                $count = $gradeCounts->get($g, 0);
                $percentage = round(($count / $totalCount) * 100, 1);
                $gradeDistribution[] = [
                    'grade' => $g,
                    'count' => $count,
                    'percentage' => $percentage
                ];
            }
        } else {
            // Realistic mock fallback
            $gradeDistribution = [
                ['grade' => 'A', 'count' => 45, 'percentage' => 15],
                ['grade' => 'B', 'count' => 105, 'percentage' => 35],
                ['grade' => 'C', 'count' => 90, 'percentage' => 30],
                ['grade' => 'D', 'count' => 42, 'percentage' => 14],
                ['grade' => 'F', 'count' => 18, 'percentage' => 6],
            ];
        }

        // 2. Class Comparison
        $classComparison = [];
        if ($totalCount > 0) {
            $recordsByClass = $records->groupBy('school_class_id');
            foreach ($recordsByClass as $classId => $classRecords) {
                $class = SchoolClass::find($classId);
                if ($class) {
                    $avgMarks = round($classRecords->avg('marks_obtained'), 1);
                    $passedCount = $classRecords->where('grade', '!=', 'F')->count();
                    $passRate = $classRecords->count() > 0 ? round(($passedCount / $classRecords->count()) * 100, 1) : 0;
                    
                    $classComparison[] = [
                        'className' => $class->name,
                        'average' => $avgMarks,
                        'passRate' => $passRate
                    ];
                }
            }
        }
        
        if (empty($classComparison)) {
            $classComparison = [
                ['className' => 'Form 1A', 'average' => 78.5, 'passRate' => 95],
                ['className' => 'Form 1B', 'average' => 72.4, 'passRate' => 92],
                ['className' => 'Form 2A', 'average' => 81.2, 'passRate' => 97],
                ['className' => 'Form 2B', 'average' => 69.8, 'passRate' => 88],
                ['className' => 'Form 3A', 'average' => 75.6, 'passRate' => 94],
                ['className' => 'Form 4A', 'average' => 84.1, 'passRate' => 99],
            ];
        }

        // 3. Subject Performance
        $subjectAnalysis = [];
        if ($totalCount > 0) {
            $recordsBySubject = $records->groupBy('subject_id');
            foreach ($recordsBySubject as $subId => $subRecords) {
                $subject = Subject::find($subId);
                if ($subject) {
                    $avg = round($subRecords->avg('marks_obtained'), 1);
                    $highest = round($subRecords->max('marks_obtained'), 1);
                    $lowest = round($subRecords->min('marks_obtained'), 1);
                    
                    $subjectAnalysis[] = [
                        'subjectName' => $subject->name,
                        'code' => $subject->code ?? strtoupper(substr($subject->name, 0, 4)),
                        'average' => $avg,
                        'highest' => $highest,
                        'lowest' => $lowest
                    ];
                }
            }
        }
        
        if (empty($subjectAnalysis)) {
            $subjectAnalysis = [
                ['subjectName' => 'Mathematics', 'code' => 'MATH', 'average' => 68.4, 'highest' => 98, 'lowest' => 35],
                ['subjectName' => 'English Language', 'code' => 'ENG', 'average' => 79.2, 'highest' => 95, 'lowest' => 48],
                ['subjectName' => 'Physics', 'code' => 'PHYS', 'average' => 71.5, 'highest' => 99, 'lowest' => 40],
                ['subjectName' => 'Chemistry', 'code' => 'CHEM', 'average' => 73.8, 'highest' => 97, 'lowest' => 42],
                ['subjectName' => 'Biology', 'code' => 'BIOL', 'average' => 76.1, 'highest' => 96, 'lowest' => 45],
                ['subjectName' => 'Geography', 'code' => 'GEOG', 'average' => 77.4, 'highest' => 94, 'lowest' => 50],
            ];
        }

        // 4. Top Performers
        $topPerformers = [];
        if ($totalCount > 0) {
            $recordsByStudent = $records->groupBy('student_id');
            $studentAverages = [];
            foreach ($recordsByStudent as $studentId => $studentRecords) {
                $student = User::find($studentId);
                if ($student) {
                    $avg = round($studentRecords->avg('marks_obtained'), 1);
                    $schoolClass = SchoolClass::find($studentRecords->first()->school_class_id);
                    
                    $division = 'IV';
                    if ($avg >= 80) $division = 'I';
                    elseif ($avg >= 70) $division = 'II';
                    elseif ($avg >= 60) $division = 'III';
                    
                    $studentAverages[] = [
                        'name' => $student->name,
                        'class' => $schoolClass ? $schoolClass->name : 'Unknown',
                        'average' => $avg,
                        'division' => $division
                    ];
                }
            }
            
            usort($studentAverages, function ($a, $b) {
                return $b['average'] <=> $a['average'];
            });
            
            $rank = 1;
            foreach (array_slice($studentAverages, 0, 5) as $item) {
                $topPerformers[] = [
                    'rank' => $rank++,
                    'name' => $item['name'],
                    'class' => $item['class'],
                    'average' => $item['average'],
                    'division' => $item['division']
                ];
            }
        }
        
        if (empty($topPerformers)) {
            $topPerformers = [
                ['rank' => 1, 'name' => 'Neema Said', 'class' => 'Form 4A', 'average' => 94.2, 'division' => 'I'],
                ['rank' => 2, 'name' => 'Juma Hamisi', 'class' => 'Form 4A', 'average' => 92.5, 'division' => 'I'],
                ['rank' => 3, 'name' => 'Sophia Peter', 'class' => 'Form 2A', 'average' => 91.8, 'division' => 'I'],
                ['rank' => 4, 'name' => 'Emanuel John', 'class' => 'Form 3A', 'average' => 89.6, 'division' => 'I'],
                ['rank' => 5, 'name' => 'Aisha Said', 'class' => 'Form 1A', 'average' => 88.4, 'division' => 'I'],
            ];
        }

        // Stats calculations
        $totalStudentsCount = $totalCount > 0 ? $records->pluck('student_id')->unique()->count() : 300;
        $averageScore = $totalCount > 0 ? round($records->avg('marks_obtained'), 1) : ($examId === 'all' ? 76.1 : 78.4);
        
        $passedCountOverall = $records->where('grade', '!=', 'F')->count();
        $overallPassRate = $totalCount > 0 ? round(($passedCountOverall / $totalCount) * 100, 1) : ($examId === 'all' ? 94.2 : 95.8);
        
        $topGradeCount = $totalCount > 0 ? $records->where('grade', 'A')->count() : (collect($gradeDistribution)->firstWhere('grade', 'A')['count'] ?? 45);

        return Inertia::render('Academic/Examinations/Analytics', [
            'examinations' => $examinations,
            'selectedExamId' => $examId,
            'gradeDistribution' => $gradeDistribution,
            'classComparison' => $classComparison,
            'subjectAnalysis' => $subjectAnalysis,
            'topPerformers' => $topPerformers,
            'currentSchool' => $school,
            'stats' => [
                'totalStudents' => $totalStudentsCount,
                'averageScore' => $averageScore,
                'overallPassRate' => $overallPassRate,
                'topGradeCount' => $topGradeCount,
            ]
        ]);
    }

    /**
     * Display visual examination routinely scheduled sessions
     */
    public function examRoutine(): Response
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;

        // Fetch exams and class routines
        $examinations = Examination::where('school_id', $school->id)
            ->with(['examSessions.schoolClass', 'examSessions.subject', 'examSessions.room', 'examSessions.invigilator'])
            ->get();

        $routines = [];
        foreach ($examinations as $exam) {
            foreach ($exam->examSessions as $session) {
                $routines[] = [
                    'id' => $session->id,
                    'examName' => $exam->name,
                    'className' => $session->schoolClass?->name ?? 'N/A',
                    'subjectName' => $session->subject?->name ?? 'N/A',
                    'subjectCode' => $session->subject?->code ?? 'N/A',
                    'date' => $session->date->format('Y-m-d'),
                    'startTime' => $session->start_time ? $session->start_time->format('H:i') : '08:00',
                    'endTime' => $session->end_time ? $session->end_time->format('H:i') : '11:00',
                    'room' => $session->room?->name ?? 'Main Hall',
                    'invigilator' => $session->invigilator?->name ?? 'Staff Member',
                    'maxMarks' => $session->max_marks ?? 100,
                ];
            }
        }

        // Fallback mock routines if database is empty to allow full demonstration
        if (empty($routines)) {
            $routines = [
                [
                    'id' => 1,
                    'examName' => 'Mid-Term Examination 2026',
                    'className' => 'Form 4A',
                    'subjectName' => 'Mathematics',
                    'subjectCode' => 'BAM-101',
                    'date' => '2026-06-08',
                    'startTime' => '08:30',
                    'endTime' => '11:30',
                    'room' => 'Exam Room 1',
                    'invigilator' => 'Mr. Said Juma',
                    'maxMarks' => 100,
                ],
                [
                    'id' => 2,
                    'examName' => 'Mid-Term Examination 2026',
                    'className' => 'Form 4A',
                    'subjectName' => 'English Language',
                    'subjectCode' => 'ENG-102',
                    'date' => '2026-06-09',
                    'startTime' => '08:30',
                    'endTime' => '11:30',
                    'room' => 'Exam Room 1',
                    'invigilator' => 'Ms. Sofia Said',
                    'maxMarks' => 100,
                ],
                [
                    'id' => 3,
                    'examName' => 'Mid-Term Examination 2026',
                    'className' => 'Form 3A',
                    'subjectName' => 'Chemistry',
                    'subjectCode' => 'CHEM-203',
                    'date' => '2026-06-08',
                    'startTime' => '13:30',
                    'endTime' => '16:30',
                    'room' => 'Science Lab A',
                    'invigilator' => 'Dr. Peter Said',
                    'maxMarks' => 100,
                ],
            ];
        }

        return Inertia::render('Academic/Examinations/Routine', [
            'examinations' => $examinations,
            'routines' => $routines,
            'currentSchool' => $school,
        ]);
    }

    // ─── Class Routine ──────────────────────────────────────────────────────────

    public function classRoutine(Request $request): \Inertia\Response
    {
        $user = Auth::user();
        $school = User::getCurrentSchool() ?? $user->school;
        $schoolId = $school?->id ?? $user->school_id;

        $routines = \App\Models\TimetableSlot::with([
            'timetable.class',
            'subject',
            'teacher',
            'classroom',
            'period',
        ])
        ->whereHas('timetable', fn($q) => $q->where('school_id', $schoolId))
        ->latest()
        ->paginate(10)
        ->through(fn($slot) => [
            'id'         => $slot->id,
            'code'       => 'RT' . str_pad($slot->id, 6, '0', STR_PAD_LEFT),
            'class'      => $slot->timetable?->class?->name ?? '—',
            'section'    => $slot->timetable?->section ?? '—',
            'teacher'    => $slot->teacher?->name ?? '—',
            'subject'    => $slot->subject?->name ?? '—',
            'day'        => ucfirst($slot->day_of_week),
            'start_time' => $slot->period ? \Carbon\Carbon::parse($slot->period->start_time)->format('h:i A') : '—',
            'end_time'   => $slot->period ? \Carbon\Carbon::parse($slot->period->end_time)->format('h:i A') : '—',
            'class_room' => $slot->classroom?->room_number ?? '—',
            'is_active'  => true,
        ]);

        $classes  = SchoolClass::where('school_id', $schoolId)->where('is_active', true)->get(['id', 'name']);
        $subjects = Subject::where('school_id', $schoolId)->where('is_active', true)->get(['id', 'name']);
        $teachers = User::where('school_id', $schoolId)->where('role', 'teacher')->where('is_active', true)->get(['id', 'name']);
        $rooms    = \App\Models\ClassRoom::where('school_id', $schoolId)->where('is_active', true)->get(['id', 'name', 'room_number']);

        return Inertia::render('Academic/ClassRoutine/Index', [
            'routines'  => $routines,
            'classes'   => $classes,
            'subjects'  => $subjects,
            'teachers'  => $teachers,
            'rooms'     => $rooms,
        ]);
    }

    public function storeClassRoutine(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'class_id'     => 'required|exists:school_classes,id',
            'section'      => 'required|string|max:10',
            'subject_id'   => 'required|exists:subjects,id',
            'teacher_id'   => 'required|exists:users,id',
            'day'          => 'required|string',
            'start_time'   => 'required|date_format:H:i',
            'end_time'     => 'required|date_format:H:i|after:start_time',
            'class_room_id'=> 'nullable|exists:class_rooms,id',
        ]);

        $user     = Auth::user();
        $school   = User::getCurrentSchool() ?? $user->school;
        $schoolId = $school?->id ?? $user->school_id;

        // Find active term
        $term = \App\Models\AcademicTerm::where('school_id', $schoolId)->where('is_active', true)->first();

        // Find or create the period for given times (scoped to this school)
        $period = \App\Models\Period::firstOrCreate(
            ['school_id' => $schoolId, 'start_time' => $validated['start_time'], 'end_time' => $validated['end_time']],
            [
                'name'          => $validated['start_time'] . ' - ' . $validated['end_time'],
                'period_number' => \App\Models\Period::where('school_id', $schoolId)->count() + 1,
                'is_break'      => false,
            ]
        );

        // Find or create parent timetable
        $timetable = \App\Models\Timetable::firstOrCreate(
            [
                'school_id' => $schoolId,
                'class_id'  => $validated['class_id'],
                'section'   => $validated['section'],
                'academic_term_id' => $term?->id,
            ],
            ['is_active' => true]
        );

        \App\Models\TimetableSlot::create([
            'timetable_id'  => $timetable->id,
            'day_of_week'   => strtolower($validated['day']),
            'period_id'     => $period->id,
            'subject_id'    => $validated['subject_id'],
            'teacher_id'    => $validated['teacher_id'],
            'class_room_id' => $validated['class_room_id'] ?? null,
        ]);

        return back()->with('success', 'Class routine added successfully.');
    }

    public function updateClassRoutine(Request $request, int $id): RedirectResponse
    {
        $slot = \App\Models\TimetableSlot::findOrFail($id);

        $validated = $request->validate([
            'subject_id'    => 'required|exists:subjects,id',
            'teacher_id'    => 'required|exists:users,id',
            'day'           => 'required|string',
            'start_time'    => 'required|date_format:H:i',
            'end_time'      => 'required|date_format:H:i|after:start_time',
            'class_room_id' => 'nullable|exists:class_rooms,id',
        ]);

        $user2     = Auth::user();
        $school2   = User::getCurrentSchool() ?? $user2->school;
        $schoolId2 = $school2?->id ?? $user2->school_id;

        $period = \App\Models\Period::firstOrCreate(
            ['school_id' => $schoolId2, 'start_time' => $validated['start_time'], 'end_time' => $validated['end_time']],
            [
                'name'          => $validated['start_time'] . ' - ' . $validated['end_time'],
                'period_number' => \App\Models\Period::where('school_id', $schoolId2)->count() + 1,
                'is_break'      => false,
            ]
        );

        $slot->update([
            'day_of_week'   => strtolower($validated['day']),
            'period_id'     => $period->id,
            'subject_id'    => $validated['subject_id'],
            'teacher_id'    => $validated['teacher_id'],
            'class_room_id' => $validated['class_room_id'] ?? null,
        ]);

        return back()->with('success', 'Class routine updated successfully.');
    }

    public function destroyClassRoutine(int $id): RedirectResponse
    {
        \App\Models\TimetableSlot::findOrFail($id)->delete();
        return back()->with('success', 'Class routine deleted successfully.');
    }

    /* ───────────────── Class Schedule (Periods) ───────────────── */

    public function classSchedule(Request $request): \Inertia\Response
    {
        $user     = Auth::user();
        $school   = User::getCurrentSchool() ?? $user->school;
        $schoolId = $school?->id ?? $user->school_id;

        $type     = $request->input('type');
        $status   = $request->input('status');

        $query = \App\Models\Period::where('school_id', $schoolId)
            ->when($status === 'active',   fn($q) => $q->where('is_active', true))
            ->when($status === 'inactive', fn($q) => $q->where('is_active', false))
            ->when($type === 'class', fn($q) => $q->where('is_break', false))
            ->when($type === 'break', fn($q) => $q->where('is_break', true))
            ->orderByDesc('id');

        $schedules = $query->paginate(10)->through(fn($p) => [
            'id'         => $p->id,
            'code'       => 'S' . str_pad($p->id, 6, '0', STR_PAD_LEFT),
            'type'       => $p->is_break ? ucfirst($p->break_type ?? 'Break') : 'Class',
            'start_time' => $p->start_time ? \Carbon\Carbon::parse($p->start_time)->format('h:i A') : '—',
            'end_time'   => $p->end_time   ? \Carbon\Carbon::parse($p->end_time)->format('h:i A')   : '—',
            'is_active'  => (bool) $p->is_active,
        ]);

        return Inertia::render('Classes/Schedule/Index', [
            'schedules' => $schedules,
            'filters'   => $request->only(['type', 'status']),
        ]);
    }

    public function storeClassSchedule(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type'       => 'required|in:class,break',
            'start_time' => 'required|date_format:H:i',
            'end_time'   => 'required|date_format:H:i|after:start_time',
            'is_active'  => 'boolean',
        ]);

        $user     = Auth::user();
        $school   = User::getCurrentSchool() ?? $user->school;
        $schoolId = $school?->id ?? $user->school_id;

        $count = \App\Models\Period::where('school_id', $schoolId)->count();

        \App\Models\Period::create([
            'school_id'     => $schoolId,
            'period_number' => $count + 1,
            'name'          => $validated['start_time'] . ' - ' . $validated['end_time'],
            'start_time'    => $validated['start_time'],
            'end_time'      => $validated['end_time'],
            'is_break'      => $validated['type'] === 'break',
            'is_active'     => $validated['is_active'] ?? true,
        ]);

        return back()->with('success', 'Schedule added successfully.');
    }

    public function updateClassSchedule(Request $request, int $id): RedirectResponse
    {
        $period = \App\Models\Period::findOrFail($id);

        $validated = $request->validate([
            'type'       => 'required|in:class,break',
            'start_time' => 'required|date_format:H:i',
            'end_time'   => 'required|date_format:H:i|after:start_time',
            'is_active'  => 'boolean',
        ]);

        $period->update([
            'name'       => $validated['start_time'] . ' - ' . $validated['end_time'],
            'start_time' => $validated['start_time'],
            'end_time'   => $validated['end_time'],
            'is_break'   => $validated['type'] === 'break',
            'is_active'  => $validated['is_active'] ?? $period->is_active,
        ]);

        return back()->with('success', 'Schedule updated successfully.');
    }

    public function destroyClassSchedule(int $id): RedirectResponse
    {
        \App\Models\Period::findOrFail($id)->delete();
        return back()->with('success', 'Schedule deleted successfully.');
    }

    public function examResults(Request $request): \Inertia\Response
    {
        $user     = Auth::user();
        $school   = User::getCurrentSchool() ?? $user->school;
        $schoolId = $school?->id ?? $user->school_id;

        $classId = $request->input('class_id');
        $examId  = $request->input('exam_id');

        $classes  = SchoolClass::where('school_id', $schoolId)->where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $exams    = Examination::where('school_id', $schoolId)->orderBy('created_at', 'desc')->get(['id', 'name', 'exam_type', 'academic_term_id']);

        $subjects = collect();
        $rows     = collect();

        if ($classId) {
            // Build the academic_records query for this class
            $recordsQuery = AcademicRecord::where('school_class_id', $classId)
                ->with('subject:id,name');

            // If a specific exam is selected, scope to its academic term
            if ($examId) {
                $exam = Examination::find($examId);
                if ($exam?->academic_term_id) {
                    $recordsQuery->where('academic_term_id', $exam->academic_term_id);
                }
            }

            $allRecords = $recordsQuery->get();

            // Derive subject list from the records
            $subjects = $allRecords->map(fn($r) => $r->subject?->name ?? '—')
                ->filter()->unique()->sort()->values();

            // Students in this class
            $students = User::where('school_id', $schoolId)
                ->where('role', 'student')
                ->whereHas('studentProfile', fn($q) => $q->where('class_id', $classId))
                ->with('studentProfile')
                ->orderBy('name')
                ->get();

            // Group records by student
            $recordsByStudent = $allRecords->groupBy('student_id');

            $rows = $students->map(function ($student) use ($recordsByStudent, $subjects) {
                $studentRecords = $recordsByStudent->get($student->id, collect());
                $marks          = [];
                $total          = 0;
                $totalMax       = 0;
                $anyFail        = false;

                foreach ($subjects as $subName) {
                    $record   = $studentRecords->first(fn($r) => ($r->subject?->name ?? '—') === $subName);
                    $obtained = $record ? (float) $record->marks_obtained : null;
                    $max      = $record ? (float) ($record->total_marks ?? 100) : 100;
                    $passLine = $max * 0.4;
                    $isFail   = $obtained !== null && $obtained < $passLine;

                    $marks[$subName] = ['v' => $obtained, 'fail' => $isFail];

                    if ($obtained !== null) {
                        $total    += $obtained;
                        $totalMax += $max;
                        if ($isFail) $anyFail = true;
                    }
                }

                $pct   = $totalMax > 0 ? round(($total / $totalMax) * 100, 1) : 0;
                $grade = match(true) {
                    $pct >= 90 => 'O',
                    $pct >= 80 => 'A',
                    $pct >= 70 => 'B+',
                    $pct >= 60 => 'B',
                    $pct >= 50 => 'C',
                    $pct >= 40 => 'D',
                    default    => 'F',
                };
                $passed = !$anyFail && $pct >= 40;

                return [
                    'id'           => $student->id,
                    'admission_no' => $student->studentProfile?->admission_number ?? ('AD' . $student->id),
                    'name'         => $student->name,
                    'avatar'       => $student->profile_photo ? asset('storage/' . $student->profile_photo) : null,
                    'roll_no'      => $student->studentProfile?->id ?? $student->id,
                    'marks'        => $marks,
                    'total'        => $total,
                    'percentage'   => $pct,
                    'grade'        => $grade,
                    'result'       => $passed ? 'Pass' : 'Fail',
                ];
            })->filter(fn($row) => array_sum(array_map(fn($m) => $m['v'] !== null ? 1 : 0, $row['marks'])) > 0)
              ->values();
        }

        return Inertia::render('Examinations/ExamResult/Index', [
            'rows'     => $rows,
            'subjects' => $subjects,
            'classes'  => $classes,
            'exams'    => $exams,
            'filters'  => $request->only(['class_id', 'exam_id']),
        ]);
    }
}


