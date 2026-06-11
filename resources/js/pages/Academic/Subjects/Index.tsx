import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
    Plus, Search, MoreHorizontal, Eye, Edit, Trash2,
    BookOpen, Users, GraduationCap, Hash, X, Save, AlertCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import { StatCard, StatGrid } from '@/components/ui/stat-card';

interface SubjectClass {
    id: number;
    name: string;
    level: string;
}

interface Subject {
    id: number;
    name: string;
    code: string;
    description: string;
    necta_code: string;
    is_active: boolean;
    classes_count: number;
    teachers_count: number;
    classes: SubjectClass[];
    created_at: string;
}

interface Props {
    subjects: { data: Subject[]; links: any[]; meta: any };
    stats: {
        subjects: { total: number; active: number; inactive: number };
        classes_covered: number;
        teachers_count: number;
    };
    classes: Array<{ id: number; name: string; level: string }>;
}

export default function SubjectsIndex({ subjects, stats, classes = [] }: Props) {
    const [search, setSearch] = useState('');
    const [panel, setPanel] = useState<'closed' | 'create' | 'edit' | 'view'>('closed');
    const [selected, setSelected] = useState<Subject | null>(null);

    // Inertia form
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        code: '',
        necta_code: '',
        description: '',
        is_active: true as boolean,
        class_ids: [] as number[],
    });

    const filtered = subjects.data.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase()) ||
        (s.necta_code || '').toLowerCase().includes(search.toLowerCase())
    );

    const openCreate = () => {
        reset();
        clearErrors();
        setSelected(null);
        setPanel('create');
    };

    const openEdit = (sub: Subject) => {
        clearErrors();
        setSelected(sub);
        setData({
            name: sub.name,
            code: sub.code,
            necta_code: sub.necta_code || '',
            description: sub.description || '',
            is_active: sub.is_active,
            class_ids: sub.classes.map(c => c.id).filter(Boolean),
        });
        setPanel('edit');
    };

    const openView = (sub: Subject) => {
        setSelected(sub);
        setPanel('view');
    };

    const closePanel = () => {
        setPanel('closed');
        setSelected(null);
        clearErrors();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (panel === 'create') {
            post('/academic/subjects', {
                onSuccess: closePanel,
            });
        } else if (panel === 'edit' && selected) {
            put(`/academic/subjects/${selected.id}`, {
                onSuccess: closePanel,
            });
        }
    };

    const toggleClass = (classId: number) => {
        setData('class_ids',
            data.class_ids.includes(classId)
                ? data.class_ids.filter(id => id !== classId)
                : [...data.class_ids, classId]
        );
    };

    const handleDelete = (subject: Subject) => {
        Swal.fire({
            title: 'Delete subject?',
            text: `"${subject.name}" will be permanently removed.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Delete'
        }).then(r => r.isConfirmed && router.delete(`/academic/subjects/${subject.id}`));
    };

    const FieldError = ({ field }: { field: string }) =>
        errors[field as keyof typeof errors] ? (
            <div className="flex items-center gap-1 mt-1">
                <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                <p className="text-xs text-red-500">{errors[field as keyof typeof errors]}</p>
            </div>
        ) : null;

    return (
        <AppLayout>
            <Head title="Subjects" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Subjects</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Manage school subjects and NECTA configurations</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/academic/subjects/set-optional">Assign Optional</Link>
                        </Button>
                        <Button size="sm" onClick={openCreate}>
                            <Plus className="mr-2 h-4 w-4" />Add Subject
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <StatGrid cols={4}>
                    <StatCard
                        title="Total Subjects"
                        value={stats.subjects.total}
                        icon={BookOpen}
                        color="blue"
                        trend="stable"
                        trendLabel="Total"
                        subtitle={`Active: ${stats.subjects.active} | Inactive: ${stats.subjects.inactive}`}
                    />
                    <StatCard
                        title="Active Subjects"
                        value={stats.subjects.active}
                        icon={Hash}
                        color="green"
                        trend="stable"
                        trendLabel="Active"
                        subtitle="Operational subjects"
                    />
                    <StatCard
                        title="Classes Covered"
                        value={stats.classes_covered}
                        icon={GraduationCap}
                        color="violet"
                        trend="stable"
                        trendLabel="Classes"
                        subtitle="Classes with subjects"
                    />
                    <StatCard
                        title="Assigned Teachers"
                        value={stats.teachers_count}
                        icon={Users}
                        color="amber"
                        trend="stable"
                        trendLabel="Staff"
                        subtitle="Subject instructors"
                    />
                </StatGrid>

                {/* Table */}
                <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-3">
                            <CardTitle className="text-base">All Subjects</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search subjects..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40">
                                    <TableHead className="pl-6">Subject</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>NECTA Code</TableHead>
                                    <TableHead>Classes</TableHead>
                                    <TableHead>Teachers</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(subject => (
                                    <TableRow key={subject.id} className="hover:bg-muted/30">
                                        <TableCell className="pl-6">
                                            <div className="flex items-start gap-2">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 mt-0.5">
                                                    <BookOpen className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{subject.name}</p>
                                                    {subject.description && <p className="text-xs text-muted-foreground line-clamp-1">{subject.description}</p>}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell><Badge variant="outline" className="font-mono text-xs">{subject.code}</Badge></TableCell>
                                        <TableCell>
                                            {subject.necta_code
                                                ? <Badge variant="secondary" className="font-mono text-xs">{subject.necta_code}</Badge>
                                                : <span className="text-muted-foreground text-xs">—</span>}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="text-sm">{subject.classes_count}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="text-sm">{subject.teachers_count}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {subject.is_active
                                                ? <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Active</Badge>
                                                : <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openView(subject)}><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openEdit(subject)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(subject)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {filtered.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <BookOpen className="h-10 w-10 text-muted-foreground/50 mb-3" />
                                <p className="text-sm font-medium">{search ? 'No subjects match your search' : 'No subjects yet'}</p>
                                <p className="text-xs text-muted-foreground mt-1 mb-4">{search ? 'Try a different keyword' : 'Create your first subject to get started'}</p>
                                {!search && <Button size="sm" onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Subject</Button>}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Side Panel Overlay */}
            {panel !== 'closed' && (
                <>
                    <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={closePanel} />
                    <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l shadow-2xl z-50 flex flex-col">
                        {/* Panel Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h2 className="text-lg font-semibold">
                                {panel === 'create' ? 'New Subject' : panel === 'edit' ? `Edit: ${selected?.name}` : selected?.name}
                            </h2>
                            <Button variant="ghost" size="icon" onClick={closePanel}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Panel Body */}
                        <div className="flex-1 overflow-y-auto p-6">

                            {/* VIEW MODE */}
                            {panel === 'view' && selected && (
                                <div className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'Subject Name', value: selected.name },
                                            { label: 'Subject Code', value: selected.code },
                                            { label: 'NECTA Code', value: selected.necta_code || '—' },
                                            { label: 'Assigned Classes', value: String(selected.classes_count) },
                                            { label: 'Assigned Teachers', value: String(selected.teachers_count) },
                                        ].map(f => (
                                            <div key={f.label}>
                                                <p className="text-xs text-muted-foreground mb-1">{f.label}</p>
                                                <p className="font-medium text-sm">{f.value}</p>
                                            </div>
                                        ))}
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Status</p>
                                            {selected.is_active
                                                ? <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Active</Badge>
                                                : <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                                        </div>
                                    </div>

                                    {selected.description && (
                                        <>
                                            <Separator />
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1">Description</p>
                                                <p className="text-sm text-slate-700 dark:text-slate-300">{selected.description}</p>
                                            </div>
                                        </>
                                    )}

                                    {selected.classes && selected.classes.length > 0 && (
                                        <>
                                            <Separator />
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-2">
                                                    Classes ({selected.classes.length})
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {selected.classes.map((c, i) => (
                                                        <Badge key={i} variant="outline" className="text-xs">{c.name}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    <Button className="w-full" variant="outline" onClick={() => openEdit(selected)}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit Subject
                                    </Button>
                                </div>
                            )}

                            {/* CREATE / EDIT FORM */}
                            {(panel === 'create' || panel === 'edit') && (
                                <form onSubmit={handleSubmit} className="space-y-4">

                                    {/* Name */}
                                    <div>
                                        <Label htmlFor="name">
                                            Subject Name <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            placeholder="e.g. Mathematics"
                                            className={`mt-1 ${errors.name ? 'border-red-400' : ''}`}
                                        />
                                        <FieldError field="name" />
                                    </div>

                                    {/* Code */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label htmlFor="code">
                                                Code <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="code"
                                                value={data.code}
                                                onChange={e => setData('code', e.target.value)}
                                                placeholder="e.g. MATH"
                                                className={`mt-1 ${errors.code ? 'border-red-400' : ''}`}
                                            />
                                            <FieldError field="code" />
                                        </div>
                                        <div>
                                            <Label htmlFor="necta_code">
                                                NECTA Code <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="necta_code"
                                                value={data.necta_code}
                                                onChange={e => setData('necta_code', e.target.value)}
                                                placeholder="e.g. 041"
                                                className={`mt-1 ${errors.necta_code ? 'border-red-400' : ''}`}
                                            />
                                            <FieldError field="necta_code" />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <textarea
                                            id="description"
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            placeholder="Enter subject description..."
                                            className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                    </div>

                                    {/* Active Toggle */}
                                    <div className="flex items-center justify-between rounded-lg border p-3">
                                        <div>
                                            <p className="text-sm font-medium">Active</p>
                                            <p className="text-xs text-muted-foreground">
                                                Make this subject visible in curriculum and classes
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.is_active}
                                            onCheckedChange={v => setData('is_active', v)}
                                        />
                                    </div>

                                    {/* Classes Checklist */}
                                    {classes.length > 0 && (
                                        <div>
                                            <Label className="mb-2 block">
                                                Assign to Classes
                                                {data.class_ids.length > 0 && (
                                                    <span className="ml-1.5 text-xs text-muted-foreground">
                                                        ({data.class_ids.length} selected)
                                                    </span>
                                                )}
                                            </Label>
                                            <div className="max-h-48 overflow-y-auto rounded-lg border divide-y">
                                                {classes.map(c => (
                                                    <label
                                                        key={c.id}
                                                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="rounded"
                                                            checked={data.class_ids.includes(c.id)}
                                                            onChange={() => toggleClass(c.id)}
                                                        />
                                                        <span className="text-sm flex-1">{c.name}</span>
                                                        <Badge variant="outline" className="text-xs">{c.level}</Badge>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={closePanel}
                                            disabled={processing}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1"
                                            disabled={processing}
                                        >
                                            <Save className="mr-2 h-4 w-4" />
                                            {processing
                                                ? (panel === 'create' ? 'Creating...' : 'Saving...')
                                                : (panel === 'create' ? 'Create Subject' : 'Save Changes')}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </>
            )}
        </AppLayout>
    );
}
