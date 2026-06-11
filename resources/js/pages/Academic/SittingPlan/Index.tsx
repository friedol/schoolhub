import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Users, Lock, Percent, Plus, ArrowRight, UserCheck, Calendar, LayoutGrid } from 'lucide-react';

interface Session {
    id: number;
    exam: { id: number; name: string };
    subject: { id: number; name: string };
    school_class: { id: number; name: string };
    date: string;
    start_time: string;
    end_time: string;
    room: { id: number; room_number: string } | null;
    invigilator: { id: number; name: string } | null;
    seating_arrangements_count: number;
}

interface Props {
    stats: {
        total_rooms: number;
        total_capacity: number;
        allocated_seats: number;
        reserved_seats: number;
        available_seats: number;
        utilization_rate: number;
    };
    sessions: { data: Session[]; links: any[] };
}

function StatCard({ icon: Icon, label, value, sub, color, lightBg, textColor }: {
    icon: React.ElementType; label: string; value: string | number; sub: string;
    color: string; lightBg: string; textColor: string;
}) {
    return (
        <div className={`flex items-center gap-4 rounded-xl border p-4 shadow-sm ${lightBg}`}>
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color}`}>
                <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
                <p className={`text-xs font-medium ${textColor}`}>{label}</p>
                <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{value}</p>
                <p className={`text-[10px] ${textColor} opacity-70`}>{sub}</p>
            </div>
        </div>
    );
}

export default function SittingPlanIndex({ stats, sessions }: Props) {
    return (
        <AppLayout>
            <Head title="Sitting Plan Management" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">

                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Sitting Plan Management</h1>
                        <p className="text-xs text-indigo-400 mt-0.5">Dashboard / Examinations / Sitting Plans</p>
                    </div>
                    <Link href="/academic/sitting-plans/generator">
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 gap-1.5 h-9">
                            <Plus className="h-3.5 w-3.5" /> Generate Sitting Plan
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={Building2}  label="Total Capacity"    value={stats.total_capacity}     sub={`${stats.total_rooms} active rooms`}     color="bg-indigo-500"  lightBg="bg-indigo-50 border-indigo-200"   textColor="text-indigo-500" />
                    <StatCard icon={Users}       label="Allocated Seats"  value={stats.allocated_seats}    sub="Assigned candidates"                      color="bg-emerald-500" lightBg="bg-emerald-50 border-emerald-200" textColor="text-emerald-600" />
                    <StatCard icon={Lock}        label="Reserved/Blocked" value={stats.reserved_seats}     sub="Locked positions"                         color="bg-amber-500"   lightBg="bg-amber-50 border-amber-200"     textColor="text-amber-600" />
                    <StatCard icon={Percent}     label="Occupancy Rate"   value={`${stats.utilization_rate}%`} sub="Active seat usage"                    color="bg-rose-500"    lightBg="bg-rose-50 border-rose-200"       textColor="text-rose-600" />
                </div>

                {/* Quick nav */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { href: '/academic/sitting-plans/student',          icon: Users,      label: 'Student Lookup',       color: 'text-indigo-600 bg-indigo-50 border-indigo-200 hover:bg-indigo-100' },
                        { href: '/academic/sitting-plans/candidate-list',   icon: LayoutGrid, label: 'Candidate Lists',      color: 'text-violet-600 bg-violet-50 border-violet-200 hover:bg-violet-100' },
                        { href: '/academic/sitting-plans/invigilators',     icon: UserCheck,  label: 'Invigilators',         color: 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100' },
                        { href: '/academic/sitting-plans/reports',          icon: Calendar,   label: 'Room Reports',         color: 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100' },
                    ].map(({ href, icon: Icon, label, color }) => (
                        <Link key={href} href={href}>
                            <div className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${color}`}>
                                <Icon className="h-4 w-4 shrink-0" />
                                {label}
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Sessions table */}
                <div className="rounded-xl border border-indigo-200 overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-indigo-100 bg-indigo-50">
                        <div>
                            <h2 className="text-sm font-bold text-indigo-800">Recent Seating Arrangements</h2>
                            <p className="text-xs text-indigo-400 mt-0.5">Generated examination session sitting plans</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[700px]">
                            <thead className="bg-indigo-50/60 border-b border-indigo-100">
                                <tr>
                                    {['Examination / Date', 'Subject', 'Class', 'Room', 'Invigilator', 'Allocated', ''].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-indigo-500 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-indigo-50 bg-white dark:bg-zinc-900">
                                {sessions.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-indigo-400 text-sm">
                                            No sitting plans generated yet. Click "Generate Sitting Plan" to begin.
                                        </td>
                                    </tr>
                                ) : sessions.data.map(sess => (
                                    <tr key={sess.id} className="hover:bg-indigo-50/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-zinc-800 dark:text-zinc-200">{sess.exam.name}</p>
                                            <p className="text-[10px] text-indigo-400 font-mono mt-0.5">
                                                {new Date(sess.date).toLocaleDateString()} · {sess.start_time}–{sess.end_time}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{sess.subject.name}</td>
                                        <td className="px-4 py-3">
                                            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded">
                                                {sess.school_class.name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {sess.room ? (
                                                <span className="bg-violet-100 text-violet-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                                    Room {sess.room.room_number}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-amber-500 font-medium">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {sess.invigilator ? (
                                                <div className="flex items-center gap-1 text-emerald-700 text-xs font-medium">
                                                    <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                                                    {sess.invigilator.name}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-amber-500 font-medium">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-bold text-indigo-600 text-center">
                                            {sess.seating_arrangements_count}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link href={`/academic/sitting-plans/${sess.id}`}>
                                                <Button size="sm" variant="ghost" className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 text-xs gap-1">
                                                    View Layout <ArrowRight className="h-3 w-3" />
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
