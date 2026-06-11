import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    User, GraduationCap, Users, Phone, Mail, MapPin, Calendar,
    Hash, BookOpen, Briefcase, Activity, Download, FileText,
    Clock, ChevronDown, ChevronUp, Lock, Edit, School,
    Heart, Shield, Star, DollarSign, ClipboardList, Library,
    AlertCircle, CheckCircle2
} from 'lucide-react';

/* ────────────────────────────────────────────────────────── */
/* Type Definitions                                            */
/* ────────────────────────────────────────────────────────── */

interface StudentProfile {
    admission_number: string; admission_date: string; stream: string;
    boarding_status: string; transport_route?: string;
    previous_school?: string; previous_class?: string; transfer_reason?: string;
    allergies?: string; medications?: string;
    emergency_contact_name?: string; emergency_contact_phone?: string;
    emergency_contact_relationship?: string;
    special_needs?: any; medical_info?: any;
    scholarship_status?: string; scholarship_amount?: number;
    family_income_range?: string; extracurricular_activities?: any; notes?: string;
    school_class?: { name: string; level: string } | null;
    father_name?: string; mother_name?: string;
    father_occupation?: string; mother_occupation?: string;
    father_income_range?: string; blood_group?: string;
    religion?: string; nationality?: string;
    country?: string; region?: string; district?: string; ward?: string; village?: string;
    address_details?: string;
    submitted_documents?: string[];
    uploaded_documents?: { name: string; path: string }[];
}

interface Guardian {
    id: number; guardian_name: string; relationship: string;
    phone_number: string; email?: string; occupation?: string;
    employer?: string; address?: string;
    is_primary_contact: boolean; is_emergency_contact: boolean;
    photo?: string | null;
}

interface Student {
    id: number; name: string; email: string; phone?: string;
    student_number: string; date_of_birth: string; gender: string;
    address: string; is_active: boolean; created_at: string;
    profile_photo?: string | null;
    student_profile?: StudentProfile | null;
    guardians: Guardian[];
    medical_records?: any[];
    disciplinary_records?: any[];
}

interface Props { student: Student }

/* ────────────────────────────────────────────────────────── */
/* Helpers                                                    */
/* ────────────────────────────────────────────────────────── */

function initials(name: string) {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

function fmtDate(d?: string | null, short = false) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', short
        ? { day: '2-digit', month: 'short', year: 'numeric' }
        : { day: '2-digit', month: 'long', year: 'numeric' });
}

function ageYrs(dob: string) {
    if (!dob) return '';
    return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000));
}

const DOC_LABELS: Record<string, string> = {
    previous_certificate: 'Previous Certificate',
    tc: 'Transfer Certificate (TC)',
    at: 'Academic Transcript',
    nbc: 'Birth Certificate (NBC)',
    testimonial: 'Testimonial',
};

/* ────────────────────────────────────────────────────────── */
/* Small reusable components                                  */
/* ────────────────────────────────────────────────────────── */

function SideInfoRow({ label, value }: { label: string; value?: string | null }) {
    if (!value) return null;
    return (
        <div className="flex items-start justify-between py-1.5 border-b border-slate-100 last:border-0">
            <span className="text-xs text-slate-500 shrink-0 w-28">{label}</span>
            <span className="text-xs font-medium text-slate-800 text-right capitalize leading-relaxed">{value}</span>
        </div>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h3 className="text-sm font-bold text-slate-800 mb-4">{children}</h3>
    );
}

/* ────────────────────────────────────────────────────────── */
/* Tab types                                                  */
/* ────────────────────────────────────────────────────────── */
type Tab = 'details' | 'timetable' | 'attendance' | 'fees' | 'exams' | 'library';

/* ────────────────────────────────────────────────────────── */
/* Main Component                                             */
/* ────────────────────────────────────────────────────────── */

export default function ShowStudentProfile({ student }: Props) {
    const profile = student.student_profile;
    const [activeTab, setActiveTab] = useState<Tab>('details');
    const [openExam, setOpenExam] = useState<number | null>(0);

    const rollNo = 35000 + student.id;

    const tabDefs: { id: Tab; icon: any; label: string }[] = [
        { id: 'details',    icon: User,          label: 'Student Details' },
        { id: 'timetable',  icon: Calendar,      label: 'Time Table' },
        { id: 'attendance', icon: ClipboardList, label: 'Leave & Attendance' },
        { id: 'fees',       icon: DollarSign,    label: 'Fees' },
        { id: 'exams',      icon: GraduationCap, label: 'Exam & Results' },
        { id: 'library',    icon: Library,       label: 'Library' },
    ];

    /* ── Sample exam data ── */
    const exams = [
        {
            name: 'Monthly Test (May)', rank: 4, passed: true,
            subjects: [
                { name: 'English',     total: 150, max: 100, min: 35, obtained: 78, pass: true },
                { name: 'Mathematics', total: 214, max: 100, min: 35, obtained: 89, pass: true },
                { name: 'Physics',     total: 120, max: 100, min: 35, obtained: 62, pass: true },
                { name: 'Chemistry',   total: 110, max: 100, min: 35, obtained: 91, pass: true },
                { name: 'Biology',     total: 130, max: 100, min: 35, obtained: 55, pass: true },
            ],
        },
        {
            name: 'Monthly Test (Apr)', rank: 6, passed: true,
            subjects: [
                { name: 'English',     total: 150, max: 100, min: 35, obtained: 71, pass: true },
                { name: 'Mathematics', total: 214, max: 100, min: 35, obtained: 80, pass: true },
                { name: 'Physics',     total: 120, max: 100, min: 35, obtained: 58, pass: true },
                { name: 'Chemistry',   total: 110, max: 100, min: 35, obtained: 85, pass: true },
                { name: 'Biology',     total: 130, max: 100, min: 35, obtained: 50, pass: true },
            ],
        },
        {
            name: 'Monthly Test (Mar)', rank: 8, passed: true,
            subjects: [
                { name: 'English',     total: 150, max: 100, min: 35, obtained: 65, pass: true },
                { name: 'Mathematics', total: 214, max: 100, min: 35, obtained: 74, pass: true },
                { name: 'Physics',     total: 120, max: 100, min: 35, obtained: 42, pass: true },
                { name: 'Chemistry',   total: 110, max: 100, min: 35, obtained: 79, pass: true },
                { name: 'Biology',     total: 130, max: 100, min: 35, obtained: 48, pass: true },
            ],
        },
    ];

    /* ── Sample leave data ── */
    const leaves = [
        { type: 'Casual Leave',  from: '07 May 2024', to: '07 May 2024', days: 1, applied: '07 May 2024', status: 'Approved' },
        { type: 'Casual Leave',  from: '08 May 2024', to: '08 May 2024', days: 1, applied: '04 May 2024', status: 'Approved' },
        { type: 'Casual Leave',  from: '20 May 2024', to: '20 May 2024', days: 1, applied: '19 May 2024', status: 'Pending' },
        { type: 'Medical Leave', from: '05 May 2024', to: '09 May 2024', days: 5, applied: '05 May 2024', status: 'Approved' },
        { type: 'Medical Leave', from: '08 May 2024', to: '11 May 2024', days: 4, applied: '07 May 2024', status: 'Pending' },
        { type: 'Special Leave', from: '09 May 2024', to: '09 May 2024', days: 1, applied: '09 May 2024', status: 'Pending' },
    ];

    /* ── Sample fees data ── */
    const fees = [
        { group: 'Annual Registration Fee',   code: 'reg-2024',       due: '10 Jan 2024', amount: 50000,  status: 'Paid',    ref: '#10001', mode: 'Cash',  paid: '05 Jan 2024', disc: '0%' },
        { group: 'Term 1 Tuition Fee',        code: 'term1-fees',     due: '10 Feb 2024', amount: 250000, status: 'Paid',    ref: '#10002', mode: 'Bank',  paid: '01 Feb 2024', disc: '0%' },
        { group: 'Term 2 Tuition Fee',        code: 'term2-fees',     due: '10 May 2024', amount: 250000, status: 'Paid',    ref: '#10009', mode: 'MPesa', paid: '01 May 2024', disc: '5%' },
        { group: 'Term 3 Tuition Fee',        code: 'term3-fees',     due: '10 Aug 2024', amount: 250000, status: 'Unpaid',  ref: '—',      mode: '—',     paid: '—',           disc: '—'  },
        { group: 'Boarding Fee (Term 1)',      code: 'board-t1-2024',  due: '10 Feb 2024', amount: 180000, status: 'Paid',    ref: '#10004', mode: 'Cash',  paid: '03 Feb 2024', disc: '0%' },
        { group: 'Exam Fee',                  code: 'exam-fee-2024',  due: '10 Mar 2024', amount: 30000,  status: 'Paid',    ref: '#10005', mode: 'Cash',  paid: '09 Mar 2024', disc: '0%' },
    ];

    /* ── Weekly timetable ── */
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const subjectColors = [
        'bg-green-50 border-green-200 text-green-800',
        'bg-blue-50 border-blue-200 text-blue-800',
        'bg-purple-50 border-purple-200 text-purple-800',
        'bg-yellow-50 border-yellow-200 text-yellow-800',
        'bg-pink-50 border-pink-200 text-pink-800',
        'bg-orange-50 border-orange-200 text-orange-800',
    ];
    const sampleSlots = [
        { time: '08:00 - 08:45', subjects: ['Maths', 'Spanish', 'Computer', 'Physics', 'English', 'Kiswahili'], teachers: ['Mr. Daniel', 'Ms. Teresa', 'Mr. Aaron', 'Ms. Hellana', 'Ms. Erickson', 'Mr. Juma'] },
        { time: '08:45 - 09:30', subjects: ['English', 'Physics', 'Science', 'Computer', 'Spanish', 'Biology'], teachers: ['Ms. Hellana', 'Ms. Teresa', 'Mr. Morgan', 'Mr. Daniel', 'Ms. Erickson', 'Ms. Grace'] },
        { time: '09:45 - 10:30', subjects: ['Computer', 'Chemistry', 'Maths', 'English', 'Physics', 'History'], teachers: ['Mr. Daniel', 'Mr. Aaron', 'Ms. Jacquelin', 'Ms. Hellana', 'Ms. Teresa', 'Mr. Baraka'] },
        { time: '10:30 - 11:15', subjects: ['Spanish', 'Maths', 'Chemistry', 'Science', 'Chemistry', 'Chemistry'], teachers: ['Ms. Erickson', 'Ms. Jacquelin', 'Mr. Aaron', 'Mr. Morgan', 'Ms. Hellana', 'Ms. Grace'] },
    ];

    return (
        <AppLayout>
            <Head title={`${student.name} — Student Details`} />

            <div className="flex h-full flex-1 flex-col bg-slate-50/60 dark:bg-zinc-950">

                {/* ── Top Bar ── */}
                <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800">
                    <div>
                        <h1 className="text-lg font-bold text-slate-800 dark:text-white">Student Details</h1>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                            <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
                            <span>/</span>
                            <Link href="/students/profiles" className="hover:text-blue-600">Student</Link>
                            <span>/</span>
                            <span className="text-slate-600">Student Details</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 text-xs font-semibold border-slate-200 text-slate-700 gap-1.5"
                            onClick={() => {
                                const msg = `Student Login\nEmail: ${student.email}\nDefault Password: ${student.student_number}`;
                                alert(msg);
                            }}
                        >
                            <Lock className="h-3.5 w-3.5" /> Login Details
                        </Button>
                        <Button size="sm" className="h-9 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5" asChild>
                            <Link href={`/students/profiles/${student.id}/edit`}>
                                <Edit className="h-3.5 w-3.5" /> Edit Student
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="flex flex-1 overflow-hidden">

                    {/* ══ LEFT SIDEBAR ══ */}
                    <aside className="w-60 shrink-0 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 overflow-y-auto flex flex-col">

                        {/* Avatar & Name */}
                        <div className="flex flex-col items-center pt-8 pb-5 px-4 border-b border-slate-100">
                            <div className="relative mb-3">
                                <Avatar className="h-20 w-20 border-4 border-white shadow-md">
                                    {student.profile_photo ? (
                                        <img src={`/storage/${student.profile_photo}`} alt={student.name} className="h-full w-full object-cover rounded-full" />
                                    ) : (
                                        <AvatarFallback className={`text-xl font-bold ${student.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                            {initials(student.name)}
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${student.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                    <span className={`h-1 w-1 rounded-full ${student.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                    {student.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <h2 className="text-sm font-bold text-slate-800 dark:text-white text-center mt-2">{student.name}</h2>
                            <p className="text-xs text-blue-600 font-semibold font-mono mt-0.5">{student.student_number}</p>
                        </div>

                        {/* Basic Information */}
                        <div className="px-4 py-4 border-b border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Basic Information</p>
                            <SideInfoRow label="Roll No" value={String(rollNo)} />
                            <SideInfoRow label="Gender" value={student.gender} />
                            <SideInfoRow label="Date of Birth" value={fmtDate(student.date_of_birth, true)} />
                            <SideInfoRow label="Blood Group" value={profile?.blood_group} />
                            <SideInfoRow label="Religion" value={profile?.religion} />
                            <SideInfoRow label="Nationality" value={profile?.nationality || 'Tanzanian'} />
                            <SideInfoRow label="Class" value={profile?.school_class?.name} />
                            <SideInfoRow label="Section" value={profile?.stream} />
                            <SideInfoRow label="Boarding" value={profile?.boarding_status?.replace(/_/g, ' ')} />
                        </div>

                        {/* Add Fees Button */}
                        <div className="px-4 py-3 border-b border-slate-100">
                            <Button
                                className="w-full h-9 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => alert('Opening fee collection for ' + student.name)}
                            >
                                <DollarSign className="h-3.5 w-3.5 mr-1.5" /> Add Fees
                            </Button>
                        </div>

                        {/* Primary Contact Info */}
                        <div className="px-4 py-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Primary Contact Info</p>
                            <div className="space-y-2.5">
                                <div className="flex items-start gap-2">
                                    <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                        <Phone className="h-3 w-3 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400">Phone Number</p>
                                        <p className="text-xs font-semibold text-slate-700">{student.phone || student.guardians?.[0]?.phone_number || '—'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                        <Mail className="h-3 w-3 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400">Email Address</p>
                                        <p className="text-xs font-semibold text-slate-700 break-all">{student.email}</p>
                                    </div>
                                </div>
                                {profile?.emergency_contact_phone && (
                                    <div className="flex items-start gap-2">
                                        <div className="h-7 w-7 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                            <Shield className="h-3 w-3 text-red-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400">Emergency</p>
                                            <p className="text-xs font-semibold text-slate-700">{profile.emergency_contact_phone}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* ══ RIGHT CONTENT AREA ══ */}
                    <div className="flex-1 flex flex-col overflow-hidden">

                        {/* Tab Bar */}
                        <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 flex items-center gap-1 overflow-x-auto">
                            {tabDefs.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveTab(t.id)}
                                    className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === t.id
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }`}
                                >
                                    <t.icon className="h-3.5 w-3.5" />
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto p-6">

                            {/* ══════════════════════════════════════════ */}
                            {/*  STUDENT DETAILS TAB                       */}
                            {/* ══════════════════════════════════════════ */}
                            {activeTab === 'details' && (
                                <div className="space-y-6">

                                    {/* Parents Information */}
                                    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 p-6">
                                        <SectionTitle>Parents Information</SectionTitle>
                                        <div className="space-y-4">
                                            {student.guardians && student.guardians.length > 0 ? (
                                                student.guardians.map((g, i) => (
                                                    <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40">
                                                        <Avatar className="h-12 w-12 border shrink-0">
                                                            {g.photo ? (
                                                                <img src={`/storage/${g.photo}`} alt={g.guardian_name} className="h-full w-full object-cover rounded-full" />
                                                            ) : (
                                                                <AvatarFallback className="bg-violet-100 text-violet-700 font-bold text-sm">
                                                                    {initials(g.guardian_name)}
                                                                </AvatarFallback>
                                                            )}
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <p className="font-bold text-sm text-slate-800 dark:text-white">{g.guardian_name}</p>
                                                                {g.is_primary_contact && (
                                                                    <span className="text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                                                        <Star className="h-2 w-2" /> Primary
                                                                    </span>
                                                                )}
                                                                {g.is_emergency_contact && (
                                                                    <span className="text-[9px] font-bold bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded-full">
                                                                        Emergency
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-blue-600 font-semibold capitalize">{g.relationship}</p>
                                                        </div>
                                                        <div className="text-right hidden sm:block">
                                                            <p className="text-[10px] text-slate-400 mb-0.5">Phone</p>
                                                            <p className="text-xs font-semibold text-slate-700">{g.phone_number || '—'}</p>
                                                        </div>
                                                        <div className="text-right hidden md:block">
                                                            <p className="text-[10px] text-slate-400 mb-0.5">Email</p>
                                                            <p className="text-xs font-semibold text-slate-700 break-all">{g.email || '—'}</p>
                                                        </div>
                                                        <div className="flex flex-col gap-1.5 shrink-0">
                                                            <button className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors" title="View guardian profile">
                                                                <User className="h-3.5 w-3.5 text-white" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                /* Fallback from profile data */
                                                <div className="space-y-3">
                                                    {profile?.father_name && (
                                                        <div className="flex items-center gap-4 p-4 rounded-lg border border-slate-100 bg-slate-50/50">
                                                            <Avatar className="h-12 w-12 border shrink-0">
                                                                <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-sm">
                                                                    {initials(profile.father_name)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <p className="font-bold text-sm text-slate-800">{profile.father_name}</p>
                                                                <p className="text-xs text-blue-600 font-semibold">Father</p>
                                                            </div>
                                                            <div className="text-right hidden sm:block">
                                                                <p className="text-[10px] text-slate-400">Occupation</p>
                                                                <p className="text-xs font-semibold text-slate-700 capitalize">{profile.father_occupation || '—'}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {profile?.mother_name && (
                                                        <div className="flex items-center gap-4 p-4 rounded-lg border border-slate-100 bg-slate-50/50">
                                                            <Avatar className="h-12 w-12 border shrink-0">
                                                                <AvatarFallback className="bg-pink-100 text-pink-700 font-bold text-sm">
                                                                    {initials(profile.mother_name)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <p className="font-bold text-sm text-slate-800">{profile.mother_name}</p>
                                                                <p className="text-xs text-pink-600 font-semibold">Mother</p>
                                                            </div>
                                                            <div className="text-right hidden sm:block">
                                                                <p className="text-[10px] text-slate-400">Occupation</p>
                                                                <p className="text-xs font-semibold text-slate-700 capitalize">{profile.mother_occupation || '—'}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {!profile?.father_name && !profile?.mother_name && (
                                                        <p className="text-center text-sm text-slate-400 py-6">No guardian information recorded</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                        {/* Documents */}
                                        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 p-6">
                                            <SectionTitle>Documents</SectionTitle>
                                            <div className="space-y-2">
                                                {(profile?.submitted_documents && profile.submitted_documents.length > 0) ? (
                                                    profile.submitted_documents.map(docId => (
                                                        <div key={docId} className="flex items-center justify-between p-3 rounded-md border border-slate-100 bg-slate-50/50">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="h-8 w-8 rounded-md bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                                                                    <FileText className="h-4 w-4 text-red-500" />
                                                                </div>
                                                                <p className="text-xs font-semibold text-slate-700">{DOC_LABELS[docId] || docId}.pdf</p>
                                                            </div>
                                                            <button className="h-7 w-7 rounded-md bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors">
                                                                <Download className="h-3.5 w-3.5 text-white" />
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    profile?.uploaded_documents && profile.uploaded_documents.length > 0 ? (
                                                        profile.uploaded_documents.map((doc, idx) => (
                                                            <div key={idx} className="flex items-center justify-between p-3 rounded-md border border-slate-100 bg-slate-50/50">
                                                                <div className="flex items-center gap-2.5">
                                                                    <div className="h-8 w-8 rounded-md bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                                                                        <FileText className="h-4 w-4 text-red-500" />
                                                                    </div>
                                                                    <p className="text-xs font-semibold text-slate-700 truncate max-w-[160px]">{doc.name}</p>
                                                                </div>
                                                                <a href={`/storage/${doc.path}`} target="_blank" rel="noopener noreferrer" className="h-7 w-7 rounded-md bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors">
                                                                    <Download className="h-3.5 w-3.5 text-white" />
                                                                </a>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-center text-xs text-slate-400 py-4">No documents uploaded</p>
                                                    )
                                                )}
                                            </div>
                                        </div>

                                        {/* Address */}
                                        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 p-6">
                                            <SectionTitle>Address</SectionTitle>
                                            <div className="space-y-4">
                                                <div className="flex items-start gap-3 p-3 rounded-md border border-slate-100 bg-slate-50/50">
                                                    <div className="h-7 w-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                                                        <MapPin className="h-3.5 w-3.5 text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Current Address</p>
                                                        <p className="text-xs font-semibold text-slate-700">
                                                            {[profile?.ward, profile?.district, profile?.region, 'Tanzania'].filter(Boolean).join(', ')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3 p-3 rounded-md border border-slate-100 bg-slate-50/50">
                                                    <div className="h-7 w-7 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                                                        <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Permanent Address</p>
                                                        <p className="text-xs font-semibold text-slate-700">
                                                            {student.address || [profile?.village, profile?.ward, profile?.district, profile?.region].filter(Boolean).join(', ') || '—'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Previous School Details */}
                                    {(profile?.previous_school || profile?.previous_class) && (
                                        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 p-6">
                                            <SectionTitle>Previous School Details</SectionTitle>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                                <div>
                                                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">School Name</p>
                                                    <p className="text-sm font-semibold text-slate-700">{profile?.previous_school || '—'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Last Class</p>
                                                    <p className="text-sm font-semibold text-slate-700">{profile?.previous_class || '—'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Reason for Transfer</p>
                                                    <p className="text-sm font-semibold text-slate-700">{profile?.transfer_reason || '—'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Scholarship & Notes */}
                                    {(profile?.scholarship_status && profile.scholarship_status !== 'none' || profile?.notes) && (
                                        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 p-6">
                                            <SectionTitle>Additional Information</SectionTitle>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {profile?.scholarship_status && profile.scholarship_status !== 'none' && (
                                                    <div>
                                                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Scholarship</p>
                                                        <Badge className="bg-amber-50 text-amber-700 border border-amber-200 capitalize font-semibold">
                                                            {profile.scholarship_status} {profile.scholarship_amount && profile.scholarship_amount > 0 ? `— TZS ${Number(profile.scholarship_amount).toLocaleString()}` : ''}
                                                        </Badge>
                                                    </div>
                                                )}
                                                {profile?.notes && (
                                                    <div className="sm:col-span-2">
                                                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Notes</p>
                                                        <p className="text-sm text-slate-600 bg-slate-50 rounded-md p-3 border border-slate-100">{profile.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ══════════════════════════════════════════ */}
                            {/*  TIMETABLE TAB                             */}
                            {/* ══════════════════════════════════════════ */}
                            {activeTab === 'timetable' && (
                                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <SectionTitle>Weekly Timetable</SectionTitle>
                                        <div className="flex items-center gap-2 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-600 bg-slate-50 cursor-pointer">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>This Term</span>
                                            <ChevronDown className="h-3 w-3 opacity-60" />
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[800px]">
                                            <thead>
                                                <tr>
                                                    {days.map(d => (
                                                        <th key={d} className="text-xs font-bold text-slate-700 text-left py-2 px-3 border-b border-slate-200">{d}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sampleSlots.map((slot, si) => (
                                                    <tr key={si}>
                                                        {days.map((_, di) => {
                                                            const colorClass = subjectColors[(si * days.length + di) % subjectColors.length];
                                                            return (
                                                                <td key={di} className="p-2 align-top">
                                                                    <div className={`rounded-md border p-2.5 ${colorClass}`}>
                                                                        <div className="flex items-center gap-1 mb-1.5">
                                                                            <Clock className="h-2.5 w-2.5 opacity-60 shrink-0" />
                                                                            <span className="text-[10px] font-semibold opacity-80">{slot.time}</span>
                                                                        </div>
                                                                        <p className="text-[11px] font-bold mb-1.5">Subject : {slot.subjects[di]}</p>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <div className="h-5 w-5 rounded-full bg-white/60 flex items-center justify-center shrink-0">
                                                                                <User className="h-2.5 w-2.5 opacity-60" />
                                                                            </div>
                                                                            <span className="text-[10px] font-medium opacity-80 truncate">{slot.teachers[di]}</span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* ══════════════════════════════════════════ */}
                            {/*  LEAVE & ATTENDANCE TAB                    */}
                            {/* ══════════════════════════════════════════ */}
                            {activeTab === 'attendance' && (
                                <div className="space-y-5">
                                    {/* Sub-tabs */}
                                    <div className="flex gap-2">
                                        <button className="px-5 py-2 text-xs font-bold bg-blue-600 text-white rounded-md">Leaves</button>
                                        <button className="px-5 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50">Attendance</button>
                                    </div>

                                    {/* Leave Summary Cards */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Medical Leave',   total: 10, used: 5,  available: 5 },
                                            { label: 'Casual Leave',    total: 12, used: 1,  available: 11 },
                                            { label: 'Special Leave',   total: 5,  used: 1,  available: 4 },
                                            { label: 'Emergency Leave', total: 3,  used: 0,  available: 3 },
                                        ].map(c => (
                                            <div key={c.label} className="bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 p-4">
                                                <p className="text-xs font-bold text-slate-700 mb-2">{c.label} ({c.total})</p>
                                                <div className="flex items-center justify-between text-[10px] text-slate-500">
                                                    <span>Used : <strong className="text-slate-700">{c.used}</strong></span>
                                                    <span>Available : <strong className="text-slate-700">{c.available}</strong></span>
                                                </div>
                                                <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(c.used / c.total) * 100}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Leaves Table */}
                                    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 p-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <SectionTitle>Leaves</SectionTitle>
                                            <Button size="sm" className="h-8 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
                                                <ClipboardList className="h-3.5 w-3.5" /> Apply Leave
                                            </Button>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="border-b border-slate-100 bg-slate-50/50">
                                                        <th className="text-left py-2.5 px-3 font-bold text-slate-600 text-[10px] uppercase tracking-wider">Leave Type</th>
                                                        <th className="text-left py-2.5 px-3 font-bold text-slate-600 text-[10px] uppercase tracking-wider">Leave Date</th>
                                                        <th className="text-left py-2.5 px-3 font-bold text-slate-600 text-[10px] uppercase tracking-wider">No of Days</th>
                                                        <th className="text-left py-2.5 px-3 font-bold text-slate-600 text-[10px] uppercase tracking-wider">Applied On</th>
                                                        <th className="text-left py-2.5 px-3 font-bold text-slate-600 text-[10px] uppercase tracking-wider">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {leaves.map((l, i) => (
                                                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/40">
                                                            <td className="py-2.5 px-3 font-medium text-slate-700">{l.type}</td>
                                                            <td className="py-2.5 px-3 text-slate-500">{l.from} - {l.to}</td>
                                                            <td className="py-2.5 px-3 text-slate-500">{l.days}</td>
                                                            <td className="py-2.5 px-3 text-slate-500">{l.applied}</td>
                                                            <td className="py-2.5 px-3">
                                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${l.status === 'Approved'
                                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                    : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                                    <span className={`h-1 w-1 rounded-full ${l.status === 'Approved' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                                    {l.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ══════════════════════════════════════════ */}
                            {/*  FEES TAB                                  */}
                            {/* ══════════════════════════════════════════ */}
                            {activeTab === 'fees' && (
                                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 p-5">
                                    <div className="flex items-center justify-between mb-5">
                                        <SectionTitle>Fees</SectionTitle>
                                        <div className="flex items-center gap-2 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-600 bg-slate-50 cursor-pointer">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>Year : 2024 / 2025</span>
                                            <ChevronDown className="h-3 w-3 opacity-60" />
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs min-w-[750px]">
                                            <thead>
                                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                                    {['Fees Group', 'Fees Code', 'Due Date', 'Amount (TZS)', 'Status', 'Ref ID', 'Mode', 'Date Paid', 'Discount'].map(h => (
                                                        <th key={h} className="text-left py-2.5 px-3 font-bold text-slate-600 text-[10px] uppercase tracking-wider whitespace-nowrap">
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {fees.map((f, i) => (
                                                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/40">
                                                        <td className="py-2.5 px-3">
                                                            <span className="text-blue-600 hover:underline cursor-pointer font-semibold">{f.group}</span>
                                                        </td>
                                                        <td className="py-2.5 px-3 text-slate-500 font-mono text-[10px]">{f.code}</td>
                                                        <td className="py-2.5 px-3 text-slate-500">{f.due}</td>
                                                        <td className="py-2.5 px-3 font-semibold text-slate-700">{Number(f.amount).toLocaleString()}</td>
                                                        <td className="py-2.5 px-3">
                                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${f.status === 'Paid'
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                                                <span className={`h-1 w-1 rounded-full ${f.status === 'Paid' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                                {f.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-2.5 px-3 text-slate-500 font-mono text-[10px]">{f.ref}</td>
                                                        <td className="py-2.5 px-3 text-slate-500">{f.mode}</td>
                                                        <td className="py-2.5 px-3 text-slate-500">{f.paid}</td>
                                                        <td className="py-2.5 px-3 text-slate-500">{f.disc}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="bg-slate-800 dark:bg-zinc-800 text-white">
                                                    <td colSpan={3} className="py-2.5 px-3 text-xs font-bold">Total</td>
                                                    <td className="py-2.5 px-3 text-xs font-bold">
                                                        {fees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0).toLocaleString()}
                                                    </td>
                                                    <td colSpan={5} className="py-2.5 px-3 text-xs text-slate-300">
                                                        Outstanding: {fees.filter(f => f.status !== 'Paid').reduce((sum, f) => sum + f.amount, 0).toLocaleString()} TZS
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* ══════════════════════════════════════════ */}
                            {/*  EXAMS & RESULTS TAB                       */}
                            {/* ══════════════════════════════════════════ */}
                            {activeTab === 'exams' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <SectionTitle>Exams & Results</SectionTitle>
                                        <div className="flex items-center gap-2 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-600 bg-white cursor-pointer">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>Year : 2024 / 2025</span>
                                            <ChevronDown className="h-3 w-3 opacity-60" />
                                        </div>
                                    </div>

                                    {exams.map((exam, ei) => {
                                        const isOpen = openExam === ei;
                                        const totalObtained = exam.subjects.reduce((s, sub) => s + sub.obtained, 0);
                                        const totalMax = exam.subjects.reduce((s, sub) => s + sub.max, 0);
                                        const pct = ((totalObtained / totalMax) * 100).toFixed(1);
                                        return (
                                            <div key={ei} className="bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 overflow-hidden">
                                                <button
                                                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition-colors"
                                                    onClick={() => setOpenExam(isOpen ? null : ei)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-6 w-6 rounded-full flex items-center justify-center ${exam.passed ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                                            <CheckCircle2 className={`h-4 w-4 ${exam.passed ? 'text-emerald-600' : 'text-red-500'}`} />
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-800">{exam.name}</span>
                                                    </div>
                                                    {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                                                </button>

                                                {isOpen && (
                                                    <div className="border-t border-slate-100">
                                                        <table className="w-full text-xs">
                                                            <thead>
                                                                <tr className="bg-slate-50/80">
                                                                    <th className="text-left py-2.5 px-5 font-bold text-slate-600 text-[10px] uppercase tracking-wider">Subject</th>
                                                                    <th className="text-center py-2.5 px-3 font-bold text-slate-600 text-[10px] uppercase tracking-wider">Max Marks</th>
                                                                    <th className="text-center py-2.5 px-3 font-bold text-slate-600 text-[10px] uppercase tracking-wider">Min Marks</th>
                                                                    <th className="text-center py-2.5 px-3 font-bold text-slate-600 text-[10px] uppercase tracking-wider">Marks Obtained</th>
                                                                    <th className="text-center py-2.5 px-5 font-bold text-slate-600 text-[10px] uppercase tracking-wider">Result</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {exam.subjects.map((sub, si) => (
                                                                    <tr key={si} className="border-t border-slate-50 hover:bg-slate-50/40">
                                                                        <td className="py-2.5 px-5 font-medium text-slate-700">{sub.name} ({sub.total})</td>
                                                                        <td className="py-2.5 px-3 text-center text-slate-500">{sub.max}</td>
                                                                        <td className="py-2.5 px-3 text-center text-slate-500">{sub.min}</td>
                                                                        <td className="py-2.5 px-3 text-center font-bold text-slate-800">{sub.obtained}</td>
                                                                        <td className="py-2.5 px-5 text-center">
                                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sub.pass
                                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                                : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                                                {sub.pass ? '✓ Pass' : '✗ Fail'}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                            <tfoot>
                                                                <tr className="bg-slate-800 dark:bg-zinc-700 text-white text-[10px]">
                                                                    <td className="py-2.5 px-5 font-bold">Rank : {exam.rank}</td>
                                                                    <td className="py-2.5 px-3 text-center font-bold">Total : {totalMax}</td>
                                                                    <td className="py-2.5 px-3 text-center"></td>
                                                                    <td className="py-2.5 px-3 text-center font-bold">Marks Obtained : {totalObtained}</td>
                                                                    <td className="py-2.5 px-5 text-center font-bold">
                                                                        Percentage : {pct} &nbsp; Result : <span className="text-emerald-400">Pass</span>
                                                                    </td>
                                                                </tr>
                                                            </tfoot>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* ══════════════════════════════════════════ */}
                            {/*  LIBRARY TAB                               */}
                            {/* ══════════════════════════════════════════ */}
                            {activeTab === 'library' && (
                                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 p-6">
                                    <SectionTitle>Library Books</SectionTitle>
                                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                        <Library className="h-12 w-12 mb-3 opacity-30" />
                                        <p className="text-sm font-medium">No library books checked out</p>
                                        <p className="text-xs mt-1 opacity-70">Books borrowed by this student will appear here</p>
                                    </div>
                                </div>
                            )}

                        </div>{/* end content area */}
                    </div>{/* end right panel */}
                </div>{/* end body flex */}
            </div>
        </AppLayout>
    );
}
