import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Upload, Trash2, Save, User, Users, ArrowLeft, AlertCircle, FileText } from 'lucide-react';

const SectionHeading = ({ icon: Icon, title, action }: { icon: any; title: string; action?: React.ReactNode }) => (
    <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
            <div className="h-5 w-0.5 rounded-full bg-blue-700" />
            <Icon className="h-3.5 w-3.5 text-blue-700" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600">{title}</h3>
        </div>
        {action}
    </div>
);

interface SchoolClass {
    id: number;
    name: string;
    level: string;
}

interface Props {
    classes: SchoolClass[];
}

const Err = ({ msg }: { msg?: string }) =>
    msg ? <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3 shrink-0" />{msg}</p> : null;

const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
    <Label className="text-xs font-medium text-slate-500 mb-1 block">
        {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </Label>
);

export default function CreateApplication({ classes }: Props) {
    const [documents, setDocuments] = useState<Array<{
        type: string;
        file: File | null;
        preview?: string;
    }>>([]);

    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        middle_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        nationality: 'Tanzanian',
        applied_class: '',
        applied_academic_year: new Date().getFullYear().toString(),
        parent_name: '',
        parent_phone: '',
        parent_email: '',
        parent_occupation: '',
        parent_address: '',
        documents: [] as any[],
    });

    const addDocument = () => {
        const updated = [...documents, { type: '', file: null }];
        setDocuments(updated);
        setData('documents', updated);
    };

    const removeDocument = (index: number) => {
        const updated = documents.filter((_, i) => i !== index);
        setDocuments(updated);
        setData('documents', updated);
    };

    const updateDocument = (index: number, field: string, value: any) => {
        const updated = [...documents];
        updated[index] = { ...updated[index], [field]: value };
        setDocuments(updated);
        setData('documents', updated);
    };

    const handleFileChange = (index: number, file: File) => {
        const updated = [...documents];
        updated[index].file = file;
        updated[index].preview = URL.createObjectURL(file);
        setDocuments(updated);
        setData('documents', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/student/applications', { forceFormData: true });
    };

    const totalErrors = Object.keys(errors).length;

    return (
        <AppLayout>
            <Head title="New Student Application" />

            <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <Link href="/students/applications"><ArrowLeft className="h-4 w-4" /></Link>
                            </Button>
                            <div>
                                <h1 className="text-base font-bold text-slate-900">New Student Application</h1>
                                <p className="text-xs text-slate-400">Submit a new student admission application</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="ghost" size="sm" className="text-slate-500" asChild>
                                <Link href="/students/applications">Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing} size="sm" className="bg-blue-700 hover:bg-blue-800 text-white px-5">
                                <Save className="mr-1.5 h-3.5 w-3.5" />
                                {processing ? 'Submitting...' : 'Submit Application'}
                            </Button>
                        </div>
                    </div>

                    {totalErrors > 0 && (
                        <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                            <p className="text-xs text-red-600 font-medium">Please correct the {totalErrors} highlighted field(s) before submitting.</p>
                        </div>
                    )}

                    {/* Two Column Layout */}
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-5">

                        {/* LEFT COLUMN: Student Information */}
                        <div className="space-y-5">
                            <div className={panel}>
                                <SectionHeading icon={User} title="Student Information" />
                                <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <FieldLabel required>First Name</FieldLabel>
                                            <Input
                                                id="first_name"
                                                value={data.first_name}
                                                onChange={(e) => setData('first_name', e.target.value)}
                                                placeholder="Enter first name"
                                                className={errors.first_name ? 'border-red-400' : ''}
                                            />
                                            <Err msg={errors.first_name} />
                                        </div>
                                        <div>
                                            <FieldLabel>Middle Name</FieldLabel>
                                            <Input
                                                id="middle_name"
                                                value={data.middle_name}
                                                onChange={(e) => setData('middle_name', e.target.value)}
                                                placeholder="Middle name"
                                            />
                                        </div>
                                        <div>
                                            <FieldLabel required>Last Name</FieldLabel>
                                            <Input
                                                id="last_name"
                                                value={data.last_name}
                                                onChange={(e) => setData('last_name', e.target.value)}
                                                placeholder="Enter last name"
                                                className={errors.last_name ? 'border-red-400' : ''}
                                            />
                                            <Err msg={errors.last_name} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <FieldLabel required>Date of Birth</FieldLabel>
                                            <Input
                                                id="date_of_birth"
                                                type="date"
                                                value={data.date_of_birth}
                                                onChange={(e) => setData('date_of_birth', e.target.value)}
                                                className={errors.date_of_birth ? 'border-red-400' : ''}
                                            />
                                            <Err msg={errors.date_of_birth} />
                                        </div>

                                        <div>
                                            <FieldLabel required>Gender</FieldLabel>
                                            <Select
                                                value={data.gender}
                                                onValueChange={(value) => setData('gender', value)}
                                            >
                                                <SelectTrigger className={errors.gender ? 'border-red-400' : ''}>
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Err msg={errors.gender} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="col-span-1">
                                            <FieldLabel required>Applying for Class</FieldLabel>
                                            <Select
                                                value={data.applied_class}
                                                onValueChange={(value) => setData('applied_class', value)}
                                            >
                                                <SelectTrigger className={errors.applied_class ? 'border-red-400' : ''}>
                                                    <SelectValue placeholder="Select class" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classes.map((cls) => (
                                                        <SelectItem key={cls.id} value={cls.name}>
                                                            {cls.name} ({cls.level})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Err msg={errors.applied_class} />
                                        </div>

                                        <div className="col-span-1">
                                            <FieldLabel>Nationality</FieldLabel>
                                            <Input
                                                id="nationality"
                                                value={data.nationality}
                                                onChange={(e) => setData('nationality', e.target.value)}
                                                placeholder="e.g., Tanzanian"
                                            />
                                        </div>

                                        <div className="col-span-1">
                                            <FieldLabel required>Academic Year</FieldLabel>
                                            <Input
                                                id="applied_academic_year"
                                                value={data.applied_academic_year}
                                                onChange={(e) => setData('applied_academic_year', e.target.value)}
                                                placeholder="2026"
                                                className={errors.applied_academic_year ? 'border-red-400' : ''}
                                            />
                                            <Err msg={errors.applied_academic_year} />
                                        </div>
                                    </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Parent Information & Required Documents */}
                        <div className="space-y-5">
                            <div className={panel}>
                                <SectionHeading icon={Users} title="Parent / Guardian Information" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <FieldLabel required>Parent/Guardian Name</FieldLabel>
                                            <Input
                                                id="parent_name"
                                                value={data.parent_name}
                                                onChange={(e) => setData('parent_name', e.target.value)}
                                                placeholder="Full name"
                                                className={errors.parent_name ? 'border-red-400' : ''}
                                            />
                                            <Err msg={errors.parent_name} />
                                        </div>

                                        <div>
                                            <FieldLabel required>Phone Number</FieldLabel>
                                            <Input
                                                id="parent_phone"
                                                value={data.parent_phone}
                                                onChange={(e) => setData('parent_phone', e.target.value)}
                                                placeholder="+255 XXX XXX XXX"
                                                className={errors.parent_phone ? 'border-red-400' : ''}
                                            />
                                            <Err msg={errors.parent_phone} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <FieldLabel required>Email Address</FieldLabel>
                                            <Input
                                                id="parent_email"
                                                type="email"
                                                value={data.parent_email}
                                                onChange={(e) => setData('parent_email', e.target.value)}
                                                placeholder="email@example.com"
                                                className={errors.parent_email ? 'border-red-400' : ''}
                                            />
                                            <Err msg={errors.parent_email} />
                                        </div>

                                        <div>
                                            <FieldLabel>Occupation</FieldLabel>
                                            <Input
                                                id="parent_occupation"
                                                value={data.parent_occupation}
                                                onChange={(e) => setData('parent_occupation', e.target.value)}
                                                placeholder="Job title or profession"
                                                className={errors.parent_occupation ? 'border-red-400' : ''}
                                            />
                                            <Err msg={errors.parent_occupation} />
                                        </div>
                                    </div>

                                    <div>
                                        <FieldLabel required>Address</FieldLabel>
                                        <Textarea
                                            id="parent_address"
                                            value={data.parent_address}
                                            onChange={(e) => setData('parent_address', e.target.value)}
                                            placeholder="Full address including region and district"
                                            rows={2}
                                            className={errors.parent_address ? 'border-red-400' : ''}
                                        />
                                        <Err msg={errors.parent_address} />
                                    </div>
                            </div>

                            <div className={panel}>
                                <SectionHeading
                                    icon={FileText}
                                    title="Required Documents"
                                    action={
                                        <Button type="button" onClick={addDocument} variant="outline" size="sm" className="h-7 text-xs gap-1">
                                            <Plus className="w-3 h-3" /> Add Document
                                        </Button>
                                    }
                                />
                                    {documents.length === 0 ? (
                                        <div className="text-center py-6 text-slate-400 border border-dashed rounded-lg">
                                            <Upload className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                            <p className="text-xs">No documents added yet.</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">Click "Add Document" to upload certificate/transcripts.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {documents.map((doc, index) => (
                                                <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg bg-slate-50/30 relative">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeDocument(index)}
                                                        className="h-6 w-6 absolute right-2 top-2 text-slate-400 hover:text-red-600"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>

                                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 md:pt-0">
                                                        <div>
                                                            <FieldLabel required>Document Type</FieldLabel>
                                                            <Select
                                                                value={doc.type}
                                                                onValueChange={(value) => updateDocument(index, 'type', value)}
                                                            >
                                                                <SelectTrigger className="h-9 text-xs">
                                                                    <SelectValue placeholder="Select document type" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {documentTypes.map((type) => (
                                                                        <SelectItem key={type.value} value={type.value}>
                                                                            {type.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div>
                                                            <FieldLabel required>File (PDF/Image)</FieldLabel>
                                                            <Input
                                                                type="file"
                                                                accept=".pdf,.jpg,.jpeg,.png"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) handleFileChange(index, file);
                                                                }}
                                                                className="cursor-pointer h-9 text-xs"
                                                            />
                                                            {doc.file && (
                                                                <p className="text-[10px] text-green-600 mt-1 truncate">
                                                                    ✓ Selected: {doc.file.name}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <Err msg={errors.documents} />
                            </div>
                        </div>
                    </div>

                    {/* Sticky Bottom Bar */}
                    <div className="sticky bottom-0 bg-white/95 backdrop-blur px-6 py-3 flex items-center justify-between">
                        <Button type="button" variant="ghost" className="text-slate-500" asChild>
                            <Link href="/students/applications">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-blue-700 hover:bg-blue-800 text-white px-8">
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Submitting...' : 'Submit Application'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
