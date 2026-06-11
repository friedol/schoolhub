import { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
    RefreshCw, Printer, Download, Plus, Search,
    ChevronDown, MoreVertical, Pencil, Trash2, X,
    Filter, SlidersHorizontal, Calendar,
} from 'lucide-react';

interface Schedule {
    id: number;
    code: string;
    type: string;
    start_time: string;
    end_time: string;
    is_active: boolean;
}

interface Props {
    schedules: {
        data: Schedule[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { type?: string; status?: string };
}

const emptyForm = { type: 'class', start_time: '', end_time: '', is_active: true };

function convert24(time12: string): string {
    if (!time12 || time12 === '—') return '';
    try {
        const [time, period] = time12.split(' ');
        let [h, m] = time.split(':').map(Number);
        if (period === 'PM' && h !== 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    } catch { return ''; }
}

export default function ScheduleIndex({ schedules, filters }: Props) {
    const [search, setSearch]           = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showFilter, setShowFilter]   = useState(false);
    const [filterType, setFilterType]   = useState(filters.type ?? '');
    const [filterStatus, setFilterStatus] = useState(filters.status ?? '');

    const [showModal, setShowModal]   = useState(false);
    const [editId, setEditId]         = useState<number | null>(null);
    const [form, setForm]             = useState({ ...emptyForm });
    const [errors, setErrors]         = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const today = new Date();
    const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 6);
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    const dateRange = `${fmt(weekAgo)} - ${fmt(today)}`;

    const filtered = useMemo(() => {
        if (!search.trim()) return schedules.data;
        const q = search.toLowerCase();
        return schedules.data.filter(s =>
            s.code.toLowerCase().includes(q) ||
            s.type.toLowerCase().includes(q)
        );
    }, [schedules.data, search]);

    function applyFilter() {
        setShowFilter(false);
        router.get('/academic/classes/schedule', {
            type:   filterType   || undefined,
            status: filterStatus || undefined,
        }, { preserveState: true, replace: true });
    }

    function resetFilter() {
        setFilterType(''); setFilterStatus('');
        setShowFilter(false);
        router.get('/academic/classes/schedule', {}, { preserveState: true, replace: true });
    }

    function openAdd() {
        setEditId(null); setForm({ ...emptyForm }); setErrors({});
        setShowModal(true);
    }

    function openEdit(s: Schedule) {
        setEditId(s.id);
        setForm({
            type:       s.type === 'Class' ? 'class' : 'break',
            start_time: convert24(s.start_time),
            end_time:   convert24(s.end_time),
            is_active:  s.is_active,
        });
        setErrors({});
        setShowModal(true);
    }

    function validate() {
        const e: Record<string, string> = {};
        if (!form.type)       e.type       = 'Type is required';
        if (!form.start_time) e.start_time = 'Start time is required';
        if (!form.end_time)   e.end_time   = 'End time is required';
        setErrors(e);
        return !Object.keys(e).length;
    }

    function handleSubmit() {
        if (!validate()) return;
        setProcessing(true);
        const url = editId
            ? `/academic/classes/schedule/${editId}`
            : '/academic/classes/schedule';
        router[editId ? 'put' : 'post'](url, form, {
            onSuccess: () => { setShowModal(false); setProcessing(false); },
            onError:   (errs) => { setErrors(errs); setProcessing(false); },
        });
    }

    function handleDelete(id: number) {
        if (!confirm('Delete this schedule?')) return;
        router.delete(`/academic/classes/schedule/${id}`);
    }

    const breadcrumbs = [
        { title: 'Dashboard', href: '/school-admin/dashboard' },
        { title: 'Classes',   href: '/academic/classes' },
        { title: 'Schedule',  href: '/academic/classes/schedule' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Schedule" />

            <div className="flex flex-col gap-4 p-4 md:p-6">

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Schedule</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">Manage class period schedules</p>
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
                            <Plus className="h-4 w-4" /> Add Schedule
                        </Button>
                    </div>
                </div>

                {/* Table Card */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">

                    {/* Card header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-base font-bold text-slate-800 dark:text-white">Schedule Classes</h2>
                        <div className="flex items-center gap-2">
                            {/* Date range */}
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
                                <Calendar className="h-3.5 w-3.5" />
                                {dateRange}
                            </div>

                            {/* Filter */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowFilter(!showFilter)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    <Filter className="h-3.5 w-3.5" /> Filter <ChevronDown className="h-3 w-3" />
                                </button>

                                {showFilter && (
                                    <div className="absolute right-0 top-full mt-1 z-30 w-64 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl p-4 space-y-4">
                                        <h3 className="font-semibold text-sm text-slate-800 dark:text-white">Filter</h3>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Type</Label>
                                            <Select value={filterType} onValueChange={setFilterType}>
                                                <SelectTrigger className="h-9 text-xs">
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="class">Class</SelectItem>
                                                    <SelectItem value="break">Break</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Status</Label>
                                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                                <SelectTrigger className="h-9 text-xs">
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex items-center justify-end gap-2 pt-1">
                                            <Button variant="outline" onClick={resetFilter} className="h-8 px-4 text-xs">Reset</Button>
                                            <Button onClick={applyFilter} className="h-8 px-5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">Apply</Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sort */}
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                                <SlidersHorizontal className="h-3.5 w-3.5" /> Sort by A-Z <ChevronDown className="h-3 w-3" />
                            </button>
                        </div>
                    </div>

                    {/* Controls row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <span>Row Per Page</span>
                            <Select value={String(rowsPerPage)} onValueChange={v => setRowsPerPage(Number(v))}>
                                <SelectTrigger className="h-8 w-16 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {[10, 25, 50, 100].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <span>Entries</span>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <Input placeholder="Search" className="pl-9 h-8 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
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
                                    {['ID', 'Type', 'Start Time', 'End Time', 'Status', 'Action'].map(h => (
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
                                        <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                                            No schedules found.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.slice(0, rowsPerPage).map(s => (
                                        <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <input type="checkbox" className="rounded border-slate-300" />
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-indigo-600 dark:text-indigo-400 font-medium text-xs">{s.code}</span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{s.type}</td>
                                            <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">{s.start_time}</td>
                                            <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">{s.end_time}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold
                                                    ${s.is_active
                                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                                        : 'bg-red-50 text-red-600 border border-red-200'
                                                    }`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${s.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    {s.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                                                            <MoreVertical className="h-4 w-4 text-slate-500" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-36">
                                                        <DropdownMenuItem onClick={() => openEdit(s)} className="gap-2 text-xs">
                                                            <Pencil className="h-3.5 w-3.5" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDelete(s.id)} className="gap-2 text-xs text-red-600 focus:text-red-600">
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
                    <div className="flex items-center justify-end gap-1 px-5 py-3 border-t border-slate-100 dark:border-slate-800">
                        {schedules.links.map((link, i) => (
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
                    <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                {editId ? 'Edit Schedule' : 'Add Schedule'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                                <X className="h-4 w-4 text-slate-500" />
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-4">
                            {/* Type */}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Type</Label>
                                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                                    <SelectTrigger className={`h-10 ${errors.type ? 'border-red-400' : ''}`}>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="class">Class</SelectItem>
                                        <SelectItem value="break">Break</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
                            </div>

                            {/* Start / End Time */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Start Time</Label>
                                    <Input
                                        type="time"
                                        value={form.start_time}
                                        onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                                        className={`h-10 ${errors.start_time ? 'border-red-400' : ''}`}
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
                                    />
                                    {errors.end_time && <p className="text-xs text-red-500">{errors.end_time}</p>}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-start justify-between pt-1">
                                <div>
                                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Status</Label>
                                    <p className="text-xs text-muted-foreground mt-0.5">Toggle to set active/inactive</p>
                                </div>
                                <Switch
                                    checked={form.is_active}
                                    onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                            <Button variant="outline" onClick={() => setShowModal(false)} className="h-10 px-5 text-sm">Cancel</Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={processing}
                                className="h-10 px-6 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                            >
                                {processing ? 'Saving...' : editId ? 'Update' : 'Add Schedule'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Click-away to close filter */}
            {showFilter && <div className="fixed inset-0 z-20" onClick={() => setShowFilter(false)} />}
        </AppLayout>
    );
}
