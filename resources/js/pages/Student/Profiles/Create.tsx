import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    ArrowLeft, Save, Plus, Trash2,
    User, Users, MapPin, AlertCircle, BookOpen
} from 'lucide-react';

interface SchoolClass { id: number; name: string; level: string }
interface Props { classes: SchoolClass[] }

interface GuardianForm {
    first_name: string;
    last_name: string;
    guardian_name: string;
    relationship: string;
    phone_number: string;
    email: string;
    occupation: string;
    employer: string;
    address: string;
    is_primary_contact: boolean;
    is_emergency_contact: boolean;
    photo?: File | null;
    password?: string;
    password_confirm?: string;
}

const TANZANIA_LOCATIONS: Record<string, string[]> = {
    "Arusha": ["Arusha City", "Arusha Rural", "Hai", "Karatu", "Longido", "Meru", "Monduli", "Ngorongoro"],
    "Dar es Salaam": ["Ilala", "Kinondoni", "Temeke", "Kigamboni", "Ubungo"],
    "Dodoma": ["Dodoma Municipal", "Bahi", "Chamwino", "Chemba", "Kondoa", "Kongwa", "Mpwapwa"],
    "Geita": ["Geita Town", "Geita Rural", "Bukombe", "Chato", "Mbogwe", "Nyang'hwale"],
    "Iringa": ["Iringa Municipal", "Iringa Rural", "Kilolo", "Mufindi"],
    "Kagera": ["Bukoba Municipal", "Bukoba Rural", "Biharamulo", "Karagwe", "Kyerwa", "Missenyi", "Muleba", "Ngara"],
    "Katavi": ["Mpanda Municipal", "Mpanda Rural", "Mlele"],
    "Kigoma": ["Kigoma Municipal", "Kigoma Rural", "Buhigwe", "Kakonko", "Kasulu", "Kibondo", "Uvinza"],
    "Kilimanjaro": ["Moshi Urban", "Moshi Rural", "Hai", "Rombo", "Mwanga", "Same", "Siha"],
    "Lindi": ["Lindi Municipal", "Lindi Rural", "Kilwa", "Liwale", "Nachingwea", "Ruangwa"],
    "Manyara": ["Babati Urban", "Babati Rural", "Hanang", "Kiteto", "Mbulu", "Simanjiro"],
    "Mara": ["Musoma Municipal", "Musoma Rural", "Bunda", "Butiama", "Rorya", "Serengeti", "Tarime"],
    "Mbeya": ["Mbeya City", "Mbeya Rural", "Chunya", "Mbarali", "Rungwe", "Kyela"],
    "Morogoro": ["Morogoro Municipal", "Morogoro Rural", "Gairo", "Kilombero", "Kilosa", "Mvomero", "Ulanga", "Malinyi"],
    "Mtwara": ["Mtwara Municipal", "Mtwara Rural", "Masasi", "Nanyumbu", "Newala", "Tandahimba"],
    "Mwanza": ["Nyamagana", "Ilemela", "Sengerema", "Magu", "Misungwi", "Kwimba", "Ukerewe"],
    "Njombe": ["Njombe Town", "Njombe Rural", "Ludewa", "Makete", "Wanging'ombe"],
    "Pwani": ["Bagamoyo", "Kibaha Urban", "Kibaha Rural", "Kisarawe", "Mafia", "Mkuranga", "Rufiji"],
    "Rukwa": ["Sumbawanga Urban", "Sumbawanga Rural", "Kalambo", "Nkasi"],
    "Ruvuma": ["Songea Municipal", "Songea Rural", "Mbinga", "Namtumbo", "Nyasa", "Tunduru"],
    "Shinyanga": ["Shinyanga Urban", "Shinyanga Rural", "Kahama Town", "Kahama Rural", "Kishapu"],
    "Simiyu": ["Bariadi", "Busega", "Itilima", "Maswa", "Meatu"],
    "Singida": ["Singida Urban", "Singida Rural", "Iramba", "Manyoni", "Mkalama", "Ikungi"],
    "Songwe": ["Mbozi", "Ileje", "Momba", "Songwe"],
    "Tabora": ["Tabora Municipal", "Uyui", "Igunga", "Kaliua", "Nzega", "Sikonge", "Urambo"],
    "Tanga": ["Tanga City", "Handeni Town", "Handeni Rural", "Kilindi", "Korogwe Town", "Korogwe Rural", "Lushoto", "Mkinga", "Muheza", "Pangani"]
};

const COMMON_WARDS: Record<string, string[]> = {
    "Moshi Urban": ["Njoro", "Bondeni", "Mawenzi", "Rau", "Soweto", "Kiboriloni", "Pasua", "Kaloleni", "Karanga", "Msaranga"],
    "Moshi Rural": ["Marangu East", "Marangu West", "Kibosho East", "Kibosho West", "Uru East", "Uru North", "Machame Uro", "Machame Kusini"],
    "Ilala": ["Kariakoo", "Gerezani", "Kisutu", "Kivukoni", "Upanga East", "Upanga West", "Buguruni", "Vingunguti", "Ukonga", "Tabata"],
    "Kinondoni": ["Sinza", "Mikochem", "Kinondoni", "Kijitonyama", "Mwananyamala", "Magomeni", "Ndugumbi", "Tandale"],
    "Temeke": ["Temeke", "Chang'ombe", "Kurasini", "Mtoni", "Yombo Vituka", "Sandali", "Mbagala", "Charambe"]
};

const Err = ({ msg }: { msg?: string }) =>
    msg ? <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3 shrink-0" />{msg}</p> : null;

const FL = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
    <Label className="text-xs font-medium text-slate-500 mb-1 block">
        {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </Label>
);

// Clean section heading with subtle left-accent
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

export default function CreateStudentProfile({ classes }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        first_name: '', middle_name: '', last_name: '',
        email: '', phone: '', date_of_birth: '', gender: '',
        nationality: 'Tanzanian', religion: '',
        address: '', region: '', district: '', ward: '',
        father_name: '', mother_name: '',
        father_occupation: '', mother_occupation: '',
        father_income_range: '', blood_group: '',
        country: 'Tanzania', village: '', address_details: '',
        submitted_documents: [] as string[],
        profile_photo: null as File | null,
        documents: [] as File[],
        school_class_id: '', stream: '', admission_date: new Date().toISOString().split('T')[0],
        boarding_status: 'day', transport_route: '',
        previous_school: '', previous_class: '', transfer_reason: '',
        allergies: '', medications: '', medical_conditions: '', special_needs: '',
        emergency_contact_name: '', emergency_contact_phone: '', emergency_contact_relationship: '',
        scholarship_status: 'none', scholarship_amount: '',
        family_income_range: '', extracurricular_activities: '',
        notes: '',
        guardians: [{
            first_name: '',
            last_name: '',
            guardian_name: '',
            relationship: 'father',
            phone_number: '',
            email: '',
            occupation: '',
            employer: '',
            address: '',
            is_primary_contact: true,
            is_emergency_contact: true,
            photo: null as File | null,
            password: 'OpenSCParent',
            password_confirm: 'OpenSCParent',
        }] as any[],
    });

    useEffect(() => {
        const parts = [data.country, data.region, data.district, data.ward?.startsWith('custom:') ? data.ward.replace('custom:', '') : data.ward, data.village].filter(Boolean);
        let compiled = parts.join(', ');
        if (data.address_details) compiled += (compiled ? ' - ' : '') + data.address_details;
        setData('address', compiled || 'Tanzania');
    }, [data.country, data.region, data.district, data.ward, data.village, data.address_details]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/students/profiles');
    };

    const addGuardian = () => setData('guardians', [...data.guardians, {
        first_name: '', last_name: '', guardian_name: '', relationship: 'mother',
        phone_number: '', email: '', occupation: '', employer: '', address: '',
        is_primary_contact: false, is_emergency_contact: false,
        photo: null as File | null, password: 'OpenSCParent', password_confirm: 'OpenSCParent',
    }]);

    const removeGuardian = (i: number) => {
        if (data.guardians.length === 1) return;
        setData('guardians', data.guardians.filter((_: any, idx: number) => idx !== i));
    };

    const setGuardian = (i: number, field: keyof GuardianForm, value: any) => {
        const updated = [...data.guardians];
        updated[i] = { ...updated[i], [field]: value };
        if (field === 'first_name' || field === 'last_name') {
            updated[i].guardian_name = `${updated[i].first_name || ''} ${updated[i].last_name || ''}`.trim();
        }
        if (field === 'is_primary_contact' && value) {
            updated.forEach((g: any, idx: number) => { g.is_primary_contact = idx === i; });
        }
        setData('guardians', updated);
    };

    const totalErrors = Object.keys(errors).length;

    const panel = "bg-white rounded-xl shadow-sm p-6 space-y-5";

    return (
        <AppLayout>
            <Head title="Register Student" />
            <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleSubmit}>

                    {/* ── Sticky Header ── */}
                    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <Link href="/students/profiles"><ArrowLeft className="h-4 w-4" /></Link>
                            </Button>
                            <div>
                                <h1 className="text-base font-bold text-slate-900">Student Admission</h1>
                                <p className="text-xs text-slate-400">Register and enroll a new student into the system</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="ghost" size="sm" className="text-slate-500" asChild>
                                <Link href="/students/profiles">Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing} size="sm" className="bg-blue-700 hover:bg-blue-800 text-white px-5">
                                <Save className="mr-1.5 h-3.5 w-3.5" />
                                {processing ? 'Registering...' : 'Register Student'}
                            </Button>
                        </div>
                    </div>

                    {/* ── Error Banner ── */}
                    {totalErrors > 0 && (
                        <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                            <p className="text-xs text-red-600 font-medium">Please correct the {totalErrors} highlighted field(s) before submitting.</p>
                        </div>
                    )}

                    {/* ── Main Content ── */}
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-5">

                        {/* ══ LEFT COLUMN ══ */}
                        <div className="space-y-5">

                            {/* Personal Information */}
                            <div className={panel}>
                                <SectionHeading icon={User} title="Personal Information" />

                                {/* Name row */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <FL required>First Name</FL>
                                        <Input value={data.first_name} onChange={e => setData('first_name', e.target.value)} placeholder="First name" className={errors.first_name ? 'border-red-400' : ''} />
                                        <Err msg={errors.first_name} />
                                    </div>
                                    <div>
                                        <FL>Middle Name</FL>
                                        <Input value={data.middle_name} onChange={e => setData('middle_name', e.target.value)} placeholder="Middle name" />
                                    </div>
                                    <div>
                                        <FL required>Last Name</FL>
                                        <Input value={data.last_name} onChange={e => setData('last_name', e.target.value)} placeholder="Last name" className={errors.last_name ? 'border-red-400' : ''} />
                                        <Err msg={errors.last_name} />
                                    </div>
                                </div>

                                {/* Parents */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <FL required>Father's Name</FL>
                                        <Input value={data.father_name} onChange={e => setData('father_name', e.target.value)} placeholder="Father's full name" className={errors.father_name ? 'border-red-400' : ''} />
                                        <Err msg={errors.father_name} />
                                    </div>
                                    <div>
                                        <FL required>Mother's Name</FL>
                                        <Input value={data.mother_name} onChange={e => setData('mother_name', e.target.value)} placeholder="Mother's full name" className={errors.mother_name ? 'border-red-400' : ''} />
                                        <Err msg={errors.mother_name} />
                                    </div>
                                </div>

                                {/* DOB / Email */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <FL required>Date of Birth</FL>
                                        <Input type="date" value={data.date_of_birth} onChange={e => setData('date_of_birth', e.target.value)} className={errors.date_of_birth ? 'border-red-400' : ''} />
                                        <Err msg={errors.date_of_birth} />
                                    </div>
                                    <div>
                                        <FL>Student Email <span className="text-slate-300">(optional)</span></FL>
                                        <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="student@example.com" />
                                    </div>
                                </div>

                                {/* Gender */}
                                <div>
                                    <FL required>Sex</FL>
                                    <div className="flex gap-5 mt-1">
                                        {['male', 'female'].map(g => (
                                            <label key={g} className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="gender" value={g} checked={data.gender === g} onChange={() => setData('gender', g)} className="h-4 w-4 accent-blue-700" />
                                                <span className="text-sm text-slate-700 capitalize">{g}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <Err msg={errors.gender} />
                                </div>

                                {/* Occupations */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <FL required>Father's Occupation</FL>
                                        <Input value={data.father_occupation} onChange={e => setData('father_occupation', e.target.value)} placeholder="e.g., Farmer" className={errors.father_occupation ? 'border-red-400' : ''} />
                                        <Err msg={errors.father_occupation} />
                                    </div>
                                    <div>
                                        <FL required>Mother's Occupation</FL>
                                        <Input value={data.mother_occupation} onChange={e => setData('mother_occupation', e.target.value)} placeholder="e.g., Teacher" className={errors.mother_occupation ? 'border-red-400' : ''} />
                                        <Err msg={errors.mother_occupation} />
                                    </div>
                                </div>

                                {/* Income / Blood */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <FL required>Father's Income Range</FL>
                                        <Select value={data.father_income_range || 'none'} onValueChange={v => setData('father_income_range', v === 'none' ? '' : v)}>
                                            <SelectTrigger className={errors.father_income_range ? 'border-red-400' : ''}>
                                                <SelectValue placeholder="Select range" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Select Income Range</SelectItem>
                                                <SelectItem value="Below 500,000 TZS">Below 500,000 TZS</SelectItem>
                                                <SelectItem value="500,000 - 1,000,000 TZS">500k – 1M TZS</SelectItem>
                                                <SelectItem value="1,000,000 - 2,000,000 TZS">1M – 2M TZS</SelectItem>
                                                <SelectItem value="2,000,000 - 5,000,000 TZS">2M – 5M TZS</SelectItem>
                                                <SelectItem value="Above 5,000,000 TZS">Above 5M TZS</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Err msg={errors.father_income_range} />
                                    </div>
                                    <div>
                                        <FL>Blood Type</FL>
                                        <Select value={data.blood_group || 'none'} onValueChange={v => setData('blood_group', v === 'none' ? '' : v)}>
                                            <SelectTrigger><SelectValue placeholder="Select blood type" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Select Blood Type</SelectItem>
                                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => (
                                                    <SelectItem key={b} value={b}>{b}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Additional / Academic Information */}
                            <div className={panel}>
                                <SectionHeading icon={BookOpen} title="Additional Information" />

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <FL required>Class</FL>
                                        <Select value={data.school_class_id} onValueChange={v => setData('school_class_id', v)}>
                                            <SelectTrigger className={errors.school_class_id ? 'border-red-400' : ''}>
                                                <SelectValue placeholder="Select class..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classes.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name} — {c.level}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Err msg={errors.school_class_id} />
                                    </div>
                                    <div>
                                        <FL required>Religion</FL>
                                        <Select value={data.religion || 'none'} onValueChange={v => setData('religion', v === 'none' ? '' : v)}>
                                            <SelectTrigger className={errors.religion ? 'border-red-400' : ''}>
                                                <SelectValue placeholder="Select religion" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Select Religion</SelectItem>
                                                <SelectItem value="Christianity">Christianity</SelectItem>
                                                <SelectItem value="Islam">Islam</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Err msg={errors.religion} />
                                    </div>
                                </div>

                                {/* Photo + Documents side by side */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Student Photo */}
                                    <div>
                                        <FL required>Student's Photo</FL>
                                        <div className="flex flex-col gap-2">
                                            <div className="w-full h-28 rounded-lg bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                                                {data.profile_photo ? (
                                                    <img src={URL.createObjectURL(data.profile_photo)} alt="Preview" className="h-full w-full object-cover rounded-lg" />
                                                ) : (
                                                    <div className="flex flex-col items-center text-slate-300">
                                                        <User className="h-8 w-8 mb-1" />
                                                        <span className="text-[10px]">No photo</span>
                                                    </div>
                                                )}
                                            </div>
                                            <input type="file" id="student-photo-upload" accept="image/*" onChange={e => setData('profile_photo', e.target.files?.[0] || null)} className="sr-only" />
                                            <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('student-photo-upload')?.click()} className="text-xs w-full">
                                                Upload Photo
                                            </Button>
                                        </div>
                                        <Err msg={errors.profile_photo} />
                                    </div>

                                    {/* Submitted Documents checklist */}
                                    <div>
                                        <FL>Submitted Documents</FL>
                                        <div className="rounded-lg bg-slate-50 p-3 space-y-2">
                                            {[
                                                { id: 'previous_certificate', label: 'Previous Certificate' },
                                                { id: 'tc', label: 'Transfer Certificate (TC)' },
                                                { id: 'at', label: 'Academic Transcript' },
                                                { id: 'nbc', label: 'Birth Certificate (NBC)' },
                                                { id: 'testimonial', label: 'Testimonial' },
                                            ].map(doc => (
                                                <label key={doc.id} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="h-3.5 w-3.5 rounded accent-blue-700"
                                                        checked={data.submitted_documents.includes(doc.id)}
                                                        onChange={e => {
                                                            const next = e.target.checked
                                                                ? [...data.submitted_documents, doc.id]
                                                                : data.submitted_documents.filter(id => id !== doc.id);
                                                            setData('submitted_documents', next);
                                                        }}
                                                    />
                                                    <span className="text-xs text-slate-600">{doc.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* File Upload */}
                                <div>
                                    <FL>Upload Document Files <span className="text-slate-300">(PDF)</span></FL>
                                    <Input
                                        type="file" multiple accept=".pdf"
                                        onChange={e => setData('documents', Array.from(e.target.files || []))}
                                        className="text-xs"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Upload one or more PDFs (certificates, transcripts, etc.)</p>
                                    {data.documents && data.documents.length > 0 && (
                                        <div className="mt-1.5 space-y-0.5">
                                            {data.documents.map((file, idx) => (
                                                <p key={idx} className="text-[10px] text-slate-500">✓ {file.name}</p>
                                            ))}
                                        </div>
                                    )}
                                    <Err msg={errors.documents} />
                                </div>
                            </div>
                        </div>

                        {/* ══ RIGHT COLUMN ══ */}
                        <div className="space-y-5">

                            {/* Address Information */}
                            <div className={panel}>
                                <SectionHeading icon={MapPin} title="Address Information" />

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <FL required>Country</FL>
                                        <Select value={data.country} onValueChange={v => setData('country', v)}>
                                            <SelectTrigger><SelectValue placeholder="Select Country" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Tanzania">Tanzania</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <FL required>Region</FL>
                                        <Select value={data.region} onValueChange={v => { setData(d => ({ ...d, region: v, district: '', ward: '' })); }}>
                                            <SelectTrigger className={errors.region ? 'border-red-400' : ''}>
                                                <SelectValue placeholder="Select Region" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.keys(TANZANIA_LOCATIONS).map(r => (
                                                    <SelectItem key={r} value={r}>{r}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Err msg={errors.region} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <FL required>District</FL>
                                        <Select value={data.district} onValueChange={v => { setData(d => ({ ...d, district: v, ward: '' })); }} disabled={!data.region}>
                                            <SelectTrigger className={errors.district ? 'border-red-400' : ''}>
                                                <SelectValue placeholder={data.region ? 'Select District' : 'Select region first'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {data.region && TANZANIA_LOCATIONS[data.region]?.map(dist => (
                                                    <SelectItem key={dist} value={dist}>{dist}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Err msg={errors.district} />
                                    </div>
                                    <div>
                                        <FL>Ward</FL>
                                        {data.district && COMMON_WARDS[data.district] && !data.ward?.startsWith('custom:') ? (
                                            <Select value={data.ward} onValueChange={v => setData('ward', v === 'Other' ? 'custom:' : v)}>
                                                <SelectTrigger><SelectValue placeholder="Select Ward" /></SelectTrigger>
                                                <SelectContent>
                                                    {COMMON_WARDS[data.district].map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                                                    <SelectItem value="Other">Other…</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <div className="flex gap-1">
                                                <Input
                                                    value={data.ward?.startsWith('custom:') ? data.ward.replace('custom:', '') : data.ward}
                                                    onChange={e => setData('ward', 'custom:' + e.target.value)}
                                                    placeholder="Type ward name"
                                                />
                                                {data.district && COMMON_WARDS[data.district] && (
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => setData('ward', '')} className="text-xs px-2 text-blue-600 shrink-0">↩ List</Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <FL>Village / Street</FL>
                                    <Input value={data.village} onChange={e => setData('village', e.target.value)} placeholder="Enter village or street name" />
                                </div>

                                <div>
                                    <FL>Additional Details</FL>
                                    <Textarea value={data.address_details} onChange={e => setData('address_details', e.target.value)} placeholder="Apartment, plot, landmarks, etc." rows={2} />
                                </div>
                            </div>

                            {/* Parent / Guardian Information */}
                            <div className={panel}>
                                <SectionHeading
                                    icon={Users}
                                    title="Parent / Guardian Information"
                                    action={
                                        <Button type="button" variant="outline" size="sm" onClick={addGuardian} className="h-7 text-xs gap-1">
                                            <Plus className="h-3 w-3" /> Add Guardian
                                        </Button>
                                    }
                                />

                                <div className="space-y-6">
                                    {data.guardians.map((g: any, i: number) => (
                                        <div key={i} className="relative">
                                            {/* Guardian divider label */}
                                            {i > 0 && (
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="flex-1 h-px bg-slate-100" />
                                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Guardian {i + 1}</span>
                                                    <div className="flex-1 h-px bg-slate-100" />
                                                    <Button type="button" variant="ghost" size="icon" className="h-5 w-5 text-slate-400 hover:text-red-500" onClick={() => removeGuardian(i)}>
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <FL required>First Name</FL>
                                                    <Input value={g.first_name || ''} onChange={e => setGuardian(i, 'first_name', e.target.value)} placeholder="First name" className={errors[`guardians.${i}.first_name` as any] ? 'border-red-400' : ''} />
                                                    <Err msg={errors[`guardians.${i}.first_name` as any]} />
                                                </div>
                                                <div>
                                                    <FL required>Last Name</FL>
                                                    <Input value={g.last_name || ''} onChange={e => setGuardian(i, 'last_name', e.target.value)} placeholder="Last name" className={errors[`guardians.${i}.last_name` as any] ? 'border-red-400' : ''} />
                                                    <Err msg={errors[`guardians.${i}.last_name` as any]} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mt-3">
                                                <div>
                                                    <FL required>Relation</FL>
                                                    <Input value={g.relationship} onChange={e => setGuardian(i, 'relationship', e.target.value)} placeholder="e.g., Father, Mother" className={errors[`guardians.${i}.relationship` as any] ? 'border-red-400' : ''} />
                                                    <Err msg={errors[`guardians.${i}.relationship` as any]} />
                                                </div>
                                                <div>
                                                    <FL required>Email</FL>
                                                    <Input type="email" value={g.email} onChange={e => setGuardian(i, 'email', e.target.value)} placeholder="guardian@example.com" className={errors[`guardians.${i}.email` as any] ? 'border-red-400' : ''} />
                                                    <Err msg={errors[`guardians.${i}.email` as any]} />
                                                </div>
                                            </div>

                                            <div className="mt-3">
                                                <FL required>Phone Number</FL>
                                                <div className="flex rounded-md overflow-hidden border border-input focus-within:ring-1 focus-within:ring-ring">
                                                    <span className="flex items-center px-3 bg-slate-50 text-slate-500 text-xs font-semibold border-r border-input">+255</span>
                                                    <Input
                                                        value={g.phone_number}
                                                        onChange={e => setGuardian(i, 'phone_number', e.target.value.replace(/\D/g, '').substring(0, 9))}
                                                        placeholder="682814583"
                                                        className="border-0 focus-visible:ring-0 rounded-none"
                                                        maxLength={9}
                                                    />
                                                </div>
                                                <Err msg={errors[`guardians.${i}.phone_number` as any]} />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mt-3">
                                                <div>
                                                    <FL required>Password</FL>
                                                    <Input type="password" value={g.password || ''} onChange={e => setGuardian(i, 'password', e.target.value)} placeholder="••••••••" className={errors[`guardians.${i}.password` as any] ? 'border-red-400' : ''} />
                                                    <Err msg={errors[`guardians.${i}.password` as any]} />
                                                </div>
                                                <div>
                                                    <FL required>Confirm Password</FL>
                                                    <Input type="password" value={g.password_confirm || ''} onChange={e => setGuardian(i, 'password_confirm', e.target.value)} placeholder="••••••••" className={errors[`guardians.${i}.password_confirm` as any] ? 'border-red-400' : ''} />
                                                    <Err msg={errors[`guardians.${i}.password_confirm` as any]} />
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1">Default: <code className="bg-slate-100 px-1 rounded">OpenSCParent</code> — change if needed (8–20 characters)</p>

                                            {/* Guardian Photo */}
                                            <div className="mt-3">
                                                <FL>Guardian Photo</FL>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-16 w-16 rounded-lg bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                                        {g.photo ? (
                                                            <img src={URL.createObjectURL(g.photo)} alt="Preview" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <User className="h-6 w-6 text-slate-300" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <input type="file" id={`guardian-photo-upload-${i}`} accept="image/*" onChange={e => setGuardian(i, 'photo', e.target.files?.[0] || null)} className="sr-only" />
                                                        <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById(`guardian-photo-upload-${i}`)?.click()} className="text-xs">
                                                            Select Photo
                                                        </Button>
                                                        {g.photo && <p className="text-[10px] text-slate-400 mt-1 max-w-[120px] truncate">{g.photo.name}</p>}
                                                    </div>
                                                </div>
                                                <Err msg={errors[`guardians.${i}.photo` as any]} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Bottom Bar ── */}
                    <div className="sticky bottom-0 bg-white/95 backdrop-blur px-6 py-3 flex items-center justify-between">
                        <Button type="button" variant="ghost" className="text-slate-500" asChild>
                            <Link href="/students/profiles">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-blue-700 hover:bg-blue-800 text-white px-8">
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Registering Student...' : 'Register Student'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
