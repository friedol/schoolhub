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

interface Master { id: number; code: string; fees_group: string; fees_type: string; due_date: string; amount: number; fine_type: string; fine_amount: number; is_active: boolean }
interface Group { id: number; name: string }
interface FType { id: number; name: string; fees_group_id: number }
interface Props {
    masters: { data: Master[]; links: { url: string|null; label: string; active: boolean }[] };
    groups:  Group[];
    types:   FType[];
    filters: { fees_group_id?: string; fees_type_id?: string; fine_type?: string; status?: string; due_date?: string };
}

const emptyForm = { fees_group_id: '', fees_type_id: '', due_date: '', amount: '', fine_type: 'none', fine_amount: '', is_active: true };

const FINE_COLORS: Record<string, string> = {
    none:       'bg-amber-50 text-amber-700 border border-amber-200',
    percentage: 'bg-sky-50 text-sky-700 border border-sky-200',
    fixed:      'bg-rose-50 text-rose-700 border border-rose-200',
};

export default function FeesMasterIndex({ masters, groups, types, filters }: Props) {
    const [search, setSearch] = useState('');
    const [rpp, setRpp]       = useState(10);
    const [showFilter, setShowFilter] = useState(false);
    const [fGroup, setFGroup]         = useState(filters.fees_group_id ?? '');
    const [fType, setFType]           = useState(filters.fees_type_id ?? '');
    const [fFine, setFFine]           = useState(filters.fine_type ?? '');
    const [fStatus, setFStatus]       = useState(filters.status ?? '');
    const [fDue, setFDue]             = useState(filters.due_date ?? '');

    const [showModal, setShowModal]   = useState(false);
    const [editId, setEditId]         = useState<number|null>(null);
    const [form, setForm]             = useState({ ...emptyForm });
    const [errors, setErrors]         = useState<Record<string,string>>({});
    const [processing, setProcessing] = useState(false);

    const today = new Date(); const wa = new Date(today); wa.setDate(today.getDate()-6);
    const fmt = (d: Date) => d.toLocaleDateString('en-US',{month:'2-digit',day:'2-digit',year:'numeric'});
    const dateRange = `${fmt(wa)} - ${fmt(today)}`;

    const filteredTypes = useMemo(() => {
        if (!form.fees_group_id) return types;
        return types.filter(t => String(t.fees_group_id) === form.fees_group_id);
    }, [types, form.fees_group_id]);

    const filtered = useMemo(() => {
        if (!search.trim()) return masters.data;
        const q = search.toLowerCase();
        return masters.data.filter(m => m.code.toLowerCase().includes(q) || m.fees_group.toLowerCase().includes(q) || m.fees_type.toLowerCase().includes(q));
    }, [masters.data, search]);

    function applyFilter() {
        setShowFilter(false);
        router.get('/finance/fees-collection/fees-master', {
            fees_group_id: fGroup||undefined, fees_type_id: fType||undefined,
            fine_type: fFine||undefined, status: fStatus||undefined, due_date: fDue||undefined,
        }, { preserveState: true, replace: true });
    }
    function resetFilter() {
        setFGroup(''); setFType(''); setFFine(''); setFStatus(''); setFDue(''); setShowFilter(false);
        router.get('/finance/fees-collection/fees-master', {}, { preserveState: true, replace: true });
    }
    function openAdd() { setEditId(null); setForm({ ...emptyForm }); setErrors({}); setShowModal(true); }
    function openEdit(m: Master) {
        setEditId(m.id);
        const g = groups.find(g => g.name === m.fees_group);
        const t = types.find(t => t.name === m.fees_type);
        setForm({
            fees_group_id: g ? String(g.id) : '',
            fees_type_id:  t ? String(t.id) : '',
            due_date: m.due_date !== '—' ? m.due_date : '',
            amount: String(m.amount),
            fine_type: m.fine_type,
            fine_amount: String(m.fine_amount),
            is_active: m.is_active,
        });
        setErrors({}); setShowModal(true);
    }
    function validate() {
        const e: Record<string,string> = {};
        if (!form.fees_group_id) e.fees_group_id = 'Fees group is required';
        if (!form.fees_type_id)  e.fees_type_id  = 'Fees type is required';
        if (!form.amount)        e.amount        = 'Amount is required';
        setErrors(e); return !Object.keys(e).length;
    }
    function handleSubmit() {
        if (!validate()) return; setProcessing(true);
        const url = editId ? `/finance/fees-collection/fees-master/${editId}` : '/finance/fees-collection/fees-master';
        router[editId ? 'put' : 'post'](url, form, {
            onSuccess: () => { setShowModal(false); setProcessing(false); },
            onError: errs => { setErrors(errs); setProcessing(false); },
        });
    }
    function handleDelete(id: number) {
        if (!confirm('Delete this fees master?')) return;
        router.delete(`/finance/fees-collection/fees-master/${id}`);
    }

    const breadcrumbs = [
        { title: 'Dashboard', href: '/school-admin/dashboard' },
        { title: 'Fees Collection', href: '#' },
        { title: 'Fees Master', href: '/finance/fees-collection/fees-master' },
    ];

    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear - 1} - ${currentYear}`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Fees Master" />
            <div className="flex flex-col gap-4 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Fees Collection</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">Dashboard / Fees Collection / Fees Master</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"><RefreshCw className="h-4 w-4" onClick={()=>router.reload()}/></button>
                        <button className="p-2 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"><Printer className="h-4 w-4" onClick={()=>window.print()}/></button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-9 gap-1.5 text-xs"><Download className="h-3.5 w-3.5"/>Export<ChevronDown className="h-3 w-3"/></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                                <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button onClick={openAdd} className="h-9 gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Plus className="h-4 w-4"/>Add Fees Master
                        </Button>
                    </div>
                </div>

                {/* Table Card */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b border-slate-100">
                        <h2 className="text-base font-bold text-slate-800 dark:text-white">Fees Collection</h2>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 text-xs text-slate-600"><Calendar className="h-3.5 w-3.5"/>{dateRange}</div>
                            <div className="relative">
                                <button onClick={()=>setShowFilter(!showFilter)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 text-xs text-slate-600 hover:bg-slate-50">
                                    <Filter className="h-3.5 w-3.5"/>Filter<ChevronDown className="h-3 w-3"/>
                                </button>
                                {showFilter && (
                                    <div className="absolute right-0 top-full mt-1 z-30 w-96 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 shadow-xl p-4 space-y-3">
                                        <h3 className="font-semibold text-sm text-slate-800">Filter</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-xs font-semibold text-slate-700">ID</Label>
                                                <Select><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select ID"/></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem></SelectContent></Select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs font-semibold text-slate-700">Fees Group</Label>
                                                <Select value={fGroup} onValueChange={setFGroup}>
                                                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select Fees Gr..."/></SelectTrigger>
                                                    <SelectContent>{groups.map(g=><SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>)}</SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs font-semibold text-slate-700">Fees Type</Label>
                                                <Select value={fType} onValueChange={setFType}>
                                                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select Fees Ty..."/></SelectTrigger>
                                                    <SelectContent>{types.map(t=><SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}</SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs font-semibold text-slate-700">Due Date</Label>
                                                <Input type="date" value={fDue} onChange={e=>setFDue(e.target.value)} className="h-8 text-xs"/>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs font-semibold text-slate-700">Fine Type</Label>
                                                <Select value={fFine} onValueChange={setFFine}>
                                                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select Fine Type"/></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">None</SelectItem>
                                                        <SelectItem value="percentage">Percentage</SelectItem>
                                                        <SelectItem value="fixed">Fixed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs font-semibold text-slate-700">Status</Label>
                                                <Select value={fStatus} onValueChange={setFStatus}>
                                                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select Status"/></SelectTrigger>
                                                    <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-end gap-2 pt-1">
                                            <Button variant="outline" onClick={resetFilter} className="h-8 px-4 text-xs">Reset</Button>
                                            <Button onClick={applyFilter} className="h-8 px-5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">Apply</Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 text-xs text-slate-600 hover:bg-slate-50">
                                <SlidersHorizontal className="h-3.5 w-3.5"/>Sort by A-Z<ChevronDown className="h-3 w-3"/>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b border-slate-100">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span>Row Per Page</span>
                            <Select value={String(rpp)} onValueChange={v=>setRpp(Number(v))}>
                                <SelectTrigger className="h-8 w-16 text-xs"><SelectValue/></SelectTrigger>
                                <SelectContent>{[10,25,50,100].map(n=><SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                            </Select>
                            <span>Entries</span>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400"/>
                            <Input placeholder="Search" className="pl-9 h-8 text-sm" value={search} onChange={e=>setSearch(e.target.value)}/>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="w-10 px-4 py-3"><input type="checkbox" className="rounded border-slate-300"/></th>
                                    {['ID','Fees Group','Fees Type','Due Date','Amount ($)','Fine Type','Fine Amount ($)','Status','Action'].map(h=>(
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">
                                            <span className="flex items-center gap-1">{h}{h!=='Action'&&<ChevronDown className="h-3 w-3 opacity-40"/>}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.length===0 ? (
                                    <tr><td colSpan={10} className="px-4 py-10 text-center text-sm text-muted-foreground">No fees master records found.</td></tr>
                                ) : filtered.slice(0,rpp).map(m=>(
                                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3"><input type="checkbox" className="rounded border-slate-300"/></td>
                                        <td className="px-4 py-3"><span className="text-indigo-600 font-medium text-xs">{m.code}</span></td>
                                        <td className="px-4 py-3 text-slate-700">{m.fees_group}</td>
                                        <td className="px-4 py-3 text-slate-700">{m.fees_type}</td>
                                        <td className="px-4 py-3 text-slate-700">{m.due_date}</td>
                                        <td className="px-4 py-3 font-medium text-slate-800">{m.amount.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold capitalize ${FINE_COLORS[m.fine_type] ?? 'bg-slate-100 text-slate-600'}`}>
                                                {m.fine_type === 'none' ? 'None' : m.fine_type.charAt(0).toUpperCase() + m.fine_type.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">{m.fine_amount.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${m.is_active?'bg-green-50 text-green-700 border border-green-200':'bg-red-50 text-red-600 border border-red-200'}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${m.is_active?'bg-green-500':'bg-red-500'}`}/>
                                                {m.is_active?'Active':'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><button className="p-1.5 rounded hover:bg-slate-100"><MoreVertical className="h-4 w-4 text-slate-500"/></button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-36">
                                                    <DropdownMenuItem onClick={()=>openEdit(m)} className="gap-2 text-xs"><Pencil className="h-3.5 w-3.5"/>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={()=>handleDelete(m.id)} className="gap-2 text-xs text-red-600 focus:text-red-600"><Trash2 className="h-3.5 w-3.5"/>Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-end gap-1 px-5 py-3 border-t border-slate-100">
                        {masters.links.map((link,i)=>(
                            <button key={i} disabled={!link.url} onClick={()=>link.url&&router.get(link.url)}
                                className={`px-3 py-1.5 rounded text-xs font-medium ${link.active?'bg-indigo-600 text-white':'text-slate-600 hover:bg-slate-100'} ${!link.url?'opacity-40 cursor-not-allowed':''}`}
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
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-slate-900">{editId?'Edit Fees Master':'Add Fees Master'}</h2>
                                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">{academicYear}</span>
                            </div>
                            <button onClick={()=>setShowModal(false)} className="p-1.5 rounded-full hover:bg-slate-100"><X className="h-4 w-4 text-slate-500"/></button>
                        </div>
                        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                            {/* Fees Group */}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-slate-700">Fees Group</Label>
                                <Select value={form.fees_group_id} onValueChange={v=>setForm(f=>({...f,fees_group_id:v,fees_type_id:''}))}>
                                    <SelectTrigger className={`h-10 ${errors.fees_group_id?'border-red-400':''}`}><SelectValue placeholder="Select"/></SelectTrigger>
                                    <SelectContent>{groups.map(g=><SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>)}</SelectContent>
                                </Select>
                                {errors.fees_group_id&&<p className="text-xs text-red-500">{errors.fees_group_id}</p>}
                            </div>
                            {/* Fees Type */}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-slate-700">Fees Type</Label>
                                <Select value={form.fees_type_id} onValueChange={v=>setForm(f=>({...f,fees_type_id:v}))}>
                                    <SelectTrigger className={`h-10 ${errors.fees_type_id?'border-red-400':''}`}><SelectValue placeholder="Select"/></SelectTrigger>
                                    <SelectContent>{filteredTypes.map(t=><SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}</SelectContent>
                                </Select>
                                {errors.fees_type_id&&<p className="text-xs text-red-500">{errors.fees_type_id}</p>}
                            </div>
                            {/* Due Date & Amount */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-semibold text-slate-700">Due Date</Label>
                                    <div className="relative">
                                        <Input type="date" value={form.due_date} onChange={e=>setForm(f=>({...f,due_date:e.target.value}))} className="h-10 pr-9"/>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-semibold text-slate-700">Amount</Label>
                                    <Input type="number" min="0" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} className={`h-10 ${errors.amount?'border-red-400':''}`} placeholder="0"/>
                                    {errors.amount&&<p className="text-xs text-red-500">{errors.amount}</p>}
                                </div>
                            </div>
                            {/* Fine Type */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-700">Fine Type</Label>
                                <div className="flex items-center gap-6">
                                    {(['none','percentage','fixed'] as const).map(ft=>(
                                        <label key={ft} className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="fine_type" value={ft} checked={form.fine_type===ft} onChange={()=>setForm(f=>({...f,fine_type:ft}))}
                                                className="h-4 w-4 text-indigo-600 border-slate-300"/>
                                            <span className="text-sm text-slate-700 capitalize">{ft==='none'?'None':ft.charAt(0).toUpperCase()+ft.slice(1)}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            {/* Fine Amount (show if not none) */}
                            {form.fine_type !== 'none' && (
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-semibold text-slate-700">Fine Amount {form.fine_type==='percentage'?'(%)':'($)'}</Label>
                                    <Input type="number" min="0" value={form.fine_amount} onChange={e=>setForm(f=>({...f,fine_amount:e.target.value}))} className="h-10" placeholder="0"/>
                                </div>
                            )}
                            {/* Status */}
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
                                {processing?'Saving...':editId?'Update Fees Master':'Add Fees Master'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {showFilter&&<div className="fixed inset-0 z-20" onClick={()=>setShowFilter(false)}/>}
        </AppLayout>
    );
}
