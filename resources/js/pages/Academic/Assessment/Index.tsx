import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, BookOpen, ClipboardList, Users, CheckSquare, X } from 'lucide-react';
import Swal from 'sweetalert2';

interface Assessment {
    id: number; name: string; type: string; total_marks: number; weight: number;
    date: string; is_published: boolean;
    class: { id: number; name: string } | null;
    subject: { id: number; name: string } | null;
    teacher: { id: number; name: string } | null;
    academic_term: { id: number; name: string } | null;
}
interface Props {
    assessments: { data: Assessment[]; links: any[]; meta: any };
    classes: Array<{ id: number; name: string }>;
    subjects: Array<{ id: number; name: string }>;
    teachers: Array<{ id: number; name: string }>;
    terms: Array<{ id: number; name: string }>;
    filters: { class_id?: string; subject_id?: string; teacher_id?: string; term_id?: string };
}

const typeConfig: Record<string, { label: string; color: string }> = {
    exam:         { label: 'Exam',         color: 'bg-red-100 text-red-700' },
    test:         { label: 'Test',         color: 'bg-orange-100 text-orange-700' },
    quiz:         { label: 'Quiz',         color: 'bg-amber-100 text-amber-700' },
    assignment:   { label: 'Assignment',   color: 'bg-blue-100 text-blue-700' },
    project:      { label: 'Project',      color: 'bg-cyan-100 text-cyan-700' },
    presentation: { label: 'Presentation', color: 'bg-pink-100 text-pink-700' },
    practical:    { label: 'Practical',    color: 'bg-teal-100 text-teal-700' },
};

export default function AssessmentsIndex({ assessments, classes, subjects, teachers, terms, filters }: Props) {
    const [search, setSearch] = useState('');
    const [localFilters, setLocalFilters] = useState(filters);

    const applyFilter = (key: string, value: string) => {
        const next = { ...localFilters, [key]: value === 'all' ? '' : value };
        setLocalFilters(next);
        router.get('/academic/assessments', next, { preserveState: true, preserveScroll: true });
    };

    const clearAll = () => {
        const empty = { class_id: '', subject_id: '', teacher_id: '', term_id: '' };
        setLocalFilters(empty);
        router.get('/academic/assessments', empty, { preserveState: true, preserveScroll: true });
    };

    const hasFilters = Object.values(localFilters).some(Boolean);

    const filtered = assessments.data.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.class?.name.toLowerCase().includes(search.toLowerCase()) ||
        a.subject?.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = (a: Assessment) => {
        Swal.fire({ title: 'Delete assessment?', text: `"${a.name}" will be permanently removed.`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Delete' })
            .then(r => r.isConfirmed && router.delete(`/academic/assessments/${a.id}`));
    };

    const published = assessments.data.filter(a => a.is_published).length;
    const draft = assessments.data.length - published;

    return (
        <AppLayout>
            <Head title="Assessments" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Assessments</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Create and manage class assessments, exams and tests</p>
                    </div>
                    <Button size="sm" asChild>
                        <Link href="/academic/assessments/create"><Plus className="mr-2 h-4 w-4" />New Assessment</Link>
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: 'Total', value: assessments.data.length, icon: ClipboardList, color: 'text-blue-600 bg-blue-50' },
                        { label: 'Published', value: published, icon: CheckSquare, color: 'text-emerald-600 bg-emerald-50' },
                        { label: 'Drafts', value: draft, icon: BookOpen, color: 'text-amber-600 bg-amber-50' },
                        { label: 'Classes', value: new Set(assessments.data.map(a => a.class?.id).filter(Boolean)).size, icon: Users, color: 'text-blue-600 bg-blue-50' },
                    ].map(s => (
                        <Card key={s.label} className="border shadow-sm">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}><s.icon className="h-5 w-5" /></div>
                                <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Table with inline filters */}
                <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="text-base">All Assessments</CardTitle>
                            <div className="flex items-center gap-2 flex-wrap">
                                <div className="relative w-52">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
                                </div>
                                <Select value={localFilters.class_id || 'all'} onValueChange={v => applyFilter('class_id', v)}>
                                    <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Class" /></SelectTrigger>
                                    <SelectContent><SelectItem value="all">All Classes</SelectItem>{classes.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                                </Select>
                                <Select value={localFilters.subject_id || 'all'} onValueChange={v => applyFilter('subject_id', v)}>
                                    <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Subject" /></SelectTrigger>
                                    <SelectContent><SelectItem value="all">All Subjects</SelectItem>{subjects.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
                                </Select>
                                <Select value={localFilters.term_id || 'all'} onValueChange={v => applyFilter('term_id', v)}>
                                    <SelectTrigger className="h-8 w-28 text-xs"><SelectValue placeholder="Term" /></SelectTrigger>
                                    <SelectContent><SelectItem value="all">All Terms</SelectItem>{terms.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}</SelectContent>
                                </Select>
                                {hasFilters && <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={clearAll}><X className="h-4 w-4" /></Button>}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40">
                                    <TableHead className="pl-6">Assessment</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Class</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Marks</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(a => {
                                    const type = typeConfig[a.type] || { label: a.type, color: 'bg-slate-100 text-slate-700' };
                                    return (
                                        <TableRow key={a.id} className="hover:bg-muted/30">
                                            <TableCell className="pl-6 font-medium text-sm">{a.name}</TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${type.color}`}>{type.label}</span>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{a.class?.name ?? '—'}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{a.subject?.name ?? '—'}</TableCell>
                                            <TableCell>
                                                <div className="text-sm"><span className="font-medium">{a.total_marks}</span><span className="text-muted-foreground text-xs"> pts</span></div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{a.date ? new Date(a.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</TableCell>
                                            <TableCell>
                                                {a.is_published
                                                    ? <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Published</Badge>
                                                    : <Badge variant="secondary" className="text-xs">Draft</Badge>}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild><Link href={`/academic/assessments/${a.id}`}><Eye className="mr-2 h-4 w-4" />View</Link></DropdownMenuItem>
                                                        <DropdownMenuItem asChild><Link href={`/academic/assessments/${a.id}/grade`}><CheckSquare className="mr-2 h-4 w-4" />Grade</Link></DropdownMenuItem>
                                                        <DropdownMenuItem asChild><Link href={`/academic/assessments/${a.id}/edit`}><Edit className="mr-2 h-4 w-4" />Edit</Link></DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDelete(a)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        {filtered.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <ClipboardList className="h-10 w-10 text-muted-foreground/50 mb-3" />
                                <p className="text-sm font-medium">{search || hasFilters ? 'No assessments match' : 'No assessments yet'}</p>
                                <p className="text-xs text-muted-foreground mt-1 mb-4">
                                    {search || hasFilters ? 'Try adjusting your filters' : 'Create your first assessment to get started'}
                                </p>
                                {!search && !hasFilters && <Button size="sm" asChild><Link href="/academic/assessments/create"><Plus className="mr-2 h-4 w-4" />New Assessment</Link></Button>}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
