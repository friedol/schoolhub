import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    School,
    Users,
    GraduationCap,
    BookOpen,
    Calculator,
    Calendar as CalendarIcon,
    AlertCircle,
    DollarSign,
    BarChart3,
    Settings,
    Clock,
    X,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    FileText,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { StatCard, StatGrid } from '@/components/ui/stat-card';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

interface School {
    id: number;
    name: string;
    code: string;
    address: string;
    region: string;
    district: string;
    level: string;
    motto: string;
    contact_phone: string;
    contact_email: string;
    is_active: boolean;
}

interface SchoolAdminDashboardProps {
    school: School;
    user: any;
    stats: {
        students: { active: number; inactive: number; total: number };
        teachers: { active: number; inactive: number; total: number };
        staff: { active: number; inactive: number; total: number };
        subjects: { active: number; inactive: number; total: number };
    };
    feesCollection: Array<{ name: string; total: number; collected: number }>;
    leaveRequests: Array<{
        id: number;
        name: string;
        role: string;
        type: string;
        start_date: string;
        end_date: string;
        applied_on: string;
        status: string;
    }>;
    attendanceStats: { present: number; absent: number; late: number; excused: number };
    upcomingEvents: Array<{
        id: number;
        title: string;
        date: string;
        type: string;
    }>;
    classRoutine: Array<{ id: number; month: string; progress: number }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Admin Dashboard', href: '/school-admin/dashboard' },
];

export default function SchoolAdminDashboard({
    school,
    user,
    stats,
    feesCollection,
    leaveRequests,
    attendanceStats,
    upcomingEvents,
    classRoutine,
}: SchoolAdminDashboardProps) {
    const [showAlert, setShowAlert] = useState(true);

    const pieData = [
        { name: 'Present', value: attendanceStats.present, color: '#3b82f6' }, // blue-500
        { name: 'Absent', value: attendanceStats.absent, color: '#e5e7eb' }, // gray-200
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Admin Dashboard - ${school?.name ?? 'School'}`} />

            <div className="flex h-full flex-1 flex-col gap-5 overflow-x-auto rounded-xl p-4 sm:p-6 bg-[#f8fafc]">
                {/* Top Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Hello, {user?.name}</h1>
                        <p className="text-sm text-slate-500">Dashboard / Admin Dashboard</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm" asChild>
                            <Link href="/school-admin/students/create">Add New Student</Link>
                        </Button>
                        <Button variant="outline" className="bg-slate-100 border-slate-200 text-slate-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300" asChild>
                            <Link href="/finance/student-fees">Fees Details</Link>
                        </Button>
                    </div>
                </div>

                {/* Alert Banner */}
                {showAlert && (
                    <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 overflow-hidden">
                                <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`} alt="User" className="h-full w-full object-cover" />
                            </div>
                            <span>
                                <strong>Fahed III,C</strong> has paid Fees for the <strong>"Term1"</strong>
                            </span>
                        </div>
                        <button onClick={() => setShowAlert(false)} className="text-emerald-600 hover:text-emerald-800">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}


                {/* 4 Stats Cards */}
                <StatGrid cols={4}>
                    <StatCard
                        title="Total Students"
                        value={stats.students.total}
                        icon={Users}
                        color="red"
                        trend="up"
                        trendLabel="1.2%"
                        subtitle={`Active: ${stats.students.active} | Inactive: ${stats.students.inactive}`}
                    />
                    <StatCard
                        title="Total Teachers"
                        value={stats.teachers.total}
                        icon={GraduationCap}
                        color="blue"
                        trend="up"
                        trendLabel="1.2%"
                        subtitle={`Active: ${stats.teachers.active} | Inactive: ${stats.teachers.inactive}`}
                    />
                    <StatCard
                        title="Total Staff"
                        value={stats.staff.total}
                        icon={Users}
                        color="amber"
                        trend="up"
                        trendLabel="1.2%"
                        subtitle={`Active: ${stats.staff.active} | Inactive: ${stats.staff.inactive}`}
                    />
                    <StatCard
                        title="Total Subjects"
                        value={stats.subjects.total}
                        icon={BookOpen}
                        color="green"
                        trend="up"
                        trendLabel="1.2%"
                        subtitle={`Active: ${stats.subjects.active} | Inactive: ${stats.subjects.inactive}`}
                    />
                </StatGrid>

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    
                    {/* LEFT COLUMN (Span 6) */}
                    <div className="lg:col-span-6 flex flex-col gap-5">
                        
                        {/* Fees Collection Bar Chart */}
                        <Card className="border-0 shadow-sm rounded-xl flex-1 min-h-[350px]">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-bold text-slate-800">Fees Collection</CardTitle>
                                <div className="flex items-center text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    Last 8 Quarter
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 mb-4 text-sm font-medium text-slate-500">
                                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-slate-200"></div> Total Fee</div>
                                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-blue-600"></div> Collected Fee</div>
                                </div>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={feesCollection} margin={{ top: 5, right: 0, left: -20, bottom: 0 }} barGap={0} barCategoryGap="25%">
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `${val/1000}L`} />
                                            <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                            <Bar dataKey="total" fill="#e2e8f0" radius={[4, 4, 0, 0]} stackId="a" />
                                            <Bar dataKey="collected" fill="#3b82f6" radius={[4, 4, 0, 0]} stackId="a" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Schedules & Upcoming Events */}
                        <Card className="border-0 shadow-sm rounded-xl">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 mb-4">
                                <CardTitle className="text-lg font-bold text-slate-800">Schedules</CardTitle>
                                <Button variant="ghost" size="sm" className="text-blue-600 font-semibold p-0 hover:bg-transparent">
                                    + Add New
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {/* Simplified Calendar Placeholder */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="font-bold text-slate-800">July 2024</span>
                                        <div className="flex items-center gap-2">
                                            <button className="p-1 rounded-full bg-slate-100 hover:bg-slate-200"><ChevronLeft className="h-4 w-4" /></button>
                                            <button className="p-1 rounded-full bg-slate-800 text-white hover:bg-slate-700"><ChevronRight className="h-4 w-4" /></button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-7 text-center text-sm mb-2">
                                        <div className="font-bold text-slate-800">S</div>
                                        <div className="font-bold text-slate-800">M</div>
                                        <div className="font-bold text-slate-800">T</div>
                                        <div className="font-bold text-slate-800">W</div>
                                        <div className="font-bold text-slate-800">T</div>
                                        <div className="font-bold text-slate-800">F</div>
                                        <div className="font-bold text-slate-800">S</div>
                                    </div>
                                    <div className="grid grid-cols-7 text-center text-sm text-slate-500 gap-y-2">
                                        {[27,28,29,30,31,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30].map((d, i) => (
                                            <div key={i} className={`p-1 mx-auto flex items-center justify-center w-8 h-8 rounded-full ${[6,7,12,27].includes(d) && i > 5 ? 'bg-blue-600 text-white font-bold' : (i < 5 ? 'text-slate-300' : '')}`}>
                                                {d}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <h4 className="font-bold text-slate-800 mb-3">Upcoming Events</h4>
                                <div className="space-y-3">
                                    {upcomingEvents.map(event => (
                                        <div key={event.id} className="flex gap-4 items-start p-3 rounded-lg bg-slate-50 border border-slate-100">
                                            <div className="flex-1 border-l-4 border-blue-400 pl-3">
                                                <h5 className="font-bold text-slate-800 text-sm">{event.title}</h5>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                                    <CalendarIcon className="h-3 w-3" />
                                                    <span>{event.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                    {/* MIDDLE COLUMN (Span 3) */}
                    <div className="lg:col-span-3 flex flex-col gap-5">
                        
                        {/* Leave Requests */}
                        <Card className="border-0 shadow-sm rounded-xl flex-1">
                            <CardHeader className="flex flex-row items-center justify-between pb-4">
                                <CardTitle className="text-lg font-bold text-slate-800">Leave Requests</CardTitle>
                                <div className="flex items-center text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                    <CalendarIcon className="mr-1 h-3 w-3" />
                                    This Week
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {leaveRequests.map(leave => (
                                    <div key={leave.id} className="border border-slate-100 rounded-xl p-3 shadow-sm">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden">
                                                    <img src={`https://ui-avatars.com/api/?name=${leave.name}&background=random`} alt={leave.name} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm text-slate-800">{leave.name}</span>
                                                        <Badge variant="outline" className={`text-[10px] px-1 py-0 h-4 border-0 ${leave.type === 'Emergency' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                            {leave.type}
                                                        </Badge>
                                                    </div>
                                                    <span className="text-xs text-slate-500">{leave.role}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button className="h-6 w-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100"><CheckCircle2 className="h-3 w-3" /></button>
                                                <button className="h-6 w-6 rounded bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100"><XCircle className="h-3 w-3" /></button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                                            <span>Leave : <strong className="text-slate-700">{leave.start_date} - {leave.end_date}</strong></span>
                                            <span>Apply on : <strong className="text-slate-700">{leave.applied_on}</strong></span>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Attendance Donut Chart */}
                        <Card className="border-0 shadow-sm rounded-xl">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-bold text-slate-800">Attendance</CardTitle>
                                <div className="flex items-center text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                    <CalendarIcon className="mr-1 h-3 w-3" />
                                    Today
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex border-b border-slate-200 mb-4">
                                    <button className="pb-2 text-sm font-bold text-blue-600 border-b-2 border-blue-600 px-2">Students</button>
                                    <button className="pb-2 text-sm font-medium text-slate-500 px-4 hover:text-slate-800">Teachers</button>
                                    <button className="pb-2 text-sm font-medium text-slate-500 px-4 hover:text-slate-800">Staff</button>
                                </div>
                                <div className="flex justify-between text-center px-2 mb-4">
                                    <div><p className="text-xl font-bold text-slate-800">{attendanceStats.excused}</p><p className="text-xs text-slate-500">Emergency</p></div>
                                    <div><p className="text-xl font-bold text-slate-800">{attendanceStats.absent}</p><p className="text-xs text-slate-500">Absent</p></div>
                                    <div><p className="text-xl font-bold text-slate-800">{attendanceStats.late}</p><p className="text-xs text-slate-500">Late</p></div>
                                </div>
                                <div className="h-[250px] w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={85}
                                                paddingAngle={2}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
                                        <span className="text-3xl font-bold text-slate-800">{attendanceStats.present}</span>
                                        <span className="text-xs font-medium text-slate-500">Present</span>
                                    </div>
                                    <div className="absolute bottom-2 right-4 bg-white shadow-sm border border-slate-100 rounded-full px-3 py-1 flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                                        <span className="font-bold text-sm text-slate-800">{attendanceStats.absent}</span>
                                        <span className="text-[10px] text-slate-500">Absent</span>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full mt-4 text-sm font-semibold text-slate-700 bg-slate-50">
                                    <CalendarIcon className="mr-2 h-4 w-4" /> View All
                                </Button>
                            </CardContent>
                        </Card>

                    </div>

                    {/* RIGHT COLUMN (Span 3) */}
                    <div className="lg:col-span-3 flex flex-col gap-5">
                        
                        {/* Quick Links Grid */}
                        <Card className="border-0 shadow-sm rounded-xl">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-bold text-slate-800">Quick Links</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-3">
                                    <Link href="/academic/timetable" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-emerald-50/50 hover:bg-emerald-50 transition-colors">
                                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center mb-2 text-emerald-600">
                                            <CalendarIcon className="h-5 w-5" />
                                        </div>
                                        <span className="text-xs font-semibold text-slate-700">Calendar</span>
                                    </Link>
                                    <Link href="/communication/events" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-blue-50/50 hover:bg-blue-50 transition-colors">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mb-2 text-blue-600">
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <span className="text-xs font-semibold text-slate-700">Events</span>
                                    </Link>
                                    <Link href="/students/attendance" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-amber-50/50 hover:bg-amber-50 transition-colors">
                                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mb-2 text-amber-600">
                                            <Clock className="h-5 w-5" />
                                        </div>
                                        <span className="text-xs font-semibold text-slate-700">Attendance</span>
                                    </Link>
                                    <Link href="/academic/assessments" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-cyan-50/50 hover:bg-cyan-50 transition-colors">
                                        <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center mb-2 text-cyan-600">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <span className="text-xs font-semibold text-slate-700">Exams</span>
                                    </Link>
                                    <Link href="/school-admin/reports" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-red-50/50 hover:bg-red-50 transition-colors">
                                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mb-2 text-red-600">
                                            <BarChart3 className="h-5 w-5" />
                                        </div>
                                        <span className="text-xs font-semibold text-slate-700">Reports</span>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Class Routine */}
                        <Card className="border-0 shadow-sm rounded-xl flex-1">
                            <CardHeader className="flex flex-row items-center justify-between pb-4">
                                <CardTitle className="text-lg font-bold text-slate-800">Class Routine</CardTitle>
                                <Button variant="ghost" size="sm" className="text-blue-600 font-semibold p-0 hover:bg-transparent">
                                    + Add New
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                {classRoutine.map((routine, i) => (
                                    <div key={routine.id} className="flex gap-3 items-center">
                                        <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                            <img src={`https://ui-avatars.com/api/?name=${routine.month.charAt(0)}&background=random`} alt={routine.month} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-bold text-slate-800">{routine.month}</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${i === 0 ? 'bg-blue-600' : 'bg-red-500'}`} style={{ width: `${routine.progress}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
