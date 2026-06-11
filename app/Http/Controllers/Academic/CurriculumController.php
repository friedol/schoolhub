<?php

namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use App\Models\Curriculum;
use App\Models\Subject;
use App\Models\SubjectCombination;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CurriculumController extends Controller
{
    /**
     * Display a listing of curricula
     */
    public function index()
    {
        $user = Auth::user();
        $school = \App\Models\User::getCurrentSchool() ?? $user->school;
        
        try {
            // If no school context, use user's school
            if (!$school) {
                $school = $user->school;
            }
            
            if (!$school) {
                throw new \Exception('No school context available');
            }
            
            // Get curricula from database with school filtering
            $query = Curriculum::where('school_id', $school->id)
                ->with(['subjects.subject:id,name,code'])
                ->withCount(['subjects']);
            
            $curricula = $query->paginate(15);
            
            // Transform the data to match frontend expectations
            $transformedCurricula = $curricula->getCollection()->map(function ($curriculum) {
                return [
                    'id' => $curriculum->id,
                    'name' => $curriculum->name,
                    'code' => $curriculum->code,
                    'description' => $curriculum->description,
                    'level' => $curriculum->level,
                    'academic_year' => $curriculum->academic_year,
                    'is_active' => $curriculum->is_active,
                    'is_necta_curriculum' => $curriculum->is_necta_curriculum,
                    'subjects_count' => $curriculum->subjects_count,
                    'subjects' => $curriculum->subjects->map(function ($curriculumSubject) {
                        return [
                            'id' => $curriculumSubject->subject->id,
                            'name' => $curriculumSubject->subject->name,
                            'code' => $curriculumSubject->subject->code,
                            'is_core' => $curriculumSubject->is_core,
                            'is_elective' => $curriculumSubject->is_elective,
                            'is_compulsory' => $curriculumSubject->is_compulsory,
                        ];
                    })->toArray(),
                    'created_at' => $curriculum->created_at->format('Y-m-d'),
                    'updated_at' => $curriculum->updated_at->format('Y-m-d'),
                ];
            });
            
            $curricula->setCollection($transformedCurricula);
            
            // Ensure the paginated object has proper meta structure
            if (!isset($curricula->meta) || !$curricula->meta) {
                $curricula->meta = [
                    'total' => $curricula->total(),
                    'per_page' => $curricula->perPage(),
                    'current_page' => $curricula->currentPage(),
                    'last_page' => $curricula->lastPage(),
                ];
            }
            
        } catch (\Exception $e) {
            // Fallback to empty data if database error
            $curricula = new \Illuminate\Pagination\LengthAwarePaginator(
                [],
                0,
                15,
                1,
                ['path' => request()->url()]
            );
            
            // Ensure the fallback data has proper meta structure
            $curricula->meta = [
                'total' => 0,
                'per_page' => 15,
                'current_page' => 1,
                'last_page' => 1,
            ];
        }
        
        return Inertia::render('Academic/Curriculum/Index', [
            'curricula' => $curricula,
            'currentSchool' => $school,
        ]);
    }

    /**
     * Show the form for creating a new curriculum
     */
    public function create()
    {
        $user = Auth::user();
        $school = \App\Models\User::getCurrentSchool() ?? $user->school;
        
        if (!$school) {
            $school = $user->school;
        }
        
        if (!$school) {
            abort(403, 'No school context available');
        }
        
        try {
            $subjects = Subject::where('school_id', $school->id)
                ->where('is_active', true)
                ->select('id', 'name', 'code', 'necta_code')
                ->get();

            $classes = SchoolClass::where('school_id', $school->id)
                ->where('is_active', true)
                ->select('id', 'name', 'level', 'stream')
                ->get();
                
        } catch (\Exception $e) {
            // Fallback to empty collections if database error
            $subjects = collect([]);
            $classes = collect([]);
        }

        return Inertia::render('Academic/Curriculum/Create', [
            'subjects' => $subjects,
            'classes' => $classes,
            'currentSchool' => $school,
        ]);
    }

    /**
     * Store a newly created curriculum
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10',
            'description' => 'nullable|string',
            'level' => 'required|in:nursery,primary,secondary,advanced',
            'academic_year' => 'required|string',
            'is_necta_curriculum' => 'boolean',
            'subjects' => 'required|array',
            'subjects.*.subject_id' => 'required|exists:subjects,id',
            'subjects.*.is_core' => 'boolean',
            'subjects.*.is_elective' => 'boolean',
            'subjects.*.is_compulsory' => 'boolean',
            'subjects.*.credits' => 'nullable|integer|min:1',
            'subjects.*.weekly_periods' => 'nullable|integer|min:1',
            'subjects.*.passing_grade' => 'nullable|integer|min:0|max:100',
        ]);

        $user = Auth::user();
        $school = \App\Models\User::getCurrentSchool() ?? $user->school;
        
        if (!$school) {
            $school = $user->school;
        }
        
        if (!$school) {
            abort(403, 'No school context available');
        }

        try {
            $curriculum = Curriculum::create([
                'school_id' => $school->id,
                'name' => $request->name,
                'code' => $request->code,
                'description' => $request->description,
                'level' => $request->level,
                'academic_year' => $request->academic_year,
                'is_necta_curriculum' => $request->boolean('is_necta_curriculum', false),
                'is_active' => true,
            ]);

            // Attach subjects to curriculum
            foreach ($request->subjects as $subjectData) {
                $curriculum->subjects()->create([
                    'subject_id' => $subjectData['subject_id'],
                    'is_core' => $subjectData['is_core'] ?? false,
                    'is_elective' => $subjectData['is_elective'] ?? false,
                    'is_compulsory' => $subjectData['is_compulsory'] ?? true,
                    'credits' => $subjectData['credits'] ?? null,
                    'weekly_periods' => $subjectData['weekly_periods'] ?? null,
                    'passing_grade' => $subjectData['passing_grade'] ?? null,
                ]);
            }

            return redirect()->route('academic.curriculum.index')
                ->with('success', 'Curriculum created successfully.')
                ->with('sweetalert', [
                    'type' => 'success',
                    'title' => 'Success!',
                    'text' => 'Curriculum has been created successfully!',
                    'showConfirmButton' => false,
                    'timer' => 3000
                ]);

        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to create curriculum. Please try again.')
                ->with('sweetalert', [
                    'type' => 'error',
                    'title' => 'Error!',
                    'text' => 'Failed to create curriculum. Please try again.',
                    'showConfirmButton' => false,
                    'timer' => 3000
                ]);
        }
    }

    /**
     * Display the specified curriculum
     */
    public function show($id)
    {
        $user = Auth::user();
        $school = \App\Models\User::getCurrentSchool() ?? $user->school;
        
        if (!$school) {
            $school = $user->school;
        }
        
        if (!$school) {
            abort(403, 'No school context available');
        }
        
        try {
            $curriculum = Curriculum::where('school_id', $school->id)
                ->where('id', $id)
                ->with(['subjects.subject:id,name,code,necta_code'])
                ->withCount(['subjects'])
                ->firstOrFail();
            
            // Transform the data to match frontend expectations
            $curriculumData = [
                'id' => $curriculum->id,
                'name' => $curriculum->name,
                'code' => $curriculum->code,
                'description' => $curriculum->description,
                'level' => $curriculum->level,
                'level_display' => $curriculum->level_display,
                'academic_year' => $curriculum->academic_year,
                'is_active' => $curriculum->is_active,
                'is_necta_curriculum' => $curriculum->is_necta_curriculum,
                'subjects_count' => $curriculum->subjects_count,
                'subjects' => $curriculum->subjects->map(function ($curriculumSubject) {
                    return [
                        'id' => $curriculumSubject->subject->id,
                        'name' => $curriculumSubject->subject->name,
                        'code' => $curriculumSubject->subject->code,
                        'necta_code' => $curriculumSubject->subject->necta_code,
                        'is_core' => $curriculumSubject->is_core,
                        'is_elective' => $curriculumSubject->is_elective,
                        'is_compulsory' => $curriculumSubject->is_compulsory,
                        'credits' => $curriculumSubject->credits,
                        'weekly_periods' => $curriculumSubject->weekly_periods,
                        'passing_grade' => $curriculumSubject->passing_grade,
                    ];
                })->toArray(),
                'created_at' => $curriculum->created_at->format('Y-m-d'),
                'updated_at' => $curriculum->updated_at->format('Y-m-d'),
            ];
            
        } catch (\Exception $e) {
            // Return 404 if curriculum not found
            abort(404, 'Curriculum not found');
        }

        return Inertia::render('Academic/Curriculum/Show', [
            'curriculum' => $curriculumData,
            'currentSchool' => $school,
        ]);
    }

    /**
     * Show the form for editing the curriculum
     */
    public function edit($id)
    {
        $user = Auth::user();
        $school = \App\Models\User::getCurrentSchool() ?? $user->school;
        
        if (!$school) {
            $school = $user->school;
        }
        
        if (!$school) {
            abort(403, 'No school context available');
        }
        
        try {
            $curriculum = Curriculum::where('school_id', $school->id)
                ->where('id', $id)
                ->with(['subjects.subject:id,name,code,necta_code'])
                ->firstOrFail();

            $subjects = Subject::where('school_id', $school->id)
                ->where('is_active', true)
                ->select('id', 'name', 'code', 'necta_code')
                ->get();

            $classes = SchoolClass::where('school_id', $school->id)
                ->where('is_active', true)
                ->select('id', 'name', 'level', 'stream')
                ->get();

            return Inertia::render('Academic/Curriculum/Edit', [
                'curriculum' => $curriculum,
                'subjects' => $subjects,
                'classes' => $classes,
                'currentSchool' => $school,
            ]);
            
        } catch (\Exception $e) {
            abort(404, 'Curriculum not found');
        }
    }

    /**
     * Update the specified curriculum
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10',
            'description' => 'nullable|string',
            'level' => 'required|in:nursery,primary,secondary,advanced',
            'academic_year' => 'required|string',
            'is_necta_curriculum' => 'boolean',
            'subjects' => 'required|array',
            'subjects.*.subject_id' => 'required|exists:subjects,id',
            'subjects.*.is_core' => 'boolean',
            'subjects.*.is_elective' => 'boolean',
            'subjects.*.is_compulsory' => 'boolean',
            'subjects.*.credits' => 'nullable|integer|min:1',
            'subjects.*.weekly_periods' => 'nullable|integer|min:1',
            'subjects.*.passing_grade' => 'nullable|integer|min:0|max:100',
        ]);

        $user = Auth::user();
        $school = \App\Models\User::getCurrentSchool() ?? $user->school;
        
        if (!$school) {
            $school = $user->school;
        }
        
        if (!$school) {
            abort(403, 'No school context available');
        }

        try {
            $curriculum = Curriculum::where('school_id', $school->id)
                ->where('id', $id)
                ->firstOrFail();

            $curriculum->update([
                'name' => $request->name,
                'code' => $request->code,
                'description' => $request->description,
                'level' => $request->level,
                'academic_year' => $request->academic_year,
                'is_necta_curriculum' => $request->boolean('is_necta_curriculum', false),
            ]);

            // Sync subjects
            $curriculum->subjects()->delete();
            foreach ($request->subjects as $subjectData) {
                $curriculum->subjects()->create([
                    'subject_id' => $subjectData['subject_id'],
                    'is_core' => $subjectData['is_core'] ?? false,
                    'is_elective' => $subjectData['is_elective'] ?? false,
                    'is_compulsory' => $subjectData['is_compulsory'] ?? true,
                    'credits' => $subjectData['credits'] ?? null,
                    'weekly_periods' => $subjectData['weekly_periods'] ?? null,
                    'passing_grade' => $subjectData['passing_grade'] ?? null,
                ]);
            }

            return redirect()->route('academic.curriculum.index')
                ->with('success', 'Curriculum updated successfully.')
                ->with('sweetalert', [
                    'type' => 'success',
                    'title' => 'Updated!',
                    'text' => 'Curriculum has been updated successfully!',
                    'showConfirmButton' => false,
                    'timer' => 3000
                ]);

        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update curriculum. Please try again.')
                ->with('sweetalert', [
                    'type' => 'error',
                    'title' => 'Error!',
                    'text' => 'Failed to update curriculum. Please try again.',
                    'showConfirmButton' => false,
                    'timer' => 3000
                ]);
        }
    }

    /**
     * Remove the specified curriculum
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $school = \App\Models\User::getCurrentSchool() ?? $user->school;
        
        if (!$school) {
            $school = $user->school;
        }
        
        if (!$school) {
            abort(403, 'No school context available');
        }
        
        try {
            $curriculum = Curriculum::where('school_id', $school->id)
                ->where('id', $id)
                ->firstOrFail();
            
            $curriculum->delete();

            return redirect()->route('academic.curriculum.index')
                ->with('success', 'Curriculum deleted successfully.')
                ->with('sweetalert', [
                    'type' => 'success',
                    'title' => 'Deleted!',
                    'text' => 'Curriculum has been deleted successfully.',
                    'showConfirmButton' => false,
                    'timer' => 3000
                ]);
                
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to delete curriculum. Please try again.')
                ->with('sweetalert', [
                    'type' => 'error',
                    'title' => 'Error!',
                    'text' => 'Failed to delete curriculum. Please try again.',
                    'showConfirmButton' => false,
                    'timer' => 3000
                ]);
        }
    }

    /**
     * Display subject combinations
     */
    public function combinations()
    {
        $user = Auth::user();
        $school = \App\Models\User::getCurrentSchool() ?? $user->school;
        
        if (!$school) {
            $school = $user->school;
        }
        
        if (!$school) {
            abort(403, 'No school context available');
        }
        
        try {
            $combinations = SubjectCombination::where('school_id', $school->id)
                ->with(['subjects'])
                ->paginate(10);

            return Inertia::render('Academic/Curriculum/Combinations', [
                'combinations' => $combinations,
                'currentSchool' => $school,
            ]);
            
        } catch (\Exception $e) {
            // Fallback to empty data if database error
            $combinations = new \Illuminate\Pagination\LengthAwarePaginator(
                [],
                0,
                10,
                1,
                ['path' => request()->url()]
            );
            
            return Inertia::render('Academic/Curriculum/Combinations', [
                'combinations' => $combinations,
                'currentSchool' => $school,
            ]);
        }
    }

    /**
     * Create subject combination
     */
    public function createCombination()
    {
        $user = Auth::user();
        $school = \App\Models\User::getCurrentSchool() ?? $user->school;
        
        if (!$school) {
            $school = $user->school;
        }
        
        if (!$school) {
            abort(403, 'No school context available');
        }
        
        try {
            $subjects = Subject::where('school_id', $school->id)
                ->where('is_active', true)
                ->select('id', 'name', 'code', 'necta_code')
                ->get();

            return Inertia::render('Academic/Curriculum/CreateCombination', [
                'subjects' => $subjects,
                'currentSchool' => $school,
            ]);
            
        } catch (\Exception $e) {
            // Fallback to empty data if database error
            return Inertia::render('Academic/Curriculum/CreateCombination', [
                'subjects' => collect([]),
                'currentSchool' => $school,
            ]);
        }
    }

    /**
     * Store subject combination
     */
    public function storeCombination(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10',
            'level' => 'required|in:O-Level,A-Level',
            'description' => 'nullable|string',
            'necta_code' => 'nullable|string',
            'subjects' => 'required|array',
            'subjects.*.subject_id' => 'required|exists:subjects,id',
            'subjects.*.is_principal' => 'boolean',
            'subjects.*.is_subsidiary' => 'boolean',
            'subjects.*.is_compulsory' => 'boolean',
        ]);

        $user = Auth::user();
        $school = \App\Models\User::getCurrentSchool() ?? $user->school;
        
        if (!$school) {
            $school = $user->school;
        }
        
        if (!$school) {
            abort(403, 'No school context available');
        }

        $combination = SubjectCombination::create([
            'school_id' => $school->id,
            'name' => $request->name,
            'code' => $request->code,
            'level' => $request->level,
            'description' => $request->description,
            'necta_code' => $request->necta_code,
            'is_active' => true,
        ]);

        // Attach subjects to combination
        foreach ($request->subjects as $subjectData) {
            $combination->subjects()->attach($subjectData['subject_id'], [
                'is_principal' => $subjectData['is_principal'] ?? false,
                'is_subsidiary' => $subjectData['is_subsidiary'] ?? false,
                'is_compulsory' => $subjectData['is_compulsory'] ?? true,
            ]);
        }

        return redirect()->route('academic.curriculum.combinations')
            ->with('success', 'Subject combination created successfully.');
    }
}
