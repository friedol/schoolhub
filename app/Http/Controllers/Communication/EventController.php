<?php

namespace App\Http\Controllers\Communication;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventRSVP;
use App\Models\SchoolClass;
use App\Models\Grade;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $query = Event::where('school_id', Auth::user()->school_id);

        // Apply filters
        if ($request->filled('event_type')) {
            $query->where('event_type', $request->event_type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('is_public')) {
            $query->where('is_public', $request->is_public);
        }

        if ($request->filled('requires_rsvp')) {
            $query->where('requires_rsvp', $request->requires_rsvp);
        }

        if ($request->filled('date_from')) {
            $query->where('start_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('start_date', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $events = $query->with(['organizer', 'targetClasses', 'targetGrades'])
            ->orderBy('start_date', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Statistics
        $stats = [
            'total_events' => Event::where('school_id', Auth::user()->school_id)->count(),
            'published_events' => Event::where('school_id', Auth::user()->school_id)->where('status', 'published')->count(),
            'upcoming_events' => Event::where('school_id', Auth::user()->school_id)->upcoming()->count(),
            'events_requiring_rsvp' => Event::where('school_id', Auth::user()->school_id)->where('requires_rsvp', true)->count(),
        ];

        return Inertia::render('Communication/Events/Index', [
            'events' => $events,
            'stats' => $stats,
            'eventTypeOptions' => Event::EVENT_TYPE_OPTIONS,
            'statusOptions' => Event::STATUS_OPTIONS,
            'filters' => $request->only(['event_type', 'status', 'is_public', 'requires_rsvp', 'date_from', 'date_to', 'search']),
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

        return Inertia::render('Communication/Events/Create', [
            'classes' => $classes,
            'grades' => $grades,
            'eventTypeOptions' => Event::EVENT_TYPE_OPTIONS,
            'statusOptions' => Event::STATUS_OPTIONS,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'event_type' => 'required|in:' . implode(',', array_keys(Event::EVENT_TYPE_OPTIONS)),
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'location' => 'nullable|string|max:255',
            'is_all_day' => 'boolean',
            'is_public' => 'boolean',
            'requires_rsvp' => 'boolean',
            'max_attendees' => 'nullable|integer|min:1',
            'registration_deadline' => 'nullable|date|before:start_date',
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|mimes:pdf,doc,docx,jpeg,png,jpg,gif|max:5120',
            'target_classes' => 'nullable|array',
            'target_grades' => 'nullable|array',
        ]);

        $event = Event::create([
            'school_id' => Auth::user()->school_id,
            'title' => $request->title,
            'description' => $request->description,
            'event_type' => $request->event_type,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'location' => $request->location,
            'is_all_day' => $request->is_all_day ?? false,
            'is_public' => $request->is_public ?? true,
            'requires_rsvp' => $request->requires_rsvp ?? false,
            'max_attendees' => $request->max_attendees,
            'registration_deadline' => $request->registration_deadline,
            'organizer_id' => Auth::id(),
            'status' => 'draft',
        ]);

        // Handle featured image upload
        if ($request->hasFile('featured_image')) {
            $path = $request->file('featured_image')->store('events/images', 'public');
            $event->update(['featured_image' => $path]);
        }

        // Handle attachments
        if ($request->hasFile('attachments')) {
            $attachments = [];
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('events/attachments', 'public');
                $attachments[] = [
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'size' => $file->getSize(),
                    'type' => $file->getMimeType(),
                ];
            }
            $event->update(['attachments' => $attachments]);
        }

        // Handle target classes
        if ($request->target_classes) {
            $event->targetClasses()->sync($request->target_classes);
        }

        // Handle target grades
        if ($request->target_grades) {
            $event->targetGrades()->sync($request->target_grades);
        }

        return redirect()->route('communication.events.index')
            ->with('success', 'Event created successfully.');
    }

    public function show(Event $event)
    {
        $this->authorize('view', $event);

        $event->load([
            'organizer',
            'targetClasses',
            'targetGrades',
            'rsvps.user'
        ]);

        // Record view
        $event->recordView(Auth::user());

        // Get user's RSVP if exists
        $userRsvp = $event->rsvps()->where('user_id', Auth::id())->first();

        return Inertia::render('Communication/Events/Show', [
            'event' => $event,
            'userRsvp' => $userRsvp,
            'rsvpStats' => $event->rsvp_stats,
        ]);
    }

    public function edit(Event $event)
    {
        $this->authorize('update', $event);

        if (in_array($event->status, ['completed', 'cancelled'])) {
            return redirect()->back()
                ->with('error', 'Cannot edit completed or cancelled events.');
        }

        $event->load(['targetClasses', 'targetGrades']);

        $classes = SchoolClass::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $grades = Grade::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Communication/Events/Edit', [
            'event' => $event,
            'classes' => $classes,
            'grades' => $grades,
            'eventTypeOptions' => Event::EVENT_TYPE_OPTIONS,
            'statusOptions' => Event::STATUS_OPTIONS,
        ]);
    }

    public function update(Request $request, Event $event)
    {
        $this->authorize('update', $event);

        if (in_array($event->status, ['completed', 'cancelled'])) {
            return redirect()->back()
                ->with('error', 'Cannot edit completed or cancelled events.');
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'event_type' => 'required|in:' . implode(',', array_keys(Event::EVENT_TYPE_OPTIONS)),
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'location' => 'nullable|string|max:255',
            'is_all_day' => 'boolean',
            'is_public' => 'boolean',
            'requires_rsvp' => 'boolean',
            'max_attendees' => 'nullable|integer|min:1',
            'registration_deadline' => 'nullable|date|before:start_date',
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|mimes:pdf,doc,docx,jpeg,png,jpg,gif|max:5120',
            'target_classes' => 'nullable|array',
            'target_grades' => 'nullable|array',
        ]);

        $event->update([
            'title' => $request->title,
            'description' => $request->description,
            'event_type' => $request->event_type,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'location' => $request->location,
            'is_all_day' => $request->is_all_day ?? false,
            'is_public' => $request->is_public ?? true,
            'requires_rsvp' => $request->requires_rsvp ?? false,
            'max_attendees' => $request->max_attendees,
            'registration_deadline' => $request->registration_deadline,
        ]);

        // Handle featured image upload
        if ($request->hasFile('featured_image')) {
            // Delete old image
            if ($event->featured_image) {
                Storage::disk('public')->delete($event->featured_image);
            }
            $path = $request->file('featured_image')->store('events/images', 'public');
            $event->update(['featured_image' => $path]);
        }

        // Handle attachments
        if ($request->hasFile('attachments')) {
            $attachments = $event->attachments ?? [];
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('events/attachments', 'public');
                $attachments[] = [
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'size' => $file->getSize(),
                    'type' => $file->getMimeType(),
                ];
            }
            $event->update(['attachments' => $attachments]);
        }

        // Handle target classes
        if ($request->target_classes) {
            $event->targetClasses()->sync($request->target_classes);
        }

        // Handle target grades
        if ($request->target_grades) {
            $event->targetGrades()->sync($request->target_grades);
        }

        return redirect()->route('communication.events.index')
            ->with('success', 'Event updated successfully.');
    }

    public function destroy(Event $event)
    {
        $this->authorize('delete', $event);

        if (in_array($event->status, ['published', 'completed'])) {
            return redirect()->back()
                ->with('error', 'Cannot delete published or completed events.');
        }

        // Delete associated files
        if ($event->featured_image) {
            Storage::disk('public')->delete($event->featured_image);
        }

        if ($event->attachments) {
            foreach ($event->attachments as $attachment) {
                Storage::disk('public')->delete($attachment['path']);
            }
        }

        $event->delete();

        return redirect()->route('communication.events.index')
            ->with('success', 'Event deleted successfully.');
    }

    public function publish(Event $event)
    {
        $this->authorize('update', $event);

        $event->publish();

        return redirect()->back()
            ->with('success', 'Event published successfully.');
    }

    public function cancel(Event $event)
    {
        $this->authorize('update', $event);

        $event->cancel();

        return redirect()->back()
            ->with('success', 'Event cancelled successfully.');
    }

    public function complete(Event $event)
    {
        $this->authorize('update', $event);

        $event->complete();

        return redirect()->back()
            ->with('success', 'Event marked as completed successfully.');
    }

    public function rsvp(Request $request, Event $event)
    {
        $this->authorize('view', $event);

        if (!$event->requires_rsvp) {
            return redirect()->back()
                ->with('error', 'This event does not require RSVP.');
        }

        if (!$event->canUserRsvp(Auth::user())) {
            return redirect()->back()
                ->with('error', 'You cannot RSVP for this event.');
        }

        $request->validate([
            'response' => 'required|in:attending,not_attending,maybe',
            'guests_count' => 'nullable|integer|min:0|max:10',
            'dietary_requirements' => 'nullable|string|max:500',
            'special_needs' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:500',
        ]);

        $rsvp = EventRSVP::updateOrCreate(
            [
                'event_id' => $event->id,
                'user_id' => Auth::id(),
            ],
            [
                'school_id' => Auth::user()->school_id,
                'response' => $request->response,
                'guests_count' => $request->guests_count ?? 0,
                'dietary_requirements' => $request->dietary_requirements,
                'special_needs' => $request->special_needs,
                'notes' => $request->notes,
                'responded_at' => now(),
            ]
        );

        $responseText = match ($request->response) {
            'attending' => 'attending',
            'not_attending' => 'not attending',
            'maybe' => 'maybe attending',
        };

        return redirect()->back()
            ->with('success', "RSVP updated: You are {$responseText}.");
    }

    public function getRsvpStats(Event $event)
    {
        $this->authorize('view', $event);

        $stats = EventRSVP::getEventStats($event->id);

        return response()->json($stats);
    }

    public function getUpcomingEvents()
    {
        $events = Event::where('school_id', Auth::user()->school_id)
            ->published()
            ->upcoming()
            ->with(['organizer'])
            ->orderBy('start_date')
            ->orderBy('start_time')
            ->limit(10)
            ->get();

        return response()->json($events);
    }

    public function getPublicEvents(Request $request)
    {
        $query = Event::where('school_id', Auth::user()->school_id)
            ->published()
            ->public();

        // Apply filters
        if ($request->filled('event_type')) {
            $query->where('event_type', $request->event_type);
        }

        if ($request->filled('date_from')) {
            $query->where('start_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('start_date', '<=', $request->date_to);
        }

        $events = $query->with(['organizer'])
            ->orderBy('start_date')
            ->orderBy('start_time')
            ->paginate(12);

        return Inertia::render('Communication/Events/Public', [
            'events' => $events,
            'eventTypeOptions' => Event::EVENT_TYPE_OPTIONS,
            'filters' => $request->only(['event_type', 'date_from', 'date_to']),
        ]);
    }

    public function getEventCalendar(Request $request)
    {
        $startDate = $request->get('start', now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->get('end', now()->endOfMonth()->format('Y-m-d'));

        $events = Event::where('school_id', Auth::user()->school_id)
            ->published()
            ->whereBetween('start_date', [$startDate, $endDate])
            ->with(['organizer'])
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'start' => $event->start_date->format('Y-m-d') . ($event->start_time ? 'T' . $event->start_time : ''),
                    'end' => $event->end_date->format('Y-m-d') . ($event->end_time ? 'T' . $event->end_time : ''),
                    'allDay' => $event->is_all_day,
                    'url' => route('communication.events.show', $event),
                    'color' => $this->getEventColor($event->event_type),
                ];
            });

        return response()->json($events);
    }

    private function getEventColor(string $eventType): string
    {
        return match ($eventType) {
            'academic' => '#3B82F6', // Blue
            'sports' => '#10B981', // Green
            'cultural' => '#F59E0B', // Yellow
            'social' => '#EF4444', // Red
            'parent_meeting' => '#8B5CF6', // Purple
            'graduation' => '#06B6D4', // Cyan
            'emergency' => '#DC2626', // Dark Red
            default => '#6B7280', // Gray
        };
    }
}



