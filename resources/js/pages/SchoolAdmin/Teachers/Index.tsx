import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { StatCard, StatGrid } from '@/components/ui/stat-card';
import {
    Plus, Eye, Edit, Trash2, Users, GraduationCap, X, Save, Search,
    Phone, Mail, MapPin, Calendar, UserCheck, UserX, Clock, BookOpen,
} from 'lucide-react';
import Swal from 'sweetalert2';

interface AssignedClass {
    id: number;
    name: string;
    level: string;
    stream: string | null;
}

interface Teacher {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    date_of_birth: string | null;
    gender: 'male' | 'female' | 'other' | null;
    address: string | null;
    profile_photo: string | null;
    is_active: boolean;
    created_at: string;
    assigned_class: AssignedClass | null;
    settings: {
        position?: string | null;
        subject?: string | null;
        working_hour?: string | null;
    } | null;
}

interface SchoolClass {
    id: number;
    name: string;
    level: string;
    stream: string | null;
}

interface Props {
    teachers: {
        data: Teacher[];
        links: any[];
        meta: any;
    };
    classes: SchoolClass[];
    filters: {
        search?: string;
        gender?: string;
        status?: string;
    };
}

type PanelType = 'view' | 'edit' | 'create' | null;

const emptyForm = {
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '' as '' | 'male' | 'female' | 'other',
    address: '',
    class_id: '' as string,
    is_active: true,
    position: '',
    subject: '',
    working_hour: '' as '' | 'Full time' | 'Part time',
};

export default function TeachersIndex({ teachers, classes, filters }: Props) {
    const { props } = usePage<any>();
    const flash = props.flash as { success?: string; error?: string } | undefined;

    const [search, setSearch] = useState(filters.search ?? '');
    const [genderFilter, setGenderFilter] = useState(filters.gender ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '');

    const [panel, setPanel] = useState<{ open: boolean; type: PanelType; teacher?: Teacher }>({
        open: false, type: null,
    });

    const [form, setForm] = useState({ ...emptyForm });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // ── helpers ──────────────────────────────────────────────────────────────

    const openPanel = (type: PanelType, teacher?: Teacher) => {
        setErrors({});
        if (type === 'create') {
            setForm({ ...emptyForm });
        } else if (teacher) {
            setForm({
                name:         teacher.name,
                email:        teacher.email,
                phone:        teacher.phone ?? '',
                date_of_birth: teacher.date_of_birth
                    ? teacher.date_of_birth.substring(0, 10)
                    : '',
                gender:       teacher.gender ?? '',
                address:      teacher.address ?? '',
                class_id:     teacher.assigned_class?.id?.toString() ?? '',
                is_active:    teacher.is_active,
                position:     teacher.settings?.position ?? '',
                subject:      teacher.settings?.subject ?? '',
                working_hour: (teacher.settings?.working_hour as any) ?? '',
            });
        }
        setPanel({ open: true, type, teacher });
    };

    const closePanel = () => setPanel({ open: false, type: null });

    const applyFilters = (overrides: Record<string, string> = {}) => {
        const params: Record<string, string> = {};
        if (search)       params.search = search;
        if (genderFilter) params.gender = genderFilter;
        if (statusFilter) params.status = statusFilter;
        Object.assign(params, overrides);
        router.get('/school-admin/teachers', params, { preserveState: true, replace: true });
    };

    const getInitials = (name: string) =>
        name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    const genderColor = (g: string | null) => {
        if (g === 'male')   return 'bg-blue-100 text-blue-700';
        if (g === 'female') return 'bg-pink-100 text-pink-700';
        return 'bg-gray-100 text-gray-600';
    };

    // ── CRUD ─────────────────────────────────────────────────────────────────

    const handleSave = () => {
        const payload = {
            name:          form.name,
            email:         form.email,
            phone:         form.phone,
            date_of_birth: form.date_of_birth,
            gender:        form.gender,
            address:       form.address,
            class_id:      form.class_id || null,
            is_active:     form.is_active,
            position:      form.position || null,
            subject:       form.subject || null,
            working_hour:  form.working_hour || null,
        };

        if (panel.type === 'create') {
            router.post('/school-admin/teachers', payload, {
                onSuccess: () => { closePanel(); router.reload({ only: ['teachers'] }); },
                onError:   (e) => setErrors(e),
            });
        } else if (panel.type === 'edit' && panel.teacher) {
            router.patch(`/school-admin/teachers/${panel.teacher.id}`, payload, {
                onSuccess: () => { closePanel(); router.reload({ only: ['teachers'] }); },
                onError:   (e) => setErrors(e),
            });
        }
    };

    const handleDelete = (teacher: Teacher) => {
        Swal.fire({
            title: 'Delete Teacher?',
            text:  `"${teacher.name}" will be permanently removed.`,
            icon:  'warning',
            showCancelButton:    true,
            confirmButtonColor:  '#ef4444',
            cancelButtonColor:   '#6b7280',
            confirmButtonText:   'Yes, delete',
            cancelButtonText:    'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/school-admin/teachers/${teacher.id}`, {
                    onSuccess: () => {
                        Swal.fire({ title: 'Deleted!', icon: 'success', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
                        router.reload({ only: ['teachers'] });
                    },
                    onError: () => {
                        Swal.fire({ title: 'Error!', text: 'Could not delete teacher.', icon: 'error', timer: 3000, showConfirmButton: false, toast: true, position: 'top-end' });
                    },
                });
            }
        });
    };

    // ── stats ─────────────────────────────────────────────────────────────────

    const total       = teachers.meta?.total ?? teachers.data.length;
    const active      = teachers.data.filter(t => t.is_active).length;
    const males       = teachers.data.filter(t => t.gender === 'male').length;
    const females     = teachers.data.filter(t => t.gender === 'female').length;
    const classTeachers = teachers.data.filter(t => t.assigned_class).length;

    // ── render ────────────────────────────────────────────────────────────────

    return (
        <AppLayout>
            <Head title="Teachers" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">

                {/* Flash */}
                {flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-base font-semibold">Teachers</h1>
                        <p className="text-sm text-muted-foreground">Manage teaching staff and class assignments</p>
                    </div>
                    <Button onClick={() => openPanel('create')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Teacher
                    </Button>
                </div>

                {/* Stats */}
                <StatGrid cols={5}>
                    <StatCard title="Total Teachers"  value={total}        icon={Users}       color="indigo"  trendLabel="All staff" />
                    <StatCard title="Active"           value={active}       icon={UserCheck}   color="emerald" trendLabel="Currently active" />
                    <StatCard title="Class Teachers"   value={classTeachers} icon={GraduationCap} color="blue" trendLabel="Assigned to class" />
                    <StatCard title="Male"             value={males}        icon={Users}       color="sky"    trendLabel="Male teachers" />
                    <StatCard title="Female"           value={females}      icon={Users}       color="pink"   trendLabel="Female teachers" />
                </StatGrid>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-5">
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="flex-1 min-w-48">
                                <Label className="text-xs mb-1 block">Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-8"
                                        placeholder="Name, email or phone…"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && applyFilters({ search })}
                                    />
                                </div>
                            </div>
                            <div className="w-36">
                                <Label className="text-xs mb-1 block">Gender</Label>
                                <Select value={genderFilter || 'all'} onValueChange={v => { const val = v === 'all' ? '' : v; setGenderFilter(val); applyFilters({ gender: val }); }}>
                                    <SelectTrigger><SelectValue placeholder="All genders" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All genders</SelectItem>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-36">
                                <Label className="text-xs mb-1 block">Status</Label>
                                <Select value={statusFilter || 'all'} onValueChange={v => { const val = v === 'all' ? '' : v; setStatusFilter(val); applyFilters({ status: val }); }}>
                                    <SelectTrigger><SelectValue placeholder="All status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button variant="outline" onClick={() => applyFilters({ search })}>
                                <Search className="mr-2 h-4 w-4" /> Search
                            </Button>
                            {(search || genderFilter || statusFilter) && (
                                <Button variant="ghost" size="sm" onClick={() => {
                                    setSearch(''); setGenderFilter(''); setStatusFilter('');
                                    router.get('/school-admin/teachers', {}, { replace: true });
                                }}>
                                    <X className="mr-1 h-3 w-3" /> Clear
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold">
                            Teaching Staff
                            {teachers.meta?.total !== undefined && (
                                <span className="ml-2 font-normal text-muted-foreground">({teachers.meta.total})</span>
                            )}
                        </CardTitle>
                        <CardDescription className="text-xs">All registered teachers in this school</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Teacher</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Position / Subject</TableHead>
                                    <TableHead>Class</TableHead>
                                    <TableHead>Gender</TableHead>
                                    <TableHead>Working</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {teachers.data.map((teacher) => (
                                    <TableRow key={teacher.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {teacher.profile_photo ? (
                                                    <img
                                                        src={`/storage/${teacher.profile_photo}`}
                                                        alt={teacher.name}
                                                        className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 ring-2 ring-white shadow-sm">
                                                        {getInitials(teacher.name)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium">{teacher.name}</p>
                                                    <p className="text-xs text-muted-foreground">{teacher.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                {teacher.phone && (
                                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Phone className="h-3 w-3" />{teacher.phone}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                {teacher.settings?.position && (
                                                    <Badge variant="secondary" className="text-xs w-fit">
                                                        {teacher.settings.position}
                                                    </Badge>
                                                )}
                                                {teacher.settings?.subject && (
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <BookOpen className="h-3 w-3" />{teacher.settings.subject}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {teacher.assigned_class ? (
                                                <Badge variant="outline" className="text-xs">
                                                    {teacher.assigned_class.name}
                                                    {teacher.assigned_class.stream ? ` (${teacher.assigned_class.stream})` : ''}
                                                </Badge>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${genderColor(teacher.gender)}`}>
                                                {teacher.gender ?? '—'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {teacher.settings?.working_hour ? (
                                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {teacher.settings.working_hour}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {teacher.is_active ? (
                                                <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs">
                                                    <UserCheck className="mr-1 h-3 w-3" />Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="text-xs">
                                                    <UserX className="mr-1 h-3 w-3" />Inactive
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="outline" size="sm" onClick={() => openPanel('view', teacher)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => openPanel('edit', teacher)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline" size="sm"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDelete(teacher)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {teachers.data.length === 0 && (
                            <div className="py-16 text-center">
                                <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-3 text-sm font-semibold">No teachers found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {search || genderFilter || statusFilter
                                        ? 'Try adjusting your filters.'
                                        : 'Get started by registering a teacher.'}
                                </p>
                                {!search && !genderFilter && !statusFilter && (
                                    <div className="mt-6">
                                        <Button onClick={() => openPanel('create')}>
                                            <Plus className="mr-2 h-4 w-4" /> Add Teacher
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        {teachers.meta?.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                                <span>
                                    Showing {teachers.meta.from}–{teachers.meta.to} of {teachers.meta.total}
                                </span>
                                <div className="flex gap-1">
                                    {teachers.links?.filter(l => l.url).map((link: any, i: number) => (
                                        <Button
                                            key={i}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                            disabled={!link.url}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ── Slide Panel ─────────────────────────────────────────────── */}
            {panel.open && (
                <>
                    <div className="fixed inset-0 bg-black/20 z-40" onClick={closePanel} />
                    <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col">

                        {/* Panel header */}
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {panel.type === 'create' && 'Register Teacher'}
                                    {panel.type === 'edit'   && 'Edit Teacher'}
                                    {panel.type === 'view'   && 'Teacher Profile'}
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {panel.type === 'create' && 'Add a new teaching staff member'}
                                    {panel.type === 'edit'   && `Updating — ${panel.teacher?.name}`}
                                    {panel.type === 'view'   && panel.teacher?.email}
                                </p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={closePanel} className="h-8 w-8 p-0">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Panel body */}
                        <div className="flex-1 overflow-y-auto px-6 py-5">
                            {panel.type === 'view' && panel.teacher ? (
                                /* ── VIEW MODE ── */
                                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                                    {/* Profile header */}
                                    <div className="flex items-center gap-4 rounded-xl border bg-gradient-to-r from-indigo-50 to-blue-50 p-4">
                                        {panel.teacher.profile_photo ? (
                                            <img
                                                src={`/storage/${panel.teacher.profile_photo}`}
                                                alt={panel.teacher.name}
                                                className="h-16 w-16 rounded-full object-cover ring-4 ring-white shadow"
                                            />
                                        ) : (
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold text-white ring-4 ring-white shadow">
                                                {getInitials(panel.teacher.name)}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-lg font-semibold">{panel.teacher.name}</h3>
                                            {panel.teacher.settings?.position && (
                                                <p className="text-sm text-indigo-600 font-medium">{panel.teacher.settings.position}</p>
                                            )}
                                            <div className="mt-1 flex items-center gap-2">
                                                {panel.teacher.is_active ? (
                                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs">Active</Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="text-xs">Inactive</Badge>
                                                )}
                                                {panel.teacher.gender && (
                                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${genderColor(panel.teacher.gender)}`}>
                                                        {panel.teacher.gender}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact */}
                                    <div className="rounded-lg border p-4 space-y-3">
                                        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact Information</h4>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span>{panel.teacher.email}</span>
                                        </div>
                                        {panel.teacher.phone && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <span>{panel.teacher.phone}</span>
                                            </div>
                                        )}
                                        {panel.teacher.address && (
                                            <div className="flex items-start gap-2 text-sm">
                                                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                                <span>{panel.teacher.address}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Teaching */}
                                    <div className="rounded-lg border p-4 space-y-3">
                                        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Teaching Details</h4>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Subject</p>
                                                <p className="font-medium">{panel.teacher.settings?.subject ?? '—'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Working Hours</p>
                                                <p className="font-medium">{panel.teacher.settings?.working_hour ?? '—'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Assigned Class</p>
                                                <p className="font-medium">
                                                    {panel.teacher.assigned_class
                                                        ? `${panel.teacher.assigned_class.name}${panel.teacher.assigned_class.stream ? ` (${panel.teacher.assigned_class.stream})` : ''}`
                                                        : '—'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Date of Birth</p>
                                                <p className="font-medium">
                                                    {panel.teacher.date_of_birth
                                                        ? new Date(panel.teacher.date_of_birth).toLocaleDateString()
                                                        : '—'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Meta */}
                                    <div className="rounded-lg border p-4 space-y-2">
                                        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">System Info</h4>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            Joined {new Date(panel.teacher.created_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Button className="flex-1" variant="outline" onClick={() => openPanel('edit', panel.teacher)}>
                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                        </Button>
                                        <Button
                                            className="flex-1"
                                            variant="outline"
                                            onClick={() => { closePanel(); handleDelete(panel.teacher!); }}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                                            <span className="text-red-600">Delete</span>
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                /* ── CREATE / EDIT FORM ── */
                                <div className="space-y-5">
                                    {/* Personal info section */}
                                    <div>
                                        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Personal Information</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="name">Full Name *</Label>
                                                <Input id="name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g., John Mwanga" className="mt-1" />
                                                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <Label htmlFor="email">Email *</Label>
                                                    <Input id="email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="teacher@school.tz" className="mt-1" />
                                                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                                                </div>
                                                <div>
                                                    <Label htmlFor="phone">Phone *</Label>
                                                    <Input id="phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+255 7xx xxx xxx" className="mt-1" />
                                                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <Label htmlFor="dob">Date of Birth *</Label>
                                                    <Input id="dob" type="date" value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} className="mt-1" />
                                                    {errors.date_of_birth && <p className="mt-1 text-xs text-red-500">{errors.date_of_birth}</p>}
                                                </div>
                                                <div>
                                                    <Label>Gender *</Label>
                                                    <Select value={form.gender || undefined} onValueChange={v => setForm({...form, gender: v as any})}>
                                                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="male">Male</SelectItem>
                                                            <SelectItem value="female">Female</SelectItem>
                                                            <SelectItem value="other">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender}</p>}
                                                </div>
                                            </div>
                                            <div>
                                                <Label htmlFor="address">Address *</Label>
                                                <Textarea id="address" rows={2} value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Present address" className="mt-1" />
                                                {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Teaching info section */}
                                    <div className="border-t pt-5">
                                        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Teaching Information</h4>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <Label htmlFor="position">Position</Label>
                                                    <Input id="position" value={form.position} onChange={e => setForm({...form, position: e.target.value})} placeholder="e.g., Head of Science" className="mt-1" />
                                                </div>
                                                <div>
                                                    <Label htmlFor="subject">Faculty / Subject</Label>
                                                    <Input id="subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="e.g., Mathematics" className="mt-1" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <Label>Working Hours</Label>
                                                    <Select value={form.working_hour || undefined} onValueChange={v => setForm({...form, working_hour: v as any})}>
                                                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Full time">Full Time</SelectItem>
                                                            <SelectItem value="Part time">Part Time</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label>Assign as Class Teacher</Label>
                                                    <Select value={form.class_id || 'none'} onValueChange={v => setForm({...form, class_id: v === 'none' ? '' : v})}>
                                                        <SelectTrigger className="mt-1"><SelectValue placeholder="None" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none">None</SelectItem>
                                                            {classes.map(c => (
                                                                <SelectItem key={c.id} value={c.id.toString()}>
                                                                    {c.name}{c.stream ? ` (${c.stream})` : ''}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status (edit only) */}
                                    {panel.type === 'edit' && (
                                        <div className="border-t pt-5">
                                            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</h4>
                                            <Select value={form.is_active ? 'active' : 'inactive'} onValueChange={v => setForm({...form, is_active: v === 'active'})}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Panel footer (only for create/edit) */}
                        {panel.type !== 'view' && (
                            <div className="border-t px-6 py-4">
                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={closePanel} className="flex-1">Cancel</Button>
                                    <Button onClick={handleSave} className="flex-1">
                                        <Save className="mr-2 h-4 w-4" />
                                        {panel.type === 'create' ? 'Register' : 'Save Changes'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </AppLayout>
    );
}
