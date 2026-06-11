<?php

namespace App\Http\Controllers\Communication;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\MessageTemplate;
use App\Models\User;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $query = Message::where('school_id', Auth::user()->school_id);

        // Apply filters
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('sender_id')) {
            $query->where('sender_id', $request->sender_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $messages = $query->with(['sender', 'template', 'messageRecipients.recipient'])
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Statistics
        $stats = [
            'total_messages' => Message::where('school_id', Auth::user()->school_id)->count(),
            'sent_messages' => Message::where('school_id', Auth::user()->school_id)->where('status', 'sent')->count(),
            'delivered_messages' => Message::where('school_id', Auth::user()->school_id)->where('status', 'delivered')->count(),
            'failed_messages' => Message::where('school_id', Auth::user()->school_id)->where('status', 'failed')->count(),
            'scheduled_messages' => Message::where('school_id', Auth::user()->school_id)->where('status', 'scheduled')->count(),
        ];

        return Inertia::render('Communication/Messages/Index', [
            'messages' => $messages,
            'stats' => $stats,
            'typeOptions' => Message::TYPE_OPTIONS,
            'statusOptions' => Message::STATUS_OPTIONS,
            'filters' => $request->only(['type', 'status', 'sender_id', 'search']),
        ]);
    }

    public function create()
    {
        $templates = MessageTemplate::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $users = User::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $classes = SchoolClass::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Communication/Messages/Create', [
            'templates' => $templates,
            'users' => $users,
            'classes' => $classes,
            'typeOptions' => Message::TYPE_OPTIONS,
            'recipientTypeOptions' => Message::RECIPIENT_TYPE_OPTIONS,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'template_id' => 'nullable|exists:message_templates,id',
            'type' => 'required|in:' . implode(',', array_keys(Message::TYPE_OPTIONS)),
            'subject' => 'nullable|string|max:255',
            'content' => 'required|string',
            'recipients' => 'required|array|min:1',
            'recipients.*.type' => 'required|in:' . implode(',', array_keys(Message::RECIPIENT_TYPE_OPTIONS)),
            'recipients.*.id' => 'required|integer',
            'scheduled_at' => 'nullable|date|after:now',
        ]);

        DB::beginTransaction();

        try {
            $message = Message::create([
                'school_id' => Auth::user()->school_id,
                'message_template_id' => $request->template_id,
                'sender_id' => Auth::id(),
                'type' => $request->type,
                'subject' => $request->subject,
                'content' => $request->content,
                'status' => $request->scheduled_at ? 'scheduled' : 'draft',
                'scheduled_at' => $request->scheduled_at,
                'cost' => $this->calculateMessageCost($request->type, count($request->recipients)),
            ]);

            // Create message recipients
            foreach ($request->recipients as $recipient) {
                $recipientUser = User::find($recipient['id']);
                if ($recipientUser) {
                    $message->messageRecipients()->create([
                        'recipient_type' => $recipient['type'],
                        'recipient_id' => $recipient['id'],
                        'recipient_contact' => $this->getRecipientContact($recipientUser, $request->type),
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('communication.messages.index')
                ->with('success', 'Message created successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Failed to create message: ' . $e->getMessage());
        }
    }

    public function show(Message $message)
    {
        $this->authorize('view', $message);

        $message->load([
            'sender',
            'template',
            'messageRecipients.recipient',
            'replies.sender',
            'threadMessages.sender'
        ]);

        return Inertia::render('Communication/Messages/Show', [
            'message' => $message,
        ]);
    }

    public function edit(Message $message)
    {
        $this->authorize('update', $message);

        if ($message->status !== 'draft') {
            return redirect()->back()
                ->with('error', 'Only draft messages can be edited.');
        }

        $message->load('messageRecipients.recipient');

        $templates = MessageTemplate::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $users = User::where('school_id', Auth::user()->school_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Communication/Messages/Edit', [
            'message' => $message,
            'templates' => $templates,
            'users' => $users,
            'typeOptions' => Message::TYPE_OPTIONS,
            'recipientTypeOptions' => Message::RECIPIENT_TYPE_OPTIONS,
        ]);
    }

    public function update(Request $request, Message $message)
    {
        $this->authorize('update', $message);

        if ($message->status !== 'draft') {
            return redirect()->back()
                ->with('error', 'Only draft messages can be edited.');
        }

        $request->validate([
            'template_id' => 'nullable|exists:message_templates,id',
            'type' => 'required|in:' . implode(',', array_keys(Message::TYPE_OPTIONS)),
            'subject' => 'nullable|string|max:255',
            'content' => 'required|string',
            'recipients' => 'required|array|min:1',
            'recipients.*.type' => 'required|in:' . implode(',', array_keys(Message::RECIPIENT_TYPE_OPTIONS)),
            'recipients.*.id' => 'required|integer',
            'scheduled_at' => 'nullable|date|after:now',
        ]);

        DB::beginTransaction();

        try {
            $message->update([
                'message_template_id' => $request->template_id,
                'type' => $request->type,
                'subject' => $request->subject,
                'content' => $request->content,
                'scheduled_at' => $request->scheduled_at,
                'cost' => $this->calculateMessageCost($request->type, count($request->recipients)),
            ]);

            // Update recipients
            $message->messageRecipients()->delete();
            foreach ($request->recipients as $recipient) {
                $recipientUser = User::find($recipient['id']);
                if ($recipientUser) {
                    $message->messageRecipients()->create([
                        'recipient_type' => $recipient['type'],
                        'recipient_id' => $recipient['id'],
                        'recipient_contact' => $this->getRecipientContact($recipientUser, $request->type),
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('communication.messages.index')
                ->with('success', 'Message updated successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Failed to update message: ' . $e->getMessage());
        }
    }

    public function destroy(Message $message)
    {
        $this->authorize('delete', $message);

        if (in_array($message->status, ['sent', 'delivered'])) {
            return redirect()->back()
                ->with('error', 'Cannot delete sent or delivered messages.');
        }

        $message->delete();

        return redirect()->route('communication.messages.index')
            ->with('success', 'Message deleted successfully.');
    }

    public function send(Message $message)
    {
        $this->authorize('update', $message);

        if ($message->status !== 'draft') {
            return redirect()->back()
                ->with('error', 'Only draft messages can be sent.');
        }

        // Here you would integrate with actual SMS/Email services
        // For now, we'll just mark as sent
        $message->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        // Update recipients
        $message->messageRecipients()->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        return redirect()->back()
            ->with('success', 'Message sent successfully.');
    }

    public function schedule(Message $message)
    {
        $this->authorize('update', $message);

        if ($message->status !== 'draft' || !$message->scheduled_at) {
            return redirect()->back()
                ->with('error', 'Only draft messages with scheduled time can be scheduled.');
        }

        $message->update(['status' => 'scheduled']);

        return redirect()->back()
            ->with('success', 'Message scheduled successfully.');
    }

    public function cancel(Message $message)
    {
        $this->authorize('update', $message);

        if (!in_array($message->status, ['scheduled', 'draft'])) {
            return redirect()->back()
                ->with('error', 'Only scheduled or draft messages can be cancelled.');
        }

        $message->update(['status' => 'cancelled']);

        return redirect()->back()
            ->with('success', 'Message cancelled successfully.');
    }

    public function reply(Request $request, Message $message)
    {
        $this->authorize('view', $message);

        $request->validate([
            'content' => 'required|string',
        ]);

        $reply = $message->createReply([
            'sender_id' => Auth::id(),
            'type' => $message->type,
            'subject' => 'Re: ' . $message->subject,
            'content' => $request->content,
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        return redirect()->back()
            ->with('success', 'Reply sent successfully.');
    }

    public function getRecipientsByType(Request $request)
    {
        $type = $request->type;
        $search = $request->search;

        $query = User::where('school_id', Auth::user()->school_id)
            ->where('is_active', true);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        switch ($type) {
            case 'students':
                $query->where('role', 'student');
                break;
            case 'parents':
                $query->where('role', 'parent');
                break;
            case 'teachers':
                $query->where('role', 'teacher');
                break;
            case 'staff':
                $query->whereIn('role', ['teacher', 'staff']);
                break;
        }

        $users = $query->limit(20)->get();

        return response()->json($users);
    }

    public function getClassRecipients(Request $request)
    {
        $classId = $request->class_id;
        $type = $request->type; // 'students' or 'parents'

        $class = SchoolClass::find($classId);
        if (!$class) {
            return response()->json([]);
        }

        if ($type === 'students') {
            $users = $class->students()->where('is_active', true)->get();
        } else {
            // Get parents of students in this class
            $users = User::where('school_id', Auth::user()->school_id)
                ->where('role', 'parent')
                ->whereHas('children.studentProfile', function ($query) use ($classId) {
                    $query->where('class_id', $classId);
                })
                ->where('is_active', true)
                ->get();
        }

        return response()->json($users);
    }

    private function calculateMessageCost(string $type, int $recipientCount): float
    {
        $costPerMessage = match ($type) {
            'sms' => 0.05, // TZS 0.05 per SMS
            'email' => 0.01, // TZS 0.01 per email
            'push' => 0.00, // Free push notifications
            default => 0.00,
        };

        return $costPerMessage * $recipientCount;
    }

    private function getRecipientContact(User $user, string $messageType): string
    {
        return match ($messageType) {
            'sms' => $user->phone ?? '',
            'email' => $user->email ?? '',
            'push' => $user->id, // For push notifications
            default => $user->email ?? $user->phone ?? '',
        };
    }
}



