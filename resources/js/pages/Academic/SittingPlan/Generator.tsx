import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, CheckCircle2, Users, Building, Calendar, Zap, BookOpen } from 'lucide-react';
import axios from 'axios';

interface Exam        { id: number; name: string }
interface Term        { id: number; name: string }
interface Subject     { id: number; name: string }
interface SchoolClass { id: number; name: string; students_count: number }
interface Room        { id: number; room_number: string; room_name: string | null; capacity: number }

const STEPS = [
    { n: 1, label: 'Exam & Subject',   icon: BookOpen },
    { n: 2, label: 'Select Classes',   icon: Users },
    { n: 3, label: 'Choose Rooms',     icon: Building },
    { n: 4, label: 'Preview & Run',    icon: Zap },
];

export default function SittingPlanGenerator() {
    const [step, setStep]       = useState(1);
    const [loading, setLoading] = useState(true);
    const [exams, setExams]         = useState<Exam[]>([]);
    const [terms, setTerms]         = useState<Term[]>([]);
    const [subjects, setSubjects]   = useState<Subject[]>([]);
    const [classes, setClasses]     = useState<SchoolClass[]>([]);
    const [rooms, setRooms]         = useState<Room[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        exam_id: '', academic_term_id: '', subject_id: '',
        date: '', start_time: '09:00', end_time: '12:00',
        class_ids: [] as string[],
        room_ids: [] as string[],
        gender_balance: false,
    });

    useEffect(() => {
        axios.get('/academic/sitting-plans/generator-data').then(res => {
            setExams(res.data.exams); setTerms(res.data.terms);
            setSubjects(res.data.subjects); setClasses(res.data.classes);
            setRooms(res.data.rooms); setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const toggleId = (field: 'class_ids' | 'room_ids', id: string) => {
        const arr = [...data[field]];
        const idx = arr.indexOf(id);
        idx > -1 ? arr.splice(idx, 1) : arr.push(id);
        setData(field, arr);
    };

    const totalCandidates = classes.filter(c => data.class_ids.includes(c.id.toString())).reduce((s, c) => s + c.students_count, 0);
    const totalCapacity   = rooms.filter(r => data.room_ids.includes(r.id.toString())).reduce((s, r) => s + r.capacity, 0);
    const capacityOk      = totalCapacity >= totalCandidates;

    if (loading) return (
        <AppLayout>
            <div className="flex h-64 items-center justify-center text-indigo-400 text-sm">Loading configurations...</div>
        </AppLayout>
    );

    return (
        <AppLayout>
            <Head title="Sitting Plan Generator" />

            <div className="flex flex-col gap-6 p-6">

                {/* Header */}
                <div>
                    <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Sitting Plan Generator</h1>
                    <p className="text-xs text-indigo-400 mt-0.5">Dashboard / Examinations / Sitting Plans / Generate</p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-0 bg-white border border-zinc-200 rounded-xl p-3 shadow-sm">
                    {STEPS.map(({ n, label, icon: Icon }, i) => (
                        <React.Fragment key={n}>
                            <div className="flex items-center gap-2 flex-1">
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                                    step === n ? 'bg-indigo-600 text-white shadow-sm' :
                                    step > n  ? 'bg-emerald-500 text-white' : 'bg-white border border-indigo-200 text-indigo-400'
                                }`}>
                                    {step > n ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                                </div>
                                <span className={`text-xs font-semibold hidden sm:block ${step === n ? 'text-indigo-700' : step > n ? 'text-emerald-600' : 'text-indigo-300'}`}>
                                    {label}
                                </span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`h-px w-6 mx-1 shrink-0 ${step > n ? 'bg-emerald-400' : 'bg-indigo-200'}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <form onSubmit={e => { e.preventDefault(); post('/academic/sitting-plans/generate'); }}>

                    {/* Step 1 */}
                    {step === 1 && (
                        <div className="rounded-xl border border-indigo-200 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-indigo-100 bg-indigo-50">
                                <h2 className="text-sm font-bold text-indigo-800">Step 1 — Examination, Term &amp; Subject</h2>
                                <p className="text-xs text-indigo-400 mt-0.5">Specify which examination session you are creating layouts for</p>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-zinc-700">Examination</Label>
                                        <Select value={data.exam_id} onValueChange={v => setData('exam_id', v)}>
                                            <SelectTrigger className="border-indigo-200"><SelectValue placeholder="Select Exam" /></SelectTrigger>
                                            <SelectContent>{exams.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                        {errors.exam_id && <p className="text-xs text-rose-500">{errors.exam_id}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-zinc-700">Academic Term</Label>
                                        <Select value={data.academic_term_id} onValueChange={v => setData('academic_term_id', v)}>
                                            <SelectTrigger className="border-indigo-200"><SelectValue placeholder="Select Term" /></SelectTrigger>
                                            <SelectContent>{terms.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-zinc-700">Exam Date</Label>
                                        <Input type="date" value={data.date} onChange={e => setData('date', e.target.value)} className="border-indigo-200" required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-zinc-700">Start Time</Label>
                                        <Input type="time" value={data.start_time} onChange={e => setData('start_time', e.target.value)} className="border-indigo-200" required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-zinc-700">End Time</Label>
                                        <Input type="time" value={data.end_time} onChange={e => setData('end_time', e.target.value)} className="border-indigo-200" required />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-zinc-700">Subject</Label>
                                    <Select value={data.subject_id} onValueChange={v => setData('subject_id', v)}>
                                        <SelectTrigger className="border-indigo-200"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                                        <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                    {errors.subject_id && <p className="text-xs text-rose-500">{errors.subject_id}</p>}
                                </div>
                            </div>
                            <div className="px-5 py-3 border-t border-indigo-100 bg-indigo-50/40 flex justify-end">
                                <Button type="button" onClick={() => setStep(2)} disabled={!data.exam_id || !data.subject_id || !data.date}
                                    className="bg-indigo-600 hover:bg-indigo-700 gap-1.5 h-9">
                                    Continue <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                        <div className="rounded-xl border border-sky-200 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-sky-100 bg-sky-50">
                                <h2 className="text-sm font-bold text-sky-800">Step 2 — Select Participating Classes</h2>
                                <p className="text-xs text-sky-400 mt-0.5">Tick all classes that will sit this examination session</p>
                            </div>
                            <div className="p-5">
                                <div className="grid grid-cols-2 gap-3">
                                    {classes.map(cls => (
                                        <label key={cls.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                                            data.class_ids.includes(cls.id.toString())
                                                ? 'border-sky-400 bg-sky-50'
                                                : 'border-zinc-200 hover:border-sky-300 hover:bg-sky-50/40'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                <Checkbox checked={data.class_ids.includes(cls.id.toString())} onCheckedChange={() => toggleId('class_ids', cls.id.toString())} />
                                                <span className="text-sm font-semibold text-zinc-800">{cls.name}</span>
                                            </div>
                                            <span className="text-[10px] font-bold bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
                                                {cls.students_count} candidates
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                {errors.class_ids && <p className="text-xs text-rose-500 mt-2">{errors.class_ids}</p>}
                            </div>
                            <div className="px-5 py-3 border-t border-sky-100 bg-sky-50/40 flex justify-between">
                                <Button type="button" variant="outline" onClick={() => setStep(1)} className="border-sky-200 text-sky-600 gap-1 h-9">
                                    <ChevronLeft className="h-3.5 w-3.5" /> Back
                                </Button>
                                <Button type="button" onClick={() => setStep(3)} disabled={data.class_ids.length === 0}
                                    className="bg-sky-600 hover:bg-sky-700 gap-1.5 h-9">
                                    Continue <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3 */}
                    {step === 3 && (
                        <div className="rounded-xl border border-emerald-200 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-emerald-100 bg-emerald-50">
                                <h2 className="text-sm font-bold text-emerald-800">Step 3 — Select Examination Rooms</h2>
                                <p className="text-xs text-emerald-500 mt-0.5">Capacity must accommodate <strong>{totalCandidates}</strong> candidates</p>
                            </div>
                            <div className="p-5 space-y-4">
                                {/* Capacity meter */}
                                <div className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${capacityOk ? 'border-emerald-300 bg-emerald-50' : 'border-rose-300 bg-rose-50'}`}>
                                    <span className="text-zinc-600">Candidates to allocate: <strong className="text-zinc-800">{totalCandidates}</strong></span>
                                    <span className={`font-bold ${capacityOk ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {totalCapacity} seats selected {capacityOk ? '✓' : '— need more'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {rooms.map(room => (
                                        <label key={room.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                                            data.room_ids.includes(room.id.toString())
                                                ? 'border-emerald-400 bg-emerald-50'
                                                : 'border-zinc-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                <Checkbox checked={data.room_ids.includes(room.id.toString())} onCheckedChange={() => toggleId('room_ids', room.id.toString())} />
                                                <span className="text-sm font-semibold text-zinc-800">{room.room_name || `Room ${room.room_number}`}</span>
                                            </div>
                                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                                Cap: {room.capacity}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                {errors.room_ids && <p className="text-xs text-rose-500">{errors.room_ids}</p>}
                            </div>
                            <div className="px-5 py-3 border-t border-emerald-100 bg-emerald-50/40 flex justify-between">
                                <Button type="button" variant="outline" onClick={() => setStep(2)} className="border-emerald-200 text-emerald-600 gap-1 h-9">
                                    <ChevronLeft className="h-3.5 w-3.5" /> Back
                                </Button>
                                <Button type="button" onClick={() => setStep(4)} disabled={data.room_ids.length === 0 || !capacityOk}
                                    className="bg-emerald-600 hover:bg-emerald-700 gap-1.5 h-9">
                                    Continue <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 4 */}
                    {step === 4 && (
                        <div className="rounded-xl border border-amber-200 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-amber-100 bg-amber-50">
                                <h2 className="text-sm font-bold text-amber-800">Step 4 — Preview &amp; Run Allocation</h2>
                                <p className="text-xs text-amber-500 mt-0.5">Confirm allocation rules and execute seating distribution</p>
                            </div>
                            <div className="p-5 space-y-5">
                                {/* Summary grid */}
                                <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                                    <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-3">Allocation Summary</h3>
                                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                                        {[
                                            ['Examination',         exams.find(e => e.id.toString() === data.exam_id)?.name],
                                            ['Subject',             subjects.find(s => s.id.toString() === data.subject_id)?.name],
                                            ['Date & Time',         `${data.date} · ${data.start_time}–${data.end_time}`],
                                            ['Total Candidates',    totalCandidates],
                                            ['Selected Capacity',   `${totalCapacity} seats`],
                                        ].map(([label, val]) => (
                                            <React.Fragment key={label as string}>
                                                <span className="text-zinc-500">{label}:</span>
                                                <span className="font-semibold text-zinc-800">{val}</span>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>

                                {/* Rules */}
                                <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
                                    <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">Auto-Applied Rules</h3>
                                    <ul className="text-xs text-emerald-700 space-y-1 list-disc list-inside">
                                        <li>Students sorted alphabetically / by admission number</li>
                                        <li>Classes &amp; streams interleaved round-robin in adjacent seats</li>
                                        <li>Special-needs candidates assigned to front rows first</li>
                                        <li>No duplicate assignments or room overcrowding</li>
                                    </ul>
                                </div>

                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <Checkbox checked={data.gender_balance} onCheckedChange={v => setData('gender_balance', v === true)} />
                                    <span className="text-sm text-zinc-700">Optimise gender balancing (interleave boy–girl positions)</span>
                                </label>
                            </div>
                            <div className="px-5 py-3 border-t border-amber-100 bg-amber-50/40 flex justify-between">
                                <Button type="button" variant="outline" onClick={() => setStep(3)} className="border-amber-200 text-amber-600 gap-1 h-9">
                                    <ChevronLeft className="h-3.5 w-3.5" /> Back
                                </Button>
                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 gap-1.5 h-9" disabled={processing}>
                                    <Zap className="h-3.5 w-3.5" />
                                    {processing ? 'Allocating…' : 'Generate Sitting Plan'}
                                </Button>
                            </div>
                        </div>
                    )}

                </form>
            </div>
        </AppLayout>
    );
}
