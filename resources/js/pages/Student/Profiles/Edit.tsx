import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, User, GraduationCap, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface SchoolClass {
    id: number;
    name: string;
    level: string;
}

interface StudentProfile {
    id: number;
    school_class_id: number;
    admission_number: string;
    admission_date: string;
}

interface Student {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    date_of_birth: string;
    gender: string;
    address: string;
    profile_photo?: string | null;
    student_profile?: {
        id: number;
        school_class_id: number;
        admission_number: string;
        admission_date: string;
        father_name?: string;
        mother_name?: string;
        father_occupation?: string;
        mother_occupation?: string;
        father_income_range?: string;
        blood_group?: string;
        religion?: string;
        nationality?: string;
        country?: string;
        region?: string;
        district?: string;
        ward?: string;
        village?: string;
        address_details?: string;
        submitted_documents?: string[];
        uploaded_documents?: { name: string; path: string }[];
    };
}

interface Props {
    student: Student;
    classes: SchoolClass[];
}

export default function EditStudentProfile({ student, classes }: Props) {
    // Parse first name and last name from student.name
    const nameParts = student.name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        first_name: firstName,
        last_name: lastName,
        email: student.email || '',
        phone: student.phone || '',
        date_of_birth: student.date_of_birth ? student.date_of_birth.split('T')[0] : '',
        gender: student.gender || '',
        address: student.address || '',
        school_class_id: student.student_profile?.school_class_id?.toString() || '',
        nationality: student.student_profile?.nationality || 'Tanzanian',
        religion: student.student_profile?.religion || '',
        region: student.student_profile?.region || '',
        district: student.student_profile?.district || '',
        ward: student.student_profile?.ward || '',
        father_name: student.student_profile?.father_name || '',
        mother_name: student.student_profile?.mother_name || '',
        father_occupation: student.student_profile?.father_occupation || '',
        mother_occupation: student.student_profile?.mother_occupation || '',
        father_income_range: student.student_profile?.father_income_range || '',
        blood_group: student.student_profile?.blood_group || '',
        country: student.student_profile?.country || 'Tanzania',
        village: student.student_profile?.village || '',
        address_details: student.student_profile?.address_details || '',
        submitted_documents: student.student_profile?.submitted_documents || [] as string[],
        profile_photo: null as File | null,
        documents: [] as File[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/student/profiles/${student.id}`);
    };

    return (
        <AppLayout>
            <Head title={`Edit Student — ${student.name}`} />

            <form onSubmit={handleSubmit} className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <Link href={`/student/profiles/${student.id}`}>
                            <Button type="button" variant="ghost" size="sm" className="p-0 h-8 w-8 rounded-full">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Edit Student Profile</h1>
                            <p className="text-gray-600">Update personal and class allocation details for {student.name}</p>
                        </div>
                    </div>
                    <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                        <Save className="w-4 h-4 mr-2" />
                        {processing ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column (Student Details) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Student Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-bold flex items-center space-x-2 text-blue-900">
                                    <User className="w-5 h-5 text-blue-600" />
                                    <span>Personal Information</span>
                                </CardTitle>
                                <CardDescription>Update the student's primary demographic details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Profile Photo */}
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600 block">Student Photo</label>
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 rounded-full border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                                            {data.profile_photo ? (
                                                <img src={URL.createObjectURL(data.profile_photo)} alt="Preview" className="h-full w-full object-cover" />
                                            ) : student.profile_photo ? (
                                                <img src={`/storage/${student.profile_photo}`} alt="Student" className="h-full w-full object-cover" />
                                            ) : (
                                                <User className="h-8 w-8 text-muted-foreground" />
                                            )}
                                        </div>
                                        <Input type="file" accept="image/*" onChange={e => setData('profile_photo', e.target.files?.[0] || null)} className="max-w-xs text-xs" />
                                    </div>
                                    {errors.profile_photo && <span className="text-xs text-red-500">{errors.profile_photo}</span>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 block">First Name <span className="text-red-500">*</span></label>
                                        <Input
                                            value={data.first_name}
                                            onChange={(e) => setData('first_name', e.target.value)}
                                            required
                                        />
                                        {errors.first_name && <span className="text-xs text-red-500">{errors.first_name}</span>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 block">Last Name <span className="text-red-500">*</span></label>
                                        <Input
                                            value={data.last_name}
                                            onChange={(e) => setData('last_name', e.target.value)}
                                            required
                                        />
                                        {errors.last_name && <span className="text-xs text-red-500">{errors.last_name}</span>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 block">Email Address <span className="text-red-500">*</span></label>
                                        <Input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                        />
                                        {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 block">Phone Number</label>
                                        <Input
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                        />
                                        {errors.phone && <span className="text-xs text-red-500">{errors.phone}</span>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 block">Date of Birth <span className="text-red-500">*</span></label>
                                        <Input
                                            type="date"
                                            value={data.date_of_birth}
                                            onChange={(e) => setData('date_of_birth', e.target.value)}
                                            required
                                        />
                                        {errors.date_of_birth && <span className="text-xs text-red-500">{errors.date_of_birth}</span>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 block">Gender <span className="text-red-500">*</span></label>
                                        <Select 
                                            value={data.gender} 
                                            onValueChange={(val) => setData('gender', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.gender && <span className="text-xs text-red-500">{errors.gender}</span>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 block">Nationality</label>
                                        <Input
                                            value={data.nationality}
                                            onChange={(e) => setData('nationality', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 block">Religion</label>
                                        <Select value={data.religion || 'none'} onValueChange={v => setData('religion', v === 'none' ? '' : v)}>
                                            <SelectTrigger><SelectValue placeholder="Select religion" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Not specified</SelectItem>
                                                <SelectItem value="Christianity">Christianity</SelectItem>
                                                <SelectItem value="Islam">Islam</SelectItem>
                                                <SelectItem value="Hinduism">Hinduism</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 block">Blood Group</label>
                                        <Select value={data.blood_group || 'none'} onValueChange={v => setData('blood_group', v === 'none' ? '' : v)}>
                                            <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Not specified</SelectItem>
                                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => (
                                                    <SelectItem key={b} value={b}>{b}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Separator />
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Parents' Details</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 block">Father's Name</label>
                                        <Input value={data.father_name} onChange={e => setData('father_name', e.target.value)} placeholder="Father's full name" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 block">Mother's Name</label>
                                        <Input value={data.mother_name} onChange={e => setData('mother_name', e.target.value)} placeholder="Mother's full name" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 block">Father's Occupation</label>
                                        <Input value={data.father_occupation} onChange={e => setData('father_occupation', e.target.value)} placeholder="Father's occupation" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 block">Mother's Occupation</label>
                                        <Input value={data.mother_occupation} onChange={e => setData('mother_occupation', e.target.value)} placeholder="Mother's occupation" />
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-xs font-semibold text-gray-600 block">Father's Income Range</label>
                                        <Select value={data.father_income_range || 'none'} onValueChange={v => setData('father_income_range', v === 'none' ? '' : v)}>
                                            <SelectTrigger><SelectValue placeholder="Select income range" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Not specified</SelectItem>
                                                <SelectItem value="Below 500,000 TZS">Below 500,000 TZS</SelectItem>
                                                <SelectItem value="500,000 - 1,000,000 TZS">500,000 - 1,000,000 TZS</SelectItem>
                                                <SelectItem value="1,000,000 - 2,000,000 TZS">1,000,000 - 2,000,000 TZS</SelectItem>
                                                <SelectItem value="2,000,000 - 5,000,000 TZS">2,000,000 - 5,000,000 TZS</SelectItem>
                                                <SelectItem value="Above 5,000,000 TZS">Above 5,000,000 TZS</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Separator />
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Address Information</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 block">Country</label>
                                        <Input value={data.country} onChange={e => setData('country', e.target.value)} placeholder="e.g. Tanzania" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 block">Village / Street</label>
                                        <Input value={data.village} onChange={e => setData('village', e.target.value)} placeholder="e.g. Kiboriloni" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 block">Region</label>
                                        <Input value={data.region} onChange={e => setData('region', e.target.value)} placeholder="e.g. Kilimanjaro" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 block">District</label>
                                        <Input value={data.district} onChange={e => setData('district', e.target.value)} placeholder="e.g. Moshi" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 block">Ward</label>
                                        <Input value={data.ward} onChange={e => setData('ward', e.target.value)} placeholder="e.g. Njoro" />
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-xs font-semibold text-gray-600 block">Street Address <span className="text-red-500">*</span></label>
                                        <Textarea
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            rows={2}
                                            required
                                        />
                                        {errors.address && <span className="text-xs text-red-500">{errors.address}</span>}
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-xs font-semibold text-gray-600 block">Additional Details</label>
                                        <Textarea value={data.address_details} onChange={e => setData('address_details', e.target.value)} placeholder="Plot, landmarks, etc." rows={2} />
                                    </div>
                                </div>

                                <Separator />
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Documents</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-600 block">Check Submitted Documents</label>
                                        {[
                                            { id: 'previous_certificate', label: 'Previous Class Certificate' },
                                            { id: 'tc', label: 'Transfer Certificate (TC)' },
                                            { id: 'at', label: 'Academic Transcript' },
                                            { id: 'nbc', label: 'National Birth Certificate' },
                                            { id: 'testimonial', label: 'Testimonial' },
                                        ].map(doc => (
                                            <label key={doc.id} className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                                                    checked={data.submitted_documents.includes(doc.id)}
                                                    onChange={e => {
                                                        const next = e.target.checked
                                                            ? [...data.submitted_documents, doc.id]
                                                            : data.submitted_documents.filter(id => id !== doc.id);
                                                        setData('submitted_documents', next);
                                                    }}
                                                />
                                                <span>{doc.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 block">Upload PDF Documents</label>
                                        <Input
                                            type="file"
                                            multiple
                                            accept=".pdf"
                                            onChange={e => {
                                                const files = Array.from(e.target.files || []);
                                                setData('documents', files);
                                            }}
                                            className="text-xs"
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-1">Upload additional PDF documents.</p>
                                        {student.student_profile?.uploaded_documents && student.student_profile.uploaded_documents.length > 0 && (
                                            <div className="mt-2 space-y-1">
                                                <p className="text-[10px] font-bold text-gray-500">Currently Uploaded:</p>
                                                {student.student_profile.uploaded_documents.map((doc, idx) => (
                                                    <div key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3 shrink-0 text-blue-500" /> {doc.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column (Academic settings) */}
                    <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-bold flex items-center space-x-2 text-green-900">
                                    <GraduationCap className="w-5 h-5 text-green-600" />
                                    <span>Academic Info</span>
                                </CardTitle>
                                <CardDescription>Class assignment settings</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600 block">School Class <span className="text-red-500">*</span></label>
                                    <Select 
                                        value={data.school_class_id} 
                                        onValueChange={(val) => setData('school_class_id', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Assign a class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classes.map((cls) => (
                                                <SelectItem key={cls.id} value={cls.id.toString()}>
                                                    {cls.name} ({cls.level})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.school_class_id && <span className="text-xs text-red-500">{errors.school_class_id}</span>}
                                </div>

                                {student.student_profile?.admission_number && (
                                    <div className="pt-2 border-t border-slate-100">
                                        <p className="text-[11px] font-semibold text-slate-400">Admission Number</p>
                                        <p className="text-sm font-semibold text-slate-700">{student.student_profile.admission_number}</p>
                                    </div>
                                )}
                                {student.student_profile?.admission_date && (
                                    <div className="pt-1">
                                        <p className="text-[11px] font-semibold text-slate-400">Admission Date</p>
                                        <p className="text-sm font-semibold text-slate-700">
                                            {new Date(student.student_profile.admission_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
