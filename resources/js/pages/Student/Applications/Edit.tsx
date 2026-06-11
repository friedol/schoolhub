import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, User, Users, ArrowLeft, AlertCircle, FileText, Phone, GraduationCap, Heart } from 'lucide-react';

interface SchoolClass {
    id: number;
    name: string;
    level: string;
}

interface Application {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    date_of_birth: string;
    gender: string;
    nationality: string;
    religion: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    region: string | null;
    district: string | null;
    ward: string | null;
    previous_school: string | null;
    previous_class: string | null;
    reason_for_transfer: string | null;
    parent_name: string;
    parent_phone: string;
    parent_email: string;
    parent_occupation: string | null;
    parent_address: string;
    guardian_name: string | null;
    guardian_phone: string | null;
    guardian_email: string | null;
    guardian_relationship: string | null;
    medical_conditions: string | null;
    allergies: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    emergency_contact_relationship: string | null;
    applied_class: string | null;
    applied_academic_year: string | null;
    desired_class?: string | null;
    academic_year?: string | null;
    status: string;
    notes: string | null;
}

interface Props {
    application: Application;
    classes: SchoolClass[];
}

const Err = ({ msg }: { msg?: string }) =>
    msg ? <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3 shrink-0" />{msg}</p> : null;

const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
    <Label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
        {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </Label>
);

function SectionCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
    return (
        <Card className="border shadow-sm overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 py-3 border-b flex flex-row items-center gap-2">
                <Icon className="h-4 w-4 text-blue-800" />
                <CardTitle className="text-sm font-bold text-slate-800">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
                {children}
            </CardContent>
        </Card>
    );
}

export default function EditApplication({ application, classes }: Props) {
    const fullName = [application.first_name, application.middle_name, application.last_name].filter(Boolean).join(' ');

    const { data, setData, put, processing, errors } = useForm({
        first_name:                      application.first_name ?? '',
        middle_name:                     application.middle_name ?? '',
        last_name:                       application.last_name ?? '',
        date_of_birth:                   application.date_of_birth?.substring(0, 10) ?? '',
        gender:                          application.gender ?? '',
        nationality:                     application.nationality ?? 'Tanzanian',
        religion:                        application.religion ?? '',
        phone:                           application.phone ?? '',
        email:                           application.email ?? '',
        address:                         application.address ?? '',
        region:                          application.region ?? '',
        district:                        application.district ?? '',
        ward:                            application.ward ?? '',
        previous_school:                 application.previous_school ?? '',
        previous_class:                  application.previous_class ?? '',
        reason_for_transfer:             application.reason_for_transfer ?? '',
        parent_name:                     application.parent_name ?? '',
        parent_phone:                    application.parent_phone ?? '',
        parent_email:                    application.parent_email ?? '',
        parent_occupation:               application.parent_occupation ?? '',
        parent_address:                  application.parent_address ?? '',
        guardian_name:                   application.guardian_name ?? '',
        guardian_phone:                  application.guardian_phone ?? '',
        guardian_email:                  application.guardian_email ?? '',
        guardian_relationship:           application.guardian_relationship ?? '',
        medical_conditions:              application.medical_conditions ?? '',
        allergies:                       application.allergies ?? '',
        emergency_contact_name:          application.emergency_contact_name ?? '',
        emergency_contact_phone:         application.emergency_contact_phone ?? '',
        emergency_contact_relationship:  application.emergency_contact_relationship ?? '',
        applied_class:                   application.applied_class ?? application.desired_class ?? '',
        applied_academic_year:           application.applied_academic_year ?? application.academic_year ?? new Date().getFullYear().toString(),
        notes:                           application.notes ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/students/applications/${application.id}`);
    };

    const totalErrors = Object.keys(errors).length;

    return (
        <AppLayout>
            <Head title={`Edit Application — ${fullName}`} />

            <div className="flex-1 overflow-y-auto bg-slate-50/50">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Header */}
                    <div className="flex items-center justify-between border-b pb-4">
                        <div className="flex items-center gap-3">
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <Link href={`/students/applications/${application.id}`}><ArrowLeft className="h-4 w-4" /></Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Application</h1>
                                <p className="text-sm text-slate-500">{fullName}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm" asChild>
                                <Link href={`/students/applications/${application.id}`}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing} size="sm" className="bg-blue-800 hover:bg-blue-900">
                                <Save className="mr-2 h-4 w-4" />
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>

                    {totalErrors > 0 && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                            <p className="text-sm text-red-600 font-medium">Please correct the {totalErrors} highlighted field(s) before saving.</p>
                        </div>
                    )}

                    {/* Two-column layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* LEFT COLUMN */}
                        <div className="space-y-6">

                            {/* Student Information */}
                            <SectionCard title="Student Information" icon={User}>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <FieldLabel required>First Name</FieldLabel>
                                        <Input id="first_name" value={data.first_name} onChange={e => setData('first_name', e.target.value)} placeholder="First name" className={errors.first_name ? 'border-red-400' : ''} />
                                        <Err msg={errors.first_name} />
                                    </div>
                                    <div>
                                        <FieldLabel>Middle Name</FieldLabel>
                                        <Input id="middle_name" value={data.middle_name} onChange={e => setData('middle_name', e.target.value)} placeholder="Middle name" />
                                    </div>
                                    <div>
                                        <FieldLabel required>Last Name</FieldLabel>
                                        <Input id="last_name" value={data.last_name} onChange={e => setData('last_name', e.target.value)} placeholder="Last name" className={errors.last_name ? 'border-red-400' : ''} />
                                        <Err msg={errors.last_name} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <FieldLabel required>Date of Birth</FieldLabel>
                                        <Input id="date_of_birth" type="date" value={data.date_of_birth} onChange={e => setData('date_of_birth', e.target.value)} className={errors.date_of_birth ? 'border-red-400' : ''} />
                                        <Err msg={errors.date_of_birth} />
                                    </div>
                                    <div>
                                        <FieldLabel required>Gender</FieldLabel>
                                        <Select value={data.gender} onValueChange={v => setData('gender', v)}>
                                            <SelectTrigger className={errors.gender ? 'border-red-400' : ''}><SelectValue placeholder="Select gender" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Err msg={errors.gender} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <FieldLabel>Nationality</FieldLabel>
                                        <Input value={data.nationality} onChange={e => setData('nationality', e.target.value)} placeholder="e.g., Tanzanian" />
                                    </div>
                                    <div>
                                        <FieldLabel>Religion</FieldLabel>
                                        <Input value={data.religion} onChange={e => setData('religion', e.target.value)} placeholder="e.g., Christian, Muslim" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <FieldLabel>Phone Number</FieldLabel>
                                        <Input value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="+255 XXX XXX XXX" />
                                    </div>
                                    <div>
                                        <FieldLabel>Email Address</FieldLabel>
                                        <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="student@example.com" />
                                    </div>
                                </div>

                                <div>
                                    <FieldLabel>Address</FieldLabel>
                                    <Textarea value={data.address} onChange={e => setData('address', e.target.value)} placeholder="Full street address" rows={2} />
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <FieldLabel>Region</FieldLabel>
                                        <Input value={data.region} onChange={e => setData('region', e.target.value)} placeholder="Region" />
                                    </div>
                                    <div>
                                        <FieldLabel>District</FieldLabel>
                                        <Input value={data.district} onChange={e => setData('district', e.target.value)} placeholder="District" />
                                    </div>
                                    <div>
                                        <FieldLabel>Ward</FieldLabel>
                                        <Input value={data.ward} onChange={e => setData('ward', e.target.value)} placeholder="Ward" />
                                    </div>
                                </div>
                            </SectionCard>

                            {/* Previous Education */}
                            <SectionCard title="Previous Education" icon={GraduationCap}>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <FieldLabel>Previous School</FieldLabel>
                                        <Input value={data.previous_school} onChange={e => setData('previous_school', e.target.value)} placeholder="School name" />
                                    </div>
                                    <div>
                                        <FieldLabel>Previous Class</FieldLabel>
                                        <Input value={data.previous_class} onChange={e => setData('previous_class', e.target.value)} placeholder="e.g., Std VI" />
                                    </div>
                                </div>
                                <div>
                                    <FieldLabel>Reason for Transfer</FieldLabel>
                                    <Textarea value={data.reason_for_transfer} onChange={e => setData('reason_for_transfer', e.target.value)} placeholder="Why leaving previous school?" rows={2} />
                                </div>
                            </SectionCard>

                            {/* Application Details */}
                            <SectionCard title="Application Details" icon={FileText}>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <FieldLabel required>Applying for Class</FieldLabel>
                                        <Select value={data.applied_class} onValueChange={v => setData('applied_class', v)}>
                                            <SelectTrigger className={errors.applied_class ? 'border-red-400' : ''}>
                                                <SelectValue placeholder="Select class" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classes.map(cls => (
                                                    <SelectItem key={cls.id} value={cls.name}>{cls.name} ({cls.level})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Err msg={errors.applied_class} />
                                    </div>
                                    <div>
                                        <FieldLabel required>Academic Year</FieldLabel>
                                        <Input value={data.applied_academic_year} onChange={e => setData('applied_academic_year', e.target.value)} placeholder="2026" className={errors.applied_academic_year ? 'border-red-400' : ''} />
                                        <Err msg={errors.applied_academic_year} />
                                    </div>
                                </div>
                                <div>
                                    <FieldLabel>Review Notes</FieldLabel>
                                    <Textarea value={data.notes} onChange={e => setData('notes', e.target.value)} placeholder="Internal notes..." rows={3} />
                                </div>
                            </SectionCard>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="space-y-6">

                            {/* Parent Information */}
                            <SectionCard title="Parent/Guardian Information" icon={Users}>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <FieldLabel required>Parent/Guardian Name</FieldLabel>
                                        <Input value={data.parent_name} onChange={e => setData('parent_name', e.target.value)} placeholder="Full name" className={errors.parent_name ? 'border-red-400' : ''} />
                                        <Err msg={errors.parent_name} />
                                    </div>
                                    <div>
                                        <FieldLabel required>Phone Number</FieldLabel>
                                        <Input value={data.parent_phone} onChange={e => setData('parent_phone', e.target.value)} placeholder="+255 XXX XXX XXX" className={errors.parent_phone ? 'border-red-400' : ''} />
                                        <Err msg={errors.parent_phone} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <FieldLabel required>Email Address</FieldLabel>
                                        <Input type="email" value={data.parent_email} onChange={e => setData('parent_email', e.target.value)} placeholder="email@example.com" className={errors.parent_email ? 'border-red-400' : ''} />
                                        <Err msg={errors.parent_email} />
                                    </div>
                                    <div>
                                        <FieldLabel>Occupation</FieldLabel>
                                        <Input value={data.parent_occupation} onChange={e => setData('parent_occupation', e.target.value)} placeholder="Job title" />
                                    </div>
                                </div>
                                <div>
                                    <FieldLabel required>Address</FieldLabel>
                                    <Textarea value={data.parent_address} onChange={e => setData('parent_address', e.target.value)} placeholder="Full address including region and district" rows={2} className={errors.parent_address ? 'border-red-400' : ''} />
                                    <Err msg={errors.parent_address} />
                                </div>
                            </SectionCard>

                            {/* Guardian */}
                            <SectionCard title="Secondary Guardian (Optional)" icon={Phone}>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <FieldLabel>Guardian Name</FieldLabel>
                                        <Input value={data.guardian_name} onChange={e => setData('guardian_name', e.target.value)} placeholder="Full name" />
                                    </div>
                                    <div>
                                        <FieldLabel>Relationship</FieldLabel>
                                        <Input value={data.guardian_relationship} onChange={e => setData('guardian_relationship', e.target.value)} placeholder="e.g., Uncle, Aunt" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <FieldLabel>Phone</FieldLabel>
                                        <Input value={data.guardian_phone} onChange={e => setData('guardian_phone', e.target.value)} placeholder="+255 XXX XXX XXX" />
                                    </div>
                                    <div>
                                        <FieldLabel>Email</FieldLabel>
                                        <Input type="email" value={data.guardian_email} onChange={e => setData('guardian_email', e.target.value)} placeholder="guardian@example.com" />
                                    </div>
                                </div>
                            </SectionCard>

                            {/* Medical Information */}
                            <SectionCard title="Medical Information" icon={Heart}>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <FieldLabel>Medical Conditions</FieldLabel>
                                        <Textarea value={data.medical_conditions} onChange={e => setData('medical_conditions', e.target.value)} placeholder="List any known conditions" rows={2} />
                                    </div>
                                    <div>
                                        <FieldLabel>Allergies</FieldLabel>
                                        <Textarea value={data.allergies} onChange={e => setData('allergies', e.target.value)} placeholder="Known allergies if any" rows={2} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <FieldLabel>Emergency Contact Name</FieldLabel>
                                        <Input value={data.emergency_contact_name} onChange={e => setData('emergency_contact_name', e.target.value)} placeholder="Full name" />
                                    </div>
                                    <div>
                                        <FieldLabel>Emergency Phone</FieldLabel>
                                        <Input value={data.emergency_contact_phone} onChange={e => setData('emergency_contact_phone', e.target.value)} placeholder="+255 XXX XXX XXX" />
                                    </div>
                                    <div>
                                        <FieldLabel>Relationship</FieldLabel>
                                        <Input value={data.emergency_contact_relationship} onChange={e => setData('emergency_contact_relationship', e.target.value)} placeholder="e.g., Parent" />
                                    </div>
                                </div>
                            </SectionCard>
                        </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between py-4 border-t bg-white px-6 rounded-lg shadow-sm">
                        <Button type="button" variant="outline" asChild>
                            <Link href={`/students/applications/${application.id}`}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-blue-800 hover:bg-blue-900">
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
