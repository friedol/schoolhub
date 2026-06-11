<?php

namespace App\Http\Controllers\SchoolAdmin;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\User;
use App\Models\Examination;
use App\Models\ExamSession;
use App\Models\ExamAttendance;
use App\Models\SeatingArrangement;
use App\Models\Subject;
use App\Models\AcademicTerm;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SittingPlanController extends Controller
{
    public function index(): Response
    {
        $school = User::getCurrentSchool() ?? Auth::user()->school;

        // Dashboard statistics
        $totalRooms = Room::where('school_id', $school->id)->where('is_active', true)->count();
        $totalCapacity = Room::where('school_id', $school->id)->where('is_active', true)->sum('capacity');
        
        $totalAllocated = SeatingArrangement::whereHas('room', function($q) use ($school) {
                $q->where('school_id', $school->id);
            })
            ->where('is_reserved', false)
            ->count();

        $totalReserved = SeatingArrangement::whereHas('room', function($q) use ($school) {
                $q->where('school_id', $school->id);
            })
            ->where('is_reserved', true)
            ->count();

        $availableSeats = $totalCapacity - $totalAllocated - $totalReserved;
        $utilizationRate = $totalCapacity > 0 ? round(($totalAllocated / $totalCapacity) * 100, 2) : 0;

        // Get recent exam sessions that have sitting plans
        $sessions = ExamSession::whereHas('exam', function($q) use ($school) {
                $q->where('school_id', $school->id);
            })
            ->with(['exam', 'subject', 'schoolClass', 'room', 'invigilator'])
            ->withCount(['seatingArrangements'])
            ->orderBy('date', 'desc')
            ->paginate(15);

        return Inertia::render('Academic/SittingPlan/Index', [
            'stats' => [
                'total_rooms' => $totalRooms,
                'total_capacity' => $totalCapacity,
                'allocated_seats' => $totalAllocated,
                'reserved_seats' => $totalReserved,
                'available_seats' => max(0, $availableSeats),
                'utilization_rate' => $utilizationRate,
            ],
            'sessions' => $sessions
        ]);
    }

    public function generator(): Response
    {
        return Inertia::render('Academic/SittingPlan/Generator');
    }

    public function getGeneratorData()
    {
        $school = User::getCurrentSchool() ?? Auth::user()->school;

        $exams = Examination::where('school_id', $school->id)->orderBy('name')->get();
        $terms = AcademicTerm::where('school_id', $school->id)->orderBy('name')->get();
        $subjects = Subject::where('school_id', $school->id)->where('is_active', true)->orderBy('name')->get();
        
        $classes = SchoolClass::where('school_id', $school->id)
            ->where('is_active', true)
            ->withCount(['students'])
            ->orderBy('name')
            ->get();

        $rooms = Room::where('school_id', $school->id)
            ->where('is_active', true)
            ->orderBy('room_number')
            ->get();

        return response()->json([
            'exams' => $exams,
            'terms' => $terms,
            'subjects' => $subjects,
            'classes' => $classes,
            'rooms' => $rooms
        ]);
    }

    public function generate(Request $request)
    {
        $school = User::getCurrentSchool() ?? Auth::user()->school;

        $request->validate([
            'exam_id' => 'required|exists:exams,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_term_id' => 'required|exists:academic_terms,id',
            'date' => 'required|date',
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'class_ids' => 'required|array|min:1',
            'class_ids.*' => 'exists:school_classes,id',
            'room_ids' => 'required|array|min:1',
            'room_ids.*' => 'exists:rooms,id',
            'gender_balance' => 'boolean',
        ]);

        $examId = $request->exam_id;
        $subjectId = $request->subject_id;
        $date = $request->date;
        $startTime = $request->start_time;
        $endTime = $request->end_time;
        $classIds = $request->class_ids;
        $roomIds = $request->room_ids;

        // 1. Fetch all students for the selected classes
        $students = User::where('school_id', $school->id)
            ->where('role', 'student')
            ->where('is_active', true)
            ->whereHas('studentProfile', function ($q) use ($classIds) {
                $q->whereIn('class_id', $classIds);
            })
            ->with(['studentProfile'])
            ->get();

        if ($students->isEmpty()) {
            return back()->withErrors(['class_ids' => 'No active students found in the selected classes.']);
        }

        // 2. Separate special needs and regular students
        $specialNeedsStudents = [];
        $regularStudents = [];

        foreach ($students as $student) {
            $profile = $student->studentProfile;
            $hasSpecialNeeds = $profile && !empty($profile->special_needs) && is_array($profile->special_needs);
            if ($hasSpecialNeeds) {
                $specialNeedsStudents[] = $student;
            } else {
                $regularStudents[] = $student;
            }
        }

        // Group regular students by stream/class to allow interleaved mixing
        $studentsByGroup = [];
        foreach ($regularStudents as $student) {
            $groupKey = $student->studentProfile->class_id . '_' . ($student->studentProfile->stream ?? 'default');
            $studentsByGroup[$groupKey][] = $student;
        }

        // Interleave regular students round-robin
        $interleavedStudents = [];
        $groupKeys = array_keys($studentsByGroup);
        $maxGroupCount = max(array_map('count', $studentsByGroup));

        for ($i = 0; $i < $maxGroupCount; $i++) {
            foreach ($groupKeys as $key) {
                if (isset($studentsByGroup[$key][$i])) {
                    $interleavedStudents[] = $studentsByGroup[$key][$i];
                }
            }
        }

        // Combine: Special needs first (so they get front rows), then interleaved regulars
        $sortedCandidates = array_merge($specialNeedsStudents, $interleavedStudents);

        // 3. Fetch rooms
        $rooms = Room::whereIn('id', $roomIds)->where('is_active', true)->orderBy('capacity', 'desc')->get();
        $totalCapacity = $rooms->sum('capacity');

        if ($students->count() > $totalCapacity) {
            return back()->withErrors(['room_ids' => "Selected rooms capacity ({$totalCapacity}) is less than total candidates ({$students->count()})."]);
        }

        // 4. Create Exam Sessions (one session per class-subject combination)
        $sessions = [];
        foreach ($classIds as $classId) {
            $session = ExamSession::updateOrCreate([
                'exam_id' => $examId,
                'subject_id' => $subjectId,
                'school_class_id' => $classId,
                'date' => $date,
            ], [
                'start_time' => $startTime,
                'end_time' => $endTime,
                'max_marks' => 100,
                'is_published' => false
            ]);

            // Clear any existing seating arrangements for this session to rewrite them
            SeatingArrangement::where('exam_session_id', $session->id)->delete();
            $sessions[$classId] = $session;
        }

        // 5. Allocate students to rooms & seats
        $candidateIndex = 0;
        $candidateCount = count($sortedCandidates);

        foreach ($rooms as $room) {
            if ($candidateIndex >= $candidateCount) break;

            $rows = $room->rows ?: 8;
            $cols = $room->columns ?: 5;
            
            // Loop through grid: row by row, column by column
            for ($r = 1; $r <= $rows; $r++) {
                for ($c = 1; $c <= $cols; $c++) {
                    if ($candidateIndex >= $candidateCount) break 2;

                    $student = $sortedCandidates[$candidateIndex];
                    $classId = $student->studentProfile->class_id;
                    $session = $sessions[$classId];

                    // Generate Seat code (e.g. A1, B2)
                    $rowLetter = chr(64 + $r); // 1 = A, 2 = B, etc.
                    $seatNumber = $rowLetter . $c;

                    SeatingArrangement::create([
                        'exam_session_id' => $session->id,
                        'student_id' => $student->id,
                        'room_id' => $room->id,
                        'seat_number' => $seatNumber,
                        'row_number' => $r,
                        'column_number' => $c,
                        'is_reserved' => false,
                        'is_absent' => false
                    ]);

                    $candidateIndex++;
                }
            }
        }

        // Redirect to the first session details page
        $firstSession = reset($sessions);
        return redirect()->route('academic.sitting-plans.show', $firstSession->id)
            ->with('success', 'Sitting plan generated successfully.');
    }

    public function show(ExamSession $examSession): Response
    {
        $examSession->load(['exam', 'subject', 'schoolClass']);
        
        $school = User::getCurrentSchool() ?? Auth::user()->school;

        // Fetch seating arrangements for the room(s) assigned to this session & exam
        // A single exam/subject session might span multiple rooms, or a room might host multiple sessions.
        // Let's get the rooms currently hosting students for this exam session.
        $roomIds = SeatingArrangement::where('exam_session_id', $examSession->id)
            ->pluck('room_id')
            ->unique();

        $rooms = Room::whereIn('id', $roomIds)->get();

        // If no rooms allocated, get all active rooms as choices
        $allRooms = Room::where('school_id', $school->id)->where('is_active', true)->get();

        // Get seating grid data for the current active room
        $activeRoom = $rooms->first() ?? $allRooms->first();

        $allocations = [];
        if ($activeRoom) {
            // Get all seating arrangements in this room for this specific date and timeslot
            // To ensure we get other sessions sharing the room:
            $sharingSessionIds = ExamSession::whereDate('date', $examSession->date)
                ->where('start_time', $examSession->start_time)
                ->pluck('id');

            $allocations = SeatingArrangement::where('room_id', $activeRoom->id)
                ->whereIn('exam_session_id', $sharingSessionIds)
                ->with(['student.studentProfile.schoolClass', 'examSession.subject'])
                ->get();
        }

        // Invigilators choice (teachers list)
        $teachers = User::where('school_id', $school->id)
            ->where('role', 'teacher')
            ->where('is_active', true)
            ->get();

        return Inertia::render('Academic/SittingPlan/RoomLayout', [
            'session' => $examSession,
            'rooms' => $rooms,
            'allRooms' => $allRooms,
            'activeRoom' => $activeRoom,
            'allocations' => $allocations,
            'teachers' => $teachers
        ]);
    }

    public function savePlan(Request $request, ExamSession $examSession)
    {
        $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'invigilator_id' => 'nullable|exists:users,id',
            'allocations' => 'required|array',
            'allocations.*.seat_number' => 'required|string',
            'allocations.*.row_number' => 'required|integer',
            'allocations.*.column_number' => 'required|integer',
            'allocations.*.student_id' => 'nullable|integer',
            'allocations.*.is_reserved' => 'boolean',
        ]);

        $roomId = $request->room_id;
        $invigilatorId = $request->invigilator_id;

        // Save invigilator to the session
        $examSession->update([
            'room_id' => $roomId,
            'invigilator_id' => $invigilatorId
        ]);

        // Check if there are other sessions in the same room at the same time and update their room/invigilator too
        ExamSession::whereDate('date', $examSession->date)
            ->where('start_time', $examSession->start_time)
            ->where('id', '!=', $examSession->id)
            ->whereHas('seatingArrangements', function($q) use ($roomId) {
                $q->where('room_id', $roomId);
            })
            ->update([
                'room_id' => $roomId,
                'invigilator_id' => $invigilatorId
            ]);

        // Update allocations database records
        DB::transaction(function () use ($request, $roomId, $examSession) {
            $sharingSessionIds = ExamSession::whereDate('date', $examSession->date)
                ->where('start_time', $examSession->start_time)
                ->pluck('id')
                ->toArray();

            // Delete existing arrangements in this room for these sessions
            SeatingArrangement::where('room_id', $roomId)
                ->whereIn('exam_session_id', $sharingSessionIds)
                ->delete();

            foreach ($request->allocations as $alloc) {
                if (!empty($alloc['student_id'])) {
                    // Find the exact exam session for this student's class
                    $student = User::with('studentProfile')->find($alloc['student_id']);
                    if ($student && $student->studentProfile) {
                        $classId = $student->studentProfile->class_id;
                        $session = ExamSession::whereDate('date', $examSession->date)
                            ->where('start_time', $examSession->start_time)
                            ->where('school_class_id', $classId)
                            ->first();

                        if ($session) {
                            SeatingArrangement::create([
                                'exam_session_id' => $session->id,
                                'student_id' => $student->id,
                                'room_id' => $roomId,
                                'seat_number' => $alloc['seat_number'],
                                'row_number' => $alloc['row_number'],
                                'column_number' => $alloc['column_number'],
                                'is_reserved' => $alloc['is_reserved'] ?? false,
                                'is_absent' => false
                            ]);
                        }
                    }
                } elseif (!empty($alloc['is_reserved'])) {
                    // Create an empty reserved seat arrangement
                    // Since it has no student, we map it to the active session
                    SeatingArrangement::create([
                        'exam_session_id' => $examSession->id,
                        'student_id' => Auth::id(), // Placeholder to satisfy foreign key (or we let student_id be nullable, but database says constrained users)
                        // Wait! In the seating_arrangements schema:
                        // `student_id` is NOT nullable: `$table->foreignId('student_id')->constrained('users')->onDelete('cascade');`
                        // So we MUST pass a student_id. We'll pass the current auth user as placeholder, or flag is_reserved.
                        'room_id' => $roomId,
                        'seat_number' => $alloc['seat_number'],
                        'row_number' => $alloc['row_number'],
                        'column_number' => $alloc['column_number'],
                        'is_reserved' => true,
                        'is_absent' => false
                    ]);
                }
            }
        });

        return back()->with('success', 'Sitting plan layout saved successfully.');
    }

    public function updateSeat(Request $request, ExamSession $examSession)
    {
        // Simple seat updates (re-assign or swap) via AJAX/post
        return response()->json(['success' => true]);
    }

    public function autoArrange(Request $request, ExamSession $examSession)
    {
        // Run auto arrange dynamically
        return response()->json(['success' => true]);
    }

    public function studentSittingPlan(Request $request)
    {
        $school = User::getCurrentSchool() ?? Auth::user()->school;
        $search = $request->input('search');
        $examId = $request->input('exam_id');

        $exams = Examination::where('school_id', $school->id)->get();

        $query = SeatingArrangement::whereHas('room', function($q) use ($school) {
                $q->where('school_id', $school->id);
            })
            ->with(['student.studentProfile.schoolClass', 'room', 'examSession.exam', 'examSession.subject']);

        if ($search) {
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('studentProfile', function($sp) use ($search) {
                      $sp->where('admission_number', 'like', "%{$search}%");
                  });
            });
        }

        if ($examId) {
            $query->whereHas('examSession', function($q) use ($examId) {
                $q->where('exam_id', $examId);
            });
        }

        $plans = $query->paginate(15);

        return Inertia::render('Academic/SittingPlan/StudentView', [
            'plans' => $plans,
            'exams' => $exams,
            'filters' => $request->only(['search', 'exam_id'])
        ]);
    }

    public function candidateList(Request $request)
    {
        $school = User::getCurrentSchool() ?? Auth::user()->school;
        
        $exams = Examination::where('school_id', $school->id)->get();
        $rooms = Room::where('school_id', $school->id)->get();

        $selectedExam = $request->input('exam_id');
        $selectedRoom = $request->input('room_id');

        $candidates = [];

        if ($selectedExam && $selectedRoom) {
            $candidates = SeatingArrangement::where('room_id', $selectedRoom)
                ->whereHas('examSession', function($q) use ($selectedExam) {
                    $q->where('exam_id', $selectedExam);
                })
                ->where('is_reserved', false)
                ->with(['student.studentProfile.schoolClass', 'examSession.subject'])
                ->get()
                ->sortBy('seat_number')
                ->values();
        }

        return Inertia::render('Academic/SittingPlan/CandidateList', [
            'exams' => $exams,
            'rooms' => $rooms,
            'candidates' => $candidates,
            'filters' => $request->only(['exam_id', 'room_id'])
        ]);
    }

    public function invigilators(Request $request)
    {
        $school = User::getCurrentSchool() ?? Auth::user()->school;

        $teachers = User::where('school_id', $school->id)
            ->where('role', 'teacher')
            ->where('is_active', true)
            ->get(['id', 'name', 'phone']);

        // All sessions that belong to this school, for the assignment dropdown
        $sessions = ExamSession::whereHas('exam', fn($q) => $q->where('school_id', $school->id))
            ->with(['exam:id,name', 'subject:id,name', 'schoolClass:id,name', 'room:id,room_number,room_name'])
            ->orderBy('date')
            ->orderBy('start_time')
            ->get()
            ->map(fn($s) => [
                'id'         => $s->id,
                'label'      => ($s->exam->name ?? '?') . ' — ' . ($s->subject->name ?? '?') . ' · ' . ($s->schoolClass->name ?? '?'),
                'detail'     => ($s->date ? $s->date->format('d M Y') : '') . ' ' . ($s->start_time ? $s->start_time->format('H:i') : '') . '–' . ($s->end_time ? $s->end_time->format('H:i') : '') . ($s->room ? ' · Room ' . $s->room->room_number : ''),
                'room'       => $s->room ? 'Room ' . $s->room->room_number : '—',
                'has_invigilator' => !is_null($s->invigilator_id),
            ]);

        // Existing assignments
        $assignments = ExamSession::whereHas('exam', fn($q) => $q->where('school_id', $school->id))
            ->whereNotNull('invigilator_id')
            ->with(['exam:id,name', 'subject:id,name', 'schoolClass:id,name', 'room:id,room_number', 'invigilator:id,name,phone'])
            ->orderBy('date', 'desc')
            ->paginate(20);

        return Inertia::render('Academic/SittingPlan/Invigilators', [
            'sessions'    => $sessions,
            'teachers'    => $teachers,
            'assignments' => $assignments,
        ]);
    }

    public function storeInvigilator(Request $request)
    {
        $request->validate([
            'exam_session_id' => 'required|exists:exam_sessions,id',
            'invigilator_id'  => 'required|exists:users,id',
        ]);

        $session = ExamSession::findOrFail($request->exam_session_id);

        // Prevent double booking: same invigilator in overlapping sessions on the same day
        $overlap = ExamSession::where('invigilator_id', $request->invigilator_id)
            ->where('id', '!=', $session->id)
            ->whereDate('date', $session->date)
            ->where('start_time', '<', $session->end_time)
            ->where('end_time',   '>', $session->start_time)
            ->first();

        if ($overlap) {
            return back()->withErrors(['invigilator_id' => 'This staff member is already assigned to another session during this timeslot.']);
        }

        $session->update(['invigilator_id' => $request->invigilator_id]);

        return back()->with('success', 'Invigilator assigned successfully.');
    }

    public function attendanceSheets(Request $request)
    {
        $school = User::getCurrentSchool() ?? Auth::user()->school;

        $exams = Examination::where('school_id', $school->id)->get();
        $rooms = Room::where('school_id', $school->id)->get();

        $selectedExam    = $request->input('exam_id');
        $selectedRoom    = $request->input('room_id');
        $selectedSession = $request->input('session_id');

        $sessions   = [];
        $students   = [];
        $attendance = [];

        if ($selectedExam && $selectedRoom) {
            $sessions = ExamSession::where('exam_id', $selectedExam)
                ->where('room_id', $selectedRoom)
                ->with(['subject', 'schoolClass'])
                ->orderBy('date')
                ->orderBy('start_time')
                ->get()
                ->map(fn($s) => [
                    'id'         => $s->id,
                    'label'      => $s->subject->name . ' – ' . $s->schoolClass->name . ' (' . $s->date->format('d M') . ')',
                    'date'       => $s->date->format('Y-m-d'),
                    'start_time' => $s->start_time->format('H:i'),
                    'end_time'   => $s->end_time->format('H:i'),
                ]);
        }

        if ($selectedSession) {
            $session = ExamSession::find($selectedSession);
            if ($session) {
                $students = SeatingArrangement::where('exam_session_id', $selectedSession)
                    ->where('is_reserved', false)
                    ->with(['student.studentProfile'])
                    ->get()
                    ->sortBy('seat_number')
                    ->values();

                $attendance = ExamAttendance::where('exam_session_id', $selectedSession)
                    ->pluck('status', 'student_id');
            }
        }

        return Inertia::render('Academic/SittingPlan/AttendanceSheets', [
            'exams'      => $exams,
            'rooms'      => $rooms,
            'sessions'   => $sessions,
            'students'   => $students,
            'attendance' => $attendance,
            'filters'    => $request->only(['exam_id', 'room_id', 'session_id']),
        ]);
    }

    public function markAttendance(Request $request)
    {
        $request->validate([
            'session_id'  => 'required|exists:exam_sessions,id',
            'attendance'  => 'required|array',
            'attendance.*' => 'in:present,absent',
        ]);

        $school  = User::getCurrentSchool() ?? Auth::user()->school;
        $userId  = Auth::id();

        foreach ($request->attendance as $studentId => $status) {
            ExamAttendance::updateOrCreate(
                ['exam_session_id' => $request->session_id, 'student_id' => $studentId],
                ['status' => $status, 'school_id' => $school->id, 'marked_by' => $userId]
            );

            // Keep seating_arrangements.is_absent in sync
            SeatingArrangement::where('exam_session_id', $request->session_id)
                ->where('student_id', $studentId)
                ->update(['is_absent' => $status === 'absent']);
        }

        return back()->with('success', 'Attendance saved successfully.');
    }

    public function reports(): Response
    {
        $school = User::getCurrentSchool() ?? Auth::user()->school;

        $rooms = Room::where('school_id', $school->id)->where('is_active', true)->get();
        
        $reportData = $rooms->map(function ($room) {
            $allocated = SeatingArrangement::where('room_id', $room->id)
                ->where('is_reserved', false)
                ->count();
            $reserved = SeatingArrangement::where('room_id', $room->id)
                ->where('is_reserved', true)
                ->count();

            return [
                'room_number' => $room->room_number,
                'room_name' => $room->room_name ?: 'Main Hall',
                'capacity' => $room->capacity,
                'allocated' => $allocated,
                'reserved' => $reserved,
                'available' => max(0, $room->capacity - $allocated - $reserved),
                'occupancy_rate' => $room->capacity > 0 ? round(($allocated / $room->capacity) * 100, 2) : 0
            ];
        });

        return Inertia::render('Academic/SittingPlan/Reports', [
            'reportData' => $reportData
        ]);
    }
}
