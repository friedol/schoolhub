import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer, Eye, Users, Download, CheckCircle, XCircle, Clock, AlertCircle, BarChart3 } from 'lucide-react';

interface SchoolClass { id: number; name: string; level: string }

interface AttendanceRecord {
    id: number;
    student_id: number;
    student_name: string;
    admission_number: string;
    class_name: string;
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused' | 'sick' | 'leave';
    notes?: string;
    marked_by: string;
}

interface Stats {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    percentage: number;
}

interface Props {
    classes: SchoolClass[];
    records: AttendanceRecord[];
    stats: Stats;
    filters: { class_id: string; date: string; status: string };
}

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
    present: { label: 'Present', badge: 'bg-emerald-100 text-emerald-700 border border-emerald-300' },
    absent:  { label: 'Absent',  badge: 'bg-red-100 text-red-700 border border-red-300' },
    late:    { label: 'Late',    badge: 'bg-amber-100 text-amber-700 border border-amber-300' },
    excused: { label: 'Excused', badge: 'bg-blue-100 text-blue-700 border border-blue-300' },
    sick:    { label: 'Sick',    badge: 'bg-purple-100 text-purple-700 border border-purple-300' },
    leave:   { label: 'Leave',   badge: 'bg-cyan-100 text-cyan-700 border border-cyan-300' },
};

export default function AttendanceDashboard({ classes, records, stats, filters }: Props) {
    const [classId, setClassId] = useState(filters.class_id || '');
    const [date, setDate]       = useState(filters.date || new Date().toISOString().split('T')[0]);
    const [status, setStatus]   = useState(filters.status || '');

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/students/attendance', {
            class_id: classId || undefined,
            date,
            status: status || undefined,
        }, { preserveState: true });
    };

    const exportUrl = `/students/attendance/export?date=${date}${classId ? '&class_id=' + classId : ''}${status ? '&status=' + status : ''}`;

    const STATS_CARDS = [
        { label: 'Total',   value: stats.total,            icon: Users,       color: 'text-foreground' },
        { label: 'Present', value: stats.present,          icon: CheckCircle, color: 'text-emerald-600' },
        { label: 'Absent',  value: stats.absent,           icon: XCircle,     color: 'text-red-600' },
        { label: 'Late',    value: stats.late,             icon: Clock,       color: 'text-amber-600' },
        { label: 'Excused', value: stats.excused,          icon: AlertCircle, color: 'text-blue-600' },
        { label: 'Rate',    value: `${stats.percentage}%`, icon: BarChart3,   color: 'text-foreground' },
    ];

    return (
        <AppLayout>
            <Head title="Attendance Dashboard" />

            <div className="flex flex-col gap-6 p-6">

                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between print:hidden">
                    <div>
                        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Attendance Dashboard</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">Dashboard / Students / Attendance</p>
                    </div>
                    {records.length > 0 && (
                        <div className="flex items-center gap-2">
                            <a
                                href={exportUrl}
                                className="inline-flex items-center gap-1.5 h-9 px-3 text-sm rounded-md border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-medium transition-colors"
                            >
                                <Download className="h-3.5 w-3.5" /> Export Excel
                            </a>
                            <Button
                                size="sm"
                                onClick={() => window.print()}
                                className="bg-indigo-600 hover:bg-indigo-700 gap-1.5 h-9"
                            >
                                <Printer className="h-3.5 w-3.5" /> Print / PDF
                            </Button>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="rounded-xl border border-border bg-white p-4 shadow-sm print:hidden">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-foreground">Class</Label>
                            <Select value={classId || 'all'} onValueChange={v => setClassId(v === 'all' ? '' : v)}>
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="All Classes" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Classes</SelectItem>
                                    {classes.map(c => (
                                        <SelectItem key={c.id} value={c.id.toString()}>
                                            {c.name} — {c.level}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-foreground">Date</Label>
                            <Input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="bg-white"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-foreground">Status</Label>
                            <Select value={status || 'all'} onValueChange={v => setStatus(v === 'all' ? '' : v)}>
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="present">Present</SelectItem>
                                    <SelectItem value="absent">Absent</SelectItem>
                                    <SelectItem value="late">Late</SelectItem>
                                    <SelectItem value="excused">Excused</SelectItem>
                                    <SelectItem value="sick">Sick</SelectItem>
                                    <SelectItem value="leave">Leave</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 gap-1.5 h-9">
                            <Eye className="h-3.5 w-3.5" /> View Attendance
                        </Button>
                    </form>
                </div>

                {/* Stats summary */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 print:hidden">
                    {STATS_CARDS.map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="rounded-lg border bg-white p-3 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
                                <Icon className={`h-3.5 w-3.5 ${color}`} />
                            </div>
                            <div className={`text-xl font-bold ${color}`}>{value}</div>
                        </div>
                    ))}
                </div>

                {/* Results */}
                {records.length > 0 ? (
                    <div className="rounded-xl border border-border shadow-sm overflow-hidden bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        {['#', 'Adm No', 'Student Name', 'Class', 'Date', 'Status', 'Notes', 'Marked By'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-white">
                                    {records.map((rec, idx) => {
                                        const sc = STATUS_CONFIG[rec.status] ?? { label: rec.status, badge: 'bg-gray-100 text-gray-600 border border-gray-300' };
                                        return (
                                            <tr key={rec.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-3 text-xs text-muted-foreground">{idx + 1}</td>
                                                <td className="px-4 py-3 font-mono text-xs text-foreground whitespace-nowrap">{rec.admission_number}</td>
                                                <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{rec.student_name}</td>
                                                <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{rec.class_name}</td>
                                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{rec.date}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${sc.badge}`}>
                                                        {sc.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px] truncate">{rec.notes || '—'}</td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{rec.marked_by}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-4 py-2.5 bg-muted/30 border-t border-border text-xs text-muted-foreground flex justify-between">
                            <span>{records.length} record{records.length !== 1 ? 's' : ''}</span>
                            <span className="print:hidden">{date}</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="h-14 w-14 rounded-full bg-muted border border-border flex items-center justify-center">
                            <Users className="h-7 w-7 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">No Attendance Records Found</p>
                        <p className="text-xs text-muted-foreground">
                            Select a class, date and status above, then click "View Attendance".
                        </p>
                    </div>
                )}

            </div>
        </AppLayout>
    );
}
