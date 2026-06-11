import { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { RefreshCw, Printer, Download, ChevronDown, Search, Filter, SlidersHorizontal, Calendar } from 'lucide-react';

interface Mark { v: number | null; fail: boolean }

interface Row {
    id: number;
    admission_no: string;
    name: string;
    avatar: string | null;
    roll_no: number | string;
    marks: Record<string, Mark>;
    total: number;
    percentage: number;
    grade: string;
    result: 'Pass' | 'Fail';
}

interface Props {
    rows: Row[];
    subjects: string[];
    classes: { id: number; name: string }[];
    exams: { id: number; name: string; exam_type: string }[];
    filters: { class_id?: string; exam_id?: string };
}

function Avatar({ name, src }: { name: string; src: string | null }) {
    if (src) return <img src={src} alt={name} className="h-8 w-8 rounded-full object-cover" />;
    const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500', 'bg-sky-500'];
    const color = colors[name.charCodeAt(0) % colors.length];
    return (
        <span className={`h-8 w-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-semibold`}>
            {initials}
        </span>
    );
}

export default function ExamResultIndex({ rows, subjects, classes, exams, filters }: Props) {
    const [search, setSearch] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showFilter, setShowFilter] = useState(false);
    const [filterClass, setFilterClass] = useState(filters.class_id ?? '');
    const [filterExam,  setFilterExam]  = useState(filters.exam_id  ?? '');

    const today = new Date();
    const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 6);
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    const dateRange = `${fmt(weekAgo)} - ${fmt(today)}`;

    const filtered = useMemo(() => {
        if (!search.trim()) return rows;
        const q = search.toLowerCase();
        return rows.filter(r =>
            r.name.toLowerCase().includes(q) ||
            r.admission_no.toLowerCase().includes(q) ||
            r.grade.toLowerCase().includes(q) ||
            r.result.toLowerCase().includes(q)
        );
    }, [rows, search]);

    function applyFilter() {
        setShowFilter(false);
        router.get('/academic/exam-results', {
            class_id: filterClass || undefined,
            exam_id:  filterExam  || undefined,
        }, { preserveState: true, replace: true });
    }

    function resetFilter() {
        setFilterClass('');
        setFilterExam('');
        setShowFilter(false);
        router.get('/academic/exam-results', {}, { preserveState: true, replace: true });
    }

    const breadcrumbs = [
        { title: 'Dashboard', href: '/school-admin/dashboard' },
        { title: 'Academic', href: '#' },
        { title: 'Exam Result', href: '/academic/exam-results' },
    ];

    const displayed = filtered.slice(0, rowsPerPage);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Exam Result" />

            <div className="flex flex-col gap-4 p-4 md:p-6">

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Exam Result</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">View student examination results by class and subject</p>
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
                    </div>
                </div>

                {/* Table Card */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">

                    {/* Card header row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-base font-bold text-slate-800 dark:text-white">Exam Results</h2>
                        <div className="flex items-center gap-2">
                            {/* Date range */}
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
                                <Calendar className="h-3.5 w-3.5" />
                                {dateRange}
                            </div>

                            {/* Filter button */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowFilter(!showFilter)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    <Filter className="h-3.5 w-3.5" /> Filter <ChevronDown className="h-3 w-3" />
                                </button>

                                {/* Filter dropdown panel */}
                                {showFilter && (
                                    <div className="absolute right-0 top-full mt-1 z-30 w-72 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl p-4 space-y-4">
                                        <h3 className="font-semibold text-sm text-slate-800 dark:text-white">Filter</h3>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Class</label>
                                            <Select value={filterClass} onValueChange={setFilterClass}>
                                                <SelectTrigger className="h-9 text-xs">
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classes.map(c => (
                                                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Examination</label>
                                            <Select value={filterExam} onValueChange={setFilterExam}>
                                                <SelectTrigger className="h-9 text-xs">
                                                    <SelectValue placeholder="All exams" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">All Exams</SelectItem>
                                                    {exams.map(e => (
                                                        <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                                                    ))}
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
                                    {['Admission No', 'Student Name', ...subjects, 'Total', 'Percent(%)', 'Grade', 'Result'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                            <span className="flex items-center gap-1">
                                                {h}
                                                <ChevronDown className="h-3 w-3 opacity-40" />
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={5 + subjects.length} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                            {filters.class_id
                                                ? 'No marks found for this class. Ensure marks have been entered and submitted.'
                                                : 'Select a class using the Filter button to view results.'}
                                        </td>
                                    </tr>
                                ) : displayed.length === 0 ? (
                                    <tr>
                                        <td colSpan={5 + subjects.length} className="px-4 py-8 text-center text-sm text-muted-foreground">
                                            No students match your search.
                                        </td>
                                    </tr>
                                ) : (
                                    displayed.map(row => (
                                        <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <input type="checkbox" className="rounded border-slate-300" />
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-indigo-600 dark:text-indigo-400 font-medium text-xs">{row.admission_no}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <Avatar name={row.name} src={row.avatar} />
                                                    <div>
                                                        <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{row.name}</p>
                                                        <p className="text-xs text-muted-foreground">Roll No : {row.roll_no}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {subjects.map(sub => {
                                                const m = row.marks[sub];
                                                return (
                                                    <td key={sub} className={`px-4 py-3 font-medium text-sm ${m?.fail ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                                        {m?.v !== null && m?.v !== undefined ? m.v : '—'}
                                                    </td>
                                                );
                                            })}
                                            <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{row.total}</td>
                                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.percentage}</td>
                                            <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{row.grade}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold
                                                    ${row.result === 'Pass'
                                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                                        : 'bg-red-50 text-red-600 border border-red-200'
                                                    }`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${row.result === 'Pass' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    {row.result}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-muted-foreground">
                        <span>Showing {Math.min(displayed.length, filtered.length)} of {filtered.length} entries</span>
                        <div className="flex items-center gap-1">
                            <button
                                className="px-3 py-1.5 rounded text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                                disabled
                            >
                                &laquo; Prev
                            </button>
                            <button className="px-3 py-1.5 rounded text-xs font-medium bg-indigo-600 text-white">1</button>
                            <button
                                className="px-3 py-1.5 rounded text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                                disabled
                            >
                                Next &raquo;
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Click-away to close filter */}
            {showFilter && (
                <div className="fixed inset-0 z-20" onClick={() => setShowFilter(false)} />
            )}
        </AppLayout>
    );
}
