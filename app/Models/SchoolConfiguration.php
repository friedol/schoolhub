<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SchoolConfiguration extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'configuration_key',
        'configuration_value',
        'data_type',
        'description',
        'is_encrypted',
        'is_public',
        'updated_by',
    ];

    protected $casts = [
        'is_encrypted' => 'boolean',
        'is_public' => 'boolean',
    ];

    const CONFIGURATION_KEYS = [
        // School Information
        'school_name' => 'School Name',
        'school_address' => 'School Address',
        'school_phone' => 'School Phone',
        'school_email' => 'School Email',
        'school_website' => 'School Website',
        'school_logo' => 'School Logo',
        'school_motto' => 'School Motto',
        'school_vision' => 'School Vision',
        'school_mission' => 'School Mission',
        
        // Academic Configuration
        'academic_year' => 'Academic Year',
        'current_term' => 'Current Term',
        'term_dates' => 'Term Dates',
        'class_levels' => 'Class Levels',
        'streams' => 'Streams',
        'subject_combinations' => 'Subject Combinations',
        'grading_system' => 'Grading System',
        'assessment_weights' => 'Assessment Weights',
        
        // System Preferences
        'default_language' => 'Default Language',
        'date_format' => 'Date Format',
        'time_format' => 'Time Format',
        'currency' => 'Currency',
        'timezone' => 'Timezone',
        'number_format' => 'Number Format',
        
        // Notification Settings
        'email_notifications' => 'Email Notifications',
        'sms_notifications' => 'SMS Notifications',
        'push_notifications' => 'Push Notifications',
        'notification_templates' => 'Notification Templates',
        'auto_notifications' => 'Auto Notifications',
        
        // Security Settings
        'password_policy' => 'Password Policy',
        'session_timeout' => 'Session Timeout',
        'max_login_attempts' => 'Max Login Attempts',
        'two_factor_auth' => 'Two Factor Authentication',
        'ip_whitelist' => 'IP Whitelist',
        
        // Backup Settings
        'backup_frequency' => 'Backup Frequency',
        'backup_retention' => 'Backup Retention',
        'backup_location' => 'Backup Location',
        'auto_backup' => 'Auto Backup',
        
        // Integration Settings
        'sms_provider' => 'SMS Provider',
        'email_provider' => 'Email Provider',
        'payment_gateway' => 'Payment Gateway',
        'necta_integration' => 'NECTA Integration',
        
        // Feature Flags
        'enable_library' => 'Enable Library',
        'enable_transport' => 'Enable Transport',
        'enable_hostel' => 'Enable Hostel',
        'enable_inventory' => 'Enable Inventory',
        'enable_hr' => 'Enable HR',
        'enable_finance' => 'Enable Finance',
    ];

    const DATA_TYPES = [
        'string' => 'String',
        'integer' => 'Integer',
        'boolean' => 'Boolean',
        'array' => 'Array',
        'json' => 'JSON',
        'date' => 'Date',
        'datetime' => 'DateTime',
        'file' => 'File',
    ];

    // Relationships
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Scopes
    public function scopeForSchool($query, $schoolId)
    {
        return $query->where('school_id', $schoolId);
    }

    public function scopeByKey($query, $key)
    {
        return $query->where('configuration_key', $key);
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopePrivate($query)
    {
        return $query->where('is_public', false);
    }

    public function scopeEncrypted($query)
    {
        return $query->where('is_encrypted', true);
    }

    public function scopeByDataType($query, $dataType)
    {
        return $query->where('data_type', $dataType);
    }

    // Accessors
    public function getConfigurationValueAttribute($value)
    {
        if ($this->is_encrypted) {
            return decrypt($value);
        }

        return $this->castValue($value);
    }

    public function setConfigurationValueAttribute($value)
    {
        if ($this->is_encrypted) {
            $this->attributes['configuration_value'] = encrypt($value);
        } else {
            $this->attributes['configuration_value'] = $this->serializeValue($value);
        }
    }

    public function getDisplayNameAttribute(): string
    {
        return self::CONFIGURATION_KEYS[$this->configuration_key] ?? $this->configuration_key;
    }

    public function getDataTypeDisplayAttribute(): string
    {
        return self::DATA_TYPES[$this->data_type] ?? $this->data_type;
    }

    // Methods
    private function castValue($value)
    {
        switch ($this->data_type) {
            case 'integer':
                return (int) $value;
            case 'boolean':
                return (bool) $value;
            case 'array':
            case 'json':
                return json_decode($value, true);
            case 'date':
                return \Carbon\Carbon::parse($value)->toDateString();
            case 'datetime':
                return \Carbon\Carbon::parse($value);
            default:
                return $value;
        }
    }

    private function serializeValue($value)
    {
        switch ($this->data_type) {
            case 'array':
            case 'json':
                return json_encode($value);
            case 'date':
            case 'datetime':
                return $value instanceof \Carbon\Carbon ? $value->toISOString() : $value;
            default:
                return (string) $value;
        }
    }

    public function getValue()
    {
        return $this->configuration_value;
    }

    public function setValue($value): void
    {
        $this->update(['configuration_value' => $value]);
    }

    public function getArrayValue(): array
    {
        if ($this->data_type === 'array' || $this->data_type === 'json') {
            return $this->configuration_value;
        }
        
        return [];
    }

    public function setArrayValue(array $value): void
    {
        $this->update([
            'configuration_value' => $value,
            'data_type' => 'array',
        ]);
    }

    public function getBooleanValue(): bool
    {
        if ($this->data_type === 'boolean') {
            return $this->configuration_value;
        }
        
        return (bool) $this->configuration_value;
    }

    public function setBooleanValue(bool $value): void
    {
        $this->update([
            'configuration_value' => $value,
            'data_type' => 'boolean',
        ]);
    }

    public function getIntegerValue(): int
    {
        if ($this->data_type === 'integer') {
            return $this->configuration_value;
        }
        
        return (int) $this->configuration_value;
    }

    public function setIntegerValue(int $value): void
    {
        $this->update([
            'configuration_value' => $value,
            'data_type' => 'integer',
        ]);
    }

    public static function get(string $key, $schoolId, $default = null)
    {
        $config = self::where('school_id', $schoolId)
            ->where('configuration_key', $key)
            ->first();
            
        return $config ? $config->configuration_value : $default;
    }

    public static function set(string $key, $value, $schoolId, string $dataType = 'string', bool $isEncrypted = false, bool $isPublic = false, ?int $updatedBy = null): self
    {
        $config = self::firstOrNew([
            'school_id' => $schoolId,
            'configuration_key' => $key,
        ]);

        $config->data_type = $dataType;
        $config->is_encrypted = $isEncrypted;
        $config->is_public = $isPublic;
        $config->updated_by = $updatedBy;
        $config->description = self::CONFIGURATION_KEYS[$key] ?? null;
        $config->configuration_value = $value; // Set value last so mutator has access to updated data_type

        $config->save();

        return $config;
    }

    public static function getSchoolConfigurations(int $schoolId): array
    {
        return self::where('school_id', $schoolId)
            ->get()
            ->keyBy('configuration_key')
            ->map(function ($config) {
                return $config->configuration_value;
            })
            ->toArray();
    }

    public static function setSchoolConfigurations(int $schoolId, array $configurations, ?int $updatedBy = null): void
    {
        foreach ($configurations as $key => $value) {
            self::set($key, $value, $schoolId, 'string', false, false, $updatedBy);
        }
    }

    public static function getPublicConfigurations(int $schoolId): array
    {
        return self::where('school_id', $schoolId)
            ->where('is_public', true)
            ->get()
            ->keyBy('configuration_key')
            ->map(function ($config) {
                return $config->configuration_value;
            })
            ->toArray();
    }

    public static function initializeSchoolConfigurations(int $schoolId): void
    {
        $defaultConfigurations = [
            'school_name' => 'New School',
            'default_language' => 'en',
            'date_format' => 'Y-m-d',
            'time_format' => 'H:i:s',
            'currency' => 'TZS',
            'timezone' => 'Africa/Dar_es_Salaam',
            'academic_year' => date('Y'),
            'current_term' => 1,
            'grading_system' => 'percentage',
            'email_notifications' => true,
            'sms_notifications' => true,
            'push_notifications' => true,
            'session_timeout' => 120,
            'max_login_attempts' => 5,
            'two_factor_auth' => false,
            'backup_frequency' => 'daily',
            'backup_retention' => 30,
            'auto_backup' => true,
            'enable_library' => true,
            'enable_transport' => true,
            'enable_hostel' => true,
            'enable_inventory' => true,
            'enable_hr' => true,
            'enable_finance' => true,
        ];

        foreach ($defaultConfigurations as $key => $value) {
            self::set($key, $value, $schoolId);
        }
    }

    public static function getConfigurationByGroup(int $schoolId, string $group): array
    {
        $groupKeys = [];
        
        switch ($group) {
            case 'school_info':
                $groupKeys = ['school_name', 'school_address', 'school_phone', 'school_email', 'school_website', 'school_logo', 'school_motto', 'school_vision', 'school_mission'];
                break;
            case 'academic':
                $groupKeys = ['academic_year', 'current_term', 'term_dates', 'class_levels', 'streams', 'subject_combinations', 'grading_system', 'assessment_weights'];
                break;
            case 'system':
                $groupKeys = ['default_language', 'date_format', 'time_format', 'currency', 'timezone', 'number_format'];
                break;
            case 'notifications':
                $groupKeys = ['email_notifications', 'sms_notifications', 'push_notifications', 'notification_templates', 'auto_notifications'];
                break;
            case 'security':
                $groupKeys = ['password_policy', 'session_timeout', 'max_login_attempts', 'two_factor_auth', 'ip_whitelist'];
                break;
            case 'backup':
                $groupKeys = ['backup_frequency', 'backup_retention', 'backup_location', 'auto_backup'];
                break;
            case 'integrations':
                $groupKeys = ['sms_provider', 'email_provider', 'payment_gateway', 'necta_integration'];
                break;
            case 'features':
                $groupKeys = ['enable_library', 'enable_transport', 'enable_hostel', 'enable_inventory', 'enable_hr', 'enable_finance'];
                break;
        }

        return self::where('school_id', $schoolId)
            ->whereIn('configuration_key', $groupKeys)
            ->get()
            ->keyBy('configuration_key')
            ->map(function ($config) {
                return $config->configuration_value;
            })
            ->toArray();
    }
}



