<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class LanguageController extends Controller
{
    /**
     * Switch the application language
     */
    public function switch(Request $request)
    {
        $validated = $request->validate([
            'language' => 'required|in:en,sw',
        ]);

        $language = $validated['language'];

        // Store language preference in session
        Session::put('locale', $language);

        // Update user's language preference if authenticated
        if (Auth::check()) {
            Auth::user()->update(['language_preference' => $language]);
        }

        // Set the application locale
        app()->setLocale($language);

        return redirect()->back();
    }

    /**
     * Get current language
     */
    public function current()
    {
        return response()->json([
            'language' => app()->getLocale(),
            'user_preference' => Auth::check() ? Auth::user()->language_preference : null,
        ]);
    }
}
