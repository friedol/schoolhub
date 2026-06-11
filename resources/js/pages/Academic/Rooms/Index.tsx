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
    Building, X, Save, AlertCircle, RefreshCw, Printer, Download, ChevronDown, Grid, Layout
} from 'lucide-react';
import Swal from 'sweetalert2';

interface Room {
    id: number;
    room_number: string;
    room_name: string | null;
    room_type: string;
    capacity: number;
    rows: number;
    columns: number;
    floor: number;
    building: string;
    is_active: boolean;
    code: string; // R000123
    room_type_display: string;
    room_display: string;
    created_at: string;
}

interface IndexProps {
    rooms: {
        data: Room[];
        links: any[];
        meta?: any;
    };
    roomTypes: Record<string, string>;
}

export default function RoomsIndex({ rooms, roomTypes }: IndexProps) {
    const [search, setSearch] = useState('');
    const [panel, setPanel] = useState<'closed' | 'create' | 'edit' | 'view'>('closed');
    const [selected, setSelected] = useState<Room | null>(null);
    const [perPage, setPerPage] = useState('10');

    // Inertia form
    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        room_number: '',
        room_name: '',
        room_type: 'classroom',
        capacity: 40,
        rows: 8,
        columns: 5,
        floor: 0,
        building: '',
        is_active: true
    });

    const filtered = rooms.data.filter(r =>
        r.room_number.toLowerCase().includes(search.toLowerCase()) ||
        (r.room_name || '').toLowerCase().includes(search.toLowerCase()) ||
        r.building.toLowerCase().includes(search.toLowerCase()) ||
        r.code.toLowerCase().includes(search.toLowerCase())
    );

    const openCreate = () => {
        reset();
        clearErrors();
        setSelected(null);
        setPanel('create');
    };

    const openEdit = (room: Room) => {
        clearErrors();
        setSelected(room);
        setData({
            room_number: room.room_number,
            room_name: room.room_name || '',
            room_type: room.room_type,
            capacity: room.capacity,
            rows: room.rows,
            columns: room.columns,
            floor: room.floor,
            building: room.building,
            is_active: room.is_active
        });
        setPanel('edit');
    };

    const openView = (room: Room) => {
        setSelected(room);
        setPanel('view');
    };

    const closePanel = () => {
        setPanel('closed');
        setSelected(null);
        clearErrors();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Front-end grid capacity warning check
        if (data.rows * data.columns < data.capacity) {
            Swal.fire({
                icon: 'error',
                title: 'Grid Size Mismatch',
                text: `Seating grid (rows × columns = ${data.rows * data.columns}) must accommodate the total capacity (${data.capacity}).`,
            });
            return;
        }

        if (panel === 'create') {
            post('/academic/rooms', {
                onSuccess: closePanel,
            });
        } else if (panel === 'edit' && selected) {
            put(`/academic/rooms/${selected.id}`, {
                onSuccess: closePanel,
            });
        }
    };

    const handleDelete = (room: Room) => {
        Swal.fire({
            title: 'Delete Class Room?',
            text: `"${room.room_display}" will be permanently removed. Timetable slots and sitting arrangements using this room will be affected.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Delete'
        }).then(r => r.isConfirmed && destroy(`/academic/rooms/${room.id}`, {
            onSuccess: closePanel
        }));
    };

    const handleRefresh = () => {
        router.reload({ only: ['rooms'] });
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
            <Head title="Class Rooms" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                
                {/* Header Section */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Class Room</h1>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                            <span>Dashboard</span>
                            <span>/</span>
                            <span>Academic</span>
                            <span>/</span>
                            <span className="text-foreground font-medium">Class Room</span>
                        </div>
                    </div>

                    {/* Actions Header */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="icon" 
                            id="refresh-rooms-btn"
                            className="h-9 w-9" 
                            onClick={handleRefresh}
                            title="Refresh"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant="outline" 
                            size="icon" 
                            id="print-rooms-btn"
                            className="h-9 w-9" 
                            onClick={() => window.print()}
                            title="Print/PDF"
                        >
                            <Printer className="h-4 w-4" />
                        </Button>
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" id="export-rooms-btn" className="h-9 gap-1.5">
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

                        <Button size="sm" id="add-room-btn" onClick={openCreate} className="h-9">
                            <Plus className="mr-1.5 h-4 w-4" /> Add Class Room
                        </Button>
                    </div>
                </div>

                {/* Cards Table */}
                <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="text-base font-semibold">Class Room</CardTitle>
                            
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
                                        id="search-rooms-input"
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
                                        <input type="checkbox" className="rounded" id="select-all-rooms" />
                                    </TableHead>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Room No</TableHead>
                                    <TableHead>Capacity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right pr-6">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(room => (
                                    <TableRow key={room.id} className="hover:bg-muted/30">
                                        <TableCell className="pl-6">
                                            <input type="checkbox" className="rounded" id={`select-room-${room.id}`} />
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                id={`view-room-link-${room.id}`}
                                                onClick={() => openView(room)}
                                                className="text-sm font-semibold text-primary hover:underline text-left"
                                            >
                                                {room.code}
                                            </button>
                                        </TableCell>
                                        <TableCell className="font-medium text-sm">
                                            <div>{room.room_number}</div>
                                            {room.room_name && (
                                                <div className="text-[10px] text-muted-foreground font-normal">{room.room_name}</div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-semibold text-sm">
                                            {room.capacity}
                                        </TableCell>
                                        <TableCell>
                                            {room.is_active ? (
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
                                                    <Button variant="ghost" size="icon" id={`action-room-${room.id}`} className="h-7 w-7">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openView(room)}>
                                                        <Eye className="mr-2 h-4 w-4" /> View
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openEdit(room)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(room)} className="text-red-600">
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
                                <Building className="h-10 w-10 text-muted-foreground/50 mb-3" />
                                <p className="text-sm font-medium">
                                    {search ? 'No rooms match your search' : 'No rooms yet'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 mb-4">
                                    {search ? 'Try a different search term' : 'Get started by adding your first class room'}
                                </p>
                                {!search && (
                                    <Button size="sm" onClick={openCreate}>
                                        <Plus className="mr-2 h-4 w-4" />Add Class Room
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
                                    ? 'New Class Room' 
                                    : panel === 'edit' 
                                        ? `Edit Class Room: ${selected?.room_display}` 
                                        : `Class Room Details: ${selected?.room_display}`
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
                                            <p className="text-xs text-muted-foreground mb-1">Room Code</p>
                                            <p className="font-semibold text-sm">{selected.code}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Room Number</p>
                                            <p className="font-semibold text-sm">{selected.room_number}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Room Name</p>
                                            <p className="font-semibold text-sm">{selected.room_name || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Room Type</p>
                                            <Badge variant="outline" className="capitalize text-xs font-semibold">
                                                {roomTypes[selected.room_type] || selected.room_type}
                                            </Badge>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Building</p>
                                            <p className="font-medium text-sm">{selected.building}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Floor</p>
                                            <p className="font-medium text-sm">{selected.floor}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Capacity</p>
                                            <p className="font-semibold text-indigo-600 text-sm">{selected.capacity}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Grid Layout</p>
                                            <Badge variant="secondary" className="font-mono text-xs">
                                                {selected.rows} × {selected.columns}
                                            </Badge>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Status</p>
                                            {selected.is_active ? (
                                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Active</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="text-xs">Inactive</Badge>
                                            )}
                                        </div>
                                    </div>
                                    <Separator />
                                    <Button className="w-full" variant="outline" onClick={() => openEdit(selected)}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit Room
                                    </Button>
                                </div>
                            )}

                            {/* CREATE / EDIT FORM */}
                            {(panel === 'create' || panel === 'edit') && (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    
                                    {/* Room Number & Name */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label htmlFor="room_number">Room Number <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="room_number"
                                                value={data.room_number}
                                                onChange={e => setData('room_number', e.target.value)}
                                                placeholder="e.g. 101"
                                                className={`mt-1 ${errors.room_number ? 'border-red-400' : ''}`}
                                                required
                                            />
                                            <FieldError field="room_number" />
                                        </div>
                                        <div>
                                            <Label htmlFor="room_name">Room Name</Label>
                                            <Input
                                                id="room_name"
                                                value={data.room_name}
                                                onChange={e => setData('room_name', e.target.value)}
                                                placeholder="e.g. Science Lab"
                                                className="mt-1"
                                            />
                                            <FieldError field="room_name" />
                                        </div>
                                    </div>

                                    {/* Room Type */}
                                    <div>
                                        <Label htmlFor="room_type">Room Type <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={data.room_type}
                                            onValueChange={v => setData('room_type', v)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select type..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(roomTypes).map(([k, val]) => (
                                                    <SelectItem key={k} value={k}>{val}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldError field="room_type" />
                                    </div>

                                    {/* Capacity & Seating Layout */}
                                    <div className="border rounded-lg p-3.5 space-y-3.5 bg-muted/10">
                                        <div className="flex items-center gap-1.5 text-sm font-semibold">
                                            <Grid className="h-4 w-4 text-indigo-500" />
                                            <span>Seating Configuration</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <Label htmlFor="capacity">Capacity *</Label>
                                                <Input
                                                    id="capacity"
                                                    type="number"
                                                    value={data.capacity}
                                                    onChange={e => setData('capacity', Number(e.target.value))}
                                                    className="mt-1"
                                                    min={1}
                                                    required
                                                />
                                                <FieldError field="capacity" />
                                            </div>
                                            <div>
                                                <Label htmlFor="rows">Rows *</Label>
                                                <Input
                                                    id="rows"
                                                    type="number"
                                                    value={data.rows}
                                                    onChange={e => setData('rows', Number(e.target.value))}
                                                    className="mt-1"
                                                    min={1}
                                                    required
                                                />
                                                <FieldError field="rows" />
                                            </div>
                                            <div>
                                                <Label htmlFor="columns">Columns *</Label>
                                                <Input
                                                    id="columns"
                                                    type="number"
                                                    value={data.columns}
                                                    onChange={e => setData('columns', Number(e.target.value))}
                                                    className="mt-1"
                                                    min={1}
                                                    required
                                                />
                                                <FieldError field="columns" />
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                                            Grid layout dimensions (Rows × Columns = {data.rows * data.columns} desks) must be equal to or greater than the total seating capacity ({data.capacity}) to run sitting plan algorithms.
                                        </p>
                                    </div>

                                    {/* Building & Floor */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label htmlFor="building">Building <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="building"
                                                value={data.building}
                                                onChange={e => setData('building', e.target.value)}
                                                placeholder="e.g. Science Block"
                                                className={`mt-1 ${errors.building ? 'border-red-400' : ''}`}
                                                required
                                            />
                                            <FieldError field="building" />
                                        </div>
                                        <div>
                                            <Label htmlFor="floor">Floor <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="floor"
                                                type="number"
                                                value={data.floor}
                                                onChange={e => setData('floor', Number(e.target.value))}
                                                className={`mt-1 ${errors.floor ? 'border-red-400' : ''}`}
                                                required
                                            />
                                            <FieldError field="floor" />
                                        </div>
                                    </div>

                                    {/* Active toggle */}
                                    <div className="flex items-center justify-between rounded-lg border p-3">
                                        <div>
                                            <p className="text-sm font-medium">Active</p>
                                            <p className="text-xs text-muted-foreground">
                                                Enable or disable this room for sitting plans and scheduling
                                            </p>
                                        </div>
                                        <Switch
                                            id="room-active-switch"
                                            checked={data.is_active}
                                            onCheckedChange={v => setData('is_active', v)}
                                        />
                                    </div>

                                    {/* Actions */}
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
                                                : (panel === 'create' ? 'Create Room' : 'Save Changes')}
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
