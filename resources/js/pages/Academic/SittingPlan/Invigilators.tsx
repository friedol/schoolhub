import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, ShieldAlert, CheckCircle2, Calendar, Phone } from 'lucide-react';

interface Session {
    id: number;
    label: string;
    detail: string;
    room: string;
    has_invigilator: boolean;
}

interface Teacher { id: number; name: string; phone: string | null }

interface Assignment {
    id: number;
    exam: { name: string };
    subject: { name: string };
    school_class: { name: string };
    room: { room_number: string } | null;
    date: string;
    start_time: string;
    end_time: string;
    invigilator: { name: string; phone: string | null };
}

interface Props {
    sessions: Session[];
    teachers: Teacher[];
    assignments: { data: Assignment[]; links: { url: string | null; label: string; active: boolean }[] };
}

export default function InvigilatorsIndex({ sessions, teachers, assignments }: Props) {
    const [sessionId,     setSessionId]     = useState('');
    const [invigilatorId, setInvigilatorId] = useState('');
    const [submitting,    setSubmitting]    = useState(false);
    const [error,         setError]         = useState('');

    const page = usePage<{ flash: { success?: string } }>();
    const flash = page.props.flash;

    const selectedSession = sessions.find(s => s.id.toString() === sessionId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!sessionId || !invigilatorId) return;
        setError('');
        setSubmitting(true);
        router.post('/academic/sitting-plans/invigilators', {
            exam_session_id: sessionId,
            invigilator_id:  invigilatorId,
        }, {
            onSuccess: () => { setSessionId(''); setInvigilatorId(''); setSubmitting(false); },
            onError: (errs) => { setError(errs.invigilator_id || 'Assignment failed.'); setSubmitting(false); },
        });
    };

    return (
        <AppLayout>
            <Head title="Invigilator Assignment" />

            <div className="flex flex-col gap-6 p-6">

                {/* Header */}
                <div>
                    <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Invigilator Assignment</h1>
                    <p className="text-xs text-indigo-400 mt-0.5">Dashboard / Sitting Plans / Invigilators</p>
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0" /> {flash.success}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Assignment form */}
                    <div className="rounded-xl border border-emerald-200 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden h-fit">
                        <div className="px-5 py-4 border-b border-emerald-100 bg-emerald-50">
                            <h2 className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                                <UserCheck className="h-4 w-4" /> Assign Invigilator
                            </h2>
                            <p className="text-xs text-emerald-500 mt-0.5">Pick a session then assign a teacher</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="p-5 space-y-4">

                                {/* Session picker */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-zinc-700">Exam Session</Label>
                                    <Select value={sessionId} onValueChange={v => { setSessionId(v); setError(''); }}>
                                        <SelectTrigger className="border-emerald-200">
                                            <SelectValue placeholder="Choose session…" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sessions.map(s => (
                                                <SelectItem key={s.id} value={s.id.toString()}>
                                                    <span className="flex flex-col">
                                                        <span className="font-semibold">{s.label}</span>
                                                        <span className="text-[10px] text-indigo-400">{s.detail}</span>
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Session detail card */}
                                {selectedSession && (
                                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-xs space-y-1">
                                        <p className="font-bold text-emerald-800">{selectedSession.label}</p>
                                        <p className="text-emerald-600">{selectedSession.detail}</p>
                                        {selectedSession.has_invigilator && (
                                            <p className="text-amber-600 font-semibold">⚠ Already has an invigilator — will be replaced</p>
                                        )}
                                    </div>
                                )}

                                {/* Teacher picker */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-zinc-700">Teacher (Invigilator)</Label>
                                    <Select value={invigilatorId} onValueChange={v => { setInvigilatorId(v); setError(''); }}>
                                        <SelectTrigger className="border-emerald-200">
                                            <SelectValue placeholder="Choose teacher…" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teachers.map(t => (
                                                <SelectItem key={t.id} value={t.id.toString()}>
                                                    {t.name}{t.phone ? ` · ${t.phone}` : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {error && (
                                        <p className="text-xs text-rose-500 flex items-center gap-1">
                                            <ShieldAlert className="h-3 w-3 shrink-0" /> {error}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="px-5 py-3 border-t border-emerald-100 bg-emerald-50/40">
                                <Button
                                    type="submit"
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 h-9"
                                    disabled={submitting || !sessionId || !invigilatorId}
                                >
                                    {submitting ? 'Assigning…' : 'Assign Duty'}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Assignments table */}
                    <div className="lg:col-span-2 rounded-xl border border-indigo-200 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden h-fit">
                        <div className="px-5 py-4 border-b border-indigo-100 bg-indigo-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-bold text-indigo-800">Current Duty Assignments</h2>
                                <p className="text-xs text-indigo-400 mt-0.5">Sessions with assigned invigilators</p>
                            </div>
                            <span className="text-xs font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                                {assignments.data.length} shown
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[540px]">
                                <thead className="bg-indigo-50/60 border-b border-indigo-100">
                                    <tr>
                                        {['Invigilator', 'Session', 'Room', 'Date & Time'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-indigo-500 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-indigo-50">
                                    {assignments.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-12 text-center text-indigo-400 text-sm">
                                                No invigilator duties assigned yet.
                                            </td>
                                        </tr>
                                    ) : assignments.data.map(asg => (
                                        <tr key={asg.id} className="hover:bg-indigo-50/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 shrink-0">
                                                        <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-zinc-800 text-xs">{asg.invigilator.name}</p>
                                                        {asg.invigilator.phone && (
                                                            <p className="text-[10px] text-indigo-400 flex items-center gap-0.5">
                                                                <Phone className="h-2.5 w-2.5" /> {asg.invigilator.phone}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-zinc-800 text-xs">{asg.exam?.name}</p>
                                                <p className="text-[10px] text-indigo-400">{asg.subject?.name} · {asg.school_class?.name}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                {asg.room ? (
                                                    <span className="bg-violet-100 text-violet-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                        Room {asg.room.room_number}
                                                    </span>
                                                ) : <span className="text-zinc-300 text-xs">—</span>}
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                <div className="flex items-center gap-1 text-zinc-600">
                                                    <Calendar className="h-3 w-3 text-indigo-400" />
                                                    {asg.date ? new Date(asg.date).toLocaleDateString() : '—'}
                                                </div>
                                                <p className="font-mono text-[10px] text-indigo-500">{asg.start_time} – {asg.end_time}</p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
