import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Platform } from '@/types';

interface SuperAdminSettingsProps {
    platform: Platform;
}

export default function SuperAdminSettings({ platform }: SuperAdminSettingsProps) {
    const { data, setData, patch, processing, errors } = useForm({
        name: platform.name || '',
        description: platform.description || '',
        contact_email: platform.contact_email || '',
        contact_phone: platform.contact_phone || '',
        address: platform.address || '',
        region: platform.region || '',
        district: platform.district || '',
        subscription_plan: platform.subscription_plan || 'basic',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch('/super-admin/settings');
    };

    return (
        <AppLayout
            title="Platform Settings"
            breadcrumbs={[
                { title: 'Dashboard', href: '/super-admin/dashboard' },
                { title: 'Settings', href: '/super-admin/settings' },
            ]}
        >
            <Head title="Platform Settings" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your platform configuration and preferences.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Platform Information</CardTitle>
                            <CardDescription>
                                Basic information about your platform.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Platform Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter platform name"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="subscription_plan">Subscription Plan</Label>
                                    <Select
                                        value={data.subscription_plan}
                                        onValueChange={(value) => setData('subscription_plan', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select subscription plan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="basic">Basic</SelectItem>
                                            <SelectItem value="premium">Premium</SelectItem>
                                            <SelectItem value="enterprise">Enterprise</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.subscription_plan && (
                                        <p className="text-sm text-red-500">{errors.subscription_plan}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Enter platform description"
                                    rows={3}
                                    className={errors.description ? 'border-red-500' : ''}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">{errors.description}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                            <CardDescription>
                                Contact details for your platform.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contact_email">Contact Email</Label>
                                    <Input
                                        id="contact_email"
                                        type="email"
                                        value={data.contact_email}
                                        onChange={(e) => setData('contact_email', e.target.value)}
                                        placeholder="Enter contact email"
                                        className={errors.contact_email ? 'border-red-500' : ''}
                                    />
                                    {errors.contact_email && (
                                        <p className="text-sm text-red-500">{errors.contact_email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contact_phone">Contact Phone</Label>
                                    <Input
                                        id="contact_phone"
                                        value={data.contact_phone}
                                        onChange={(e) => setData('contact_phone', e.target.value)}
                                        placeholder="Enter contact phone"
                                        className={errors.contact_phone ? 'border-red-500' : ''}
                                    />
                                    {errors.contact_phone && (
                                        <p className="text-sm text-red-500">{errors.contact_phone}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Location Information</CardTitle>
                            <CardDescription>
                                Physical location details for your platform.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Enter full address"
                                    rows={2}
                                    className={errors.address ? 'border-red-500' : ''}
                                />
                                {errors.address && (
                                    <p className="text-sm text-red-500">{errors.address}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="region">Region</Label>
                                    <Input
                                        id="region"
                                        value={data.region}
                                        onChange={(e) => setData('region', e.target.value)}
                                        placeholder="Enter region"
                                        className={errors.region ? 'border-red-500' : ''}
                                    />
                                    {errors.region && (
                                        <p className="text-sm text-red-500">{errors.region}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="district">District</Label>
                                    <Input
                                        id="district"
                                        value={data.district}
                                        onChange={(e) => setData('district', e.target.value)}
                                        placeholder="Enter district"
                                        className={errors.district ? 'border-red-500' : ''}
                                    />
                                    {errors.district && (
                                        <p className="text-sm text-red-500">{errors.district}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}



