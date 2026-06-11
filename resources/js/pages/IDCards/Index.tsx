import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard, StatGrid } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { CreditCard, Printer, Users, GraduationCap, Briefcase, Search, Phone } from 'lucide-react';

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

interface Props {
    users: User[];
    classes: Array<{ id: number; name: string }>;
    stats: {
        total_students: number;
        total_teachers: number;
        total_staff: number;
    };
}

export default function IDCardsIndex({ 
    users = [], 
    classes = [], 
    stats = { total_students: 0, total_teachers: 0, total_staff: 0 } 
}: Props) {
    const { currentSchool } = usePage().props as any;
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [classFilter, setClassFilter] = useState('');

    const school = {
        name: currentSchool?.name ?? 'EduTZ School',
        logo: currentSchool?.logo ?? null,
    };

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

    const filteredUsers = users.filter((user) => {
        if (typeFilter && typeFilter !== 'all' && user.type !== typeFilter) return false;
        if (classFilter && classFilter !== 'all' && user.class_name !== classFilter) return false;
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            return (
                user.name.toLowerCase().includes(lower) ||
                user.user_id.toLowerCase().includes(lower) ||
                user.phone.includes(searchTerm)
            );
        }
        return true;
    });

    return (
        <AppLayout>
            <Head title="ID Cards" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">ID Cards</h1>
                        <p className="text-gray-600">Generate and print ID cards for students, teachers, and staff</p>
                    </div>
                    <Link href={`/id-cards/bulk?type=${typeFilter}&class_name=${classFilter}&search=${searchTerm}`}>
                        <Button>
                            <Printer className="w-4 h-4 mr-2" />
                            Bulk Print
                        </Button>
                    </Link>
                </div>

                <StatGrid cols={3}>
                    <StatCard
                        title="Total Students"
                        value={stats.total_students}
                        icon={Users}
                        color="red"
                        trend="up"
                        trendLabel="1.2%"
                        subtitle="Enrolled students"
                    />
                    <StatCard
                        title="Total Teachers"
                        value={stats.total_teachers}
                        icon={GraduationCap}
                        color="blue"
                        trend="up"
                        trendLabel="1.2%"
                        subtitle="Active teachers"
                    />
                    <StatCard
                        title="Total Staff"
                        value={stats.total_staff}
                        icon={Briefcase}
                        color="amber"
                        trend="up"
                        trendLabel="1.2%"
                        subtitle="Active staff members"
                    />
                </StatGrid>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>ID Card Management</CardTitle>
                                <CardDescription>Browse and print ID cards</CardDescription>
                            </div>
                            <div className="flex space-x-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by name or ID..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-64 pl-9"
                                    />
                                </div>
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="student">Students</SelectItem>
                                        <SelectItem value="teacher">Teachers</SelectItem>
                                        <SelectItem value="staff">Staff</SelectItem>
                                    </SelectContent>
                                </Select>
                                {(typeFilter === 'student' || typeFilter === '') && (
                                    <Select value={classFilter} onValueChange={setClassFilter}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder="All classes" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Classes</SelectItem>
                                            {classes.map((cls) => (
                                                <SelectItem key={cls.id} value={cls.name}>
                                                    {cls.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredUsers.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p>No users found matching your filters</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredUsers.map((user) => {
                                    const theme = getTheme(user.type);
                                    return (
                                        <div
                                            key={user.id}
                                            className="border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white p-3 flex flex-col space-y-3"
                                        >
                                            {/* Mini Landscape ID Card (Aspect 1.58) */}
                                            <div
                                                className="w-full aspect-[1.58] rounded-xl overflow-hidden border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 flex flex-row relative select-none"
                                            >
                                                {/* LEFT SECTION (68% width) */}
                                                <div className="w-[68%] h-full relative z-10">
                                                    {/* Card Type Header */}
                                                    <div className="absolute top-2.5 left-3">
                                                        <span className={`text-[10px] font-black tracking-wider uppercase ${theme.text}`}>
                                                            {user.type === 'student' ? 'Student' : user.type === 'teacher' ? 'Teacher' : 'Staff'} ID Card
                                                        </span>
                                                    </div>

                                                    {/* Circular Photo */}
                                                    <div className={`absolute top-[24%] left-3 w-[26%] aspect-square rounded-full border-[3px] ${theme.border} shadow-sm overflow-hidden bg-white z-10`}>
                                                        {user.photo ? (
                                                            <img
                                                                src={user.photo}
                                                                alt={user.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className={`w-full h-full flex items-center justify-center text-white text-xs font-black ${theme.bg}`}>
                                                                {getInitials(user.name)}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Fields */}
                                                    <div className="absolute top-[22%] left-[34%] right-2 flex flex-col" style={{ fontSize: '7.5px', gap: '2px' }}>
                                                        {/* Name */}
                                                        <div className="border-b border-slate-200 pb-0.5">
                                                            <span className="block text-[5px] font-bold text-slate-400 leading-none">NAME</span>
                                                            <span className="block font-black text-slate-800 truncate leading-tight">
                                                                {user.name.toUpperCase()}
                                                            </span>
                                                        </div>

                                                        {/* User ID */}
                                                        <div className="border-b border-slate-200 pb-0.5">
                                                            <span className="block text-[5px] font-bold text-slate-400 leading-none">ID NUMBER</span>
                                                            <span className="block font-bold font-mono text-slate-700 truncate leading-tight">
                                                                {user.user_id}
                                                            </span>
                                                        </div>

                                                        {/* Level / Designation */}
                                                        {user.type === 'student' && user.class_name ? (
                                                            <div className="border-b border-slate-200 pb-0.5">
                                                                <span className="block text-[5px] font-bold text-slate-400 leading-none">CLASS</span>
                                                                <span className="block font-bold text-slate-700 truncate leading-tight">
                                                                    {user.class_name.toUpperCase()}
                                                                </span>
                                                            </div>
                                                        ) : user.designation ? (
                                                            <div className="border-b border-slate-200 pb-0.5">
                                                                <span className="block text-[5px] font-bold text-slate-400 leading-none">DESIGNATION</span>
                                                                <span className="block font-bold text-slate-700 truncate leading-tight">
                                                                    {user.designation.toUpperCase()}
                                                                </span>
                                                            </div>
                                                        ) : null}
                                                    </div>

                                                    {/* Expiry Label */}
                                                    <div className="absolute bottom-2.5 left-3 z-20">
                                                        <span className="block text-[5px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">
                                                            VALID UNTIL:
                                                        </span>
                                                        <span className="block text-[7px] font-black text-slate-700 leading-tight">
                                                            DEC. 2028
                                                        </span>
                                                    </div>

                                                    {/* Barcode representation */}
                                                    <div className="absolute bottom-2 right-2 flex flex-col items-center">
                                                        <div className="flex items-end h-4 space-x-[0.5px]">
                                                            {[1, 2, 1, 3, 1, 1, 2, 2, 1, 3, 1, 2, 1, 1].map((w, idx) => (
                                                                <div key={idx} className="bg-slate-900 h-full" style={{ width: `${w}px` }} />
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Curves Background */}
                                                    <div className="absolute bottom-[-20px] left-[-20px] w-20 h-20 bg-sky-850 opacity-10 rounded-full z-0" />
                                                    <div
                                                        className="absolute bottom-0 left-0 w-16 h-10 bg-gradient-to-tr from-teal-200 via-teal-100 to-transparent z-0"
                                                        style={{
                                                            clipPath: 'polygon(0 100%, 0 0, 45% 0, 100% 100%)',
                                                        }}
                                                    />
                                                    <div
                                                        className={`absolute bottom-0 left-0 w-12 h-12 ${theme.bg} opacity-10 z-0`}
                                                        style={{
                                                            clipPath: 'circle(45px at bottom left)',
                                                        }}
                                                    />
                                                </div>

                                                {/* Right Section Container (32% width) */}
                                                <div className="w-[32%] h-full relative z-10 bg-transparent flex flex-col items-center">
                                                    {/* Ribbon (shorter, swallowtail) */}
                                                    <div
                                                        className={`w-full h-[62%] ${theme.bg} flex flex-col items-center justify-start pt-3 px-1.5 text-white shadow-sm absolute top-0 right-0`}
                                                        style={{
                                                            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 86%, 0% 100%)',
                                                        }}
                                                    >
                                                        {/* Logo Ring */}
                                                        <div className="w-7 h-7 rounded-full border border-white/40 flex items-center justify-center bg-transparent overflow-hidden relative shrink-0">
                                                            {school.logo && school.logo.trim() !== '' ? (
                                                                <img
                                                                    src={school.logo}
                                                                    alt={school.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <svg className="w-4.5 h-4.5 text-white fill-none stroke-current" strokeWidth="1.2" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18c-2-2-2-5 0-7M4 14c-1-1.5-1-3.5 0-5" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18c2-2 2-5 0-7M20 14c1-1.5 1-3.5 0-5" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v14M12 4s3.5 1 3.5 4.5S12 18 12 18s-3.5-4.5-3.5-9.5S12 4 12 4z" />
                                                                    <circle cx="12" cy="11" r="1" className="fill-current" />
                                                                </svg>
                                                            )}
                                                        </div>

                                                        {/* School Name */}
                                                        <div className="text-[5px] font-black uppercase tracking-wider text-center mt-1.5 leading-tight px-0.5 drop-shadow-sm line-clamp-3">
                                                            {school.name}
                                                        </div>
                                                    </div>

                                                    {/* Overlapping Rings Deco at the bottom right */}
                                                    <div className="absolute bottom-3 right-3 w-10 h-7 pointer-events-none opacity-25">
                                                        <div className="absolute right-1.5 bottom-0 w-6 h-6 rounded-full border border-sky-600" />
                                                        <div className="absolute right-0 bottom-0.5 w-6 h-6 rounded-full border border-teal-500" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Print Action Button */}
                                            <Link href={`/id-cards/${user.id}/generate`} className="w-full">
                                                <Button size="sm" variant="outline" className="w-full text-xs py-1.5 h-auto">
                                                    <Printer className="w-3.5 h-3.5 mr-1.5" />
                                                    Print Card
                                                </Button>
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
