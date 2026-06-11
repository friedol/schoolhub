import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Plus, Search, Eye, Edit, Trash2, MoreHorizontal, BookOpen, Hash, CheckCircle, X, Save } from 'lucide-react';
import Swal from 'sweetalert2';

interface Curriculum {
    id: number; name: string; description: string; academic_year: string;
    is_active: boolean; subjects_count: number; created_at: string;
}
interface Props { curricula: { data: Curriculum[]; links: any[]; meta: any } }

export default function CurriculumIndex({ curricula }: Props) {
    const [search, setSearch] = useState('');
    const [panel, setPanel] = useState<'closed' | 'create' | 'edit' | 'view'>('closed');
    const [selected, setSelected] = useState<Curriculum | null>(null);
    const [form, setForm] = useState({ name: '', description: '', academic_year: new Date().getFullYear().toString(), is_active: true });

    const filtered = curricula.data.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.academic_year?.includes(search)
    );

    const active = curricula.data.filter(c => c.is_active).length;

    const openCreate = () => {
        setForm({ name: '', description: '', academic_year: new Date().getFullYear().toString(), is_active: true });
        setPanel('create');
    };
    const openEdit = (c: Curriculum) => { setSelected(c); setForm({ name: c.name, description: c.description || '', academic_year: c.academic_year || '', is_active: c.is_active }); setPanel('edit'); };
    const openView = (c: Curriculum) => { setSelected(c); setPanel('view'); };
    const closePanel = () => { setPanel('closed'); setSelected(null); };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (panel === 'create') router.post('/academic/curriculum', form, { onSuccess: closePanel });
        else if (panel === 'edit' && selected) router.put(`/academic/curriculum/${selected.id}`, form, { onSuccess: closePanel });
    };

    const handleDelete = (c: Curriculum) => {
        Swal.fire({ title: 'Delete curriculum?', text: `"${c.name}" will be permanently removed.`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Delete' })
            .then(r => r.isConfirmed && router.delete(`/academic/curriculum/${c.id}`));
    };

    return (
        <AppLayout>
            <Head title="Curriculum" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Curriculum</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Manage academic curricula and subject combinations</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/academic/curriculum/subject-combinations">Subject Combinations</Link>
                        </Button>
                        <Button size="sm" onClick={openCreate}><Plus className="mr-2 h-4 w-4" />New Curriculum</Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {[
                        { label: 'Total', value: curricula.data.length, icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
                        { label: 'Active', value: active, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
                        { label: 'Inactive', value: curricula.data.length - active, icon: Hash, color: 'text-slate-500 bg-slate-50' },
                    ].map(s => (
                        <Card key={s.label} className="border shadow-sm">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}><s.icon className="h-5 w-5" /></div>
                                <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-3">
                            <CardTitle className="text-base">All Curricula</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40">
                                    <TableHead className="pl-6">Name</TableHead>
                                    <TableHead>Academic Year</TableHead>
                                    <TableHead>Subjects</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(cur => (
                                    <TableRow key={cur.id} className="hover:bg-muted/30">
                                        <TableCell className="pl-6">
                                            <div>
                                                <p className="font-medium text-sm">{cur.name}</p>
                                                {cur.description && <p className="text-xs text-muted-foreground line-clamp-1">{cur.description}</p>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono text-xs">{cur.academic_year}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="text-sm">{cur.subjects_count}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {cur.is_active
                                                ? <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Active</Badge>
                                                : <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{new Date(cur.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                                        <TableCell className="text-right pr-6">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openView(cur)}><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openEdit(cur)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(cur)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
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
                                <p className="text-sm font-medium">{search ? 'No curricula match' : 'No curricula yet'}</p>
                                <p className="text-xs text-muted-foreground mt-1 mb-4">{search ? 'Try a different search' : 'Create your first curriculum'}</p>
                                {!search && <Button size="sm" onClick={openCreate}><Plus className="mr-2 h-4 w-4" />New Curriculum</Button>}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Side Panel */}
            {panel !== 'closed' && (
                <>
                    <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={closePanel} />
                    <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l shadow-2xl z-50 flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h2 className="text-lg font-semibold">{panel === 'create' ? 'New Curriculum' : panel === 'edit' ? 'Edit Curriculum' : selected?.name}</h2>
                            <Button variant="ghost" size="icon" onClick={closePanel}><X className="h-4 w-4" /></Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            {panel === 'view' && selected ? (
                                <div className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><p className="text-xs text-muted-foreground mb-1">Name</p><p className="font-medium">{selected.name}</p></div>
                                        <div><p className="text-xs text-muted-foreground mb-1">Year</p><p className="font-medium">{selected.academic_year}</p></div>
                                        <div><p className="text-xs text-muted-foreground mb-1">Subjects</p><p className="font-medium">{selected.subjects_count}</p></div>
                                        <div><p className="text-xs text-muted-foreground mb-1">Status</p>
                                            {selected.is_active
                                                ? <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Active</Badge>
                                                : <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                                        </div>
                                    </div>
                                    {selected.description && <><Separator /><div><p className="text-xs text-muted-foreground mb-1">Description</p><p className="text-sm">{selected.description}</p></div></>}
                                    <Button className="w-full" variant="outline" onClick={() => openEdit(selected)}><Edit className="mr-2 h-4 w-4" />Edit</Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label>Curriculum Name *</Label>
                                        <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. O-Level Science 2024" required className="mt-1" />
                                    </div>
                                    <div>
                                        <Label>Academic Year *</Label>
                                        <Input value={form.academic_year} onChange={e => setForm(f => ({ ...f, academic_year: e.target.value }))} placeholder="e.g. 2024" className="mt-1" />
                                    </div>
                                    <div>
                                        <Label>Description</Label>
                                        <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description..." rows={3} className="mt-1" />
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border p-3">
                                        <div><p className="text-sm font-medium">Active</p><p className="text-xs text-muted-foreground">Make this curriculum available</p></div>
                                        <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <Button type="button" variant="outline" className="flex-1" onClick={closePanel}>Cancel</Button>
                                        <Button type="submit" className="flex-1"><Save className="mr-2 h-4 w-4" />{panel === 'create' ? 'Create' : 'Save'}</Button>
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
