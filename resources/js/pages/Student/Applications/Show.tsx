import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    ArrowLeft, Edit, User, Users, FileText, Phone, Mail,
    MapPin, Calendar, Hash, Clock, CheckCircle, XCircle,
    Eye, AlertCircle, Download, GraduationCap, Star,
} from 'lucide-react';

interface ApplicationDocument {
    id: number;
    document_type: string;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    is_verified: boolean;
    verified_at: string | null;
    notes: string | null;
}

interface ApplicationPayment {
    id: number;
    amount: number;
    payment_method: string;
    transaction_id: string | null;
    payment_reference: string | null;
    status: string;
    paid_at: string;
}

interface Interview {
    id: number;
    interview_date: string;
    interview_time: string;
    interview_type: string;
    location: string | null;
    status: string;
    score: number | null;
    max_score: number | null;
    comments: string | null;
    recommendation: string | null;
    interviewer?: { name: string } | null;
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
    // legacy names from old controller
    desired_class?: string | null;
    academic_year?: string | null;
    status: string;
    application_date: string;
    notes: string | null;
    documents: ApplicationDocument[];
    payments: ApplicationPayment[];
    interviews: Interview[];
}

interface Props { application: Application }

function initials(name: string) {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

function formatDate(date: string | null) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatBytes(bytes: number) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
    if (!value) return null;
    return (
        <div className="py-2">
            <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
            <p className="text-sm font-medium break-words">{value}</p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; className: string; icon: any }> = {
        pending:      { label: 'Pending',      className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
        under_review: { label: 'Under Review', className: 'bg-blue-100 text-blue-800 border-blue-200',   icon: Eye },
        approved:     { label: 'Approved',     className: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle },
        rejected:     { label: 'Rejected',     className: 'bg-red-100 text-red-800 border-red-200',     icon: XCircle },
        withdrawn:    { label: 'Withdrawn',    className: 'bg-gray-100 text-gray-700 border-gray-200',   icon: AlertCircle },
    };
    const s = map[status] ?? { label: status, className: 'bg-gray-100 text-gray-700 border-gray-200', icon: AlertCircle };
    const Icon = s.icon;
    return (
        <Badge className={`${s.className} flex items-center gap-1 text-xs`}>
            <Icon className="h-3 w-3" />
            {s.label}
        </Badge>
    );
}

export default function ShowApplication({ application }: Props) {
    const [activeTab, setActiveTab] = useState('applicant');
    const fullName = [application.first_name, application.middle_name, application.last_name].filter(Boolean).join(' ');
    const appliedClass = application.applied_class ?? application.desired_class ?? '—';
    const appliedYear  = application.applied_academic_year ?? application.academic_year ?? '—';

    // Status update form
    const { data, setData, patch, processing } = useForm({
        status: application.status,
        notes: application.notes ?? '',
    });

    const handleStatusUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/students/applications/${application.id}/status`);
    };

    const docTypeLabel: Record<string, string> = {
        birth_certificate:  'Birth Certificate',
        passport_photo:     'Passport Photo',
        report_card:        'Report Card',
        transfer_certificate: 'Transfer Certificate',
        medical_records:    'Medical Records',
        vaccination_records:'Vaccination Records',
        other:              'Other',
    };

    return (
        <AppLayout>
            <Head title={`Application — ${fullName}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link href="/students/applications"><ArrowLeft className="h-4 w-4" /></Link>
                        </Button>
                        <Avatar className="h-12 w-12">
                            <AvatarFallback className={`text-base font-bold ${application.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                {initials(fullName)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold">{fullName}</h1>
                                <StatusBadge status={application.status} />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Applied for <span className="font-medium">{appliedClass}</span>
                                <span> · {appliedYear}</span>
                                <span className="capitalize"> · {application.gender}</span>
                            </p>
                        </div>
                    </div>
                    <Button size="sm" asChild>
                        <Link href={`/students/applications/${application.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />Edit Application
                        </Link>
                    </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        { label: 'Applied',     value: formatDate(application.application_date),        icon: Calendar },
                        { label: 'Desired Class', value: appliedClass,                                  icon: GraduationCap },
                        { label: 'Documents',   value: String(application.documents?.length ?? 0),      icon: FileText },
                        { label: 'Interviews',  value: String(application.interviews?.length ?? 0),     icon: Star },
                    ].map(s => (
                        <Card key={s.label} className="border shadow-sm">
                            <CardContent className="p-3 flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                                    <s.icon className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">{s.label}</p>
                                    <p className="text-sm font-semibold">{s.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full sm:w-auto">
                        <TabsTrigger value="applicant"><User className="mr-1.5 h-3.5 w-3.5" />Applicant</TabsTrigger>
                        <TabsTrigger value="parent"><Users className="mr-1.5 h-3.5 w-3.5" />Parent/Guardian</TabsTrigger>
                        <TabsTrigger value="documents">
                            <FileText className="mr-1.5 h-3.5 w-3.5" />Documents
                            <Badge variant="secondary" className="ml-1.5 text-xs">{application.documents?.length ?? 0}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="review"><Eye className="mr-1.5 h-3.5 w-3.5" />Review</TabsTrigger>
                    </TabsList>

                    {/* Applicant Tab */}
                    <TabsContent value="applicant">
                        <Card className="border shadow-sm">
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
                                    <InfoRow label="Full Name" value={fullName} />
                                    <InfoRow label="Date of Birth" value={formatDate(application.date_of_birth)} />
                                    <InfoRow label="Gender" value={application.gender} />
                                    <InfoRow label="Nationality" value={application.nationality} />
                                    <InfoRow label="Religion" value={application.religion} />
                                    <InfoRow label="Phone" value={application.phone} />
                                    <InfoRow label="Email" value={application.email} />
                                </div>

                                {(application.address || application.region || application.district) && (
                                    <>
                                        <Separator />
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Address</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
                                            <InfoRow label="Address" value={application.address} />
                                            <InfoRow label="Region" value={application.region} />
                                            <InfoRow label="District" value={application.district} />
                                            <InfoRow label="Ward" value={application.ward} />
                                        </div>
                                    </>
                                )}

                                {(application.previous_school || application.previous_class) && (
                                    <>
                                        <Separator />
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Previous Education</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
                                            <InfoRow label="Previous School" value={application.previous_school} />
                                            <InfoRow label="Previous Class" value={application.previous_class} />
                                            <InfoRow label="Reason for Transfer" value={application.reason_for_transfer} />
                                        </div>
                                    </>
                                )}

                                {(application.medical_conditions || application.allergies) && (
                                    <>
                                        <Separator />
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Medical Information</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
                                            <InfoRow label="Medical Conditions" value={application.medical_conditions} />
                                            <InfoRow label="Allergies" value={application.allergies} />
                                            <InfoRow label="Emergency Contact" value={application.emergency_contact_name} />
                                            <InfoRow label="Emergency Phone" value={application.emergency_contact_phone} />
                                            <InfoRow label="Relationship" value={application.emergency_contact_relationship} />
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Parent/Guardian Tab */}
                    <TabsContent value="parent">
                        <div className="space-y-4">
                            {/* Parent */}
                            <Card className="border shadow-sm">
                                <CardHeader className="bg-slate-50/50 py-3 border-b">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
                                        <User className="h-4 w-4 text-blue-800" />
                                        Parent Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
                                        <InfoRow label="Parent Name" value={application.parent_name} />
                                        <InfoRow label="Phone Number" value={application.parent_phone} />
                                        <InfoRow label="Email Address" value={application.parent_email} />
                                        <InfoRow label="Occupation" value={application.parent_occupation} />
                                        <div className="sm:col-span-2">
                                            <InfoRow label="Address" value={application.parent_address} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Guardian (if different) */}
                            {application.guardian_name && (
                                <Card className="border shadow-sm">
                                    <CardHeader className="bg-slate-50/50 py-3 border-b">
                                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
                                            <Users className="h-4 w-4 text-blue-800" />
                                            Guardian Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
                                            <InfoRow label="Guardian Name" value={application.guardian_name} />
                                            <InfoRow label="Relationship" value={application.guardian_relationship} />
                                            <InfoRow label="Phone Number" value={application.guardian_phone} />
                                            <InfoRow label="Email Address" value={application.guardian_email} />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents">
                        <Card className="border shadow-sm">
                            <CardContent className="p-5">
                                {(!application.documents || application.documents.length === 0) ? (
                                    <div className="text-center py-12 text-slate-400">
                                        <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                                        <p className="text-sm">No documents submitted yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {application.documents.map((doc) => (
                                            <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/40">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-50">
                                                        <FileText className="h-4 w-4 text-blue-700" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{docTypeLabel[doc.document_type] ?? doc.document_type}</p>
                                                        <p className="text-xs text-muted-foreground">{doc.file_name} · {formatBytes(doc.file_size)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {doc.is_verified
                                                        ? <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>
                                                        : <Badge variant="secondary" className="text-xs"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
                                                    }
                                                    <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
                                                        <a href={`/students/applications/documents/${doc.id}/download`}>
                                                            <Download className="h-3.5 w-3.5 mr-1" />Download
                                                        </a>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Review Tab */}
                    <TabsContent value="review">
                        <div className="space-y-4">
                            {/* Status Update */}
                            <Card className="border shadow-sm">
                                <CardHeader className="bg-slate-50/50 py-3 border-b">
                                    <CardTitle className="text-sm font-bold text-slate-800">Update Application Status</CardTitle>
                                </CardHeader>
                                <CardContent className="p-5">
                                    <form onSubmit={handleStatusUpdate} className="space-y-4">
                                        <div>
                                            <Label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Status</Label>
                                            <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="under_review">Under Review</SelectItem>
                                                    <SelectItem value="approved">Approved</SelectItem>
                                                    <SelectItem value="rejected">Rejected</SelectItem>
                                                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Review Notes</Label>
                                            <Textarea
                                                value={data.notes}
                                                onChange={(e) => setData('notes', e.target.value)}
                                                placeholder="Add reviewer notes or comments..."
                                                rows={3}
                                            />
                                        </div>
                                        <Button type="submit" disabled={processing} size="sm" className="bg-blue-800 hover:bg-blue-900">
                                            {processing ? 'Updating...' : 'Update Status'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Interviews */}
                            {application.interviews && application.interviews.length > 0 && (
                                <Card className="border shadow-sm">
                                    <CardHeader className="bg-slate-50/50 py-3 border-b">
                                        <CardTitle className="text-sm font-bold text-slate-800">Interviews</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-5 space-y-3">
                                        {application.interviews.map((iv) => (
                                            <div key={iv.id} className="p-3 border rounded-lg bg-slate-50/40 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-semibold capitalize">{iv.interview_type?.replace(/_/g, ' ')}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatDate(iv.interview_date)} at {iv.interview_time}
                                                            {iv.location && ` · ${iv.location}`}
                                                        </p>
                                                    </div>
                                                    <Badge variant="secondary" className="capitalize text-xs">{iv.status?.replace(/_/g, ' ')}</Badge>
                                                </div>
                                                {iv.score != null && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Score: <span className="font-semibold text-slate-700">{iv.score}/{iv.max_score}</span>
                                                        {iv.recommendation && <span className="ml-3 capitalize">· Recommendation: <span className="font-semibold">{iv.recommendation}</span></span>}
                                                    </p>
                                                )}
                                                {iv.comments && <p className="text-xs text-slate-600 italic">{iv.comments}</p>}
                                                {iv.interviewer && <p className="text-xs text-muted-foreground">Interviewer: {iv.interviewer.name}</p>}
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Payments */}
                            {application.payments && application.payments.length > 0 && (
                                <Card className="border shadow-sm">
                                    <CardHeader className="bg-slate-50/50 py-3 border-b">
                                        <CardTitle className="text-sm font-bold text-slate-800">Payments</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-5 space-y-3">
                                        {application.payments.map((pay) => (
                                            <div key={pay.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/40">
                                                <div>
                                                    <p className="text-sm font-medium">TZS {Number(pay.amount).toLocaleString()}</p>
                                                    <p className="text-xs text-muted-foreground capitalize">{pay.payment_method?.replace(/_/g, ' ')} · {formatDate(pay.paid_at)}</p>
                                                    {pay.transaction_id && <p className="text-xs text-muted-foreground">Ref: {pay.transaction_id}</p>}
                                                </div>
                                                <Badge className={pay.status === 'paid' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 text-xs' : 'bg-gray-100 text-gray-700 border-gray-200 text-xs'}>
                                                    {pay.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
