import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer, Eye, ClipboardList, CheckCircle2, XCircle, Save } from 'lucide-react';

interface StudentRow {
    id: number;
    seat_number: string;
    student: { id: number; name: string; student_profile: { admission_number: string } | null };
}

interface Session {
    id: number;
    label: string;
    date: string;
    start_time: string;
    end_time: string;
}

interface Props {
    exams: { id: number; name: string }[];
    rooms: { id: number; room_number: string; capacity: number }[];
    sessions: Session[];
    students: StudentRow[];
    attendance: Record<string, 'present' | 'absent'>;
    filters: { exam_id?: string; room_id?: string; session_id?: string };
}

export default function AttendanceSheets({ exams, rooms, sessions, students, attendance: savedAttendance, filters }: Props) {
    const [examId,    setExamId]    = useState(filters.exam_id    || '');
    const [roomId,    setRoomId]    = useState(filters.room_id    || '');
    const [sessionId, setSessionId] = useState(filters.session_id || '');

    // local attendance state – must use useEffect because Inertia doesn't remount on same-page navigation
    const [marks, setMarks] = useState<Record<number, 'present' | 'absent'>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const init: Record<number, 'present' | 'absent'> = {};
        students.forEach(s => {
            init[s.student.id] = (savedAttendance[String(s.student.id)] as 'present' | 'absent') ?? 'present';
        });
        setMarks(init);
    }, [students, savedAttendance]);

    const selectedRoom = rooms.find(r => r.id.toString() === roomId);
    const selectedExam = exams.find(e => e.id.toString() === examId);
    const selectedSession = sessions.find(s => s.id.toString() === sessionId);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/academic/sitting-plans/attendance-sheets', {
            exam_id: examId, room_id: roomId, session_id: sessionId,
        }, { preserveState: true });
    };

    const applyExamRoom = () => {
        router.get('/academic/sitting-plans/attendance-sheets', {
            exam_id: examId, room_id: roomId,
        }, { preserveState: true });
    };

    const toggle = (studentId: number) =>
        setMarks(prev => ({ ...prev, [studentId]: prev[studentId] === 'present' ? 'absent' : 'present' }));

    const markAll = (status: 'present' | 'absent') =>
        setMarks(students.reduce((acc, s) => ({ ...acc, [s.student.id]: status }), {} as Record<number, 'present' | 'absent'>));

    const handleSave = () => {
        if (saving || !sessionId || Object.keys(marks).length === 0) return;
        setSaving(true);
        router.post('/academic/sitting-plans/attendance-sheets/mark', {
            session_id: sessionId,
            attendance: marks,
        }, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    };

    const presentCount = students.filter(s => marks[s.student.id] === 'present').length;
    const absentCount  = students.length - presentCount;

    const page = usePage<{ flash: { success?: string; error?: string } }>();
    const flash = page.props.flash;

    return (
        <AppLayout>
            <Head title="Attendance Sheets" />

            <div className="flex flex-col gap-6 p-6">

                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between print:hidden">
                    <div>
                        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Room Attendance Sheets</h1>
                        <p className="text-xs text-indigo-400 mt-0.5">Dashboard / Sitting Plans / Attendance Sheets</p>
                    </div>
                    {students.length > 0 && (
                        <Button size="sm" onClick={() => window.print()} className="bg-indigo-600 hover:bg-indigo-700 gap-1.5 h-9 print:hidden">
                            <Printer className="h-3.5 w-3.5" /> Print Sheet
                        </Button>
                    )}
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 flex items-center gap-2 print:hidden">
                        <CheckCircle2 className="h-4 w-4 shrink-0" /> {flash.success}
                    </div>
                )}

                {/* Step 1: Exam + Room */}
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 shadow-sm print:hidden">
                    <p className="text-xs font-bold text-indigo-700 mb-3 uppercase tracking-wide">Step 1 — Select Exam &amp; Room</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-indigo-700">Examination</Label>
                            <Select value={examId} onValueChange={v => { setExamId(v); setSessionId(''); }}>
                                <SelectTrigger className="border-indigo-200 bg-white"><SelectValue placeholder="Choose Examination" /></SelectTrigger>
                                <SelectContent>{exams.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-indigo-700">Room</Label>
                            <Select value={roomId} onValueChange={v => { setRoomId(v); setSessionId(''); }}>
                                <SelectTrigger className="border-indigo-200 bg-white"><SelectValue placeholder="Choose Room" /></SelectTrigger>
                                <SelectContent>{rooms.map(r => <SelectItem key={r.id} value={r.id.toString()}>Room {r.room_number}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <Button type="button" onClick={applyExamRoom} className="bg-indigo-600 hover:bg-indigo-700 gap-1.5 h-9" disabled={!examId || !roomId}>
                            <Eye className="h-3.5 w-3.5" /> Load Sessions
                        </Button>
                    </div>
                </div>

                {/* Step 2: Session picker */}
                {sessions.length > 0 && (
                    <form onSubmit={handleFilter} className="rounded-xl border border-sky-200 bg-sky-50/60 p-4 shadow-sm print:hidden">
                        <p className="text-xs font-bold text-sky-700 mb-3 uppercase tracking-wide">Step 2 — Select Exam Session</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div className="col-span-2 space-y-1.5">
                                <Label className="text-xs font-semibold text-sky-700">Session (Subject &amp; Class)</Label>
                                <Select value={sessionId} onValueChange={setSessionId}>
                                    <SelectTrigger className="border-sky-200 bg-white"><SelectValue placeholder="Choose Session to Mark" /></SelectTrigger>
                                    <SelectContent>
                                        {sessions.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" className="bg-sky-600 hover:bg-sky-700 gap-1.5 h-9" disabled={!sessionId}>
                                <Eye className="h-3.5 w-3.5" /> Load Students
                            </Button>
                        </div>
                    </form>
                )}

                {sessions.length === 0 && examId && roomId && (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 rounded-xl border border-zinc-200 bg-white print:hidden">
                        <ClipboardList className="h-8 w-8 text-zinc-300" />
                        <p className="text-sm font-semibold text-zinc-500">No exam sessions found for this room and exam.</p>
                    </div>
                )}

                {/* Step 3: Attendance marking */}
                {students.length > 0 && sessionId && (
                    <>
                        {/* Stats strip */}
                        <div className="grid grid-cols-3 gap-4 print:hidden">
                            <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-center">
                                <p className="text-2xl font-bold text-indigo-700">{students.length}</p>
                                <p className="text-xs text-indigo-400 font-semibold">Total</p>
                            </div>
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
                                <p className="text-2xl font-bold text-emerald-600">{presentCount}</p>
                                <p className="text-xs text-emerald-400 font-semibold">Present</p>
                            </div>
                            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-center">
                                <p className="text-2xl font-bold text-rose-600">{absentCount}</p>
                                <p className="text-xs text-rose-400 font-semibold">Absent</p>
                            </div>
                        </div>

                        {/* Attendance sheet card */}
                        <div className="rounded-xl border-2 border-indigo-200 shadow-md overflow-hidden">

                            {/* Print header */}
                            <div className="text-center border-b border-indigo-200 bg-indigo-600 text-white py-5 px-6">
                                <h2 className="text-lg font-bold tracking-widest uppercase">Candidate Attendance Register</h2>
                                <p className="text-xs text-indigo-200 mt-1 uppercase tracking-widest font-semibold">
                                    Room {selectedRoom?.room_number} &bull; {selectedExam?.name}
                                </p>
                                {selectedSession && (
                                    <p className="text-xs text-indigo-300 mt-0.5">{selectedSession.label} · {selectedSession.start_time} – {selectedSession.end_time}</p>
                                )}
                            </div>

                            {/* Bulk actions */}
                            <div className="flex items-center justify-between px-5 py-3 border-b border-indigo-100 bg-white print:hidden">
                                <span className="text-xs text-zinc-500">{students.length} candidates</span>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => markAll('present')} className="h-7 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                                        Mark All Present
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => markAll('absent')} className="h-7 text-xs border-rose-300 text-rose-700 hover:bg-rose-50">
                                        Mark All Absent
                                    </Button>
                                </div>
                            </div>

                            <table className="w-full text-sm">
                                <thead className="bg-indigo-50 border-b border-indigo-200">
                                    <tr>
                                        {['Seat', 'Adm. No', 'Student Name', 'Status', 'Signature (print)'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-indigo-500 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-indigo-50 bg-white">
                                    {students.map(s => {
                                        const status = marks[s.student.id] ?? 'present';
                                        return (
                                            <tr key={s.id} className={`transition-colors ${status === 'absent' ? 'bg-rose-50/40' : 'hover:bg-indigo-50/20'}`}>
                                                <td className="px-4 py-3 font-mono font-bold text-indigo-600">{s.seat_number}</td>
                                                <td className="px-4 py-3 font-mono text-xs text-indigo-400">{s.student.student_profile?.admission_number}</td>
                                                <td className="px-4 py-3 font-semibold text-zinc-800">{s.student.name}</td>
                                                <td className="px-4 py-3 print:hidden">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggle(s.student.id)}
                                                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                                                            status === 'present'
                                                                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                                                                : 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                                                        }`}
                                                    >
                                                        {status === 'present'
                                                            ? <><CheckCircle2 className="h-3.5 w-3.5" /> Present</>
                                                            : <><XCircle className="h-3.5 w-3.5" /> Absent</>
                                                        }
                                                    </button>
                                                </td>
                                                {/* Print-only status */}
                                                <td className="px-4 py-3 hidden print:table-cell text-xs font-bold">
                                                    {status === 'present' ? '✓ Present' : '✗ Absent'}
                                                </td>
                                                <td className="px-4 py-3 border-l border-dashed border-indigo-200 print:table-cell">
                                                    <div className="w-36 h-7 border-b-2 border-dotted border-indigo-300" />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {/* Save button */}
                            <div className="flex items-center justify-between px-5 py-4 border-t border-indigo-100 bg-indigo-50/40 print:hidden">
                                <p className="text-xs text-indigo-400">Click a student's status to toggle. Save when done.</p>
                                <Button onClick={handleSave} disabled={saving || Object.keys(marks).length === 0} className="bg-indigo-600 hover:bg-indigo-700 gap-1.5 h-9">
                                    <Save className="h-3.5 w-3.5" />
                                    {saving ? 'Saving…' : 'Save Attendance'}
                                </Button>
                            </div>

                            {/* Print sign-off footer */}
                            <div className="grid grid-cols-2 gap-8 px-8 py-8 border-t-2 border-dashed border-indigo-200 bg-indigo-50/40 text-sm text-zinc-600 hidden print:grid">
                                <div className="space-y-3">
                                    <div className="w-56 border-b-2 border-zinc-400 h-8" />
                                    <p className="text-xs font-medium text-zinc-500">Invigilator Signature &amp; Date</p>
                                </div>
                                <div className="space-y-3 flex flex-col items-end">
                                    <div className="w-56 border-b-2 border-zinc-400 h-8" />
                                    <p className="text-xs font-medium text-zinc-500">Head Teacher Signature &amp; Date</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Empty state when no session chosen yet */}
                {students.length === 0 && !sessionId && !examId && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-xl border border-zinc-200 bg-white">
                        <div className="h-14 w-14 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                            <ClipboardList className="h-7 w-7 text-indigo-400" />
                        </div>
                        <p className="text-sm font-semibold text-zinc-700">No Attendance Loaded</p>
                        <p className="text-xs text-indigo-400">Select an exam and room above to begin marking attendance.</p>
                    </div>
                )}

            </div>

            <style>{`@media print { .print\\:hidden { display: none !important; } .hidden.print\\:grid { display: grid !important; } .hidden.print\\:table-cell { display: table-cell !important; } }`}</style>
        </AppLayout>
    );
}
