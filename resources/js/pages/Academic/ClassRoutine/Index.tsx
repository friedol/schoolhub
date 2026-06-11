import { useState, useMemo } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { RefreshCw, Printer, Download, Plus, Search, ChevronDown, MoreVertical, Pencil, Trash2, X } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SECTIONS = ['A', 'B', 'C', 'D', 'E'];

interface Routine {
    id: number;
    code: string;
    class: string;
    section: string;
    teacher: string;
    subject: string;
    day: string;
    start_time: string;
    end_time: string;
    class_room: string;
    is_active: boolean;
}

interface Props {
    routines: {
        data: Routine[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    classes:  { id: number; name: string }[];
    subjects: { id: number; name: string }[];
    teachers: { id: number; name: string }[];
    rooms:    { id: number; name: string; room_number: string }[];
}

const emptyForm = {
    class_id: '',
    section: '',
    subject_id: '',
    teacher_id: '',
    day: '',
    start_time: '',
    end_time: '',
    class_room_id: '',
    is_active: true,
};

export default function ClassRoutineIndex({ routines, classes, subjects, teachers, rooms }: Props) {
    const { props } = usePage<any>();
    const flash = props.flash ?? {};

    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState({ ...emptyForm });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [search, setSearch] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [processing, setProcessing] = useState(false);

    const filtered = useMemo(() => {
        if (!search.trim()) return routines.data;
        const q = search.toLowerCase();
        return routines.data.filter(r =>
            r.code.toLowerCase().includes(q) ||
            r.class.toLowerCase().includes(q) ||
            r.teacher.toLowerCase().includes(q) ||
            r.subject.toLowerCase().includes(q) ||
            r.day.toLowerCase().includes(q)
        );
    }, [routines.data, search]);

    function openAdd() {
        setEditId(null);
        setForm({ ...emptyForm });
        setErrors({});
        setShowModal(true);
    }

    function openEdit(r: Routine) {
        setEditId(r.id);
        const classObj = classes.find(c => c.name === r.class);
        const subObj   = subjects.find(s => s.name === r.subject);
        const tchObj   = teachers.find(t => t.name === r.teacher);
        const roomObj  = rooms.find(rm => rm.room_number === r.class_room);
        setForm({
            class_id:      classObj ? String(classObj.id) : '',
            section:       r.section,
            subject_id:    subObj   ? String(subObj.id)   : '',
            teacher_id:    tchObj   ? String(tchObj.id)   : '',
            day:           r.day,
            start_time:    r.start_time ? convertTo24(r.start_time) : '',
            end_time:      r.end_time   ? convertTo24(r.end_time)   : '',
            class_room_id: roomObj ? String(roomObj.id) : '',
            is_active:     r.is_active,
        });
        setErrors({});
        setShowModal(true);
    }

    function convertTo24(time12: string): string {
        if (!time12 || time12 === '—') return '';
        try {
            const [time, period] = time12.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        } catch { return ''; }
    }

    function validate(): boolean {
        const e: Record<string, string> = {};
        if (!form.class_id)   e.class_id   = 'Class is required';
        if (!form.section)    e.section    = 'Section is required';
        if (!form.subject_id) e.subject_id = 'Subject is required';
        if (!form.teacher_id) e.teacher_id = 'Teacher is required';
        if (!form.day)        e.day        = 'Day is required';
        if (!form.start_time) e.start_time = 'Start time is required';
        if (!form.end_time)   e.end_time   = 'End time is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function handleSubmit() {
        if (!validate()) return;
        setProcessing(true);
        const url = editId
            ? `/academic/class-routine/${editId}`
            : '/academic/class-routine';
        router[editId ? 'put' : 'post'](url, form, {
            onSuccess: () => { setShowModal(false); setProcessing(false); },
            onError: (errs) => { setErrors(errs); setProcessing(false); },
        });
    }

    function handleDelete(id: number) {
        if (!confirm('Delete this class routine?')) return;
        router.delete(`/academic/class-routine/${id}`);
    }

    const breadcrumbs = [
        { title: 'Dashboard', href: '/school-admin/dashboard' },
        { title: 'Academic', href: '#' },
        { title: 'Class Routine', href: '/academic/class-routine' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Class Routine" />

            <div className="flex flex-col gap-4 p-4 md:p-6">

                {/* Flash message */}
                {flash.success && (
                    <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-700 font-medium">
                        {flash.success}
                    </div>
                )}

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Class Routine</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">Manage weekly class schedules and timetable slots</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">
                            <RefreshCw className="h-4 w-4" onClick={() => router.reload()} />
                        </button>
                        <button className="p-2 rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">
                            <Printer className="h-4 w-4" onClick={() => window.print()} />
                        </button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-9 gap-1.5 text-xs">
                                    <Download className="h-3.5 w-3.5" /> Export <ChevronDown className="h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                                <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button onClick={openAdd} className="h-9 gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Plus className="h-4 w-4" /> Add Class Routine
                        </Button>
                    </div>
                </div>

                {/* Table Card */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                    {/* Table Header Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <span>Row Per Page</span>
                            <Select value={String(rowsPerPage)} onValueChange={v => setRowsPerPage(Number(v))}>
                                <SelectTrigger className="h-8 w-16 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[10, 25, 50, 100].map(n => (
                                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span>Entries</span>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <Input
                                placeholder="Search"
                                className="pl-9 h-8 text-sm"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                    <th className="w-10 px-4 py-3">
                                        <input type="checkbox" className="rounded border-slate-300" />
                                    </th>
                                    {['ID', 'Class', 'Section', 'Teacher', 'Subject', 'Day', 'Start Time', 'End Time', 'Class Room', 'Action'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                            <span className="flex items-center gap-1">
                                                {h}
                                                {h !== 'Action' && <ChevronDown className="h-3 w-3 opacity-40" />}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="px-4 py-10 text-center text-sm text-muted-foreground">
                                            No class routines found.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.slice(0, rowsPerPage).map(r => (
                                        <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <input type="checkbox" className="rounded border-slate-300" />
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-indigo-600 dark:text-indigo-400 font-medium text-xs">{r.code}</span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">{r.class}</td>
                                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{r.section}</td>
                                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{r.teacher}</td>
                                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{r.subject}</td>
                                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{r.day}</td>
                                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-mono text-xs">{r.start_time}</td>
                                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-mono text-xs">{r.end_time}</td>
                                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{r.class_room}</td>
                                            <td className="px-4 py-3">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                                                            <MoreVertical className="h-4 w-4 text-slate-500" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-36">
                                                        <DropdownMenuItem onClick={() => openEdit(r)} className="gap-2 text-xs">
                                                            <Pencil className="h-3.5 w-3.5" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDelete(r.id)} className="gap-2 text-xs text-red-600 focus:text-red-600">
                                                            <Trash2 className="h-3.5 w-3.5" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-end gap-1 px-4 py-3 border-t border-slate-100 dark:border-slate-800">
                        {routines.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors
                                    ${link.active ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}
                                    ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Add / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                {editId ? 'Edit Class Routine' : 'Add Class Routine'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                                <X className="h-4 w-4 text-slate-500" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

                            {/* Teacher */}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Teacher</Label>
                                <Select value={form.teacher_id} onValueChange={v => setForm(f => ({ ...f, teacher_id: v }))}>
                                    <SelectTrigger className={`h-10 ${errors.teacher_id ? 'border-red-400' : ''}`}>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teachers.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {errors.teacher_id && <p className="text-xs text-red-500">{errors.teacher_id}</p>}
                            </div>

                            {/* Class */}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Class</Label>
                                <Select value={form.class_id} onValueChange={v => setForm(f => ({ ...f, class_id: v }))}>
                                    <SelectTrigger className={`h-10 ${errors.class_id ? 'border-red-400' : ''}`}>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {errors.class_id && <p className="text-xs text-red-500">{errors.class_id}</p>}
                            </div>

                            {/* Subject */}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Subject</Label>
                                <Select value={form.subject_id} onValueChange={v => setForm(f => ({ ...f, subject_id: v }))}>
                                    <SelectTrigger className={`h-10 ${errors.subject_id ? 'border-red-400' : ''}`}>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {errors.subject_id && <p className="text-xs text-red-500">{errors.subject_id}</p>}
                            </div>

                            {/* Section */}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Section</Label>
                                <Select value={form.section} onValueChange={v => setForm(f => ({ ...f, section: v }))}>
                                    <SelectTrigger className={`h-10 ${errors.section ? 'border-red-400' : ''}`}>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SECTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {errors.section && <p className="text-xs text-red-500">{errors.section}</p>}
                            </div>

                            {/* Day */}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Day</Label>
                                <Select value={form.day} onValueChange={v => setForm(f => ({ ...f, day: v }))}>
                                    <SelectTrigger className={`h-10 ${errors.day ? 'border-red-400' : ''}`}>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {errors.day && <p className="text-xs text-red-500">{errors.day}</p>}
                            </div>

                            {/* Start Time / End Time */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Start Time</Label>
                                    <Input
                                        type="time"
                                        value={form.start_time}
                                        onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                                        className={`h-10 ${errors.start_time ? 'border-red-400' : ''}`}
                                        placeholder="Choose"
                                    />
                                    {errors.start_time && <p className="text-xs text-red-500">{errors.start_time}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">End Time</Label>
                                    <Input
                                        type="time"
                                        value={form.end_time}
                                        onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                                        className={`h-10 ${errors.end_time ? 'border-red-400' : ''}`}
                                        placeholder="Choose"
                                    />
                                    {errors.end_time && <p className="text-xs text-red-500">{errors.end_time}</p>}
                                </div>
                            </div>

                            {/* Class Room */}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Class Room</Label>
                                <Select value={form.class_room_id} onValueChange={v => setForm(f => ({ ...f, class_room_id: v }))}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rooms.map(r => (
                                            <SelectItem key={r.id} value={String(r.id)}>
                                                {r.name} ({r.room_number})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status */}
                            <div className="flex items-start justify-between pt-1">
                                <div>
                                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Status</Label>
                                    <p className="text-xs text-muted-foreground mt-0.5">Change the Status by toggle</p>
                                </div>
                                <Switch
                                    checked={form.is_active}
                                    onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))}
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                            <Button variant="outline" onClick={() => setShowModal(false)} className="h-10 px-5 text-sm">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={processing}
                                className="h-10 px-6 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                            >
                                {processing ? 'Saving...' : editId ? 'Update Class Routine' : 'Add Class Routine'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
