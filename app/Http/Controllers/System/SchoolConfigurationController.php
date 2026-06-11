<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\SchoolConfiguration;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SchoolConfigurationController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('role:super_admin,school_admin,headteacher');
    }

    /**
     * Display school configuration
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $school = $user->school;

        $group = $request->get('group', 'school_info');
        $configurations = SchoolConfiguration::getConfigurationByGroup($school->id, $group);

        return Inertia::render('System/Configuration/Index', [
            'school' => $school,
            'configurations' => $configurations,
            'currentGroup' => $group,
            'configurationGroups' => [
                'school_info' => 'School Information',
                'academic' => 'Academic Settings',
                'system' => 'System Preferences',
                'notifications' => 'Notification Settings',
                'security' => 'Security Settings',
                'backup' => 'Backup Settings',
                'integrations' => 'Integrations',
                'features' => 'Feature Flags',
            ],
            'configurationKeys' => SchoolConfiguration::CONFIGURATION_KEYS,
            'dataTypes' => SchoolConfiguration::DATA_TYPES,
        ]);
    }

    /**
     * Update school configuration
     */
    public function update(Request $request)
    {
        $user = Auth::user();
        $school = $user->school;

        $request->validate([
            'configurations' => 'required|array',
            'group' => 'required|string',
        ]);

        try {
            DB::beginTransaction();

            foreach ($request->configurations as $key => $value) {
                SchoolConfiguration::set($key, $value, $school->id, 'string', false, false, $user->id);
            }

            DB::commit();

            return back()->with('success', 'Configuration updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update configuration: ' . $e->getMessage()]);
        }
    }

    /**
     * Update a single configuration value
     */
    public function updateSingle(Request $request)
    {
        $user = Auth::user();
        $school = $user->school;

        $request->validate([
            'key' => 'required|string',
            'value' => 'required',
            'data_type' => 'nullable|string|in:' . implode(',', array_keys(SchoolConfiguration::DATA_TYPES)),
            'is_encrypted' => 'boolean',
            'is_public' => 'boolean',
        ]);

        try {
            SchoolConfiguration::set(
                $request->key,
                $request->value,
                $school->id,
                $request->data_type ?? 'string',
                $request->is_encrypted ?? false,
                $request->is_public ?? false,
                $user->id
            );

            return response()->json([
                'success' => true,
                'message' => 'Configuration updated successfully.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update configuration: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get configuration by key
     */
    public function get(Request $request)
    {
        $user = Auth::user();
        $school = $user->school;

        $request->validate([
            'key' => 'required|string',
            'default' => 'nullable',
        ]);

        $value = SchoolConfiguration::get($request->key, $school->id, $request->default);

        return response()->json([
            'key' => $request->key,
            'value' => $value,
        ]);
    }

    /**
     * Get all configurations for a group
     */
    public function getGroup(Request $request)
    {
        $user = Auth::user();
        $school = $user->school;

        $request->validate([
            'group' => 'required|string',
        ]);

        $configurations = SchoolConfiguration::getConfigurationByGroup($school->id, $request->group);

        return response()->json($configurations);
    }

    /**
     * Get public configurations
     */
    public function getPublic()
    {
        $user = Auth::user();
        $school = $user->school;

        $configurations = SchoolConfiguration::getPublicConfigurations($school->id);

        return response()->json($configurations);
    }

    /**
     * Initialize default configurations
     */
    public function initialize()
    {
        $user = Auth::user();
        $school = $user->school;

        try {
            SchoolConfiguration::initializeSchoolConfigurations($school->id);

            return back()->with('success', 'Default configurations initialized successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to initialize configurations: ' . $e->getMessage()]);
        }
    }

    /**
     * Reset configurations to default
     */
    public function reset(Request $request)
    {
        $user = Auth::user();
        $school = $user->school;

        $request->validate([
            'group' => 'required|string',
            'confirm' => 'required|boolean|accepted',
        ]);

        if (!$request->confirm) {
            return back()->withErrors(['error' => 'Please confirm the reset operation.']);
        }

        try {
            DB::beginTransaction();

            // Delete existing configurations for the group
            $groupKeys = $this->getGroupKeys($request->group);
            SchoolConfiguration::where('school_id', $school->id)
                ->whereIn('configuration_key', $groupKeys)
                ->delete();

            // Re-initialize default configurations
            SchoolConfiguration::initializeSchoolConfigurations($school->id);

            DB::commit();

            return back()->with('success', 'Configurations reset to default successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to reset configurations: ' . $e->getMessage()]);
        }
    }

    /**
     * Export configurations
     */
    public function export(Request $request)
    {
        $user = Auth::user();
        $school = $user->school;

        $request->validate([
            'group' => 'nullable|string',
            'format' => 'nullable|string|in:json,csv',
        ]);

        try {
            if ($request->group) {
                $configurations = SchoolConfiguration::getConfigurationByGroup($school->id, $request->group);
            } else {
                $configurations = SchoolConfiguration::getSchoolConfigurations($school->id);
            }

            $format = $request->format ?? 'json';

            if ($format === 'csv') {
                $filename = 'school_configurations_' . ($request->group ?? 'all') . '_' . now()->format('Y-m-d') . '.csv';
                
                $headers = [
                    'Content-Type' => 'text/csv',
                    'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                ];

                $callback = function () use ($configurations) {
                    $file = fopen('php://output', 'w');
                    fputcsv($file, ['Key', 'Value', 'Data Type', 'Is Encrypted', 'Is Public']);
                    
                    foreach ($configurations as $key => $value) {
                        fputcsv($file, [$key, $value, 'string', 'false', 'false']);
                    }
                    
                    fclose($file);
                };

                return response()->stream($callback, 200, $headers);
            } else {
                return response()->json([
                    'school_id' => $school->id,
                    'school_name' => $school->name,
                    'exported_at' => now()->toISOString(),
                    'group' => $request->group ?? 'all',
                    'configurations' => $configurations,
                ]);
            }
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to export configurations: ' . $e->getMessage()]);
        }
    }

    /**
     * Import configurations
     */
    public function import(Request $request)
    {
        $user = Auth::user();
        $school = $user->school;

        $request->validate([
            'file' => 'required|file|mimes:json,csv|max:2048',
            'overwrite' => 'boolean',
        ]);

        try {
            $file = $request->file('file');
            $extension = $file->getClientOriginalExtension();
            $overwrite = $request->overwrite ?? false;

            DB::beginTransaction();

            if ($extension === 'json') {
                $data = json_decode(file_get_contents($file->getPathname()), true);
                
                if (!isset($data['configurations'])) {
                    throw new \Exception('Invalid JSON format. Missing configurations key.');
                }

                $configurations = $data['configurations'];
            } else {
                // CSV format
                $configurations = [];
                $csv = array_map('str_getcsv', file($file->getPathname()));
                $headers = array_shift($csv);

                foreach ($csv as $row) {
                    $configurations[$row[0]] = $row[1];
                }
            }

            $importedCount = 0;
            $skippedCount = 0;

            foreach ($configurations as $key => $value) {
                $existing = SchoolConfiguration::where('school_id', $school->id)
                    ->where('configuration_key', $key)
                    ->first();

                if ($existing && !$overwrite) {
                    $skippedCount++;
                    continue;
                }

                SchoolConfiguration::set($key, $value, $school->id, 'string', false, false, $user->id);
                $importedCount++;
            }

            DB::commit();

            return back()->with('success', "Configurations imported successfully. {$importedCount} imported, {$skippedCount} skipped.");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to import configurations: ' . $e->getMessage()]);
        }
    }

    /**
     * Get configuration history
     */
    public function history(Request $request)
    {
        $user = Auth::user();
        $school = $user->school;

        $request->validate([
            'key' => 'nullable|string',
            'days' => 'nullable|integer|min:1|max:365',
        ]);

        $query = SchoolConfiguration::where('school_id', $school->id)
            ->with('updatedBy:id,name');

        if ($request->key) {
            $query->where('configuration_key', $request->key);
        }

        $days = $request->days ?? 30;
        $query->where('updated_at', '>=', now()->subDays($days));

        $history = $query->orderByDesc('updated_at')
            ->paginate(20);

        return Inertia::render('System/Configuration/History', [
            'history' => $history,
            'filters' => $request->only(['key', 'days']),
            'configurationKeys' => SchoolConfiguration::CONFIGURATION_KEYS,
        ]);
    }

    /**
     * Validate configuration values
     */
    public function validateConfigurations(Request $request)
    {
        $request->validate([
            'configurations' => 'required|array',
        ]);

        $errors = [];
        $validations = [
            'school_name' => 'required|string|max:255',
            'school_email' => 'required|email|max:255',
            'school_phone' => 'required|string|max:20',
            'default_language' => 'required|string|in:en,sw',
            'currency' => 'required|string|in:TZS,USD,EUR',
            'timezone' => 'required|string|max:50',
            'session_timeout' => 'required|integer|min:5|max:480',
            'max_login_attempts' => 'required|integer|min:3|max:10',
            'backup_retention' => 'required|integer|min:7|max:365',
        ];

        foreach ($request->configurations as $key => $value) {
            if (isset($validations[$key])) {
                $validator = validator([$key => $value], [$key => $validations[$key]]);
                
                if ($validator->fails()) {
                    $errors[$key] = $validator->errors()->first($key);
                }
            }
        }

        return response()->json([
            'valid' => empty($errors),
            'errors' => $errors,
        ]);
    }

    /**
     * Get group keys for a configuration group
     */
    private function getGroupKeys(string $group): array
    {
        $groupKeys = [
            'school_info' => ['school_name', 'school_address', 'school_phone', 'school_email', 'school_website', 'school_logo', 'school_motto', 'school_vision', 'school_mission'],
            'academic' => ['academic_year', 'current_term', 'term_dates', 'class_levels', 'streams', 'subject_combinations', 'grading_system', 'assessment_weights'],
            'system' => ['default_language', 'date_format', 'time_format', 'currency', 'timezone', 'number_format'],
            'notifications' => ['email_notifications', 'sms_notifications', 'push_notifications', 'notification_templates', 'auto_notifications'],
            'security' => ['password_policy', 'session_timeout', 'max_login_attempts', 'two_factor_auth', 'ip_whitelist'],
            'backup' => ['backup_frequency', 'backup_retention', 'backup_location', 'auto_backup'],
            'integrations' => ['sms_provider', 'email_provider', 'payment_gateway', 'necta_integration'],
            'features' => ['enable_library', 'enable_transport', 'enable_hostel', 'enable_inventory', 'enable_hr', 'enable_finance'],
        ];

        return $groupKeys[$group] ?? [];
    }
}
