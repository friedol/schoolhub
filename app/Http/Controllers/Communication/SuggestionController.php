<?php

namespace App\Http\Controllers\Communication;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SuggestionController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Communication/Suggestions/Index', [
            'class_filter'   => $request->get('class_id', ''),
            'subject_filter' => $request->get('subject_id', ''),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'class_id'   => 'required|integer',
            'subject_id' => 'required|integer',
            'title'      => 'required|string|max:255',
            'details'    => 'required|string',
        ]);

        return redirect()->back()->with('success', 'Suggestion submitted successfully!');
    }

    public function destroy(int $id)
    {
        return redirect()->back()->with('success', 'Suggestion deleted successfully!');
    }
}
