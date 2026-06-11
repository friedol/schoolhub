<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Alumni;
use App\Models\Graduation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AlumniController extends Controller
{
    /**
     * Display a listing of alumni
     */
    public function index(Request $request)
    {
        $query = Alumni::whereHas('student', function ($query) {
            $query->where('school_id', Auth::user()->school_id);
        })->with(['student', 'graduation']);

        // Filter by graduation year
        if ($request->has('graduation_year') && $request->graduation_year) {
            $query->where('graduation_year', $request->graduation_year);
        }

        // Filter by final class
        if ($request->has('final_class') && $request->final_class) {
            $query->where('final_class', $request->final_class);
        }

        // Filter by occupation
        if ($request->has('occupation') && $request->occupation) {
            $query->where('occupation', 'like', '%' . $request->occupation . '%');
        }

        // Filter by mentor status
        if ($request->has('is_mentor') && $request->is_mentor !== '') {
            $query->where('is_mentor', $request->is_mentor);
        }

        $alumni = $query->orderBy('graduation_year', 'desc')
            ->paginate(20);

        $graduationYears = Alumni::whereHas('student', function ($query) {
                $query->where('school_id', Auth::user()->school_id);
            })
            ->distinct()
            ->pluck('graduation_year')
            ->sort()
            ->values();

        $finalClasses = Alumni::whereHas('student', function ($query) {
                $query->where('school_id', Auth::user()->school_id);
            })
            ->distinct()
            ->pluck('final_class')
            ->sort()
            ->values();

        return Inertia::render('Student/Alumni/Index', [
            'alumni' => $alumni,
            'graduationYears' => $graduationYears,
            'finalClasses' => $finalClasses,
            'filters' => $request->only(['graduation_year', 'final_class', 'occupation', 'is_mentor'])
        ]);
    }

    /**
     * Display the specified alumni
     */
    public function show(Alumni $alumni)
    {
        $alumni->load(['student', 'graduation', 'graduation.finalClass']);

        return Inertia::render('Student/Alumni/Show', [
            'alumni' => $alumni
        ]);
    }

    /**
     * Show the form for editing the alumni
     */
    public function edit(Alumni $alumni)
    {
        $alumni->load(['student', 'graduation']);

        return Inertia::render('Student/Alumni/Edit', [
            'alumni' => $alumni
        ]);
    }

    /**
     * Update the specified alumni
     */
    public function update(Request $request, Alumni $alumni)
    {
        $request->validate([
            'current_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'occupation' => 'nullable|string|max:255',
            'employer' => 'nullable|string|max:255',
            'industry' => 'nullable|string|max:255',
            'higher_education_institution' => 'nullable|string|max:255',
            'higher_education_degree' => 'nullable|string|max:255',
            'higher_education_year' => 'nullable|integer|min:1900|max:' . (date('Y') + 10),
            'social_media_linkedin' => 'nullable|url',
            'social_media_facebook' => 'nullable|url',
            'social_media_twitter' => 'nullable|url',
            'social_media_instagram' => 'nullable|url',
            'is_mentor' => 'boolean',
            'mentor_areas' => 'nullable|array',
            'is_volunteer' => 'boolean',
            'volunteer_areas' => 'nullable|array',
            'newsletter_subscription' => 'boolean',
            'event_notifications' => 'boolean',
            'privacy_level' => 'required|in:public,alumni_only,private',
        ]);

        $alumni->update($request->all());

        return redirect()->route('student.alumni.show', $alumni)
            ->with('success', 'Alumni information updated successfully.');
    }

    /**
     * Display alumni statistics
     */
    public function statistics()
    {
        $totalAlumni = Alumni::whereHas('student', function ($query) {
            $query->where('school_id', Auth::user()->school_id);
        })->count();

        $mentors = Alumni::whereHas('student', function ($query) {
            $query->where('school_id', Auth::user()->school_id);
        })->where('is_mentor', true)->count();

        $volunteers = Alumni::whereHas('student', function ($query) {
            $query->where('school_id', Auth::user()->school_id);
        })->where('is_volunteer', true)->count();

        $graduationYearStats = Alumni::whereHas('student', function ($query) {
                $query->where('school_id', Auth::user()->school_id);
            })
            ->selectRaw('graduation_year, COUNT(*) as count')
            ->groupBy('graduation_year')
            ->orderBy('graduation_year')
            ->get();

        $classStats = Alumni::whereHas('student', function ($query) {
                $query->where('school_id', Auth::user()->school_id);
            })
            ->selectRaw('final_class, COUNT(*) as count')
            ->groupBy('final_class')
            ->orderBy('final_class')
            ->get();

        $occupationStats = Alumni::whereHas('student', function ($query) {
                $query->where('school_id', Auth::user()->school_id);
            })
            ->whereNotNull('occupation')
            ->selectRaw('occupation, COUNT(*) as count')
            ->groupBy('occupation')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Student/Alumni/Statistics', [
            'totalAlumni' => $totalAlumni,
            'mentors' => $mentors,
            'volunteers' => $volunteers,
            'graduationYearStats' => $graduationYearStats,
            'classStats' => $classStats,
            'occupationStats' => $occupationStats
        ]);
    }

    /**
     * Display mentor directory
     */
    public function mentors()
    {
        $mentors = Alumni::whereHas('student', function ($query) {
                $query->where('school_id', Auth::user()->school_id);
            })
            ->where('is_mentor', true)
            ->where('privacy_level', '!=', 'private')
            ->with(['student', 'graduation'])
            ->orderBy('graduation_year', 'desc')
            ->paginate(20);

        return Inertia::render('Student/Alumni/Mentors', [
            'mentors' => $mentors
        ]);
    }

    /**
     * Display volunteer directory
     */
    public function volunteers()
    {
        $volunteers = Alumni::whereHas('student', function ($query) {
                $query->where('school_id', Auth::user()->school_id);
            })
            ->where('is_volunteer', true)
            ->where('privacy_level', '!=', 'private')
            ->with(['student', 'graduation'])
            ->orderBy('graduation_year', 'desc')
            ->paginate(20);

        return Inertia::render('Student/Alumni/Volunteers', [
            'volunteers' => $volunteers
        ]);
    }

    /**
     * Send newsletter to alumni
     */
    public function sendNewsletter(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
            'recipients' => 'required|in:all,mentors,volunteers,graduation_year',
            'graduation_year' => 'nullable|integer|required_if:recipients,graduation_year',
        ]);

        $query = Alumni::whereHas('student', function ($query) {
            $query->where('school_id', Auth::user()->school_id);
        })->where('newsletter_subscription', true);

        switch ($request->recipients) {
            case 'mentors':
                $query->where('is_mentor', true);
                break;
            case 'volunteers':
                $query->where('is_volunteer', true);
                break;
            case 'graduation_year':
                $query->where('graduation_year', $request->graduation_year);
                break;
        }

        $alumni = $query->get();

        // TODO: Send email newsletter
        foreach ($alumni as $alumnus) {
            // Send email logic here
        }

        return redirect()->route('student.alumni.index')
            ->with('success', "Newsletter sent to {$alumni->count()} alumni successfully.");
    }

    /**
     * Export alumni data
     */
    public function export(Request $request)
    {
        $query = Alumni::whereHas('student', function ($query) {
            $query->where('school_id', Auth::user()->school_id);
        })->with(['student', 'graduation']);

        // Apply filters
        if ($request->has('graduation_year') && $request->graduation_year) {
            $query->where('graduation_year', $request->graduation_year);
        }

        if ($request->has('final_class') && $request->final_class) {
            $query->where('final_class', $request->final_class);
        }

        $alumni = $query->get();

        // TODO: Generate CSV/Excel export
        return redirect()->route('student.alumni.index')
            ->with('success', 'Alumni data exported successfully.');
    }
}
