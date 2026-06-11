import { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { RefreshCw, Printer, Download, Plus, Search, ChevronDown, MoreVertical, Pencil, Trash2, X, Filter, SlidersHorizontal, Calendar } from 'lucide-react';

interface Group { id: number; code: string; name: string; description: string; is_active: boolean }
interface Props {
    groups: { data: Group[]; links: { url: string|null; label: string; active: boolean }[] };
    filters: { status?: string; name?: string };
}

const emptyForm = { name: '', description: '', is_active: true };

export default function FeesGroupIndex({ groups, filters }: Props) {
    const [search, setSearch]   = useState('');
    const [rpp, setRpp]         = useState(10);
    const [showFilter, setShowFilter] = useState(false);
    const [fStatus, setFStatus] = useState(filters.status ?? '');
    const [fName, setFName]     = useState(filters.name ?? '');

    const [showModal, setShowModal]   = useState(false);
    const [editId, setEditId]         = useState<number|null>(null);
    const [form, setForm]             = useState({ ...emptyForm });
    const [errors, setErrors]         = useState<Record<string,string>>({});
    const [processing, setProcessing] = useState(false);

    const today = new Date(); const wa = new Date(today); wa.setDate(today.getDate()-6);
    const fmt = (d: Date) => d.toLocaleDateString('en-US',{month:'2-digit',day:'2-digit',year:'numeric'});
    const dateRange = `${fmt(wa)} - ${fmt(today)}`;

    const filtered = useMemo(() => {
        if (!search.trim()) return groups.data;
        const q = search.toLowerCase();
        return groups.data.filter(g => g.code.toLowerCase().includes(q) || g.name.toLowerCase().includes(q));
    }, [groups.data, search]);

    function applyFilter() {
        setShowFilter(false);
        router.get('/finance/fees-collection/fees-group', { status: fStatus||undefined, name: fName||undefined }, { preserveState: true, replace: true });
    }
    function resetFilter() {
        setFStatus(''); setFName(''); setShowFilter(false);
        router.get('/finance/fees-collection/fees-group', {}, { preserveState: true, replace: true });
    }
    function openAdd() { setEditId(null); setForm({ ...emptyForm }); setErrors({}); setShowModal(true); }
    function openEdit(g: Group) { setEditId(g.id); setForm({ name: g.name, description: g.description ?? '', is_active: g.is_active }); setErrors({}); setShowModal(true); }
    function validate() {
        const e: Record<string,string> = {};
        if (!form.name.trim()) e.name = 'Name is required';
        setErrors(e); return !Object.keys(e).length;
    }
    function handleSubmit() {
        if (!validate()) return; setProcessing(true);
        const url = editId ? `/finance/fees-collection/fees-group/${editId}` : '/finance/fees-collection/fees-group';
        router[editId ? 'put' : 'post'](url, form, {
            onSuccess: () => { setShowModal(false); setProcessing(false); },
            onError: errs => { setErrors(errs); setProcessing(false); },
        });
    }
    function handleDelete(id: number) {
        if (!confirm('Delete this fees group?')) return;
        router.delete(`/finance/fees-collection/fees-group/${id}`);
    }

    const breadcrumbs = [
        { title: 'Dashboard', href: '/school-admin/dashboard' },
        { title: 'Fees Collection', href: '#' },
        { title: 'Fees Group', href: '/finance/fees-collection/fees-group' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Fees Group" />
            <div className="flex flex-col gap-4 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Fees Collection</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">Dashboard / Fees Collection / Fees Group</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50"><RefreshCw className="h-4 w-4" onClick={() => router.reload()} /></button>
                        <button className="p-2 rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50"><Printer className="h-4 w-4" onClick={() => window.print()} /></button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-9 gap-1.5 text-xs"><Download className="h-3.5 w-3.5" /> Export <ChevronDown className="h-3 w-3" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                                <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button onClick={openAdd} className="h-9 gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Plus className="h-4 w-4" /> Add Fees Group
                        </Button>
                    </div>
                </div>

                {/* Table Card */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                    {/* Card header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-base font-bold text-slate-800 dark:text-white">Fees Collection</h2>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 text-xs text-slate-600"><Calendar className="h-3.5 w-3.5" />{dateRange}</div>
                            <div className="relative">
                                <button onClick={() => setShowFilter(!showFilter)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 text-xs text-slate-600 hover:bg-slate-50">
                                    <Filter className="h-3.5 w-3.5" /> Filter <ChevronDown className="h-3 w-3" />
                                </button>
                                {showFilter && (
                                    <div className="absolute right-0 top-full mt-1 z-30 w-80 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 shadow-xl p-4 space-y-4">
                                        <h3 className="font-semibold text-sm text-slate-800">Filter</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold text-slate-700">ID</Label>
                                                <Select><SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem></SelectContent></Select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold text-slate-700">Name</Label>
                                                <Input value={fName} onChange={e => setFName(e.target.value)} className="h-9 text-xs" placeholder="Search name" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-slate-700">Status</Label>
                                            <Select value={fStatus} onValueChange={setFStatus}>
                                                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
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
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 text-xs text-slate-600 hover:bg-slate-50">
                                <SlidersHorizontal className="h-3.5 w-3.5" /> Sort by A-Z <ChevronDown className="h-3 w-3" />
                            </button>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span>Row Per Page</span>
                            <Select value={String(rpp)} onValueChange={v => setRpp(Number(v))}>
                                <SelectTrigger className="h-8 w-16 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>{[10,25,50,100].map(n=><SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
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
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100">
                                    <th className="w-10 px-4 py-3"><input type="checkbox" className="rounded border-slate-300" /></th>
                                    {['ID','Fees Group','Description','Status','Action'].map(h=>(
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">
                                            <span className="flex items-center gap-1">{h}{h!=='Action'&&<ChevronDown className="h-3 w-3 opacity-40"/>}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">No fees groups found.</td></tr>
                                ) : filtered.slice(0,rpp).map(g => (
                                    <tr key={g.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3"><input type="checkbox" className="rounded border-slate-300" /></td>
                                        <td className="px-4 py-3"><span className="text-indigo-600 font-medium text-xs">{g.code}</span></td>
                                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{g.name}</td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">{g.description}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${g.is_active?'bg-green-50 text-green-700 border border-green-200':'bg-red-50 text-red-600 border border-red-200'}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${g.is_active?'bg-green-500':'bg-red-500'}`}/>
                                                {g.is_active?'Active':'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="p-1.5 rounded hover:bg-slate-100"><MoreVertical className="h-4 w-4 text-slate-500"/></button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-36">
                                                    <DropdownMenuItem onClick={()=>openEdit(g)} className="gap-2 text-xs"><Pencil className="h-3.5 w-3.5"/>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={()=>handleDelete(g.id)} className="gap-2 text-xs text-red-600 focus:text-red-600"><Trash2 className="h-3.5 w-3.5"/>Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-end gap-1 px-5 py-3 border-t border-slate-100">
                        {groups.links.map((link,i)=>(
                            <button key={i} disabled={!link.url} onClick={()=>link.url&&router.get(link.url)}
                                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${link.active?'bg-indigo-600 text-white':'text-slate-600 hover:bg-slate-100'} ${!link.url?'opacity-40 cursor-not-allowed':''}`}
                                dangerouslySetInnerHTML={{__html:link.label}}/>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h2 className="text-base font-bold text-slate-900">{editId?'Edit Fees Group':'Add Fees Group'}</h2>
                            <button onClick={()=>setShowModal(false)} className="p-1.5 rounded-full hover:bg-slate-100"><X className="h-4 w-4 text-slate-500"/></button>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-slate-700">Fees Group</Label>
                                <Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className={`h-10 ${errors.name?'border-red-400':''}`} placeholder="Enter fees group name"/>
                                {errors.name&&<p className="text-xs text-red-500">{errors.name}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-slate-700">Description</Label>
                                <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[90px] resize-none focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Enter description"/>
                            </div>
                            <div className="flex items-start justify-between pt-1">
                                <div>
                                    <Label className="text-sm font-semibold text-slate-700">Status</Label>
                                    <p className="text-xs text-muted-foreground mt-0.5">Change the Status by toggle</p>
                                </div>
                                <Switch checked={form.is_active} onCheckedChange={v=>setForm(f=>({...f,is_active:v}))}/>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
                            <Button variant="outline" onClick={()=>setShowModal(false)} className="h-10 px-5 text-sm">Cancel</Button>
                            <Button onClick={handleSubmit} disabled={processing} className="h-10 px-6 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                                {processing?'Saving...':editId?'Update Fees Group':'Add Fees Group'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {showFilter&&<div className="fixed inset-0 z-20" onClick={()=>setShowFilter(false)}/>}
        </AppLayout>
    );
}
