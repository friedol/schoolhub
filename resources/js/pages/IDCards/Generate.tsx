import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';

interface User {
    id: number;
    name: string;
    type: 'student' | 'teacher' | 'staff';
    class_name?: string;
    designation?: string;
    user_id: string;
    phone: string;
    photo?: string;
    date_of_birth?: string;
}

interface School {
    name: string;
    address: string;
    phone: string;
    logo?: string;
}

interface Props {
    user: User;
    school: School;
}

export default function IDCardsGenerate({ user, school }: Props) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n.charAt(0))
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const getTheme = (type: string) => {
        switch (type) {
            case 'student':
                return {
                    text: 'text-sky-600',
                    border: 'border-sky-500',
                    bg: 'bg-sky-600',
                    label: 'text-sky-700',
                };
            case 'teacher':
                return {
                    text: 'text-emerald-600',
                    border: 'border-emerald-500',
                    bg: 'bg-emerald-600',
                    label: 'text-emerald-700',
                };
            case 'staff':
                return {
                    text: 'text-violet-600',
                    border: 'border-violet-500',
                    bg: 'bg-violet-600',
                    label: 'text-violet-700',
                };
            default:
                return {
                    text: 'text-slate-600',
                    border: 'border-slate-500',
                    bg: 'bg-slate-600',
                    label: 'text-slate-700',
                };
        }
    };

    const theme = getTheme(user.type);

    return (
        <AppLayout>
            <Head title={`ID Card - ${user.name}`} />

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    .print-area {
                        padding: 0 !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                    }
                    .print-card {
                        box-shadow: none !important;
                        border: 1px solid #e2e8f0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

            <div className="flex h-full flex-1 flex-col gap-6 p-6 print-area">
                <div className="flex justify-between items-center no-print">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">ID Card Preview</h1>
                        <p className="text-gray-600">Review and print the ID card for {user.name}</p>
                    </div>
                    <div className="flex space-x-2">
                        <Link href="/id-cards">
                            <Button variant="outline">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <Button onClick={() => window.open(`/id-cards/${user.id}/print`, '_blank')}>
                            <Printer className="w-4 h-4 mr-2" />
                            Print Card
                        </Button>
                    </div>
                </div>

                <div className="flex justify-center py-8 print:py-0 print:block">
                    {/* CR-80 Card: 3.375" x 2.125" (Approx 540px x 340px) */}
                    <div
                        className="print-card w-[540px] h-[340px] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 flex flex-row relative select-none"
                        style={{ fontFamily: 'system-ui, sans-serif' }}
                    >
                        {/* LEFT SECTION (65% width) */}
                        <div className="w-[65%] h-full relative z-10">
                            {/* Card Type Header */}
                            <div className="absolute top-6 left-6">
                                <span className={`text-2xl font-black tracking-wider uppercase ${theme.text}`}>
                                    {user.type === 'student' ? 'Student' : user.type === 'teacher' ? 'Teacher' : 'Staff'} ID Card
                                </span>
                            </div>

                            {/* Circular Photo */}
                            <div className={`absolute top-[92px] left-6 w-[124px] h-[124px] rounded-full border-[5px] ${theme.border} shadow-md overflow-hidden bg-white z-10`}>
                                {user.photo ? (
                                    <img
                                        src={user.photo}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className={`w-full h-full flex items-center justify-center text-white text-3xl font-black ${theme.bg}`}>
                                        {getInitials(user.name)}
                                    </div>
                                )}
                            </div>

                            {/* Fields */}
                            <div className="absolute top-[88px] left-[172px] right-3 flex flex-col" style={{ gap: '6px' }}>
                                {/* Name Field */}
                                <div className="border-b border-slate-200 pb-0.5">
                                    <span className={`block text-[8px] font-black tracking-wider uppercase ${theme.label} leading-none`}>
                                        NAME:
                                    </span>
                                    <span className="block text-sm font-black text-slate-800 tracking-wide truncate mt-0.5 leading-tight">
                                        {user.name.toUpperCase()}
                                    </span>
                                </div>

                                {/* ID Field */}
                                <div className="border-b border-slate-200 pb-0.5">
                                    <span className={`block text-[8px] font-black tracking-wider uppercase ${theme.label} leading-none`}>
                                        {user.type === 'student' ? 'STUDENT ID:' : 'STAFF ID:'}
                                    </span>
                                    <span className="block text-xs font-black text-slate-800 font-mono tracking-wider truncate mt-0.5 leading-tight">
                                        {user.user_id}
                                    </span>
                                </div>

                                {/* Program/Class/Designation Field */}
                                {user.type === 'student' && user.class_name ? (
                                    <div className="border-b border-slate-200 pb-0.5">
                                        <span className={`block text-[8px] font-black tracking-wider uppercase ${theme.label} leading-none`}>
                                            CLASS / PROGRAM:
                                        </span>
                                        <span className="block text-xs font-bold text-slate-800 truncate mt-0.5 leading-tight">
                                            {user.class_name.toUpperCase()}
                                        </span>
                                    </div>
                                ) : user.designation ? (
                                    <div className="border-b border-slate-200 pb-0.5">
                                        <span className={`block text-[8px] font-black tracking-wider uppercase ${theme.label} leading-none`}>
                                            DESIGNATION:
                                        </span>
                                        <span className="block text-xs font-bold text-slate-800 truncate mt-0.5 leading-tight">
                                            {user.designation.toUpperCase()}
                                        </span>
                                    </div>
                                ) : null}

                                {/* Date of Birth Field */}
                                <div className="border-b border-slate-200 pb-0.5 last:border-b-0">
                                    <span className={`block text-[8px] font-black tracking-wider uppercase ${theme.label} leading-none`}>
                                        DATE OF BIRTH:
                                    </span>
                                    <span className="block text-[11px] font-bold text-slate-700 truncate mt-0.5 leading-tight">
                                        {user.date_of_birth && user.date_of_birth !== 'N/A' ? user.date_of_birth.toUpperCase() : 'NOT SPECIFIED'}
                                    </span>
                                </div>
                            </div>

                            {/* Expiry Date (Valid Until) */}
                            <div className="absolute bottom-6 left-6 z-20">
                                <span className="block text-[7px] font-extrabold text-slate-500 uppercase tracking-widest leading-none">
                                    VALID UNTIL:
                                </span>
                                <span className="block text-[10px] font-black text-slate-800 leading-tight">
                                    DECEMBER 2028
                                </span>
                            </div>

                            {/* Barcode representation */}
                            <div className="absolute bottom-6 right-6 flex flex-col items-center">
                                <div className="flex items-end h-6 space-x-[1px]">
                                    {[1, 2, 1, 3, 1, 1, 2, 2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 2, 1, 1, 3, 1, 1, 2, 1, 1, 2].map((w, idx) => (
                                        <div key={idx} className="bg-slate-900 h-full" style={{ width: `${w}px` }} />
                                    ))}
                                </div>
                                <span className="text-[7px] font-mono tracking-widest mt-0.5 text-slate-600">
                                    {user.user_id}
                                </span>
                            </div>

                            {/* Curved background shape overlays */}
                            <div className="absolute bottom-[-50px] left-[-50px] w-40 h-40 bg-sky-800 opacity-20 rounded-full z-0" />
                            <div
                                className="absolute bottom-0 left-0 w-36 h-24 bg-gradient-to-tr from-teal-250 via-teal-100 to-transparent z-0"
                                style={{
                                    clipPath: 'polygon(0 100%, 0 0, 45% 0, 100% 100%)',
                                }}
                            />
                            <div
                                className={`absolute bottom-0 left-0 w-28 h-28 ${theme.bg} opacity-10 z-0`}
                                style={{
                                    clipPath: 'circle(90px at bottom left)',
                                }}
                            />
                        </div>

                        {/* RIGHT SECTION (Right Banner/Pennant - 35% width) */}
                        <div className="w-[35%] h-full relative z-10 bg-transparent flex flex-col items-center">
                            {/* Ribbon (shorter, swallowtail) */}
                            <div
                                className={`w-full h-[215px] ${theme.bg} flex flex-col items-center justify-start pt-7 px-4 text-white shadow-lg absolute top-0 right-0`}
                                style={{
                                    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 86%, 0% 100%)',
                                }}
                            >
                                {/* Logo frame (white ring) */}
                                <div className="w-[72px] h-[72px] rounded-full border-2 border-white/40 flex items-center justify-center bg-transparent overflow-hidden relative shrink-0">
                                    {school.logo && school.logo.trim() !== '' ? (
                                        <img
                                            src={school.logo}
                                            alt={school.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        /* University Crest Badge SVG */
                                        <svg className="w-11 h-11 text-white fill-none stroke-current" strokeWidth="1.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18c-2-2-2-5 0-7M4 14c-1-1.5-1-3.5 0-5" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18c2-2 2-5 0-7M20 14c1-1.5 1-3.5 0-5" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v14M12 4s3.5 1 3.5 4.5S12 18 12 18s-3.5-4.5-3.5-9.5S12 4 12 4z" />
                                            <circle cx="12" cy="11" r="2" className="fill-current" />
                                            <path d="M9.5 2.5l.5 1 .5-1M12 1.5l.5 1 .5-1M14.5 2.5l.5 1 .5-1" strokeWidth="1" />
                                        </svg>
                                    )}
                                </div>

                                {/* School Name */}
                                <div className="text-[10px] font-black uppercase tracking-widest text-center mt-4 leading-snug px-1 drop-shadow-sm line-clamp-3">
                                    {school.name}
                                </div>
                            </div>

                            {/* Overlapping Rings Deco at the bottom right */}
                            <div className="absolute bottom-6 right-6 w-24 h-16 pointer-events-none opacity-25">
                                <div className="absolute right-4 bottom-0 w-14 h-14 rounded-full border-2 border-sky-600" />
                                <div className="absolute right-0 bottom-1 w-14 h-14 rounded-full border-2 border-teal-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
