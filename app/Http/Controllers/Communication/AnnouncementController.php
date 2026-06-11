<?php

namespace App\Http\Controllers\Communication;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\SchoolClass;
use App\Models\Grade;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $query = Announcement::where('school_id', Auth::user()->school_id);

        // Apply filters
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('target_audience')) {
            $query->where('target_audience', $request->target_audience);
        }

        if ($request->filled('is_published')) {
            $query->where('is_published', $request->is_published);
        }

        if ($request->filled('is_pinned')) {
            $query->where('is_pinned', $request->is_pinned);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $announcements = $query->with(['author', 'targetClasses', 'targetGrades'])
            ->orderBy('is_pinned', 'desc')
            ->orderBy('published_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Statistics
        $stats = [
            'total_announcements' => Announcement::where('school_id', Auth::user()->school_id)->count(),
            'published_announcements' => Announcement::where('school_id', Auth::user()->school_id)->where('is_published', true)->count(),
            'pinned_announcements' => Announcement::where('school_id', Auth::user()->school_id)->where('is_pinned', true)->count(),
            'urgent_announcements' => Announcement::where('school_id', Auth::user()->school_id)->where('priority', 'urgent')->count(),
        ];

        return Inertia::render('Communication/Announcements/Index', [
            'announcements' => $announcements,
            'stats' => $stats,
            'categoryOptions' => Announcement::CATEGORY_OPTIONS,
            'priorityOptions' => Announcement::PRIORITY_OPTIONS,
            'targetAudienceOptions' => Announcement::TARGET_AUDIENCE_OPTIONS,
            'languageOptions' => Announcement::LANGUAGE_OPTIONS,
            'filters' => $request->only(['category', 'priority', 'target_audience', 'is_published', 'is_pinned', 'search']),
        ]);
    }

    public function create()
    {
        $classes = SchoolClass::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $grades = Grade::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Communication/Announcements/Create', [
            'classes' => $classes,
            'grades' => $grades,
            'categoryOptions' => Announcement::CATEGORY_OPTIONS,
            'priorityOptions' => Announcement::PRIORITY_OPTIONS,
            'targetAudienceOptions' => Announcement::TARGET_AUDIENCE_OPTIONS,
            'languageOptions' => Announcement::LANGUAGE_OPTIONS,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:500',
            'category' => 'required|in:' . implode(',', array_keys(Announcement::CATEGORY_OPTIONS)),
            'priority' => 'required|in:' . implode(',', array_keys(Announcement::PRIORITY_OPTIONS)),
            'target_audience' => 'required|in:' . implode(',', array_keys(Announcement::TARGET_AUDIENCE_OPTIONS)),
            'language' => 'required|in:' . implode(',', array_keys(Announcement::LANGUAGE_OPTIONS)),
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|mimes:pdf,doc,docx,jpeg,png,jpg,gif|max:5120',
            'published_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:published_at',
            'is_published' => 'boolean',
            'is_pinned' => 'boolean',
            'target_classes' => 'nullable|array',
            'target_grades' => 'nullable|array',
        ]);

        $announcement = Announcement::create([
            'school_id' => Auth::user()->school_id,
            'title' => $request->title,
            'content' => $request->content,
            'excerpt' => $request->excerpt,
            'category' => $request->category,
            'priority' => $request->priority,
            'target_audience' => $request->target_audience,
            'language' => $request->language,
            'published_at' => $request->published_at ?: ($request->is_published ? now() : null),
            'expires_at' => $request->expires_at,
            'is_published' => $request->is_published ?? false,
            'is_pinned' => $request->is_pinned ?? false,
            'author_id' => Auth::id(),
        ]);

        // Handle featured image upload
        if ($request->hasFile('featured_image')) {
            $path = $request->file('featured_image')->store('announcements/images', 'public');
            $announcement->update(['featured_image' => $path]);
        }

        // Handle attachments
        if ($request->hasFile('attachments')) {
            $attachments = [];
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('announcements/attachments', 'public');
                $attachments[] = [
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'size' => $file->getSize(),
                    'type' => $file->getMimeType(),
                ];
            }
            $announcement->update(['attachments' => $attachments]);
        }

        // Handle target classes
        if ($request->target_classes) {
            $announcement->targetClasses()->sync($request->target_classes);
        }

        // Handle target grades
        if ($request->target_grades) {
            $announcement->targetGrades()->sync($request->target_grades);
        }

        return redirect()->route('communication.announcements.index')
            ->with('success', 'Announcement created successfully.');
    }

    public function show(Announcement $announcement)
    {
        $this->authorize('view', $announcement);

        $announcement->load(['author', 'targetClasses', 'targetGrades', 'comments.user']);

        // Record view
        $announcement->recordView(Auth::user());

        return Inertia::render('Communication/Announcements/Show', [
            'announcement' => $announcement,
        ]);
    }

    public function edit(Announcement $announcement)
    {
        $this->authorize('update', $announcement);

        $announcement->load(['targetClasses', 'targetGrades']);

        $classes = SchoolClass::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $grades = Grade::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Communication/Announcements/Edit', [
            'announcement' => $announcement,
            'classes' => $classes,
            'grades' => $grades,
            'categoryOptions' => Announcement::CATEGORY_OPTIONS,
            'priorityOptions' => Announcement::PRIORITY_OPTIONS,
            'targetAudienceOptions' => Announcement::TARGET_AUDIENCE_OPTIONS,
            'languageOptions' => Announcement::LANGUAGE_OPTIONS,
        ]);
    }

    public function update(Request $request, Announcement $announcement)
    {
        $this->authorize('update', $announcement);

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:500',
            'category' => 'required|in:' . implode(',', array_keys(Announcement::CATEGORY_OPTIONS)),
            'priority' => 'required|in:' . implode(',', array_keys(Announcement::PRIORITY_OPTIONS)),
            'target_audience' => 'required|in:' . implode(',', array_keys(Announcement::TARGET_AUDIENCE_OPTIONS)),
            'language' => 'required|in:' . implode(',', array_keys(Announcement::LANGUAGE_OPTIONS)),
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|mimes:pdf,doc,docx,jpeg,png,jpg,gif|max:5120',
            'published_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:published_at',
            'is_published' => 'boolean',
            'is_pinned' => 'boolean',
            'target_classes' => 'nullable|array',
            'target_grades' => 'nullable|array',
        ]);

        $announcement->update([
            'title' => $request->title,
            'content' => $request->content,
            'excerpt' => $request->excerpt,
            'category' => $request->category,
            'priority' => $request->priority,
            'target_audience' => $request->target_audience,
            'language' => $request->language,
            'published_at' => $request->published_at ?: ($request->is_published ? now() : null),
            'expires_at' => $request->expires_at,
            'is_published' => $request->is_published ?? false,
            'is_pinned' => $request->is_pinned ?? false,
        ]);

        // Handle featured image upload
        if ($request->hasFile('featured_image')) {
            // Delete old image
            if ($announcement->featured_image) {
                Storage::disk('public')->delete($announcement->featured_image);
            }
            $path = $request->file('featured_image')->store('announcements/images', 'public');
            $announcement->update(['featured_image' => $path]);
        }

        // Handle attachments
        if ($request->hasFile('attachments')) {
            $attachments = $announcement->attachments ?? [];
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('announcements/attachments', 'public');
                $attachments[] = [
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'size' => $file->getSize(),
                    'type' => $file->getMimeType(),
                ];
            }
            $announcement->update(['attachments' => $attachments]);
        }

        // Handle target classes
        if ($request->target_classes) {
            $announcement->targetClasses()->sync($request->target_classes);
        }

        // Handle target grades
        if ($request->target_grades) {
            $announcement->targetGrades()->sync($request->target_grades);
        }

        return redirect()->route('communication.announcements.index')
            ->with('success', 'Announcement updated successfully.');
    }

    public function destroy(Announcement $announcement)
    {
        $this->authorize('delete', $announcement);

        // Delete associated files
        if ($announcement->featured_image) {
            Storage::disk('public')->delete($announcement->featured_image);
        }

        if ($announcement->attachments) {
            foreach ($announcement->attachments as $attachment) {
                Storage::disk('public')->delete($attachment['path']);
            }
        }

        $announcement->delete();

        return redirect()->route('communication.announcements.index')
            ->with('success', 'Announcement deleted successfully.');
    }

    public function publish(Announcement $announcement)
    {
        $this->authorize('update', $announcement);

        $announcement->publish();

        return redirect()->back()
            ->with('success', 'Announcement published successfully.');
    }

    public function unpublish(Announcement $announcement)
    {
        $this->authorize('update', $announcement);

        $announcement->unpublish();

        return redirect()->back()
            ->with('success', 'Announcement unpublished successfully.');
    }

    public function pin(Announcement $announcement)
    {
        $this->authorize('update', $announcement);

        $announcement->pin();

        return redirect()->back()
            ->with('success', 'Announcement pinned successfully.');
    }

    public function unpin(Announcement $announcement)
    {
        $this->authorize('update', $announcement);

        $announcement->unpin();

        return redirect()->back()
            ->with('success', 'Announcement unpinned successfully.');
    }

    public function addComment(Request $request, Announcement $announcement)
    {
        $this->authorize('view', $announcement);

        $request->validate([
            'content' => 'required|string|max:1000',
            'is_anonymous' => 'boolean',
        ]);

        $comment = $announcement->comments()->create([
            'user_id' => Auth::id(),
            'content' => $request->content,
            'is_anonymous' => $request->is_anonymous ?? false,
            'is_approved' => false, // Comments need approval
        ]);

        return redirect()->back()
            ->with('success', 'Comment added successfully. It will be visible after approval.');
    }

    public function approveComment(Announcement $announcement, $commentId)
    {
        $this->authorize('update', $announcement);

        $comment = $announcement->comments()->findOrFail($commentId);
        $comment->approve(Auth::user());

        return redirect()->back()
            ->with('success', 'Comment approved successfully.');
    }

    public function deleteComment(Announcement $announcement, $commentId)
    {
        $this->authorize('update', $announcement);

        $comment = $announcement->comments()->findOrFail($commentId);
        $comment->delete();

        return redirect()->back()
            ->with('success', 'Comment deleted successfully.');
    }

    public function getPublicAnnouncements(Request $request)
    {
        $query = Announcement::where('school_id', Auth::user()->school_id)
            ->published()
            ->where('is_public', true);

        // Apply filters
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        $announcements = $query->with(['author'])
            ->orderBy('is_pinned', 'desc')
            ->orderBy('published_at', 'desc')
            ->paginate(10);

        return Inertia::render('Communication/Announcements/Public', [
            'announcements' => $announcements,
            'categoryOptions' => Announcement::CATEGORY_OPTIONS,
            'priorityOptions' => Announcement::PRIORITY_OPTIONS,
            'filters' => $request->only(['category', 'priority']),
        ]);
    }
}



