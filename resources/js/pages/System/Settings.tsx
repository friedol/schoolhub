import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { Settings, Shield, Database, Bell, Globe, Lock } from 'lucide-react';

interface SystemSettingsProps {
    settings: {
        general: {
            site_name: string;
            site_description: string;
            timezone: string;
            language: string;
            maintenance_mode: boolean;
        };
        security: {
            password_min_length: number;
            password_require_special_chars: boolean;
            two_factor_required: boolean;
            session_timeout: number;
            max_login_attempts: number;
        };
        notifications: {
            email_notifications: boolean;
            sms_notifications: boolean;
            push_notifications: boolean;
            notification_frequency: string;
        };
        backup: {
            auto_backup_enabled: boolean;
            backup_frequency: string;
            backup_retention_days: number;
            backup_location: string;
        };
    };
}

export default function SystemSettings({ settings }: SystemSettingsProps) {
    const { data, setData, patch, processing, errors } = useForm({
        // General Settings
        site_name: settings.general.site_name || '',
        site_description: settings.general.site_description || '',
        timezone: settings.general.timezone || 'Africa/Dar_es_Salaam',
        language: settings.general.language || 'en',
        maintenance_mode: settings.general.maintenance_mode || false,
        
        // Security Settings
        password_min_length: settings.security.password_min_length || 8,
        password_require_special_chars: settings.security.password_require_special_chars || false,
        two_factor_required: settings.security.two_factor_required || false,
        session_timeout: settings.security.session_timeout || 120,
        max_login_attempts: settings.security.max_login_attempts || 5,
        
        // Notification Settings
        email_notifications: settings.notifications.email_notifications ?? true,
        sms_notifications: settings.notifications.sms_notifications || false,
        push_notifications: settings.notifications.push_notifications ?? true,
        notification_frequency: settings.notifications.notification_frequency || 'immediate',
        
        // Backup Settings
        auto_backup_enabled: settings.backup.auto_backup_enabled ?? true,
        backup_frequency: settings.backup.backup_frequency || 'daily',
        backup_retention_days: settings.backup.backup_retention_days || 30,
        backup_location: settings.backup.backup_location || 'local',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch('/system/settings');
    };

    return (
        <AppLayout
            title="System Settings"
            breadcrumbs={[
                { title: 'Dashboard', href: '/super-admin/dashboard' },
                { title: 'System Configuration', href: '/system/configurations' },
                { title: 'System Settings', href: '/system/settings' },
            ]}
        >
            <Head title="System Settings" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                    <p className="text-muted-foreground">
                        Configure global system settings and preferences.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Globe className="h-5 w-5" />
                                <span>General Settings</span>
                            </CardTitle>
                            <CardDescription>
                                Basic system configuration and preferences.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="site_name">Site Name</Label>
                                    <Input
                                        id="site_name"
                                        value={data.site_name}
                                        onChange={(e) => setData('site_name', e.target.value)}
                                        placeholder="Enter site name"
                                        className={errors.site_name ? 'border-red-500' : ''}
                                    />
                                    {errors.site_name && (
                                        <p className="text-sm text-red-500">{errors.site_name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="timezone">Timezone</Label>
                                    <Select
                                        value={data.timezone}
                                        onValueChange={(value) => setData('timezone', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select timezone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Africa/Dar_es_Salaam">Africa/Dar_es_Salaam</SelectItem>
                                            <SelectItem value="Africa/Nairobi">Africa/Nairobi</SelectItem>
                                            <SelectItem value="Africa/Kampala">Africa/Kampala</SelectItem>
                                            <SelectItem value="UTC">UTC</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="site_description">Site Description</Label>
                                <Textarea
                                    id="site_description"
                                    value={data.site_description}
                                    onChange={(e) => setData('site_description', e.target.value)}
                                    placeholder="Enter site description"
                                    rows={3}
                                    className={errors.site_description ? 'border-red-500' : ''}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="language">Default Language</Label>
                                    <Select
                                        value={data.language}
                                        onValueChange={(value) => setData('language', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select language" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="en">English</SelectItem>
                                            <SelectItem value="sw">Swahili</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="maintenance_mode"
                                        checked={data.maintenance_mode}
                                        onCheckedChange={(checked) => setData('maintenance_mode', checked)}
                                    />
                                    <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Shield className="h-5 w-5" />
                                <span>Security Settings</span>
                            </CardTitle>
                            <CardDescription>
                                Configure security policies and authentication settings.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password_min_length">Minimum Password Length</Label>
                                    <Input
                                        id="password_min_length"
                                        type="number"
                                        value={data.password_min_length}
                                        onChange={(e) => setData('password_min_length', parseInt(e.target.value))}
                                        min="6"
                                        max="20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
                                    <Input
                                        id="session_timeout"
                                        type="number"
                                        value={data.session_timeout}
                                        onChange={(e) => setData('session_timeout', parseInt(e.target.value))}
                                        min="30"
                                        max="480"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
                                    <Input
                                        id="max_login_attempts"
                                        type="number"
                                        value={data.max_login_attempts}
                                        onChange={(e) => setData('max_login_attempts', parseInt(e.target.value))}
                                        min="3"
                                        max="10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="password_require_special_chars"
                                        checked={data.password_require_special_chars}
                                        onCheckedChange={(checked) => setData('password_require_special_chars', checked)}
                                    />
                                    <Label htmlFor="password_require_special_chars">Require Special Characters in Passwords</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="two_factor_required"
                                        checked={data.two_factor_required}
                                        onCheckedChange={(checked) => setData('two_factor_required', checked)}
                                    />
                                    <Label htmlFor="two_factor_required">Require Two-Factor Authentication</Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notification Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Bell className="h-5 w-5" />
                                <span>Notification Settings</span>
                            </CardTitle>
                            <CardDescription>
                                Configure notification preferences and delivery methods.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="email_notifications"
                                        checked={data.email_notifications}
                                        onCheckedChange={(checked) => setData('email_notifications', checked)}
                                    />
                                    <Label htmlFor="email_notifications">Email Notifications</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="sms_notifications"
                                        checked={data.sms_notifications}
                                        onCheckedChange={(checked) => setData('sms_notifications', checked)}
                                    />
                                    <Label htmlFor="sms_notifications">SMS Notifications</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="push_notifications"
                                        checked={data.push_notifications}
                                        onCheckedChange={(checked) => setData('push_notifications', checked)}
                                    />
                                    <Label htmlFor="push_notifications">Push Notifications</Label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notification_frequency">Notification Frequency</Label>
                                <Select
                                    value={data.notification_frequency}
                                    onValueChange={(value) => setData('notification_frequency', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="immediate">Immediate</SelectItem>
                                        <SelectItem value="hourly">Hourly</SelectItem>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Backup Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Database className="h-5 w-5" />
                                <span>Backup Settings</span>
                            </CardTitle>
                            <CardDescription>
                                Configure automated backup and data retention policies.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="auto_backup_enabled"
                                    checked={data.auto_backup_enabled}
                                    onCheckedChange={(checked) => setData('auto_backup_enabled', checked)}
                                />
                                <Label htmlFor="auto_backup_enabled">Enable Automatic Backups</Label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="backup_frequency">Backup Frequency</Label>
                                    <Select
                                        value={data.backup_frequency}
                                        onValueChange={(value) => setData('backup_frequency', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select frequency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="hourly">Hourly</SelectItem>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="backup_retention_days">Retention Period (days)</Label>
                                    <Input
                                        id="backup_retention_days"
                                        type="number"
                                        value={data.backup_retention_days}
                                        onChange={(e) => setData('backup_retention_days', parseInt(e.target.value))}
                                        min="7"
                                        max="365"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="backup_location">Backup Location</Label>
                                <Select
                                    value={data.backup_location}
                                    onValueChange={(value) => setData('backup_location', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="local">Local Storage</SelectItem>
                                        <SelectItem value="cloud">Cloud Storage</SelectItem>
                                        <SelectItem value="external">External Drive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}



