import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Switch } from '@/components/ui/switch';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
    Settings, 
    Save, 
    RotateCcw, 
    Download, 
    Upload, 
    History, 
    CheckCircle, 
    AlertCircle,
    Info,
    School,
    Calendar,
    Bell,
    Shield,
    Database,
    Plug,
    Flag
} from 'lucide-react';

interface Configuration {
    key: string;
    value: any;
    data_type: string;
    is_encrypted: boolean;
    is_public: boolean;
    description?: string;
}

interface School {
    id: number;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    logo?: string;
}

interface Props {
    school: School;
    configurations: Record<string, any>;
    currentGroup: string;
    configurationGroups: Record<string, string>;
    configurationKeys: Record<string, any>;
    dataTypes: Record<string, string>;
}

export default function ConfigurationIndex({ 
    school, 
    configurations, 
    currentGroup, 
    configurationGroups, 
    configurationKeys, 
    dataTypes 
}: Props) {
    const [activeGroup, setActiveGroup] = useState(currentGroup);
    const [formData, setFormData] = useState<Record<string, any>>(configurations);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleInputChange = (key: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await router.post('/system/configurations/update', {
                configurations: formData,
                group: activeGroup
            }, {
                onSuccess: () => {
                    setMessage({ type: 'success', text: 'Configuration updated successfully.' });
                },
                onError: (errors) => {
                    setMessage({ type: 'error', text: Object.values(errors)[0] as string });
                }
            });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update configuration.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = async () => {
        if (confirm('Are you sure you want to reset all configurations in this group to default values?')) {
            setIsLoading(true);
            try {
                await router.post('/system/configurations/reset', {
                    group: activeGroup,
                    confirm: true
                }, {
                    onSuccess: () => {
                        setMessage({ type: 'success', text: 'Configurations reset to default successfully.' });
                        // Reload the page to get updated configurations
                        router.reload();
                    },
                    onError: (errors) => {
                        setMessage({ type: 'error', text: Object.values(errors)[0] as string });
                    }
                });
            } catch (error) {
                setMessage({ type: 'error', text: 'Failed to reset configurations.' });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleExport = async () => {
        try {
            const response = await fetch(`/system/configurations/export?group=${activeGroup}&format=json`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `configurations_${activeGroup}_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to export configurations.' });
        }
    };

    const renderConfigurationField = (key: string, config: any) => {
        const fieldConfig = configurationKeys[activeGroup]?.[key];
        if (!fieldConfig) return null;

        const { type, label, description, options, required, min, max } = fieldConfig;

        switch (type) {
            case 'text':
                return (
                    <div key={key} className="space-y-2">
                        <Label htmlFor={key}>{label}</Label>
                        <Input
                            id={key}
                            value={formData[key] || ''}
                            onChange={(e) => handleInputChange(key, e.target.value)}
                            placeholder={description}
                            required={required}
                        />
                        {description && (
                            <p className="text-sm text-muted-foreground">{description}</p>
                        )}
                    </div>
                );

            case 'textarea':
                return (
                    <div key={key} className="space-y-2">
                        <Label htmlFor={key}>{label}</Label>
                        <Textarea
                            id={key}
                            value={formData[key] || ''}
                            onChange={(e) => handleInputChange(key, e.target.value)}
                            placeholder={description}
                            rows={3}
                        />
                        {description && (
                            <p className="text-sm text-muted-foreground">{description}</p>
                        )}
                    </div>
                );

            case 'select':
                return (
                    <div key={key} className="space-y-2">
                        <Label htmlFor={key}>{label}</Label>
                        <Select
                            value={formData[key] || ''}
                            onValueChange={(value) => handleInputChange(key, value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={description} />
                            </SelectTrigger>
                            <SelectContent>
                                {options?.map((option: any) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {description && (
                            <p className="text-sm text-muted-foreground">{description}</p>
                        )}
                    </div>
                );

            case 'number':
                return (
                    <div key={key} className="space-y-2">
                        <Label htmlFor={key}>{label}</Label>
                        <Input
                            id={key}
                            type="number"
                            value={formData[key] || ''}
                            onChange={(e) => handleInputChange(key, parseInt(e.target.value) || 0)}
                            placeholder={description}
                            min={min}
                            max={max}
                            required={required}
                        />
                        {description && (
                            <p className="text-sm text-muted-foreground">{description}</p>
                        )}
                    </div>
                );

            case 'boolean':
                return (
                    <div key={key} className="space-y-2">
                        <Label htmlFor={key}>{label}</Label>
                        <Select
                            value={formData[key] ? 'true' : 'false'}
                            onValueChange={(value) => handleInputChange(key, value === 'true')}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">Yes</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                        </Select>
                        {description && (
                            <p className="text-sm text-muted-foreground">{description}</p>
                        )}
                    </div>
                );

            case 'json':
                return (
                    <div key={key} className="space-y-2">
                        <Label htmlFor={key}>{label}</Label>
                        <Textarea
                            id={key}
                            value={typeof formData[key] === 'string' ? formData[key] : JSON.stringify(formData[key] || {}, null, 2)}
                            onChange={(e) => {
                                try {
                                    const parsed = JSON.parse(e.target.value);
                                    handleInputChange(key, parsed);
                                } catch {
                                    handleInputChange(key, e.target.value);
                                }
                            }}
                            placeholder={description}
                            rows={6}
                            className="font-mono text-sm"
                        />
                        {description && (
                            <p className="text-sm text-muted-foreground">{description}</p>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    const getGroupIcon = (group: string) => {
        const icons: Record<string, React.ReactNode> = {
            school_info: <School className="h-4 w-4" />,
            academic: <Calendar className="h-4 w-4" />,
            system: <Settings className="h-4 w-4" />,
            notifications: <Bell className="h-4 w-4" />,
            security: <Shield className="h-4 w-4" />,
            backup: <Database className="h-4 w-4" />,
            integrations: <Plug className="h-4 w-4" />,
            features: <Flag className="h-4 w-4" />,
        };
        return icons[group] || <Settings className="h-4 w-4" />;
    };

    return (
        <AppLayout title="System Configuration">
            <Head title="System Configuration" />

            <SettingsLayout
                title="School Administration"
                description="Manage your school settings and system configurations"
            >
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center space-x-4">
                            <Label htmlFor="group-select" className="font-semibold text-slate-700 shrink-0">Group:</Label>
                            <Select value={activeGroup} onValueChange={setActiveGroup}>
                                <SelectTrigger className="w-52">
                                    <SelectValue placeholder="Select group" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(configurationGroups).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>
                                            <div className="flex items-center space-x-2">
                                                {getGroupIcon(key)}
                                                <span>{label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExport}
                                disabled={isLoading}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleReset}
                                disabled={isLoading}
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reset
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={isLoading}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {isLoading ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </div>

                    {message && (
                        <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                            {message.type === 'error' ? (
                                <AlertCircle className="h-4 w-4 text-red-600" />
                            ) : (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                            <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
                                {message.text}
                            </AlertDescription>
                        </Alert>
                    )}

                    <Card className="border border-slate-200 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-bold flex items-center space-x-2 text-slate-800">
                                {getGroupIcon(activeGroup)}
                                <span>{configurationGroups[activeGroup]} Settings</span>
                            </CardTitle>
                            <CardDescription>
                                Configure {configurationGroups[activeGroup]?.toLowerCase()} settings for {school.name}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {configurationKeys[activeGroup] ? (
                                Object.entries(configurationKeys[activeGroup]).map(([key, config]) => 
                                    renderConfigurationField(key, config)
                                )
                            ) : (
                                <div className="text-center py-8">
                                    <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No configuration options available for this group.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
