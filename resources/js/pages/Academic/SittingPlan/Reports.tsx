import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Building2, Users, Lock, BarChart3 } from 'lucide-react';

interface ReportRow {
    room_number: string;
    room_name: string;
    capacity: number;
    allocated: number;
    reserved: number;
    available: number;
    occupancy_rate: number;
}

interface Props { reportData: ReportRow[] }

function round(v: number, d: number): number {
    return Number(Math.round(Number(v + 'e' + d)) + 'e-' + d);
}

function StatCard({ icon: Icon, label, value, color, lightBg, textColor }: {
    icon: React.ElementType; label: string; value: string | number;
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
            </div>
        </div>
    );
}

export default function SittingPlanReports({ reportData }: Props) {
    const totalCapacity  = reportData.reduce((s, r) => s + r.capacity, 0);
    const totalAllocated = reportData.reduce((s, r) => s + r.allocated, 0);
    const totalReserved  = reportData.reduce((s, r) => s + r.reserved, 0);
    const avgOccupancy   = reportData.length > 0
        ? round(reportData.reduce((s, r) => s + r.occupancy_rate, 0) / reportData.length, 2)
        : 0;

    return (
        <AppLayout>
            <Head title="Sitting Plan Reports" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">

                {/* Header */}
                <div>
                    <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Sitting Plan Reports</h1>
                    <p className="text-xs text-indigo-400 mt-0.5">Dashboard / Sitting Plans / Reports</p>
                </div>

                {/* Summary stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={Building2} label="Total Capacity"       value={totalCapacity}    color="bg-indigo-500"  lightBg="bg-indigo-50 border-indigo-200"   textColor="text-indigo-500" />
                    <StatCard icon={Users}     label="Allocated Candidates" value={totalAllocated}   color="bg-emerald-500" lightBg="bg-emerald-50 border-emerald-200" textColor="text-emerald-600" />
                    <StatCard icon={Lock}      label="Reserved Seats"       value={totalReserved}    color="bg-amber-500"   lightBg="bg-amber-50 border-amber-200"     textColor="text-amber-600" />
                    <StatCard icon={BarChart3} label="Avg. Occupancy"       value={`${avgOccupancy}%`} color="bg-rose-500"  lightBg="bg-rose-50 border-rose-200"       textColor="text-rose-600" />
                </div>

                {/* Room breakdown */}
                <div className="rounded-xl border border-indigo-200 overflow-hidden shadow-sm">
                    <div className="px-5 py-3 border-b border-indigo-100 bg-indigo-50 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-indigo-500" />
                        <h2 className="text-sm font-bold text-indigo-800">Room Utilisation Breakdown</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[600px]">
                            <thead className="bg-indigo-50/60 border-b border-indigo-100">
                                <tr>
                                    {['Room', 'Capacity', 'Allocated', 'Reserved', 'Available', 'Occupancy'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-indigo-500 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-indigo-50 bg-white dark:bg-zinc-900">
                                {reportData.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-indigo-400 text-sm">
                                            No room seating reports available.
                                        </td>
                                    </tr>
                                ) : reportData.map((room, idx) => {
                                    const pct = Math.min(100, room.occupancy_rate);
                                    const barColor = pct >= 90 ? 'bg-rose-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';
                                    return (
                                        <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-zinc-800 dark:text-zinc-200">{room.room_name}</p>
                                                <p className="text-[10px] text-indigo-400 font-mono">No. {room.room_number}</p>
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-zinc-700 text-center">{room.capacity}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="font-bold text-indigo-600">{room.allocated}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="font-bold text-amber-600">{room.reserved}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="font-bold text-emerald-600">{room.available}</span>
                                            </td>
                                            <td className="px-4 py-3 w-52">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-indigo-100 rounded-full h-2 overflow-hidden">
                                                        <div className={`h-2 rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className={`text-xs font-bold w-10 text-right ${
                                                        pct >= 90 ? 'text-rose-600' : pct >= 70 ? 'text-amber-600' : 'text-emerald-600'
                                                    }`}>{room.occupancy_rate}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-4 py-2.5 bg-indigo-50 border-t border-indigo-100 text-xs text-indigo-500 flex justify-between">
                        <span>{reportData.length} room{reportData.length !== 1 ? 's' : ''}</span>
                        <span className="flex items-center gap-3">
                            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" /> &lt;70%</span>
                            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500 inline-block" /> 70–90%</span>
                            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500 inline-block" /> &gt;90%</span>
                        </span>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
