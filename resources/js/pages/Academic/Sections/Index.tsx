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
    Layers, X, Save, AlertCircle, RefreshCw, Printer, Download, ChevronDown
} from 'lucide-react';
import Swal from 'sweetalert2';

interface Section {
    id: number;
    name: string;
    code: string; // SE000123
    is_active: boolean;
    created_at: string;
}

interface Props {
    sections: { data: Section[]; links: any[]; meta: any };
    currentSchool: { id: number; name: string };
}

export default function SectionsIndex({ sections, currentSchool }: Props) {
    const [search, setSearch] = useState('');
    const [panel, setPanel] = useState<'closed' | 'create' | 'edit' | 'view'>('closed');
    const [selected, setSelected] = useState<Section | null>(null);
    const [perPage, setPerPage] = useState('10');

    // Inertia form
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        is_active: true as boolean,
    });

    const filtered = sections.data.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase())
    );

    const openCreate = () => {
        reset();
        clearErrors();
        setSelected(null);
        setPanel('create');
    };

    const openEdit = (sec: Section) => {
        clearErrors();
        setSelected(sec);
        setData({
            name: sec.name,
            is_active: sec.is_active,
        });
        setPanel('edit');
    };

    const openView = (sec: Section) => {
        setSelected(sec);
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
            post('/academic/sections', {
                onSuccess: closePanel,
            });
        } else if (panel === 'edit' && selected) {
            put(`/academic/sections/${selected.id}`, {
                onSuccess: closePanel,
            });
        }
    };

    const handleDelete = (sec: Section) => {
        Swal.fire({
            title: 'Delete Section?',
            text: `"${sec.name}" will be permanently removed.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Delete'
        }).then(r => r.isConfirmed && router.delete(`/academic/sections/${sec.id}`));
    };

    const handleRefresh = () => {
        router.reload({ only: ['sections'] });
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
            <Head title="Sections" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                
                {/* Breadcrumb & Actions Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Sections</h1>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                            <span>Dashboard</span>
                            <span>/</span>
                            <span>Academic</span>
                            <span>/</span>
                            <span className="text-foreground font-medium">Sections</span>
                        </div>
                    </div>
                    
                    {/* Header Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="icon" 
                            id="refresh-sections-btn"
                            className="h-9 w-9" 
                            onClick={handleRefresh}
                            title="Refresh"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant="outline" 
                            size="icon" 
                            id="print-sections-btn"
                            className="h-9 w-9" 
                            onClick={() => window.print()}
                            title="Print/PDF"
                        >
                            <Printer className="h-4 w-4" />
                        </Button>
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" id="export-sections-btn" className="h-9 gap-1.5">
                                    <Download className="h-4 w-4" /> Export <ChevronDown className="h-3 w-3 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => alert('Exporting to Excel...')}>
                                    Export Excel
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => alert('Exporting to CSV...')}>
                                    Export CSV
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button size="sm" id="add-section-btn" onClick={openCreate} className="h-9">
                            <Plus className="mr-1.5 h-4 w-4" /> Add Section
                        </Button>
                    </div>
                </div>

                {/* Card Table */}
                <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="text-base font-semibold">Class Section</CardTitle>
                            
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                {/* Entries Per Page */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground whitespace-nowrap">Row Per Page</span>
                                    <select
                                        id="entries-select"
                                        value={perPage}
                                        onChange={(e) => setPerPage(e.target.value)}
                                        className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="10">10</option>
                                        <option value="25">25</option>
                                        <option value="50">50</option>
                                    </select>
                                    <span className="text-sm text-muted-foreground whitespace-nowrap">Entries</span>
                                </div>

                                {/* Search */}
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search-sections-input"
                                        placeholder="Search..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="pl-8 h-8 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40">
                                    <TableHead className="w-12 pl-6">
                                        <input type="checkbox" className="rounded" id="select-all-sections" />
                                    </TableHead>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Section Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right pr-6">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(sec => (
                                    <TableRow key={sec.id} className="hover:bg-muted/30">
                                        <TableCell className="pl-6">
                                            <input type="checkbox" className="rounded" id={`select-section-${sec.id}`} />
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                id={`view-section-link-${sec.id}`}
                                                onClick={() => openView(sec)}
                                                className="text-sm font-semibold text-primary hover:underline"
                                            >
                                                {sec.code}
                                            </button>
                                        </TableCell>
                                        <TableCell className="font-medium text-sm">
                                            {sec.name}
                                        </TableCell>
                                        <TableCell>
                                            {sec.is_active ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                                    Inactive
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" id={`action-section-${sec.id}`} className="h-7 w-7">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openView(sec)}>
                                                        <Eye className="mr-2 h-4 w-4" /> View
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openEdit(sec)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(sec)} className="text-red-600">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {filtered.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <Layers className="h-10 w-10 text-muted-foreground/50 mb-3" />
                                <p className="text-sm font-medium">
                                    {search ? 'No sections match your search' : 'No sections yet'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 mb-4">
                                    {search ? 'Try a different search term' : 'Get started by adding your first section'}
                                </p>
                                {!search && (
                                    <Button size="sm" onClick={openCreate}>
                                        <Plus className="mr-2 h-4 w-4" />Add Section
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
                    <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
                        {/* Panel Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h2 className="text-lg font-semibold">
                                {panel === 'create' 
                                    ? 'New Section' 
                                    : panel === 'edit' 
                                        ? `Edit Section: ${selected?.name}` 
                                        : `Section Details: ${selected?.name}`
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
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Section ID</p>
                                            <p className="font-semibold text-sm">{selected.code}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Section Name</p>
                                            <p className="font-semibold text-sm">{selected.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Status</p>
                                            {selected.is_active ? (
                                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Active</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="text-xs">Inactive</Badge>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Created At</p>
                                            <p className="font-medium text-sm">{selected.created_at}</p>
                                        </div>
                                    </div>
                                    <Separator />
                                    <Button className="w-full" variant="outline" onClick={() => openEdit(selected)}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit Section
                                    </Button>
                                </div>
                            )}

                            {/* CREATE / EDIT FORM */}
                            {(panel === 'create' || panel === 'edit') && (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Section Name */}
                                    <div>
                                        <Label htmlFor="section-name">
                                            Section Name <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="section-name"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            placeholder="e.g. A"
                                            className={`mt-1 ${errors.name ? 'border-red-400' : ''}`}
                                            maxLength={50}
                                            required
                                        />
                                        <FieldError field="name" />
                                    </div>

                                    {/* Active Switch */}
                                    <div className="flex items-center justify-between rounded-lg border p-3">
                                        <div>
                                            <p className="text-sm font-medium">Active</p>
                                            <p className="text-xs text-muted-foreground">
                                                Enable or disable this section
                                            </p>
                                        </div>
                                        <Switch
                                            id="section-active-switch"
                                            checked={data.is_active}
                                            onCheckedChange={v => setData('is_active', v)}
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-4 border-t">
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
                                                : (panel === 'create' ? 'Create Section' : 'Save Changes')}
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
