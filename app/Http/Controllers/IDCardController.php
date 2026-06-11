<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\User;
use App\Models\SchoolClass;
use App\Models\School;

class IDCardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $schoolId = $user->school_id ?? 1;

        // Fetch active classes for dropdown
        $classes = SchoolClass::where('school_id', $schoolId)
            ->where('is_active', true)
            ->get(['id', 'name'])
            ->toArray();

        // Fetch students, teachers, and staff
        $roles = ['student', 'teacher', 'school_admin', 'headteacher', 'bursar', 'librarian', 'dormitory_manager'];
        $dbUsers = User::where('school_id', $schoolId)
            ->where('is_active', true)
            ->whereIn('role', $roles)
            ->with(['studentProfile.schoolClass'])
            ->get();

        $users = $dbUsers->map(function($u) {
            $type = 'staff';
            if ($u->role === 'student') {
                $type = 'student';
            } elseif ($u->role === 'teacher') {
                $type = 'teacher';
            }

            $className = null;
            if ($type === 'student' && $u->studentProfile && $u->studentProfile->schoolClass) {
                $className = $u->studentProfile->schoolClass->name;
            }

            $designation = null;
            if ($type === 'teacher') {
                $designation = 'Teacher';
            } elseif ($type === 'staff') {
                $designation = ucfirst(str_replace('_', ' ', $u->role));
            }

            return [
                'id' => $u->id,
                'name' => $u->name,
                'type' => $type,
                'class_name' => $className,
                'designation' => $designation,
                'user_id' => $u->student_number ?? 'EMP-' . str_pad($u->id, 4, '0', STR_PAD_LEFT),
                'phone' => $u->phone ?? 'N/A',
                'photo' => $u->profile_photo,
                'date_of_birth' => $u->date_of_birth ? $u->date_of_birth->format('F d, Y') : 'N/A',
            ];
        })->toArray();

        // Stats counts
        $totalStudents = $dbUsers->where('role', 'student')->count();
        $totalTeachers = $dbUsers->where('role', 'teacher')->count();
        $totalStaff = $dbUsers->whereNotIn('role', ['student', 'teacher'])->count();

        $stats = [
            'total_students' => $totalStudents,
            'total_teachers' => $totalTeachers,
            'total_staff' => $totalStaff,
        ];

        return Inertia::render('IDCards/Index', [
            'users' => $users,
            'classes' => $classes,
            'stats' => $stats,
            'filter' => $request->get('filter', 'all'),
            'class_id' => $request->get('class_id', ''),
            'search' => $request->get('search', ''),
        ]);
    }

    public function generate(User $user)
    {
        $school = $user->school;
        
        $type = 'staff';
        if ($user->role === 'student') {
            $type = 'student';
        } elseif ($user->role === 'teacher') {
            $type = 'teacher';
        }

        $className = null;
        if ($type === 'student' && $user->studentProfile && $user->studentProfile->schoolClass) {
            $className = $user->studentProfile->schoolClass->name;
        }

        $designation = null;
        if ($type === 'teacher') {
            $designation = 'Teacher';
        } elseif ($type === 'staff') {
            $designation = ucfirst(str_replace('_', ' ', $user->role));
        }

        $formattedUser = [
            'id' => $user->id,
            'name' => $user->name,
            'type' => $type,
            'class_name' => $className,
            'designation' => $designation,
            'user_id' => $user->student_number ?? 'EMP-' . str_pad($user->id, 4, '0', STR_PAD_LEFT),
            'phone' => $user->phone ?? 'N/A',
            'photo' => $user->profile_photo,
            'date_of_birth' => $user->date_of_birth ? $user->date_of_birth->format('F d, Y') : 'N/A',
        ];

        $formattedSchool = [
            'name' => $school->name ?? 'EduTZ School',
            'address' => $school->address ?? 'Tanzania',
            'phone' => $school->contact_phone ?? 'N/A',
            'logo' => $school->logo,
        ];

        return Inertia::render('IDCards/Generate', [
            'user' => $formattedUser,
            'school' => $formattedSchool,
        ]);
    }

    public function bulkGenerate(Request $request)
    {
        $user = Auth::user();
        $schoolId = $user->school_id ?? 1;
        $school = $user->school ?? School::find($schoolId);

        $typeFilter = $request->get('type', '');
        $classFilter = $request->get('class_name', '');
        $searchTerm = $request->get('search', '');

        $roles = ['student', 'teacher', 'school_admin', 'headteacher', 'bursar', 'librarian', 'dormitory_manager'];
        
        $query = User::where('school_id', $schoolId)
            ->where('is_active', true)
            ->whereIn('role', $roles)
            ->with(['studentProfile.schoolClass']);

        // Apply filters matching React's filters
        if ($typeFilter && $typeFilter !== 'all') {
            if ($typeFilter === 'student') {
                $query->where('role', 'student');
            } elseif ($typeFilter === 'teacher') {
                $query->where('role', 'teacher');
            } else {
                $query->whereNotIn('role', ['student', 'teacher']);
            }
        }

        if ($classFilter && $classFilter !== 'all') {
            $query->whereHas('studentProfile.schoolClass', function($q) use ($classFilter) {
                $q->where('name', $classFilter);
            });
        }

        if ($searchTerm) {
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('student_number', 'like', "%{$searchTerm}%")
                  ->orWhere('phone', 'like', "%{$searchTerm}%");
            });
        }

        $dbUsers = $query->get();

        $users = $dbUsers->map(function($u) {
            $type = 'staff';
            if ($u->role === 'student') {
                $type = 'student';
            } elseif ($u->role === 'teacher') {
                $type = 'teacher';
            }

            $className = null;
            if ($type === 'student' && $u->studentProfile && $u->studentProfile->schoolClass) {
                $className = $u->studentProfile->schoolClass->name;
            }

            $designation = null;
            if ($type === 'teacher') {
                $designation = 'Teacher';
            } elseif ($type === 'staff') {
                $designation = ucfirst(str_replace('_', ' ', $u->role));
            }

            return [
                'id' => $u->id,
                'name' => $u->name,
                'type' => $type,
                'class_name' => $className,
                'designation' => $designation,
                'user_id' => $u->student_number ?? 'EMP-' . str_pad($u->id, 4, '0', STR_PAD_LEFT),
                'phone' => $u->phone ?? 'N/A',
                'photo' => $u->profile_photo,
                'date_of_birth' => $u->date_of_birth ? $u->date_of_birth->format('F d, Y') : 'N/A',
            ];
        })->toArray();

        $formattedSchool = [
            'name' => $school->name ?? 'EduTZ School',
            'address' => $school->address ?? 'Tanzania',
            'phone' => $school->contact_phone ?? 'N/A',
            'logo' => $school->logo,
        ];

        return Inertia::render('IDCards/BulkGenerate', [
            'users' => $users,
            'school' => $formattedSchool,
            'filters' => [
                'type' => $typeFilter,
                'class_name' => $classFilter,
                'search' => $searchTerm,
            ],
        ]);
    }

    public function printSingle(User $user)
    {
        $school = $user->school;
        
        $type = 'staff';
        if ($user->role === 'student') {
            $type = 'student';
        } elseif ($user->role === 'teacher') {
            $type = 'teacher';
        }

        $className = null;
        if ($type === 'student' && $user->studentProfile && $user->studentProfile->schoolClass) {
            $className = $user->studentProfile->schoolClass->name;
        }

        $designation = null;
        if ($type === 'teacher') {
            $designation = 'Teacher';
        } elseif ($type === 'staff') {
            $designation = ucfirst(str_replace('_', ' ', $user->role));
        }

        $formattedUser = [
            'id' => $user->id,
            'name' => $user->name,
            'type' => $type,
            'class_name' => $className,
            'designation' => $designation,
            'user_id' => $user->student_number ?? 'EMP-' . str_pad($user->id, 4, '0', STR_PAD_LEFT),
            'phone' => $user->phone ?? 'N/A',
            'photo' => $user->profile_photo,
            'date_of_birth' => $user->date_of_birth ? $user->date_of_birth->format('F d, Y') : 'N/A',
        ];

        $formattedSchool = [
            'name' => $school->name ?? 'EduTZ School',
            'address' => $school->address ?? 'Tanzania',
            'phone' => $school->contact_phone ?? 'N/A',
            'logo' => $school->logo,
        ];

        return view('id-cards.print', [
            'users' => [$formattedUser],
            'school' => $formattedSchool,
        ]);
    }

    public function printBulk(Request $request)
    {
        $user = Auth::user();
        $schoolId = $user->school_id ?? 1;
        $school = $user->school ?? School::find($schoolId);

        $typeFilter = $request->get('type', '');
        $classFilter = $request->get('class_name', '');
        $searchTerm = $request->get('search', '');

        $roles = ['student', 'teacher', 'school_admin', 'headteacher', 'bursar', 'librarian', 'dormitory_manager'];
        
        $query = User::where('school_id', $schoolId)
            ->where('is_active', true)
            ->whereIn('role', $roles)
            ->with(['studentProfile.schoolClass']);

        // Apply filters matching React's filters
        if ($typeFilter && $typeFilter !== 'all') {
            if ($typeFilter === 'student') {
                $query->where('role', 'student');
            } elseif ($typeFilter === 'teacher') {
                $query->where('role', 'teacher');
            } else {
                $query->whereNotIn('role', ['student', 'teacher']);
            }
        }

        if ($classFilter && $classFilter !== 'all') {
            $query->whereHas('studentProfile.schoolClass', function($q) use ($classFilter) {
                $q->where('name', $classFilter);
            });
        }

        if ($searchTerm) {
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('student_number', 'like', "%{$searchTerm}%")
                  ->orWhere('phone', 'like', "%{$searchTerm}%");
            });
        }

        $dbUsers = $query->get();

        $users = $dbUsers->map(function($u) {
            $type = 'staff';
            if ($u->role === 'student') {
                $type = 'student';
            } elseif ($u->role === 'teacher') {
                $type = 'teacher';
            }

            $className = null;
            if ($type === 'student' && $u->studentProfile && $u->studentProfile->schoolClass) {
                $className = $u->studentProfile->schoolClass->name;
            }

            $designation = null;
            if ($type === 'teacher') {
                $designation = 'Teacher';
            } elseif ($type === 'staff') {
                $designation = ucfirst(str_replace('_', ' ', $u->role));
            }

            return [
                'id' => $u->id,
                'name' => $u->name,
                'type' => $type,
                'class_name' => $className,
                'designation' => $designation,
                'user_id' => $u->student_number ?? 'EMP-' . str_pad($u->id, 4, '0', STR_PAD_LEFT),
                'phone' => $u->phone ?? 'N/A',
                'photo' => $u->profile_photo,
                'date_of_birth' => $u->date_of_birth ? $u->date_of_birth->format('F d, Y') : 'N/A',
            ];
        })->toArray();

        $formattedSchool = [
            'name' => $school->name ?? 'EduTZ School',
            'address' => $school->address ?? 'Tanzania',
            'phone' => $school->contact_phone ?? 'N/A',
            'logo' => $school->logo,
        ];

        return view('id-cards.print', [
            'users' => $users,
            'school' => $formattedSchool,
        ]);
    }
}
