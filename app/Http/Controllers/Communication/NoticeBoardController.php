<?php

namespace App\Http\Controllers\Communication;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NoticeBoardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $receiver = $request->get('receiver', 'all');
        $search = $request->get('search', '');

        return Inertia::render('Communication/NoticeBoard/Index', [
            'receiver' => $receiver,
            'search' => $search,
        ]);
    }

    public function create()
    {
        return Inertia::render('Communication/NoticeBoard/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'notice'  => 'required|string',
            'receiver' => 'required|in:student,teacher,staff,parents,all',
        ]);

        return redirect()->route('communication.notice-board.index')
            ->with('success', 'Notice posted successfully!');
    }

    public function destroy(int $id)
    {
        return redirect()->route('communication.notice-board.index')
            ->with('success', 'Notice deleted successfully!');
    }
}
