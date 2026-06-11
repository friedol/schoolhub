<?php

namespace App\Http\Controllers\Communication;

use App\Http\Controllers\Controller;
use App\Models\NotificationPreference;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationPreferenceController extends Controller
{
    public function index()
    {
        $preferences = NotificationPreference::where('user_id', Auth::id())
            ->orderBy('notification_type')
            ->get();

        // Get all notification types and create defaults for missing ones
        $allTypes = array_keys(NotificationPreference::NOTIFICATION_TYPE_OPTIONS);
        $existingTypes = $preferences->pluck('notification_type')->toArray();
        $missingTypes = array_diff($allTypes, $existingTypes);

        // Create default preferences for missing types
        foreach ($missingTypes as $type) {
            $defaults = NotificationPreference::getDefaultPreferences();
            NotificationPreference::create([
                'user_id' => Auth::id(),
                'notification_type' => $type,
                'email_enabled' => $defaults['email_enabled'],
                'sms_enabled' => $defaults['sms_enabled'],
                'push_enabled' => $defaults['push_enabled'],
                'frequency' => $defaults['frequency'],
                'categories' => $defaults['categories'],
            ]);
        }

        // Refresh preferences
        $preferences = NotificationPreference::where('user_id', Auth::id())
            ->orderBy('notification_type')
            ->get();

        return Inertia::render('Communication/NotificationPreferences/Index', [
            'preferences' => $preferences,
            'notificationTypeOptions' => NotificationPreference::NOTIFICATION_TYPE_OPTIONS,
            'frequencyOptions' => NotificationPreference::FREQUENCY_OPTIONS,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'preferences' => 'required|array',
            'preferences.*.notification_type' => 'required|in:' . implode(',', array_keys(NotificationPreference::NOTIFICATION_TYPE_OPTIONS)),
            'preferences.*.email_enabled' => 'boolean',
            'preferences.*.sms_enabled' => 'boolean',
            'preferences.*.push_enabled' => 'boolean',
            'preferences.*.frequency' => 'required|in:' . implode(',', array_keys(NotificationPreference::FREQUENCY_OPTIONS)),
            'preferences.*.quiet_hours_start' => 'nullable|date_format:H:i',
            'preferences.*.quiet_hours_end' => 'nullable|date_format:H:i',
            'preferences.*.categories' => 'nullable|array',
        ]);

        foreach ($request->preferences as $prefData) {
            $preference = NotificationPreference::where('user_id', Auth::id())
                ->where('notification_type', $prefData['notification_type'])
                ->first();

            if ($preference) {
                $preference->update([
                    'email_enabled' => $prefData['email_enabled'] ?? true,
                    'sms_enabled' => $prefData['sms_enabled'] ?? true,
                    'push_enabled' => $prefData['push_enabled'] ?? true,
                    'frequency' => $prefData['frequency'],
                    'quiet_hours_start' => $prefData['quiet_hours_start'],
                    'quiet_hours_end' => $prefData['quiet_hours_end'],
                    'categories' => $prefData['categories'] ?? [],
                ]);
            } else {
                NotificationPreference::create([
                    'user_id' => Auth::id(),
                    'notification_type' => $prefData['notification_type'],
                    'email_enabled' => $prefData['email_enabled'] ?? true,
                    'sms_enabled' => $prefData['sms_enabled'] ?? true,
                    'push_enabled' => $prefData['push_enabled'] ?? true,
                    'frequency' => $prefData['frequency'],
                    'quiet_hours_start' => $prefData['quiet_hours_start'],
                    'quiet_hours_end' => $prefData['quiet_hours_end'],
                    'categories' => $prefData['categories'] ?? [],
                ]);
            }
        }

        return redirect()->back()
            ->with('success', 'Notification preferences updated successfully.');
    }

    public function updateChannel(Request $request, $notificationType)
    {
        $request->validate([
            'channel' => 'required|in:email,sms,push',
            'enabled' => 'required|boolean',
        ]);

        $preference = NotificationPreference::where('user_id', Auth::id())
            ->where('notification_type', $notificationType)
            ->first();

        if (!$preference) {
            $defaults = NotificationPreference::getDefaultPreferences();
            $preference = NotificationPreference::create([
                'user_id' => Auth::id(),
                'notification_type' => $notificationType,
                'email_enabled' => $defaults['email_enabled'],
                'sms_enabled' => $defaults['sms_enabled'],
                'push_enabled' => $defaults['push_enabled'],
                'frequency' => $defaults['frequency'],
                'categories' => $defaults['categories'],
            ]);
        }

        if ($request->enabled) {
            $preference->enableChannel($request->channel);
        } else {
            $preference->disableChannel($request->channel);
        }

        return response()->json([
            'success' => true,
            'message' => 'Channel preference updated successfully.',
        ]);
    }

    public function updateFrequency(Request $request, $notificationType)
    {
        $request->validate([
            'frequency' => 'required|in:' . implode(',', array_keys(NotificationPreference::FREQUENCY_OPTIONS)),
        ]);

        $preference = NotificationPreference::where('user_id', Auth::id())
            ->where('notification_type', $notificationType)
            ->first();

        if (!$preference) {
            $defaults = NotificationPreference::getDefaultPreferences();
            $preference = NotificationPreference::create([
                'user_id' => Auth::id(),
                'notification_type' => $notificationType,
                'email_enabled' => $defaults['email_enabled'],
                'sms_enabled' => $defaults['sms_enabled'],
                'push_enabled' => $defaults['push_enabled'],
                'frequency' => $request->frequency,
                'categories' => $defaults['categories'],
            ]);
        } else {
            $preference->update(['frequency' => $request->frequency]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Frequency preference updated successfully.',
        ]);
    }

    public function updateQuietHours(Request $request, $notificationType)
    {
        $request->validate([
            'quiet_hours_start' => 'nullable|date_format:H:i',
            'quiet_hours_end' => 'nullable|date_format:H:i',
        ]);

        $preference = NotificationPreference::where('user_id', Auth::id())
            ->where('notification_type', $notificationType)
            ->first();

        if (!$preference) {
            $defaults = NotificationPreference::getDefaultPreferences();
            $preference = NotificationPreference::create([
                'user_id' => Auth::id(),
                'notification_type' => $notificationType,
                'email_enabled' => $defaults['email_enabled'],
                'sms_enabled' => $defaults['sms_enabled'],
                'push_enabled' => $defaults['push_enabled'],
                'frequency' => $defaults['frequency'],
                'categories' => $defaults['categories'],
                'quiet_hours_start' => $request->quiet_hours_start,
                'quiet_hours_end' => $request->quiet_hours_end,
            ]);
        } else {
            $preference->update([
                'quiet_hours_start' => $request->quiet_hours_start,
                'quiet_hours_end' => $request->quiet_hours_end,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Quiet hours updated successfully.',
        ]);
    }

    public function addCategory(Request $request, $notificationType)
    {
        $request->validate([
            'category' => 'required|string|max:255',
        ]);

        $preference = NotificationPreference::where('user_id', Auth::id())
            ->where('notification_type', $notificationType)
            ->first();

        if (!$preference) {
            $defaults = NotificationPreference::getDefaultPreferences();
            $preference = NotificationPreference::create([
                'user_id' => Auth::id(),
                'notification_type' => $notificationType,
                'email_enabled' => $defaults['email_enabled'],
                'sms_enabled' => $defaults['sms_enabled'],
                'push_enabled' => $defaults['push_enabled'],
                'frequency' => $defaults['frequency'],
                'categories' => $defaults['categories'],
            ]);
        }

        $preference->addCategory($request->category);

        return response()->json([
            'success' => true,
            'message' => 'Category added successfully.',
        ]);
    }

    public function removeCategory(Request $request, $notificationType)
    {
        $request->validate([
            'category' => 'required|string|max:255',
        ]);

        $preference = NotificationPreference::where('user_id', Auth::id())
            ->where('notification_type', $notificationType)
            ->first();

        if ($preference) {
            $preference->removeCategory($request->category);
        }

        return response()->json([
            'success' => true,
            'message' => 'Category removed successfully.',
        ]);
    }

    public function resetToDefaults($notificationType)
    {
        $preference = NotificationPreference::where('user_id', Auth::id())
            ->where('notification_type', $notificationType)
            ->first();

        if ($preference) {
            $defaults = NotificationPreference::getDefaultPreferences();
            $preference->update([
                'email_enabled' => $defaults['email_enabled'],
                'sms_enabled' => $defaults['sms_enabled'],
                'push_enabled' => $defaults['push_enabled'],
                'frequency' => $defaults['frequency'],
                'categories' => $defaults['categories'],
                'quiet_hours_start' => null,
                'quiet_hours_end' => null,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Preferences reset to defaults successfully.',
        ]);
    }

    public function getPreferences()
    {
        $preferences = NotificationPreference::where('user_id', Auth::id())
            ->get()
            ->keyBy('notification_type');

        return response()->json($preferences);
    }

    public function getPreference($notificationType)
    {
        $preference = NotificationPreference::where('user_id', Auth::id())
            ->where('notification_type', $notificationType)
            ->first();

        if (!$preference) {
            $defaults = NotificationPreference::getDefaultPreferences();
            $preference = NotificationPreference::create([
                'user_id' => Auth::id(),
                'notification_type' => $notificationType,
                'email_enabled' => $defaults['email_enabled'],
                'sms_enabled' => $defaults['sms_enabled'],
                'push_enabled' => $defaults['push_enabled'],
                'frequency' => $defaults['frequency'],
                'categories' => $defaults['categories'],
            ]);
        }

        return response()->json($preference);
    }
}



