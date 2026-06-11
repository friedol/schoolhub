import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { School } from '@/types';

interface SchoolAdminSettingsProps {
    school: School;
}

export default function SchoolAdminSettings({ school }: SchoolAdminSettingsProps) {
    const { data, setData, patch, processing, errors } = useForm({
        name: school.name || '',
        description: school.description || '',
        motto: school.motto || '',
        contact_email: school.contact_email || '',
        contact_phone: school.contact_phone || '',
        address: school.address || '',
        region: school.region || '',
        district: school.district || '',
        ward: school.ward || '',
        registration_number: school.registration_number || '',
        necta_number: school.necta_number || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch('/school-admin/settings');
    };

    return (
        <AppLayout
            title="School Settings"
            breadcrumbs={[
                { title: 'Dashboard', href: '/school-admin/dashboard' },
                { title: 'Settings', href: '/school-admin/settings' },
            ]}
        >
            <Head title="School Settings" />

            <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">School Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your school configuration and preferences.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-6">
                    {/* First Row: School Information & Contact Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>School Information</CardTitle>
                                <CardDescription>
                                    Basic information about your school.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">School Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter school name"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="motto">School Motto</Label>
                                    <Input
                                        id="motto"
                                        value={data.motto}
                                        onChange={(e) => setData('motto', e.target.value)}
                                        placeholder="Enter school motto"
                                        className={errors.motto ? 'border-red-500' : ''}
                                    />
                                    {errors.motto && (
                                        <p className="text-sm text-red-500">{errors.motto}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Enter school description"
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
                                    Contact details for your school.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
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
                            </CardContent>
                        </Card>
                    </div>

                    {/* Second Row: Location Information & Registration Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Location Information</CardTitle>
                                <CardDescription>
                                    Physical location details for your school.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
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

                                <div className="space-y-2">
                                    <Label htmlFor="ward">Ward</Label>
                                    <Input
                                        id="ward"
                                        value={data.ward}
                                        onChange={(e) => setData('ward', e.target.value)}
                                        placeholder="Enter ward"
                                        className={errors.ward ? 'border-red-500' : ''}
                                    />
                                    {errors.ward && (
                                        <p className="text-sm text-red-500">{errors.ward}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Registration Information</CardTitle>
                                <CardDescription>
                                    Official registration and certification details.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="registration_number">Registration Number</Label>
                                    <Input
                                        id="registration_number"
                                        value={data.registration_number}
                                        onChange={(e) => setData('registration_number', e.target.value)}
                                        placeholder="Enter registration number"
                                        className={errors.registration_number ? 'border-red-500' : ''}
                                    />
                                    {errors.registration_number && (
                                        <p className="text-sm text-red-500">{errors.registration_number}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="necta_number">NECTA Number</Label>
                                    <Input
                                        id="necta_number"
                                        value={data.necta_number}
                                        onChange={(e) => setData('necta_number', e.target.value)}
                                        placeholder="Enter NECTA number"
                                        className={errors.necta_number ? 'border-red-500' : ''}
                                    />
                                    {errors.necta_number && (
                                        <p className="text-sm text-red-500">{errors.necta_number}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

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


