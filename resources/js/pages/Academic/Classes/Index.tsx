import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
    Plus, Search, MoreHorizontal, Eye, Edit, Trash2,
    Users, BookOpen, GraduationCap, School, X, Save, Hash, AlertCircle,
    ChevronUp, ChevronDown
} from 'lucide-react';
import Swal from 'sweetalert2';
import { StatCard, StatGrid } from '@/components/ui/stat-card';

interface SchoolClass {
    id: number;
    name: string;
    level: string;
    stream: string;
    section: string;
    capacity: number;
    class_teacher_id: number | null;
    room_number: string;
    is_active: boolean;
    students_count: number;
    subjects_count: number;
    subjects: Array<{ id?: number; name: string; code: string }>;
    created_at: string;
}

interface Subject { id: number; name: string; code: string }
interface Teacher { id: number; name: string; email: string }

interface Props {
    classes: { data: SchoolClass[]; links: any[]; meta: any };
    subjects?: Subject[];
    teachers?: Teacher[];
    sectionsList?: Array<{ id: number; name: string }>;
    roomsList?: Array<{ id: number; room_number: string; room_name: string | null }>;
    levels?: string[];
    stats: {
        classes: { total: number; active: number; inactive: number };
        students: { total: number; active: number; inactive: number };
        avg_size: number;
    };
}

const DEFAULT_LEVELS = [
    'Nursery', 'Primary', 'Secondary', 'Advanced',

];

const levelColor: Record<string, string> = {
    'Form 1': 'bg-blue-100 text-blue-700',
    'Form 2': 'bg-blue-100 text-blue-700',
    'Form 3': 'bg-violet-100 text-violet-700',
    'Form 4': 'bg-violet-100 text-violet-700',
    'Form 5': 'bg-amber-100 text-amber-700',
    'Form 6': 'bg-amber-100 text-amber-700',
};

export default function ClassesIndex({ classes, subjects = [], teachers = [], sectionsList = [], roomsList = [], stats, levels = [] }: Props) {
    const [search, setSearch] = useState('');
    const [panel, setPanel] = useState<'closed' | 'create' | 'edit' | 'view'>('closed');
    const [selected, setSelected] = useState<SchoolClass | null>(null);

    const [isManagingLevels, setIsManagingLevels] = useState(false);
    const [tempLevels, setTempLevels] = useState<string[]>([]);
    const [newLevelName, setNewLevelName] = useState('');
    const [savingLevels, setSavingLevels] = useState(false);
    const [hasMultipleSections, setHasMultipleSections] = useState(false);

    const activeLevels = levels && levels.length > 0 ? levels : DEFAULT_LEVELS;

    const handleAddLevel = () => {
        if (newLevelName.trim()) {
            setTempLevels([...tempLevels, newLevelName.trim()]);
            setNewLevelName('');
        }
    };

    const handleRemoveLevel = (index: number) => {
        setTempLevels(tempLevels.filter((_, i) => i !== index));
    };

    const handleUpdateLevel = (index: number, val: string) => {
        const updated = [...tempLevels];
        updated[index] = val;
        setTempLevels(updated);
    };

    const handleMoveLevel = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === tempLevels.length - 1) return;
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const updated = [...tempLevels];
        const temp = updated[index];
        updated[index] = updated[targetIndex];
        updated[targetIndex] = temp;
        setTempLevels(updated);
    };

    const handleSaveLevels = () => {
        const cleanLevels = tempLevels.map(l => l.trim()).filter(Boolean);
        if (cleanLevels.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please add at least one level.',
            });
            return;
        }

        setSavingLevels(true);
        router.post('/academic/classes/levels', { levels: cleanLevels }, {
            onSuccess: () => {
                setSavingLevels(false);
                setIsManagingLevels(false);
                Swal.fire({
                    icon: 'success',
                    title: 'Levels Saved',
                    text: 'Class levels list updated successfully.',
                    timer: 1500,
                    showConfirmButton: false,
                });
            },
            onError: (errs) => {
                setSavingLevels(false);
                Swal.fire({
                    icon: 'error',
                    title: 'Error Saving Levels',
                    text: Object.values(errs).join(', ') || 'An error occurred while saving.',
                });
            }
        });
    };

    const [newSectionName, setNewSectionName] = useState('');

    // Inertia form with proper error handling
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        level: '',
        stream: '',
        section: '',
        sections: [] as string[],
        capacity: 40,
        class_teacher_id: '' as string | number,
        room_number: '',
        is_active: true as boolean,
        subject_ids: [] as number[],
    });

    const handleAddSection = () => {
        if (newSectionName.trim()) {
            const trimmed = newSectionName.trim();
            if (!data.sections.includes(trimmed)) {
                setData('sections', [...data.sections, trimmed]);
            }
            setNewSectionName('');
        }
    };

    const handleRemoveSection = (sec: string) => {
        setData('sections', data.sections.filter(s => s !== sec));
    };

    const filtered = classes.data.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.level.toLowerCase().includes(search.toLowerCase()) ||
        (c.stream || '').toLowerCase().includes(search.toLowerCase())
    );

    const openCreate = () => {
        reset();
        clearErrors();
        setSelected(null);
        setData({
            name: '',
            level: '',
            stream: '',
            section: '',
            sections: [] as string[],
            capacity: 40,
            class_teacher_id: '',
            room_number: '',
            is_active: true,
            subject_ids: [],
        });
        setNewSectionName('');
        setHasMultipleSections(false);
        setPanel('create');
    };

    const openEdit = (cls: SchoolClass) => {
        clearErrors();
        setSelected(cls);
        setData({
            name: cls.name,
            level: cls.level,
            stream: cls.stream || '',
            section: cls.section || '',
            sections: cls.section ? [cls.section] : [] as string[],
            capacity: cls.capacity,
            class_teacher_id: cls.class_teacher_id || '',
            room_number: cls.room_number || '',
            is_active: cls.is_active,
            subject_ids: cls.subjects.map(s => s.id ?? 0).filter(Boolean),
        });
        setHasMultipleSections(false);
        setPanel('edit');
    };

    const openView = (cls: SchoolClass) => {
        setSelected(cls);
        setPanel('view');
    };

    const closePanel = () => {
        setPanel('closed');
        setSelected(null);
        clearErrors();
        setIsManagingLevels(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (panel === 'create' && hasMultipleSections && data.sections.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please add at least one section when Multiple Sections is enabled.',
            });
            return;
        }
        if (panel === 'create') {
            post('/academic/classes', {
                onSuccess: closePanel,
            });
        } else if (panel === 'edit' && selected) {
            put(`/academic/classes/${selected.id}`, {
                onSuccess: closePanel,
            });
        }
    };

    const toggleSubject = (subjectId: number) => {
        setData('subject_ids',
            data.subject_ids.includes(subjectId)
                ? data.subject_ids.filter(id => id !== subjectId)
                : [...data.subject_ids, subjectId]
        );
    };

    const handleDelete = (cls: SchoolClass) => {
        Swal.fire({
            title: 'Delete class?',
            text: `"${cls.name}" will be permanently removed.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Delete',
        }).then(r => r.isConfirmed && router.delete(`/academic/classes/${cls.id}`));
    };

    const capacityPct = (cls: SchoolClass) =>
        Math.min(100, Math.round((cls.students_count / (cls.capacity || 1)) * 100));

    const FieldError = ({ field }: { field: string }) =>
        errors[field as keyof typeof errors] ? (
            <div className="flex items-center gap-1 mt-1">
                <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                <p className="text-xs text-red-500">{errors[field as keyof typeof errors]}</p>
            </div>
        ) : null;

    return (
        <AppLayout>
            <Head title="Classes" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Classes</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Manage school classes, streams and their subjects</p>
                    </div>
                    <Button onClick={openCreate} size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Add Class
                    </Button>
                </div>

                {/* Stats */}
                <StatGrid cols={4}>
                    <StatCard
                        title="Total Classes"
                        value={stats.classes.total}
                        icon={School}
                        color="blue"
                        trend="stable"
                        trendLabel="Total"
                        subtitle={`Active: ${stats.classes.active} | Inactive: ${stats.classes.inactive}`}
                    />
                    <StatCard
                        title="Active Classes"
                        value={stats.classes.active}
                        icon={GraduationCap}
                        color="green"
                        trend="up"
                        trendLabel="Active"
                        subtitle="Operational"
                    />
                    <StatCard
                        title="Total Students"
                        value={stats.students.total}
                        icon={Users}
                        color="red"
                        trend="up"
                        trendLabel="Enrolled"
                        subtitle={`Active: ${stats.students.active} | Inactive: ${stats.students.inactive}`}
                    />
                    <StatCard
                        title="Avg Class Size"
                        value={stats.avg_size}
                        icon={Hash}
                        color="amber"
                        trend="stable"
                        trendLabel="Average"
                        subtitle="Based on active classes"
                    />
                </StatGrid>

                {/* Table Card */}
                <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-3">
                            <CardTitle className="text-base">All Classes</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search classes..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="pl-8 h-8 text-sm"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40">
                                    <TableHead className="pl-6">Class</TableHead>
                                    <TableHead>Level</TableHead>
                                    <TableHead>Stream</TableHead>
                                    <TableHead>Room</TableHead>
                                    <TableHead>Students</TableHead>
                                    <TableHead>Subjects</TableHead>
                                    <TableHead>Capacity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(cls => {
                                    const pct = capacityPct(cls);
                                    const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';
                                    return (
                                        <TableRow key={cls.id} className="hover:bg-muted/30">
                                            <TableCell className="pl-6 font-medium">
                                                {cls.name}
                                                {cls.section && (
                                                    <span className="text-xs text-muted-foreground ml-1.5 font-normal">
                                                        ({cls.section})
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${levelColor[cls.level] || 'bg-slate-100 text-slate-700'}`}>
                                                    {cls.level}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{cls.stream || '—'}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{cls.room_number || '—'}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span className="text-sm font-medium">{cls.students_count}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span className="text-sm">{cls.subjects_count}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1 w-24">
                                                    <div className="flex justify-between text-xs text-muted-foreground">
                                                        <span>{cls.students_count}/{cls.capacity}</span>
                                                        <span>{pct}%</span>
                                                    </div>
                                                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                                        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {cls.is_active
                                                    ? <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Active</Badge>
                                                    : <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openView(cls)}>
                                                            <Eye className="mr-2 h-4 w-4" /> View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => openEdit(cls)}>
                                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDelete(cls)} className="text-red-600">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                        </DropdownMenuItem>
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
                                <School className="h-10 w-10 text-muted-foreground/50 mb-3" />
                                <p className="text-sm font-medium">
                                    {search ? 'No classes match your search' : 'No classes yet'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 mb-4">
                                    {search ? 'Try a different search term' : 'Get started by adding your first class'}
                                </p>
                                {!search && (
                                    <Button size="sm" onClick={openCreate}>
                                        <Plus className="mr-2 h-4 w-4" />Add Class
                                    </Button>
                                )}
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
                                {panel === 'create' 
                                    ? 'New Class' 
                                    : panel === 'edit' 
                                        ? `Edit Class: ${selected?.name}${selected?.section ? ` (${selected.section})` : ''}` 
                                        : `${selected?.name}${selected?.section ? ` (${selected.section})` : ''}`
                                }
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
                                            { label: 'Class Name', value: selected.name },
                                            { label: 'Level', value: selected.level },
                                            { label: 'Stream', value: selected.stream || '—' },
                                            { label: 'Section', value: selected.section || '—' },
                                            { label: 'Room', value: selected.room_number || '—' },
                                            { label: 'Capacity', value: String(selected.capacity) },
                                            { 
                                                label: 'Class Teacher', 
                                                value: selected.class_teacher_id 
                                                    ? teachers.find(t => t.id === selected.class_teacher_id)?.name || '—'
                                                    : '—' 
                                            },
                                            { label: 'Students', value: String(selected.students_count) },
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
                                    {selected.subjects.length > 0 && (
                                        <>
                                            <Separator />
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-2">
                                                    Subjects ({selected.subjects_count})
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {selected.subjects.map((s, i) => (
                                                        <Badge key={i} variant="outline" className="text-xs">{s.name}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    <Button className="w-full" variant="outline" onClick={() => openEdit(selected)}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit Class
                                    </Button>
                                </div>
                            )}

                            {/* CREATE / EDIT FORM */}
                            {(panel === 'create' || panel === 'edit') && (
                                isManagingLevels ? (
                                    <div className="space-y-4 animate-fade-in">
                                        <div className="flex items-center justify-between pb-2 border-b">
                                            <div>
                                                <h3 className="text-sm font-semibold">Manage Class Levels</h3>
                                                <p className="text-xs text-muted-foreground">Add, edit, delete or sort levels</p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setIsManagingLevels(false)}
                                                className="h-7 px-2"
                                            >
                                                Back to Form
                                            </Button>
                                        </div>

                                        {/* Add New Level */}
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="New level name..."
                                                value={newLevelName}
                                                onChange={e => setNewLevelName(e.target.value)}
                                                className="h-9"
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddLevel();
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={handleAddLevel}
                                                disabled={!newLevelName.trim()}
                                            >
                                                <Plus className="h-4 w-4 mr-1" /> Add
                                            </Button>
                                        </div>

                                        {/* Levels List */}
                                        <div className="max-h-[300px] overflow-y-auto rounded-lg border divide-y bg-muted/10">
                                            {tempLevels.length === 0 ? (
                                                <p className="text-sm text-muted-foreground p-4 text-center">No levels defined.</p>
                                            ) : (
                                                tempLevels.map((lvl, index) => (
                                                    <div key={index} className="flex items-center gap-2 p-2 hover:bg-muted/30">
                                                        <Input
                                                            value={lvl}
                                                            onChange={e => handleUpdateLevel(index, e.target.value)}
                                                            className="h-8 py-1 px-2 text-sm flex-1 border-transparent focus-visible:border-input focus-visible:ring-1 hover:border-input bg-transparent"
                                                        />
                                                        <div className="flex items-center gap-0.5 shrink-0">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                                                disabled={index === 0}
                                                                onClick={() => handleMoveLevel(index, 'up')}
                                                            >
                                                                <ChevronUp className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                                                disabled={index === tempLevels.length - 1}
                                                                onClick={() => handleMoveLevel(index, 'down')}
                                                             >
                                                                <ChevronDown className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => handleRemoveLevel(index)}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-3 pt-4 border-t mt-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => setIsManagingLevels(false)}
                                                disabled={savingLevels}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="button"
                                                className="flex-1"
                                                onClick={handleSaveLevels}
                                                disabled={savingLevels || tempLevels.length === 0}
                                            >
                                                {savingLevels ? 'Saving...' : 'Save List'}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">

                                    {/* Name */}
                                    <div>
                                        <Label htmlFor="name">
                                            Class Name <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            placeholder="e.g. Form 1A"
                                            className={`mt-1 ${errors.name ? 'border-red-400' : ''}`}
                                        />
                                        <FieldError field="name" />
                                    </div>

                                    {/* Level */}
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="level">
                                                Level <span className="text-red-500">*</span>
                                            </Label>
                                            <Button
                                                type="button"
                                                variant="link"
                                                className="h-auto p-0 text-xs font-semibold text-primary hover:underline"
                                                onClick={() => {
                                                     setTempLevels([...activeLevels]);
                                                     setNewLevelName('');
                                                     setIsManagingLevels(true);
                                                }}
                                            >
                                                Manage Levels
                                            </Button>
                                        </div>
                                        <Select
                                            value={data.level || ''}
                                            onValueChange={v => setData('level', v)}
                                        >
                                            <SelectTrigger className={`mt-1 ${errors.level ? 'border-red-400' : ''}`}>
                                                <SelectValue placeholder="Select level..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {activeLevels.map(l => (
                                            <SelectItem key={l} value={l}>{l}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldError field="level" />
                                        {/* Stream + Section(s) */}
                                        <div className="space-y-3">
                                            {/* Multiple Sections Toggle (Only on Create) */}
                                            {panel === 'create' && (
                                                <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/10">
                                                    <div>
                                                        <p className="text-sm font-medium">Multiple Sections</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Batch create multiple sections (e.g. Class I A, Class I B)
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={hasMultipleSections}
                                                        onCheckedChange={(v) => {
                                                            setHasMultipleSections(v);
                                                            if (v) {
                                                                // Use the first two active database sections as default if they exist
                                                                const defaultSecs = sectionsList.slice(0, 2).map(s => s.name);
                                                                setData(prev => ({
                                                                    ...prev,
                                                                    section: '',
                                                                    sections: prev.sections.length > 0 ? prev.sections : defaultSecs
                                                                }));
                                                            } else {
                                                                setData(prev => ({
                                                                    ...prev,
                                                                    section: '',
                                                                    sections: []
                                                                }));
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <Label htmlFor="stream">Stream</Label>
                                                    <Input
                                                        id="stream"
                                                        value={data.stream}
                                                        onChange={e => setData('stream', e.target.value)}
                                                        placeholder="e.g. Science"
                                                        className="mt-1"
                                                    />
                                                </div>
                                                {(!hasMultipleSections || panel === 'edit') && (
                                                    <div>
                                                        <Label htmlFor="section">Section <span className="text-xs text-muted-foreground">(Optional)</span></Label>
                                                        {sectionsList.length > 0 ? (
                                                            <Select
                                                                value={data.section || ''}
                                                                onValueChange={v => setData('section', v)}
                                                            >
                                                                <SelectTrigger className="mt-1">
                                                                    <SelectValue placeholder="Select section..." />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="">None</SelectItem>
                                                                    {sectionsList.map(s => (
                                                                        <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        ) : (
                                                            <div className="mt-1 text-xs text-muted-foreground flex flex-col gap-1">
                                                                <p>No active sections available.</p>
                                                                <Link href="/academic/sections" className="text-primary hover:underline font-semibold flex items-center gap-1">
                                                                    Create sections first
                                                                </Link>
                                                            </div>
                                                        )}
                                                        <FieldError field="section" />
                                                    </div>
                                                )}
                                            </div>

                                            {panel === 'create' && hasMultipleSections && (
                                                <div className="space-y-2 border-t pt-3 mt-1">
                                                    <Label>Sections <span className="text-red-500">*</span></Label>
                                                    {sectionsList.length > 0 ? (
                                                        <div className="flex gap-2">
                                                            <div className="flex-1">
                                                                <Select
                                                                    value={newSectionName}
                                                                    onValueChange={v => setNewSectionName(v)}
                                                                >
                                                                    <SelectTrigger className="h-9">
                                                                        <SelectValue placeholder="Select section to add..." />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {sectionsList
                                                                            .filter(s => !data.sections.includes(s.name))
                                                                            .map(s => (
                                                                                <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                                                                            ))
                                                                        }
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                onClick={handleAddSection}
                                                                disabled={!newSectionName}
                                                                className="h-9"
                                                            >
                                                                <Plus className="h-4 w-4 mr-1" /> Add
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-muted-foreground flex flex-col gap-1">
                                                            <p>No active sections available.</p>
                                                            <Link href="/academic/sections" className="text-primary hover:underline font-semibold">
                                                                Create sections first
                                                            </Link>
                                                        </div>
                                                    )}

                                                    {/* Sections Badges List */}
                                                    <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border bg-muted/20 min-h-[42px] items-center">
                                                        {data.sections.length === 0 ? (
                                                            <span className="text-xs text-muted-foreground px-1">No sections added yet. At least one required.</span>
                                                        ) : (
                                                            data.sections.map((sec, i) => (
                                                                <Badge key={i} variant="secondary" className="flex items-center gap-1 text-xs px-2 py-0.5 animate-fade-in">
                                                                    {sec}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveSection(sec)}
                                                                        className="text-muted-foreground hover:text-foreground shrink-0 rounded-full hover:bg-muted p-0.5"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </button>
                                                                </Badge>
                                                            ))
                                                        )}
                                                    </div>
                                                    <FieldError field="sections" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Room + Capacity */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label htmlFor="room_number">Room</Label>
                                            {roomsList.length > 0 ? (
                                                <Select
                                                    value={data.room_number || ''}
                                                    onValueChange={v => setData('room_number', v)}
                                                >
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Select room..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="">None</SelectItem>
                                                        {roomsList.map(r => (
                                                            <SelectItem key={r.id} value={r.room_number}>
                                                                {r.room_number} {r.room_name ? `(${r.room_name})` : ''}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <div className="mt-1 text-xs text-muted-foreground flex flex-col gap-1">
                                                    <p>No active rooms available.</p>
                                                    <Link href="/academic/rooms" className="text-primary hover:underline font-semibold flex items-center gap-1">
                                                        Create rooms first
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="capacity">
                                                Capacity <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="capacity"
                                                type="number"
                                                value={data.capacity}
                                                onChange={e => setData('capacity', Number(e.target.value))}
                                                min={1}
                                                className={`mt-1 ${errors.capacity ? 'border-red-400' : ''}`}
                                            />
                                            <FieldError field="capacity" />
                                        </div>
                                    </div>

                                    {/* Class Teacher */}
                                    {teachers.length > 0 && (
                                        <div>
                                            <Label htmlFor="class_teacher_id">Class Teacher</Label>
                                            <Select
                                                value={String(data.class_teacher_id || '')}
                                                onValueChange={v => setData('class_teacher_id', v ? Number(v) : '')}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Select class teacher..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">None</SelectItem>
                                                    {teachers.map(t => (
                                                        <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FieldError field="class_teacher_id" />
                                        </div>
                                    )}

                                    {/* Active Toggle */}
                                    <div className="flex items-center justify-between rounded-lg border p-3">
                                        <div>
                                            <p className="text-sm font-medium">Active</p>
                                            <p className="text-xs text-muted-foreground">
                                                Make this class visible to students and teachers
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.is_active}
                                            onCheckedChange={v => setData('is_active', v)}
                                        />
                                    </div>

                                    {/* Subjects */}
                                    {subjects.length > 0 && (
                                        <div>
                                            <Label className="mb-2 block">
                                                Subjects
                                                {data.subject_ids.length > 0 && (
                                                    <span className="ml-1.5 text-xs text-muted-foreground">
                                                        ({data.subject_ids.length} selected)
                                                    </span>
                                                )}
                                            </Label>
                                            <div className="max-h-48 overflow-y-auto rounded-lg border divide-y">
                                                {subjects.map(s => (
                                                    <label
                                                        key={s.id}
                                                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="rounded"
                                                            checked={data.subject_ids.includes(s.id)}
                                                            onChange={() => toggleSubject(s.id)}
                                                        />
                                                        <span className="text-sm flex-1">{s.name}</span>
                                                        <Badge variant="outline" className="text-xs font-mono">{s.code}</Badge>
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
                                                : (panel === 'create' ? 'Create Class' : 'Save Changes')}
                                        </Button>
                                    </div>
                                </form>
                                )
                            )}
                        </div>
                    </div>
                </>
            )}
        </AppLayout>
    );
}
