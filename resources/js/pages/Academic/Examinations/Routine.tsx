import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Calendar,
    Search,
    Clock,
    MapPin,
    UserCheck,
    Printer,
    LayoutGrid,
    List,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Table2,
    AlertCircle,
    CheckCircle2,
    Timer,
} from 'lucide-react';

interface Examination { id: number; name: string; exam_type: string }

interface RoutineSession {
    id: number;
    examName: string;
    className: string;
    subjectName: string;
    subjectCode: string;
    date: string;
    startTime: string;
    endTime: string;
    room: string;
    invigilator: string;
    maxMarks: number;
}

interface Props {
    examinations: Examination[];
    routines: RoutineSession[];
    currentSchool: { id: number; name: string };
}

/* ─── Palette ─────────────────────────────────────────────── */

const SUBJECT_PALETTE = [
    { bg: 'bg-blue-500',    light: 'bg-blue-50 border-blue-200',    text: 'text-blue-600',    badge: 'bg-blue-100 text-blue-700',    icon: 'text-blue-500' },
    { bg: 'bg-violet-500',  light: 'bg-violet-50 border-violet-200', text: 'text-violet-600',  badge: 'bg-violet-100 text-violet-700', icon: 'text-violet-500' },
    { bg: 'bg-emerald-500', light: 'bg-emerald-50 border-emerald-200',text: 'text-emerald-600',badge: 'bg-emerald-100 text-emerald-700',icon: 'text-emerald-500' },
    { bg: 'bg-amber-500',   light: 'bg-amber-50 border-amber-200',   text: 'text-amber-600',   badge: 'bg-amber-100 text-amber-700',   icon: 'text-amber-500' },
    { bg: 'bg-rose-500',    light: 'bg-rose-50 border-rose-200',     text: 'text-rose-600',    badge: 'bg-rose-100 text-rose-700',     icon: 'text-rose-500' },
    { bg: 'bg-cyan-500',    light: 'bg-cyan-50 border-cyan-200',     text: 'text-cyan-600',    badge: 'bg-cyan-100 text-cyan-700',     icon: 'text-cyan-500' },
    { bg: 'bg-orange-500',  light: 'bg-orange-50 border-orange-200', text: 'text-orange-600',  badge: 'bg-orange-100 text-orange-700', icon: 'text-orange-500' },
    { bg: 'bg-pink-500',    light: 'bg-pink-50 border-pink-200',     text: 'text-pink-600',    badge: 'bg-pink-100 text-pink-700',     icon: 'text-pink-500' },
];
type SubjectColor = typeof SUBJECT_PALETTE[0];

function useSubjectColor(map: Map<string, number>) {
    return (name: string) => SUBJECT_PALETTE[(map.get(name) ?? 0) % SUBJECT_PALETTE.length];
}

/* ─── Helpers ─────────────────────────────────────────────── */

function countdownLabel(dateStr: string): { label: string; status: 'past' | 'today' | 'soon' | 'upcoming' } {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
    const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
    if (diff < 0)   return { label: 'Completed',       status: 'past' };
    if (diff === 0) return { label: 'Today',            status: 'today' };
    if (diff === 1) return { label: 'Tomorrow',         status: 'soon' };
    if (diff <= 7)  return { label: `In ${diff} days`,  status: 'soon' };
    return           { label: `In ${diff} days`,        status: 'upcoming' };
}

function formatDate(dateStr: string, opts?: Intl.DateTimeFormatOptions) {
    return new Date(dateStr).toLocaleDateString('en-US', opts ?? {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
}

function durationMins(start: string, end: string) {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
}

/* ─── CountdownPill ───────────────────────────────────────── */

function CountdownPill({ dateStr }: { dateStr: string }) {
    const { label, status } = countdownLabel(dateStr);
    const cls = {
        past:     'bg-violet-50 text-violet-400 border-violet-200',
        today:    'bg-emerald-100 text-emerald-700 border-emerald-300 animate-pulse',
        soon:     'bg-amber-100 text-amber-700 border-amber-300',
        upcoming: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    }[status];
    return (
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
            {status === 'today' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
            {label}
        </span>
    );
}

/* ─── StatCard ────────────────────────────────────────────── */

function StatCard({ icon: Icon, label, value, color, lightBg, textColor }: {
    icon: React.ElementType; label: string; value: string | number;
    color: string; lightBg: string; textColor: string;
}) {
    return (
        <div className={`flex items-center gap-4 rounded-xl border p-4 ${lightBg} shadow-sm`}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
                <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
                <p className={`text-xs font-medium ${textColor}`}>{label}</p>
                <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{value}</p>
            </div>
        </div>
    );
}

/* ─── SessionCard ─────────────────────────────────────────── */

function SessionCard({ session, color }: { session: RoutineSession; color: SubjectColor }) {
    const mins = durationMins(session.startTime, session.endTime);
    const { light, text, badge, icon } = color;
    const { status } = countdownLabel(session.date);
    const isPast = status === 'past';

    return (
        <div className={`group rounded-xl border ${light} shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${isPast ? 'opacity-55' : ''}`}>
            <div className="px-4 pt-4 pb-3">
                {/* Top row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                        <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge} mb-1`}>
                            {session.className}
                        </span>
                        <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 leading-tight truncate">
                            {session.subjectName}
                        </h4>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <CountdownPill dateStr={session.date} />
                        <span className={`font-mono text-[10px] ${text} font-semibold`}>{session.subjectCode}</span>
                    </div>
                </div>

                {/* Exam name */}
                <p className={`text-[11px] italic truncate mb-3 border-b pb-2 ${text} opacity-70 border-current/20`}>
                    {session.examName}
                </p>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                    <div className="flex items-center gap-1.5">
                        <Clock className={`h-3.5 w-3.5 ${icon} shrink-0`} />
                        <div>
                            <p className="font-semibold text-zinc-700 dark:text-zinc-300">
                                {session.startTime} – {session.endTime}
                            </p>
                            <p className={`text-[10px] ${text} opacity-60`}>{mins} min</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MapPin className={`h-3.5 w-3.5 ${icon} shrink-0`} />
                        <div>
                            <p className="font-semibold text-zinc-700 dark:text-zinc-300">{session.room}</p>
                            <p className={`text-[10px] ${text} opacity-60`}>{session.maxMarks} marks</p>
                        </div>
                    </div>
                </div>

                {/* Invigilator */}
                <div className={`mt-3 pt-2 border-t border-current/10 flex items-center gap-1.5 ${text}`}>
                    <UserCheck className={`h-3.5 w-3.5 ${icon} shrink-0`} />
                    <span className="text-[11px]">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-200">{session.invigilator}</span>
                        <span className="opacity-60"> · Invigilator</span>
                    </span>
                </div>
            </div>
        </div>
    );
}

/* ─── Main ────────────────────────────────────────────────── */

type ViewMode = 'timeline' | 'grid' | 'table';

export default function ExaminationsRoutine({ examinations, routines, currentSchool }: Props) {
    const [selectedExam, setSelectedExam]   = useState('all');
    const [selectedClass, setSelectedClass] = useState('all');
    const [searchQuery, setSearchQuery]     = useState('');
    const [viewMode, setViewMode]           = useState<ViewMode>('timeline');
    const [weekOffset, setWeekOffset]       = useState(0);

    const subjectColorMap = useMemo(() => {
        const map = new Map<string, number>(); let idx = 0;
        routines.forEach(r => { if (!map.has(r.subjectName)) map.set(r.subjectName, idx++); });
        return map;
    }, [routines]);
    const getColor = useSubjectColor(subjectColorMap);

    const uniqueClasses = useMemo(() => [...new Set(routines.map(r => r.className))], [routines]);

    const filtered = useMemo(() => routines.filter(s => {
        const q = searchQuery.toLowerCase();
        return (
            (selectedExam === 'all' || s.examName === selectedExam) &&
            (selectedClass === 'all' || s.className === selectedClass) &&
            (!q || s.subjectName.toLowerCase().includes(q) ||
                s.subjectCode.toLowerCase().includes(q) ||
                s.invigilator.toLowerCase().includes(q) ||
                s.room.toLowerCase().includes(q))
        );
    }), [routines, selectedExam, selectedClass, searchQuery]);

    const todayStr      = new Date().toISOString().split('T')[0];
    const todayCount    = filtered.filter(s => s.date === todayStr).length;
    const upcomingCount = filtered.filter(s => s.date >= todayStr).length;
    const uniqueSubjects = new Set(filtered.map(s => s.subjectName)).size;
    const uniqueRooms    = new Set(filtered.map(s => s.room)).size;

    const byDate = useMemo(() => {
        const map: Record<string, RoutineSession[]> = {};
        filtered.forEach(s => { (map[s.date] ??= []).push(s); });
        return map;
    }, [filtered]);
    const sortedDates = Object.keys(byDate).sort();

    /* Week grid */
    const getWeekDates = (offset: number) => {
        const base = new Date(); base.setHours(0, 0, 0, 0);
        const mon = new Date(base);
        mon.setDate(base.getDate() - ((base.getDay() + 6) % 7) + offset * 7);
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(mon); d.setDate(mon.getDate() + i);
            return d.toISOString().split('T')[0];
        });
    };
    const weekDates    = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
    const weekSessions = useMemo(() => {
        const map: Record<string, RoutineSession[]> = {};
        weekDates.forEach(d => { map[d] = byDate[d] ?? []; });
        return map;
    }, [weekDates, byDate]);
    const weekHasData = weekDates.some(d => weekSessions[d]?.length > 0);
    const DAY_NAMES   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    /* Table sort */
    const [sortField, setSortField] = useState<keyof RoutineSession>('date');
    const [sortDir, setSortDir]     = useState<'asc' | 'desc'>('asc');
    const toggleSort = (f: keyof RoutineSession) => {
        if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(f); setSortDir('asc'); }
    };
    const tableSorted = useMemo(() => [...filtered].sort((a, b) => {
        const av = String(a[sortField]); const bv = String(b[sortField]);
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    }), [filtered, sortField, sortDir]);

    const SortHeader = ({ field, label }: { field: keyof RoutineSession; label: string }) => (
        <th
            className="px-4 py-3 text-left text-xs font-semibold text-indigo-500 uppercase tracking-wide cursor-pointer select-none hover:text-indigo-800 transition-colors"
            onClick={() => toggleSort(field)}
        >
            {label}{sortField === field && <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>}
        </th>
    );

    return (
        <AppLayout>
            <Head title="Examination Timetable" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 print:p-4 print:gap-4">

                {/* ── Header ───────────────────────────────────────── */}
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between print:border-b print:pb-4">
                    <div>
                        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Examination Timetable</h1>
                        <p className="text-xs text-indigo-400 mt-0.5">Dashboard / Examinations / Timetable</p>
                    </div>

                    <div className="flex items-center gap-2 print:hidden">
                        {/* View toggle */}
                        <div className="flex items-center bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 rounded-lg p-1 gap-0.5">
                            {([
                                { id: 'timeline', icon: List,       label: 'Timeline' },
                                { id: 'grid',     icon: LayoutGrid,  label: 'Week' },
                                { id: 'table',    icon: Table2,      label: 'Table' },
                            ] as const).map(({ id, icon: Icon, label }) => (
                                <button
                                    key={id}
                                    onClick={() => setViewMode(id)}
                                    className={`flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium transition-all ${
                                        viewMode === id
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'text-indigo-500 hover:text-indigo-700 hover:bg-indigo-100'
                                    }`}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {label}
                                </button>
                            ))}
                        </div>

                        <Button variant="outline" size="sm" onClick={() => window.print()}
                            className="h-9 gap-1.5 border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                            <Printer className="h-3.5 w-3.5" />
                            Print
                        </Button>
                    </div>
                </div>

                {/* ── Stats ────────────────────────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
                    <StatCard icon={Calendar}     label="Total Sessions" value={filtered.length}
                        color="bg-indigo-500"  lightBg="bg-indigo-50 border border-indigo-200"  textColor="text-indigo-500" />
                    <StatCard icon={CheckCircle2} label="Today's Exams"  value={todayCount}
                        color="bg-emerald-500" lightBg="bg-emerald-50 border border-emerald-200" textColor="text-emerald-600" />
                    <StatCard icon={Timer}        label="Upcoming"       value={upcomingCount}
                        color="bg-amber-500"   lightBg="bg-amber-50 border border-amber-200"   textColor="text-amber-600" />
                    <StatCard icon={BookOpen}     label="Subjects"       value={uniqueSubjects}
                        color="bg-rose-500"    lightBg="bg-rose-50 border border-rose-200"    textColor="text-rose-600" />
                </div>

                {/* ── Filters ──────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-xl p-3 shadow-sm print:hidden">
                    <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
                        <Input
                            placeholder="Search subject, invigilator, room..."
                            className="pl-9 h-9 border-indigo-200 focus-visible:ring-indigo-400 text-sm bg-white"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={selectedExam} onValueChange={setSelectedExam}>
                        <SelectTrigger className="h-9 w-full sm:w-52 border-indigo-200 text-sm bg-white">
                            <SelectValue placeholder="All Examinations" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Examinations</SelectItem>
                            {examinations.map(e => (
                                <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                        <SelectTrigger className="h-9 w-full sm:w-44 border-indigo-200 text-sm bg-white">
                            <SelectValue placeholder="All Classes" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Classes</SelectItem>
                            {uniqueClasses.map((c, i) => (
                                <SelectItem key={i} value={c}>{c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {(selectedExam !== 'all' || selectedClass !== 'all' || searchQuery) && (
                        <Button variant="ghost" size="sm" className="h-9 text-rose-500 hover:text-rose-700 hover:bg-rose-50 shrink-0 text-xs"
                            onClick={() => { setSelectedExam('all'); setSelectedClass('all'); setSearchQuery(''); }}>
                            Clear
                        </Button>
                    )}
                </div>

                {/* ── Empty state ───────────────────────────────────── */}
                {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="h-14 w-14 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                            <AlertCircle className="h-7 w-7 text-indigo-400" />
                        </div>
                        <p className="text-base font-semibold text-zinc-700 dark:text-zinc-300">No scheduled sessions found</p>
                        <p className="text-sm text-indigo-400">Adjust the filters above to find exam sessions.</p>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════
                    TIMELINE VIEW
                ══════════════════════════════════════════════════════ */}
                {viewMode === 'timeline' && filtered.length > 0 && (
                    <div className="space-y-8">
                        {sortedDates.map(dateStr => {
                            const sessions  = byDate[dateStr];
                            const { label: cdLabel, status } = countdownLabel(dateStr);
                            const isToday   = status === 'today';

                            const dateLabelCls = {
                                past:     'border-violet-300 text-violet-500',
                                today:    'border-emerald-500 text-emerald-700',
                                soon:     'border-amber-400 text-amber-700',
                                upcoming: 'border-indigo-500 text-indigo-700',
                            }[status];

                            const subLabelCls = {
                                past:     'text-violet-400',
                                today:    'text-emerald-500',
                                soon:     'text-amber-500',
                                upcoming: 'text-indigo-400',
                            }[status];

                            return (
                                <div key={dateStr}>
                                    <div className={`flex items-center gap-3 border-l-4 pl-3 mb-4 ${dateLabelCls}`}>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-extrabold text-zinc-800 dark:text-zinc-100">
                                                    {formatDate(dateStr)}
                                                </h3>
                                                {isToday && (
                                                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Today</span>
                                                )}
                                            </div>
                                            <p className={`text-xs font-medium mt-0.5 ${subLabelCls}`}>
                                                {sessions.length} session{sessions.length !== 1 ? 's' : ''} scheduled · {cdLabel}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {sessions.map(session => (
                                            <SessionCard key={session.id} session={session} color={getColor(session.subjectName)} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════
                    WEEK GRID VIEW
                ══════════════════════════════════════════════════════ */}
                {viewMode === 'grid' && filtered.length > 0 && (
                    <div className="space-y-4">
                        {/* Week nav */}
                        <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 shadow-sm">
                            <button
                                onClick={() => setWeekOffset(o => o - 1)}
                                className="flex items-center gap-1 text-xs font-medium text-indigo-500 hover:text-indigo-800 transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" /> Prev Week
                            </button>
                            <div className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                                {formatDate(weekDates[0], { month: 'short', day: 'numeric' })}
                                &nbsp;—&nbsp;
                                {formatDate(weekDates[6], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <button
                                onClick={() => setWeekOffset(o => o + 1)}
                                className="flex items-center gap-1 text-xs font-medium text-indigo-500 hover:text-indigo-800 transition-colors"
                            >
                                Next Week <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>

                        {/* 7-column calendar */}
                        <div className="overflow-x-auto">
                            <div className="min-w-[900px] grid grid-cols-7 gap-2">
                                {weekDates.map((dateStr, idx) => {
                                    const sessions = weekSessions[dateStr] ?? [];
                                    const isToday  = dateStr === todayStr;
                                    const isPast   = dateStr < todayStr;
                                    const dayNum   = new Date(dateStr).getDate();

                                    return (
                                        <div key={dateStr} className={`rounded-xl border overflow-hidden ${
                                            isToday
                                                ? 'border-indigo-400 bg-indigo-50/60'
                                                : isPast
                                                    ? 'border-violet-100 bg-violet-50/30'
                                                    : 'border-blue-100 bg-blue-50/20'
                                        }`}>
                                            {/* Day header */}
                                            <div className={`px-2 py-2 text-center border-b ${
                                                isToday
                                                    ? 'border-indigo-300 bg-indigo-600'
                                                    : isPast
                                                        ? 'border-violet-100 bg-violet-100/60'
                                                        : 'border-blue-100 bg-blue-100/50'
                                            }`}>
                                                <p className={`text-[10px] font-bold uppercase tracking-wider ${
                                                    isToday ? 'text-white' : isPast ? 'text-violet-500' : 'text-blue-600'
                                                }`}>
                                                    {DAY_NAMES[idx]}
                                                </p>
                                                <p className={`text-xl font-extrabold leading-tight ${
                                                    isToday ? 'text-white' : isPast ? 'text-violet-400' : 'text-blue-700'
                                                }`}>
                                                    {dayNum}
                                                </p>
                                            </div>

                                            {/* Sessions */}
                                            <div className="p-1.5 space-y-1.5 min-h-[120px]">
                                                {sessions.length === 0 ? (
                                                    <div className={`flex items-center justify-center h-16 text-[10px] font-medium ${
                                                        isPast ? 'text-violet-200' : 'text-blue-200'
                                                    }`}>
                                                        No exam
                                                    </div>
                                                ) : sessions.map(s => {
                                                    const c = getColor(s.subjectName);
                                                    return (
                                                        <div key={s.id} className={`rounded-lg border ${c.light} p-1.5 cursor-default`}>
                                                            <p className={`text-[10px] font-bold leading-tight ${c.text} truncate`}>
                                                                {s.subjectName}
                                                            </p>
                                                            <p className={`text-[9px] ${c.text} opacity-70 truncate`}>{s.className}</p>
                                                            <p className={`text-[9px] mt-0.5 font-mono ${c.text} opacity-60`}>
                                                                {s.startTime}–{s.endTime}
                                                            </p>
                                                            <p className={`text-[9px] ${c.text} opacity-60 truncate`}>{s.room}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {!weekHasData && (
                            <div className="text-center py-10 text-sm text-indigo-400">
                                No exams scheduled this week. Navigate to another week.
                            </div>
                        )}

                        {/* Subject legend */}
                        {weekHasData && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {[...new Set(filtered.map(s => s.subjectName))].map(name => {
                                    const c = getColor(name);
                                    return (
                                        <span key={name} className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full ${c.badge}`}>
                                            <span className={`h-2 w-2 rounded-full ${c.bg}`} />
                                            {name}
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════
                    TABLE VIEW
                ══════════════════════════════════════════════════════ */}
                {viewMode === 'table' && filtered.length > 0 && (
                    <div className="rounded-xl border border-indigo-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[900px]">
                                <thead className="bg-indigo-50 dark:bg-indigo-950/40 border-b border-indigo-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-400 uppercase tracking-wide w-8">#</th>
                                        <SortHeader field="date"        label="Date" />
                                        <SortHeader field="subjectName" label="Subject" />
                                        <SortHeader field="className"   label="Class" />
                                        <SortHeader field="startTime"   label="Time" />
                                        <SortHeader field="room"        label="Room" />
                                        <SortHeader field="invigilator" label="Invigilator" />
                                        <SortHeader field="maxMarks"    label="Marks" />
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-500 uppercase tracking-wide">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-indigo-50 dark:divide-indigo-900/40 bg-white dark:bg-zinc-900">
                                    {tableSorted.map((s, i) => {
                                        const color  = getColor(s.subjectName);
                                        const { status } = countdownLabel(s.date);
                                        const isPast = status === 'past';
                                        return (
                                            <tr key={s.id} className={`hover:bg-indigo-50/40 transition-colors ${isPast ? 'opacity-55' : ''}`}>
                                                <td className="px-4 py-3 text-xs text-indigo-300">{i + 1}</td>
                                                <td className="px-4 py-3">
                                                    <div className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
                                                        {formatDate(s.date, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                    </div>
                                                    <div className={`text-[10px] ${color.text} opacity-70`}>{s.examName}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`h-2 w-2 rounded-full ${color.bg} shrink-0`} />
                                                        <div>
                                                            <p className="font-semibold text-zinc-800 dark:text-zinc-200">{s.subjectName}</p>
                                                            <p className={`text-[10px] font-mono ${color.text} opacity-70`}>{s.subjectCode}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${color.badge}`}>{s.className}</span>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-300">
                                                    {s.startTime} – {s.endTime}
                                                    <div className={`text-[10px] ${color.text} opacity-60`}>{durationMins(s.startTime, s.endTime)} min</div>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-300">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className={`h-3 w-3 ${color.icon}`} />
                                                        {s.room}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-300">
                                                    <div className="flex items-center gap-1">
                                                        <UserCheck className={`h-3 w-3 ${color.icon}`} />
                                                        {s.invigilator}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-xs font-bold text-zinc-700 dark:text-zinc-300 text-center">
                                                    {s.maxMarks}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <CountdownPill dateStr={s.date} />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-t border-indigo-100 px-4 py-2.5 bg-indigo-50/60 text-xs text-indigo-500 flex items-center justify-between">
                            <span>{filtered.length} session{filtered.length !== 1 ? 's' : ''}</span>
                            <span>{uniqueRooms} room{uniqueRooms !== 1 ? 's' : ''} · {uniqueSubjects} subject{uniqueSubjects !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                )}

            </div>

            <style>{`
                @media print {
                    .print\\:hidden { display: none !important; }
                    body { background: white; }
                }
            `}</style>
        </AppLayout>
    );
}
