import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Clock,
  Settings,
  Save,
  RotateCcw
} from 'lucide-react';

interface NotificationPreference {
  id: number;
  notification_type: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  frequency: string;
  quiet_hours_start: string;
  quiet_hours_end: string;
  categories: string[];
}

interface Props {
  preferences: NotificationPreference[];
  notificationTypeOptions: Record<string, string>;
  frequencyOptions: Record<string, string>;
}

export default function NotificationPreferencesIndex({ 
  preferences, 
  notificationTypeOptions, 
  frequencyOptions 
}: Props) {
  const { data, setData, put, processing, errors } = useForm({
    preferences: preferences.map(pref => ({
      notification_type: pref.notification_type,
      email_enabled: pref.email_enabled,
      sms_enabled: pref.sms_enabled,
      push_enabled: pref.push_enabled,
      frequency: pref.frequency,
      quiet_hours_start: pref.quiet_hours_start || '',
      quiet_hours_end: pref.quiet_hours_end || '',
      categories: pref.categories || [],
    }))
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put('/communication/notification-preferences');
  };

  const updatePreference = (index: number, field: string, value: any) => {
    const newPreferences = [...data.preferences];
    newPreferences[index] = {
      ...newPreferences[index],
      [field]: value
    };
    setData('preferences', newPreferences);
  };

  const resetToDefaults = () => {
    // Reset all preferences to default values
    const defaultPreferences = data.preferences.map(pref => ({
      ...pref,
      email_enabled: true,
      sms_enabled: true,
      push_enabled: true,
      frequency: 'immediate',
      quiet_hours_start: '',
      quiet_hours_end: '',
      categories: [],
    }));
    setData('preferences', defaultPreferences);
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'push':
        return <Smartphone className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getChannelColor = (channel: string, enabled: boolean) => {
    if (!enabled) return 'text-gray-400';
    
    switch (channel) {
      case 'email':
        return 'text-blue-600';
      case 'sms':
        return 'text-green-600';
      case 'push':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <AuthenticatedLayout>
      <Head title="Notification Preferences" />

      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notification Preferences</h1>
                <p className="mt-2 text-gray-600">
                  Customize how and when you receive notifications
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={resetToDefaults}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset to Defaults
                </Button>
                <Button onClick={handleSubmit} disabled={processing}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {data.preferences.map((preference, index) => (
              <Card key={preference.notification_type}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="mr-2 h-5 w-5" />
                    {notificationTypeOptions[preference.notification_type]}
                  </CardTitle>
                  <CardDescription>
                    Configure notification settings for {notificationTypeOptions[preference.notification_type].toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Notification Channels */}
                  <div>
                    <Label className="text-base font-medium">Notification Channels</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Choose how you want to receive notifications
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={getChannelColor('email', preference.email_enabled)}>
                            {getChannelIcon('email')}
                          </div>
                          <div>
                            <p className="font-medium">Email</p>
                            <p className="text-sm text-muted-foreground">Receive via email</p>
                          </div>
                        </div>
                        <Switch
                          checked={preference.email_enabled}
                          onCheckedChange={(checked) => updatePreference(index, 'email_enabled', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={getChannelColor('sms', preference.sms_enabled)}>
                            {getChannelIcon('sms')}
                          </div>
                          <div>
                            <p className="font-medium">SMS</p>
                            <p className="text-sm text-muted-foreground">Receive via text message</p>
                          </div>
                        </div>
                        <Switch
                          checked={preference.sms_enabled}
                          onCheckedChange={(checked) => updatePreference(index, 'sms_enabled', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={getChannelColor('push', preference.push_enabled)}>
                            {getChannelIcon('push')}
                          </div>
                          <div>
                            <p className="font-medium">Push</p>
                            <p className="text-sm text-muted-foreground">Receive push notifications</p>
                          </div>
                        </div>
                        <Switch
                          checked={preference.push_enabled}
                          onCheckedChange={(checked) => updatePreference(index, 'push_enabled', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Frequency */}
                  <div>
                    <Label htmlFor={`frequency-${index}`} className="text-base font-medium">
                      Notification Frequency
                    </Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      How often you want to receive notifications
                    </p>
                    <Select
                      value={preference.frequency}
                      onValueChange={(value) => updatePreference(index, 'frequency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(frequencyOptions).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quiet Hours */}
                  <div>
                    <Label className="text-base font-medium">Quiet Hours</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Set times when you don't want to receive notifications
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`quiet-start-${index}`}>Start Time</Label>
                        <Input
                          id={`quiet-start-${index}`}
                          type="time"
                          value={preference.quiet_hours_start}
                          onChange={(e) => updatePreference(index, 'quiet_hours_start', e.target.value)}
                          placeholder="HH:MM"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`quiet-end-${index}`}>End Time</Label>
                        <Input
                          id={`quiet-end-${index}`}
                          type="time"
                          value={preference.quiet_hours_end}
                          onChange={(e) => updatePreference(index, 'quiet_hours_end', e.target.value)}
                          placeholder="HH:MM"
                        />
                      </div>
                    </div>
                    {(preference.quiet_hours_start || preference.quiet_hours_end) && (
                      <div className="mt-2 flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        Quiet hours: {preference.quiet_hours_start || '00:00'} - {preference.quiet_hours_end || '23:59'}
                      </div>
                    )}
                  </div>

                  {/* Status Summary */}
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Current Settings:</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {preference.email_enabled && (
                        <Badge variant="outline" className="text-blue-600">
                          <Mail className="mr-1 h-3 w-3" />
                          Email
                        </Badge>
                      )}
                      {preference.sms_enabled && (
                        <Badge variant="outline" className="text-green-600">
                          <MessageSquare className="mr-1 h-3 w-3" />
                          SMS
                        </Badge>
                      )}
                      {preference.push_enabled && (
                        <Badge variant="outline" className="text-purple-600">
                          <Smartphone className="mr-1 h-3 w-3" />
                          Push
                        </Badge>
                      )}
                      <Badge variant="secondary">
                        {frequencyOptions[preference.frequency]}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {errors.preferences && (
              <div className="text-red-600 text-sm">
                {errors.preferences}
              </div>
            )}
          </form>
        
      </div>
    </AuthenticatedLayout>
  );
}



