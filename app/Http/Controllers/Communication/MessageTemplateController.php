<?php

namespace App\Http\Controllers\Communication;

use App\Http\Controllers\Controller;
use App\Models\MessageTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class MessageTemplateController extends Controller
{
    public function index(Request $request)
    {
        $query = MessageTemplate::where('school_id', Auth::user()->school_id);

        // Apply filters
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('language')) {
            $query->where('language', $request->language);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $templates = $query->with('createdBy')
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Statistics
        $stats = [
            'total_templates' => MessageTemplate::where('school_id', Auth::user()->school_id)->count(),
            'active_templates' => MessageTemplate::where('school_id', Auth::user()->school_id)->where('is_active', true)->count(),
            'sms_templates' => MessageTemplate::where('school_id', Auth::user()->school_id)->where('type', 'sms')->count(),
            'email_templates' => MessageTemplate::where('school_id', Auth::user()->school_id)->where('type', 'email')->count(),
        ];

        return Inertia::render('Communication/MessageTemplates/Index', [
            'templates' => $templates,
            'stats' => $stats,
            'typeOptions' => MessageTemplate::TYPE_OPTIONS,
            'categoryOptions' => MessageTemplate::CATEGORY_OPTIONS,
            'languageOptions' => MessageTemplate::LANGUAGE_OPTIONS,
            'filters' => $request->only(['type', 'category', 'language', 'is_active', 'search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Communication/MessageTemplates/Create', [
            'typeOptions' => MessageTemplate::TYPE_OPTIONS,
            'categoryOptions' => MessageTemplate::CATEGORY_OPTIONS,
            'languageOptions' => MessageTemplate::LANGUAGE_OPTIONS,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'subject' => 'nullable|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:' . implode(',', array_keys(MessageTemplate::TYPE_OPTIONS)),
            'category' => 'required|in:' . implode(',', array_keys(MessageTemplate::CATEGORY_OPTIONS)),
            'language' => 'required|in:' . implode(',', array_keys(MessageTemplate::LANGUAGE_OPTIONS)),
            'variables' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $template = MessageTemplate::create([
            'school_id' => Auth::user()->school_id,
            'name' => $request->name,
            'subject' => $request->subject,
            'content' => $request->content,
            'type' => $request->type,
            'category' => $request->category,
            'language' => $request->language,
            'variables' => $request->variables,
            'is_active' => $request->is_active ?? true,
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('communication.templates.index')
            ->with('success', 'Message template created successfully.');
    }

    public function show(MessageTemplate $template)
    {
        $this->authorize('view', $template);

        $template->load('createdBy');

        return Inertia::render('Communication/MessageTemplates/Show', [
            'template' => $template,
        ]);
    }

    public function edit(MessageTemplate $template)
    {
        $this->authorize('update', $template);

        return Inertia::render('Communication/MessageTemplates/Edit', [
            'template' => $template,
            'typeOptions' => MessageTemplate::TYPE_OPTIONS,
            'categoryOptions' => MessageTemplate::CATEGORY_OPTIONS,
            'languageOptions' => MessageTemplate::LANGUAGE_OPTIONS,
        ]);
    }

    public function update(Request $request, MessageTemplate $template)
    {
        $this->authorize('update', $template);

        $request->validate([
            'name' => 'required|string|max:255',
            'subject' => 'nullable|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:' . implode(',', array_keys(MessageTemplate::TYPE_OPTIONS)),
            'category' => 'required|in:' . implode(',', array_keys(MessageTemplate::CATEGORY_OPTIONS)),
            'language' => 'required|in:' . implode(',', array_keys(MessageTemplate::LANGUAGE_OPTIONS)),
            'variables' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $template->update([
            'name' => $request->name,
            'subject' => $request->subject,
            'content' => $request->content,
            'type' => $request->type,
            'category' => $request->category,
            'language' => $request->language,
            'variables' => $request->variables,
            'is_active' => $request->is_active ?? true,
        ]);

        return redirect()->route('communication.templates.index')
            ->with('success', 'Message template updated successfully.');
    }

    public function destroy(MessageTemplate $template)
    {
        $this->authorize('delete', $template);

        // Check if template is being used
        if ($template->messages()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete template that is being used in messages.');
        }

        $template->delete();

        return redirect()->route('communication.templates.index')
            ->with('success', 'Message template deleted successfully.');
    }

    public function duplicate(MessageTemplate $template)
    {
        $this->authorize('view', $template);

        $newTemplate = $template->replicate();
        $newTemplate->name = $template->name . ' (Copy)';
        $newTemplate->created_by = Auth::id();
        $newTemplate->save();

        return redirect()->route('communication.templates.edit', $newTemplate)
            ->with('success', 'Template duplicated successfully.');
    }

    public function toggleStatus(MessageTemplate $template)
    {
        $this->authorize('update', $template);

        $template->update(['is_active' => !$template->is_active]);

        $status = $template->is_active ? 'activated' : 'deactivated';
        return redirect()->back()
            ->with('success', "Template {$status} successfully.");
    }

    public function preview(Request $request, MessageTemplate $template)
    {
        $this->authorize('view', $template);

        $request->validate([
            'variables' => 'nullable|array',
        ]);

        $processedContent = $template->processContent($request->variables ?? []);

        return response()->json([
            'subject' => $template->subject,
            'content' => $processedContent,
            'type' => $template->type,
        ]);
    }

    public function getTemplatesByCategory($category)
    {
        $templates = MessageTemplate::where('school_id', Auth::user()->school_id)
            ->where('category', $category)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json($templates);
    }

    public function getTemplatesByType($type)
    {
        $templates = MessageTemplate::where('school_id', Auth::user()->school_id)
            ->where('type', $type)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json($templates);
    }
}



