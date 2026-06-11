import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Save, Users, GraduationCap, Calendar, BookOpen, School } from 'lucide-react';
import { Transition } from '@headlessui/react';

interface SchoolData {
    id: number;
    name: string;
    description: string | null;
    motto: string | null;
    contact_email: string;
    contact_phone: string;
    address: string;
    region: string;
    district: string;
    ward: string | null;
    registration_number: string | null;
    necta_number: string | null;
}

interface SchoolSettingsProps {
    schoolSettings: {
        school: SchoolData;
        total_users: number;
        total_students: number;
        total_teachers: number;
        total_classes: number;
        total_subjects: number;
    };
}

export default function SchoolConfiguration({ schoolSettings }: SchoolSettingsProps) {
    const { school, total_users, total_students, total_teachers, total_classes, total_subjects } = schoolSettings;

    const { data, setData, post, processing, recentlySuccessful, errors } = useForm({
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
        post('/system/configurations/update');
    };

    return (
        <AppLayout
            title="School Profile Settings"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'School Settings', href: '/system/configurations' },
            ]}
        >
            <Head title="School Profile Settings" />

            <SettingsLayout
                title="School Administration"
                description="Manage your school profile settings and system configurations"
            >
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                    {/* Header */}
                    <HeadingSmall
                        title="School Profile"
                        description="Update your school's demographic details and system branding"
                    />

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-lg p-3 border border-blue-100 dark:border-blue-900/30">
                            <div className="flex items-center space-x-2 text-blue-600 mb-1">
                                <Users className="w-4 h-4" />
                                <span className="text-[11px] font-semibold uppercase tracking-wider">Total Staff</span>
                            </div>
                            <div className="text-xl font-bold text-blue-900 dark:text-blue-200">{total_teachers}</div>
                        </div>

                        <div className="bg-green-50/50 dark:bg-green-900/10 rounded-lg p-3 border border-green-100 dark:border-green-900/30">
                            <div className="flex items-center space-x-2 text-green-600 mb-1">
                                <GraduationCap className="w-4 h-4" />
                                <span className="text-[11px] font-semibold uppercase tracking-wider">Students</span>
                            </div>
                            <div className="text-xl font-bold text-green-900 dark:text-green-200">{total_students}</div>
                        </div>

                        <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-lg p-3 border border-purple-100 dark:border-purple-900/30 col-span-2 sm:col-span-1">
                            <div className="flex items-center space-x-2 text-purple-600 mb-1">
                                <BookOpen className="w-4 h-4" />
                                <span className="text-[11px] font-semibold uppercase tracking-wider">Classes</span>
                            </div>
                            <div className="text-xl font-bold text-purple-900 dark:text-purple-200">{total_classes}</div>
                        </div>
                    </div>

                    {/* School Settings Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card className="border border-slate-200 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold flex items-center space-x-2 text-slate-800">
                                    <School className="w-4 h-4 text-blue-600" />
                                    <span>Branding & Identity</span>
                                </CardTitle>
                                <CardDescription>Branding information used on certificates, reports, and communications</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor="name">School Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                        placeholder="e.g. EduTZ Academic School"
                                    />
                                    {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="motto">School Motto</Label>
                                    <Input
                                        id="motto"
                                        value={data.motto}
                                        onChange={(e) => setData('motto', e.target.value)}
                                        placeholder="e.g. Education is the Light"
                                    />
                                    {errors.motto && <span className="text-xs text-red-500">{errors.motto}</span>}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="description">About / Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        placeholder="Brief description of the school..."
                                    />
                                    {errors.description && <span className="text-xs text-red-500">{errors.description}</span>}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-slate-200 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold flex items-center space-x-2 text-slate-800">
                                    <span>Contact & Office Details</span>
                                </CardTitle>
                                <CardDescription>Primary contact details for system mailers and alerts</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="contact_email">Email Address <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="contact_email"
                                            type="email"
                                            value={data.contact_email}
                                            onChange={(e) => setData('contact_email', e.target.value)}
                                            required
                                            placeholder="e.g. office@school.com"
                                        />
                                        {errors.contact_email && <span className="text-xs text-red-500">{errors.contact_email}</span>}
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="contact_phone">Phone Number <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="contact_phone"
                                            value={data.contact_phone}
                                            onChange={(e) => setData('contact_phone', e.target.value)}
                                            required
                                            placeholder="e.g. +255 7..."
                                        />
                                        {errors.contact_phone && <span className="text-xs text-red-500">{errors.contact_phone}</span>}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="address">Physical Address <span className="text-red-500">*</span></Label>
                                    <Textarea
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        rows={2}
                                        required
                                        placeholder="P.O Box 123, Dar es Salaam, Tanzania"
                                    />
                                    {errors.address && <span className="text-xs text-red-500">{errors.address}</span>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="region">Region <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="region"
                                            value={data.region}
                                            onChange={(e) => setData('region', e.target.value)}
                                            required
                                            placeholder="e.g. Dar es Salaam"
                                        />
                                        {errors.region && <span className="text-xs text-red-500">{errors.region}</span>}
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="district">District <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="district"
                                            value={data.district}
                                            onChange={(e) => setData('district', e.target.value)}
                                            required
                                            placeholder="e.g. Ilala"
                                        />
                                        {errors.district && <span className="text-xs text-red-500">{errors.district}</span>}
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="ward">Ward</Label>
                                        <Input
                                            id="ward"
                                            value={data.ward}
                                            onChange={(e) => setData('ward', e.target.value)}
                                            placeholder="e.g. Upanga East"
                                        />
                                        {errors.ward && <span className="text-xs text-red-500">{errors.ward}</span>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-slate-200 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold flex items-center space-x-2 text-slate-800">
                                    <span>Accreditation & Registry</span>
                                </CardTitle>
                                <CardDescription>Official government and board credentials</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="registration_number">School Reg. Number</Label>
                                    <Input
                                        id="registration_number"
                                        value={data.registration_number}
                                        onChange={(e) => setData('registration_number', e.target.value)}
                                        placeholder="e.g. S.1234 / S.5678"
                                    />
                                    {errors.registration_number && <span className="text-xs text-red-500">{errors.registration_number}</span>}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="necta_number">NECTA Center Number</Label>
                                    <Input
                                        id="necta_number"
                                        value={data.necta_number}
                                        onChange={(e) => setData('necta_number', e.target.value)}
                                        placeholder="e.g. PS12345"
                                    />
                                    {errors.necta_number && <span className="text-xs text-red-500">{errors.necta_number}</span>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Save Button */}
                        <div className="flex items-center gap-4 pt-2">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-green-600 font-semibold flex items-center">
                                    <Sparkles className="w-4 h-4 mr-1 text-green-600 animate-pulse" />
                                    School settings updated!
                                </p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
