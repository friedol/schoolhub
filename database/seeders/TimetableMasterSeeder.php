<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\School;
use App\Models\SchoolType;
use App\Models\ClassRoom;
use App\Models\Teacher;
use App\Models\Subject;
use App\Models\SchoolClass;
use App\Models\Timetable;
use App\Models\TimetableSlot;
use App\Models\Period;
use App\Models\User;
use App\Models\AcademicTerm;
use Illuminate\Support\Facades\DB;

class TimetableMasterSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create or ensure school types
        $primaryType = SchoolType::updateOrCreate(
            ['code' => 'primary'],
            ['name' => 'Primary School', 'is_active' => true]
        );

        $secondaryType = SchoolType::updateOrCreate(
            ['code' => 'secondary'],
            ['name' => 'Secondary/Advanced School', 'is_active' => true]
        );

        // 2. Fetch schools
        $schools = School::all();
        if ($schools->isEmpty()) {
            return;
        }

        // Configure School 1 (SMSS) to be Secondary, and School 2 (KIS) to be Primary
        $schoolSecondary = $schools->first();
        $schoolPrimary = $schools->count() > 1 ? $schools->get(1) : $schools->first();

        // 3. Create Class Rooms
        foreach ($schools as $school) {
            $rooms = [
                ['room_number' => '101', 'name' => 'Classroom 101', 'capacity' => 40],
                ['room_number' => '102', 'name' => 'Classroom 102', 'capacity' => 40],
                ['room_number' => '103', 'name' => 'Classroom 103', 'capacity' => 45],
                ['room_number' => 'LAB1', 'name' => 'Science Lab A', 'capacity' => 30],
                ['room_number' => 'COMP', 'name' => 'Computer Lab', 'capacity' => 30],
                ['room_number' => 'HALL', 'name' => 'Main Hall', 'capacity' => 120],
            ];

            foreach ($rooms as $r) {
                ClassRoom::updateOrCreate(
                    ['school_id' => $school->id, 'room_number' => $r['room_number']],
                    ['name' => $r['name'], 'capacity' => $r['capacity'], 'is_active' => true]
                );
            }
        }

        // 4. Create Teacher Profiles
        foreach ($schools as $school) {
            $teachers = User::where('school_id', $school->id)->where('role', 'teacher')->get();
            foreach ($teachers as $t) {
                Teacher::updateOrCreate(
                    ['school_id' => $school->id, 'user_id' => $t->id],
                    ['specialization' => 'General Education', 'is_active' => true]
                );
            }
        }

        // 5. Seed Primary School Subjects (Math, English, Science, Social Studies, Religious Ed, Art, PE, Local Language)
        $primarySubjects = [
            ['name' => 'Mathematics', 'code' => 'P-MATH', 'category' => 'mathematics'],
            ['name' => 'English Language', 'code' => 'P-ENG', 'category' => 'language'],
            ['name' => 'Science', 'code' => 'P-SCI', 'category' => 'science'],
            ['name' => 'Social Studies', 'code' => 'P-SST', 'category' => 'social'],
            ['name' => 'Religious Education', 'code' => 'P-RE', 'category' => 'arts'],
            ['name' => 'Art & Craft', 'code' => 'P-ART', 'category' => 'arts'],
            ['name' => 'Physical Education', 'code' => 'P-PE', 'category' => 'practical'],
            ['name' => 'Local Language', 'code' => 'P-LANG', 'category' => 'language'],
        ];

        foreach ($primarySubjects as $sub) {
            Subject::updateOrCreate(
                ['school_id' => $schoolPrimary->id, 'code' => $sub['code']],
                [
                    'school_type_id' => $primaryType->id,
                    'name' => $sub['name'],
                    'category' => $sub['category'],
                    'is_core' => true,
                    'is_active' => true
                ]
            );
        }

        // 6. Seed Secondary School Subjects (Math, English, Biology, Chemistry, Physics, History, Geography, Civics, Computer Science, Literature, Foreign Language options)
        $secondarySubjects = [
            ['name' => 'Mathematics', 'code' => 'S-MATH', 'category' => 'mathematics', 'is_core' => true],
            ['name' => 'English Language', 'code' => 'S-ENG', 'category' => 'language', 'is_core' => true],
            ['name' => 'Biology', 'code' => 'S-BIO', 'category' => 'science', 'is_core' => true],
            ['name' => 'Chemistry', 'code' => 'S-CHEM', 'category' => 'science', 'is_core' => true],
            ['name' => 'Physics', 'code' => 'S-PHY', 'category' => 'science', 'is_core' => true],
            ['name' => 'History', 'code' => 'S-HIST', 'category' => 'social', 'is_core' => false],
            ['name' => 'Geography', 'code' => 'S-GEO', 'category' => 'social', 'is_core' => false],
            ['name' => 'Civics', 'code' => 'S-CIV', 'category' => 'social', 'is_core' => true],
            ['name' => 'Computer Science', 'code' => 'S-COMP', 'category' => 'practical', 'is_core' => false],
            ['name' => 'Literature in English', 'code' => 'S-LIT', 'category' => 'arts', 'is_core' => false],
            ['name' => 'French', 'code' => 'S-FREN', 'category' => 'language', 'is_core' => false],
        ];

        foreach ($secondarySubjects as $sub) {
            Subject::updateOrCreate(
                ['school_id' => $schoolSecondary->id, 'code' => $sub['code']],
                [
                    'school_type_id' => $secondaryType->id,
                    'name' => $sub['name'],
                    'category' => $sub['category'],
                    'is_core' => $sub['is_core'],
                    'is_elective' => !$sub['is_core'],
                    'is_active' => true
                ]
            );
        }

        // 7. Seed Primary Classes (Classes 1–7)
        for ($i = 1; $i <= 7; $i++) {
            foreach (['A', 'B', 'C'] as $sec) {
                SchoolClass::updateOrCreate(
                    ['school_id' => $schoolPrimary->id, 'name' => "Class {$i}", 'section' => $sec],
                    [
                        'school_type_id' => $primaryType->id,
                        'level' => "Class {$i}",
                        'capacity' => 40,
                        'is_active' => true,
                    ]
                );
            }
        }

        // 8. Seed Secondary Classes (Forms 1–6)
        for ($i = 1; $i <= 6; $i++) {
            foreach (['A', 'B', 'C'] as $sec) {
                SchoolClass::updateOrCreate(
                    ['school_id' => $schoolSecondary->id, 'name' => "Form {$i}", 'section' => $sec],
                    [
                        'school_type_id' => $secondaryType->id,
                        'level' => "Form {$i}",
                        'capacity' => 35,
                        'is_active' => true,
                    ]
                );
            }
        }

        // 9. Assign Teachers to Subjects for classes in subject_teachers
        $termPrimary = AcademicTerm::where('school_id', $schoolPrimary->id)->first() ?? AcademicTerm::factory()->create(['school_id' => $schoolPrimary->id]);
        $termSecondary = AcademicTerm::where('school_id', $schoolSecondary->id)->first() ?? AcademicTerm::factory()->create(['school_id' => $schoolSecondary->id]);

        $teachersPrimary = User::where('school_id', $schoolPrimary->id)->where('role', 'teacher')->get();
        $teachersSecondary = User::where('school_id', $schoolSecondary->id)->where('role', 'teacher')->get();

        $subjectsPrimary = Subject::where('school_id', $schoolPrimary->id)->get();
        $subjectsSecondary = Subject::where('school_id', $schoolSecondary->id)->get();

        $classesPrimary = SchoolClass::where('school_id', $schoolPrimary->id)->get();
        $classesSecondary = SchoolClass::where('school_id', $schoolSecondary->id)->get();

        // Ensure we have periods seeded
        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        $periodsPrimary = Period::where('school_id', $schoolPrimary->id)->orderBy('period_number')->get();
        if ($periodsPrimary->isEmpty()) {
            $times = [
                1 => ['08:00', '08:45'],
                2 => ['08:45', '09:30'],
                3 => ['10:00', '10:45'],
                4 => ['10:45', '11:30'],
                5 => ['11:30', '12:15'],
                6 => ['13:15', '14:00'],
                7 => ['14:00', '14:45'],
                8 => ['14:45', '15:30'],
            ];
            foreach ($times as $num => $time) {
                Period::create([
                    'school_id' => $schoolPrimary->id,
                    'period_number' => $num,
                    'name' => "Period {$num}",
                    'start_time' => $time[0],
                    'end_time' => $time[1],
                    'is_active' => true
                ]);
            }
            $periodsPrimary = Period::where('school_id', $schoolPrimary->id)->orderBy('period_number')->get();
        }

        $periodsSecondary = Period::where('school_id', $schoolSecondary->id)->orderBy('period_number')->get();
        if ($periodsSecondary->isEmpty()) {
            $times = [
                1 => ['08:00', '08:45'],
                2 => ['08:45', '09:30'],
                3 => ['10:00', '10:45'],
                4 => ['10:45', '11:30'],
                5 => ['11:30', '12:15'],
                6 => ['13:15', '14:00'],
                7 => ['14:00', '14:45'],
                8 => ['14:45', '15:30'],
            ];
            foreach ($times as $num => $time) {
                Period::create([
                    'school_id' => $schoolSecondary->id,
                    'period_number' => $num,
                    'name' => "Period {$num}",
                    'start_time' => $time[0],
                    'end_time' => $time[1],
                    'is_active' => true
                ]);
            }
            $periodsSecondary = Period::where('school_id', $schoolSecondary->id)->orderBy('period_number')->get();
        }

        // Map Primary Subject-Teachers & seed a primary timetable
        if (!$teachersPrimary->isEmpty() && !$subjectsPrimary->isEmpty() && !$classesPrimary->isEmpty()) {
            // Map
            foreach ($classesPrimary as $cls) {
                foreach ($subjectsPrimary as $idx => $sub) {
                    $teacher = $teachersPrimary->get($idx % $teachersPrimary->count());
                    DB::table('subject_teachers')->insertOrIgnore([
                        'subject_id' => $sub->id,
                        'teacher_id' => $teacher->id,
                        'school_class_id' => $cls->id,
                        'academic_year' => '2024/2025',
                        'is_primary_teacher' => true,
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            // Seed Timetable parent
            $class1A = $classesPrimary->where('name', 'Class 1')->where('section', 'A')->first();
            if ($class1A) {
                $timetable = Timetable::updateOrCreate(
                    [
                        'school_id' => $schoolPrimary->id,
                        'class_id' => $class1A->id,
                        'section' => 'A',
                        'academic_term_id' => $termPrimary->id
                    ],
                    [
                        'school_type_id' => $primaryType->id,
                        'is_active' => true
                    ]
                );

                // Seed some slots
                $classroom1 = ClassRoom::where('school_id', $schoolPrimary->id)->first();
                $slotsToSeed = [
                    ['day' => 'monday', 'period' => 1, 'subject' => 'P-MATH'],
                    ['day' => 'monday', 'period' => 2, 'subject' => 'P-ENG'],
                    ['day' => 'tuesday', 'period' => 1, 'subject' => 'P-SCI'],
                    ['day' => 'wednesday', 'period' => 3, 'subject' => 'P-SST'],
                    ['day' => 'thursday', 'period' => 4, 'subject' => 'P-RE'],
                    ['day' => 'friday', 'period' => 5, 'subject' => 'P-ART'],
                ];

                foreach ($slotsToSeed as $s) {
                    $sub = $subjectsPrimary->where('code', $s['subject'])->first();
                    $period = $periodsPrimary->where('period_number', $s['period'])->first();
                    $teacherId = DB::table('subject_teachers')
                        ->where('school_class_id', $class1A->id)
                        ->where('subject_id', $sub->id)
                        ->value('teacher_id');

                    if ($sub && $period && $teacherId) {
                        TimetableSlot::updateOrCreate(
                            [
                                'timetable_id' => $timetable->id,
                                'day_of_week' => $s['day'],
                                'period_id' => $period->id
                            ],
                            [
                                'subject_id' => $sub->id,
                                'teacher_id' => $teacherId,
                                'class_room_id' => $classroom1 ? $classroom1->id : null
                            ]
                        );
                    }
                }
            }
        }

        // Map Secondary Subject-Teachers & seed a secondary timetable
        if (!$teachersSecondary->isEmpty() && !$subjectsSecondary->isEmpty() && !$classesSecondary->isEmpty()) {
            foreach ($classesSecondary as $cls) {
                foreach ($subjectsSecondary as $idx => $sub) {
                    $teacher = $teachersSecondary->get($idx % $teachersSecondary->count());
                    DB::table('subject_teachers')->insertOrIgnore([
                        'subject_id' => $sub->id,
                        'teacher_id' => $teacher->id,
                        'school_class_id' => $cls->id,
                        'academic_year' => '2024/2025',
                        'is_primary_teacher' => true,
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            // Seed Timetable parent
            $form1A = $classesSecondary->where('name', 'Form 1')->where('section', 'A')->first();
            if ($form1A) {
                $timetable = Timetable::updateOrCreate(
                    [
                        'school_id' => $schoolSecondary->id,
                        'class_id' => $form1A->id,
                        'section' => 'A',
                        'academic_term_id' => $termSecondary->id
                    ],
                    [
                        'school_type_id' => $secondaryType->id,
                        'is_active' => true
                    ]
                );

                // Seed some slots
                $classroom1 = ClassRoom::where('school_id', $schoolSecondary->id)->first();
                $slotsToSeed = [
                    ['day' => 'monday', 'period' => 1, 'subject' => 'S-MATH'],
                    ['day' => 'monday', 'period' => 2, 'subject' => 'S-ENG'],
                    ['day' => 'tuesday', 'period' => 3, 'subject' => 'S-BIO'],
                    ['day' => 'wednesday', 'period' => 4, 'subject' => 'S-CHEM'],
                    ['day' => 'thursday', 'period' => 5, 'subject' => 'S-PHY'],
                    ['day' => 'friday', 'period' => 6, 'subject' => 'S-CIV'],
                ];

                foreach ($slotsToSeed as $s) {
                    $sub = $subjectsSecondary->where('code', $s['subject'])->first();
                    $period = $periodsSecondary->where('period_number', $s['period'])->first();
                    $teacherId = DB::table('subject_teachers')
                        ->where('school_class_id', $form1A->id)
                        ->where('subject_id', $sub->id)
                        ->value('teacher_id');

                    if ($sub && $period && $teacherId) {
                        TimetableSlot::updateOrCreate(
                            [
                                'timetable_id' => $timetable->id,
                                'day_of_week' => $s['day'],
                                'period_id' => $period->id
                            ],
                            [
                                'subject_id' => $sub->id,
                                'teacher_id' => $teacherId,
                                'class_room_id' => $classroom1 ? $classroom1->id : null
                            ]
                        );
                    }
                }
            }
        }
    }
}
