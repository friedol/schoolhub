import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import {
    Plus, Search, MoreHorizontal, Eye, Edit, Trash2, Users, GraduationCap, 
    UserCheck, UserX, Phone, X, RotateCw, Printer, Download, LayoutGrid, 
    List, Calendar as CalendarIcon, MessageSquare, Mail, MoreVertical, 
    SlidersHorizontal, ChevronDown, Check, DollarSign, UserPlus
} from 'lucide-react';
import Swal from 'sweetalert2';

interface Student {
    id: number;
    name: string;
    email: string;
    phone: string;
    student_number: string;
    date_of_birth: string;
    gender: string;
    is_active: boolean;
    created_at: string;
    outstanding_balance?: string | number;
    student_profile?: {
        admission_date: string;
        boarding_status: string;
        stream: string;
        school_class?: { name: string; level: string };
    } | null;
    guardians: Array<{
        guardian_name: string;
        relationship: string;
        phone_number: string;
        is_primary_contact: boolean;
    }>;
}

interface FeeCategory {
    id: number;
    name: string;
    amount: string | number;
}

interface FeeItem {
    id: number;
    name: string;
    category: string;
}

interface Props {
    students: { data: Student[]; links: any[]; meta: any };
    classes: Array<{ id: number; name: string; level: string }>;
    feeCategories: FeeCategory[];
    feeItems: FeeItem[];
}

function initials(name: string) {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

const genderColor = { male: 'bg-blue-50 text-blue-700 border border-blue-200', female: 'bg-pink-50 text-pink-700 border border-pink-200' };

export default function StudentProfilesIndex({ students, classes, feeCategories, feeItems }: Props) {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('name-asc');
    const [perPage, setPerPage] = useState('10');
    const [currentPage, setCurrentPage] = useState(1);
    
    // Filters Panel state
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [classFilter, setClassFilter] = useState('all');
    const [sectionFilter, setSectionFilter] = useState('all');
    const [genderFilter, setGenderFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Collect Fees Modal state
    const [showCollectFeesModal, setShowCollectFeesModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [fetchingInvoices, setFetchingInvoices] = useState(false);

    // Fee Form State
    const [feeGroup, setFeeGroup] = useState('');
    const [feeType, setFeeType] = useState('');
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [referenceNo, setReferenceNo] = useState('');
    const [notes, setNotes] = useState('');
    const [statusToggle, setStatusToggle] = useState(true);

    const handleRefresh = () => {
        router.reload({ only: ['students'] });
    };

    const handleDelete = (s: Student) => {
        Swal.fire({
            title: 'Remove student?',
            text: `"${s.name}" (${s.student_number}) will be permanently removed.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Delete'
        }).then(r => r.isConfirmed && router.delete(`/students/profiles/${s.id}`));
    };

    const handleToggleStatus = (student: Student) => {
        router.post(`/students/profiles/${student.id}/toggle-status`, {}, {
            onSuccess: () => {
                Swal.fire({
                    title: 'Status Updated',
                    text: `Account status for "${student.name}" has been successfully updated.`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
        });
    };

    // Open Collect Fees Modal and load invoices
    const openCollectFees = async (student: Student) => {
        setSelectedStudent(student);
        setShowCollectFeesModal(true);
        setInvoices([]);
        setFeeGroup('');
        setFeeType('');
        setAmount('');
        setReferenceNo('');
        setNotes('');
        setStatusToggle(true);
        
        setFetchingInvoices(true);
        try {
            const res = await fetch(`/payments/student-invoices?student_id=${student.id}`);
            const data = await res.json();
            setInvoices(data.invoices || []);
            // Pre-fill amount with outstanding sum if available
            if (data.total_outstanding > 0) {
                setAmount(String(data.total_outstanding));
            }
        } catch (e) {
            console.error('Failed to load student invoices', e);
        } finally {
            setFetchingInvoices(false);
        }
    };

    // Auto-update amount when Fee Category (Group) is selected
    useEffect(() => {
        if (feeGroup) {
            const selectedCat = feeCategories.find(c => String(c.id) === feeGroup);
            if (selectedCat) {
                setAmount(String(selectedCat.amount));
            }
        }
    }, [feeGroup, feeCategories]);

    const handlePayFeesSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;
        if (!amount || Number(amount) <= 0) {
            Swal.fire('Error', 'Please enter a valid payment amount.', 'error');
            return;
        }

        // Map payment type enum
        // controller accepts: cash, bank, mpesa, tigopesa, airtelmoney, halopesa
        let apiMethod = 'cash';
        if (paymentMethod === 'bank_transfer') apiMethod = 'bank';
        else if (paymentMethod === 'mpesa') apiMethod = 'mpesa';
        else if (paymentMethod === 'tigopesa') apiMethod = 'tigopesa';
        else if (paymentMethod === 'airtelmoney') apiMethod = 'airtelmoney';
        else if (paymentMethod === 'halopesa') apiMethod = 'halopesa';

        // Auto-link to oldest outstanding invoice if available
        const oldestInvoice = invoices.length > 0 ? invoices[0] : null;

        router.post('/payments', {
            student_id: selectedStudent.id,
            invoice_id: oldestInvoice ? oldestInvoice.id : null,
            amount: Number(amount),
            payment_date: new Date().toISOString().split('T')[0],
            payment_method: apiMethod,
            transaction_id: referenceNo || null,
            notes: notes || null,
        }, {
            onSuccess: () => {
                setShowCollectFeesModal(false);
                Swal.fire({
                    title: 'Payment Recorded',
                    text: `Payment of TZS ${Number(amount).toLocaleString()} successfully recorded for ${selectedStudent.name}.`,
                    icon: 'success',
                });
            },
            onError: (err) => {
                Swal.fire('Error', Object.values(err).join('\n'), 'error');
            }
        });
    };

    // Apply filters and search
    const filtered = students.data.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.student_number?.toLowerCase().includes(search.toLowerCase()) ||
            s.email?.toLowerCase().includes(search.toLowerCase());
        
        const matchClass = classFilter === 'all' || s.student_profile?.school_class?.name === classFilter;
        const matchSection = sectionFilter === 'all' || s.student_profile?.stream === sectionFilter;
        const matchGender = genderFilter === 'all' || s.gender === genderFilter;
        const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? s.is_active : !s.is_active);
        
        return matchSearch && matchClass && matchSection && matchGender && matchStatus;
    }).sort((a, b) => {
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        if (sortBy === 'adm-asc') return a.student_number.localeCompare(b.student_number);
        if (sortBy === 'adm-desc') return b.student_number.localeCompare(a.student_number);
        return 0;
    });

    const totalPages = Math.ceil(filtered.length / Number(perPage));
    const safePage = Math.min(currentPage, Math.max(1, totalPages));
    const startIdx = (safePage - 1) * Number(perPage);
    const paginated = filtered.slice(startIdx, startIdx + Number(perPage));
    const totalFiltered = filtered.length;
    const showingFrom = totalFiltered === 0 ? 0 : startIdx + 1;
    const showingTo = Math.min(startIdx + Number(perPage), totalFiltered);

    const resetFilters = () => {
        setClassFilter('all');
        setSectionFilter('all');
        setGenderFilter('all');
        setStatusFilter('all');
        setCurrentPage(1);
    };

    // Reset to page 1 whenever filters or search change
    const handleSearch = (val: string) => { setSearch(val); setCurrentPage(1); };
    const handlePerPage = (val: string) => { setPerPage(val); setCurrentPage(1); };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <AppLayout>
            <Head title="Students List" />
            <div className="flex flex-col gap-6 rounded-xl p-6">

                {/* Page Header (No breadcrumb, matched to Image 1) */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Students List</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-9 w-9 bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 border-slate-200 dark:border-zinc-800 shadow-sm"
                            onClick={handleRefresh}
                            title="Refresh"
                        >
                            <RotateCw className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-9 w-9 bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 border-slate-200 dark:border-zinc-800 shadow-sm"
                            onClick={() => window.print()}
                            title="Print PDF"
                        >
                            <Printer className="h-4 w-4" />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 gap-1.5 shadow-sm">
                                    <Download className="h-4 w-4" /> Export <ChevronDown className="h-3 w-3 opacity-60" />
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

                        <Button size="sm" asChild className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-medium gap-1.5">
                            <Link href="/students/profiles/create">
                                <UserPlus className="h-4 w-4" /> Add Student
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Main Content Card Wrapper */}
                <Card className="border border-slate-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
                    
                    {/* Card Header (Matched controls in Image 1) */}
                    <CardHeader className="pb-3 border-b border-slate-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-950">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Students List</CardTitle>
                            
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Date Range Display */}
                                <div className="flex items-center gap-2 border border-slate-200 dark:border-zinc-800 rounded-md px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-zinc-900 shadow-sm font-medium">
                                    <CalendarIcon className="h-3.5 w-3.5 opacity-70" />
                                    <span>06/04/2026 - 06/10/2026</span>
                                </div>

                                {/* Filter Toggle Button */}
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className={`h-8 gap-1.5 border-slate-200 dark:border-zinc-800 text-xs font-semibold shadow-sm ${showFilterPanel ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400' : 'bg-white hover:bg-slate-50'}`}
                                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                                >
                                    <SlidersHorizontal className="h-3.5 w-3.5" /> Filter <ChevronDown className="h-3 w-3 opacity-60" />
                                </Button>

                                {/* List / Grid view toggles */}
                                <div className="flex items-center border border-slate-200 dark:border-zinc-800 rounded-md p-0.5 bg-slate-50 dark:bg-zinc-900 shadow-sm">
                                    <Button 
                                        variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                                        size="icon" 
                                        className={`h-7 w-7 rounded-sm ${viewMode === 'list' ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                        onClick={() => setViewMode('list')}
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                                        size="icon" 
                                        className={`h-7 w-7 rounded-sm ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <LayoutGrid className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Sort Menu */}
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="h-8 w-36 text-xs border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm font-semibold">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="name-asc">Sort by A-Z</SelectItem>
                                        <SelectItem value="name-desc">Sort by Z-A</SelectItem>
                                        <SelectItem value="adm-asc">Adm No. Asc</SelectItem>
                                        <SelectItem value="adm-desc">Adm No. Desc</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>

                    {/* Card Content Table Actions (Row select + search, Matched to Image 1) */}
                    <div className="flex flex-col gap-3 px-6 py-4 border-b border-slate-100 dark:border-zinc-800/60 bg-slate-50/30 dark:bg-zinc-950/40 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Row Per Page</span>
                            <Select value={perPage} onValueChange={handlePerPage}>
                                <SelectTrigger className="h-8 w-16 text-xs border-slate-200 bg-white dark:bg-zinc-950">
                                    <SelectValue placeholder="10" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                    <SelectItem value="999">All</SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Entries</span>
                        </div>
                        
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                            <Input 
                                placeholder="Search..." 
                                value={search} 
                                onChange={e => handleSearch(e.target.value)} 
                                className="pl-8 h-8.5 text-xs bg-white border-slate-200" 
                            />
                        </div>
                    </div>

                    {/* View Modes */}
                    <CardContent className="p-0">
                        {viewMode === 'list' ? (
                            /* ── LIST VIEW ── */
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50 dark:bg-zinc-900/40 border-b">
                                            <TableHead className="w-12 pl-6">
                                                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                            </TableHead>
                                            <TableHead className="font-semibold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">Admission No</TableHead>
                                            <TableHead className="font-semibold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">Roll No</TableHead>
                                            <TableHead className="font-semibold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">Name</TableHead>
                                            <TableHead className="font-semibold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">Class</TableHead>
                                            <TableHead className="font-semibold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">Section</TableHead>
                                            <TableHead className="font-semibold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">Gender</TableHead>
                                            <TableHead className="font-semibold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">Status</TableHead>
                                            <TableHead className="font-semibold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">Date of Join</TableHead>
                                            <TableHead className="font-semibold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">DOB</TableHead>
                                            <TableHead className="font-semibold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider text-right pr-6">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginated.map(student => {
                                            const rollNo = 35000 + student.id;
                                            return (
                                                <TableRow key={student.id} className="hover:bg-slate-50/40 dark:hover:bg-zinc-900/30 border-b">
                                                    <TableCell className="pl-6">
                                                        <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                                    </TableCell>
                                                    <TableCell className="font-medium text-xs">
                                                        <Link href={`/students/profiles/${student.id}`} className="text-blue-600 hover:underline font-semibold font-mono">
                                                            {student.student_number || `AD989${1000 + student.id}`}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="text-xs text-slate-500 font-mono">{rollNo}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2.5">
                                                            <Avatar className="h-8 w-8 border">
                                                                <AvatarFallback className={`text-xs font-bold ${student.gender === 'male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                                                    {initials(student.name)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{student.name}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-xs font-semibold text-slate-700">
                                                        {student.student_profile?.school_class?.name || 'III'}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-slate-500 font-medium">
                                                        {student.student_profile?.stream || 'A'}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-slate-500 capitalize">{student.gender}</TableCell>
                                                    <TableCell>
                                                        {student.is_active ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                <span className="h-1 w-1 rounded-full bg-emerald-500" />
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                                <span className="h-1 w-1 rounded-full bg-rose-500" />
                                                                Inactive
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-slate-500 font-medium">
                                                        {formatDate(student.student_profile?.admission_date || student.created_at)}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-slate-500 font-medium">
                                                        {formatDate(student.date_of_birth)}
                                                    </TableCell>
                                                    
                                                    {/* Actions Buttons Column (Matched to Image 1) */}
                                                    <TableCell className="text-right pr-6">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            {/* Chat Icon Button */}
                                                            <Button 
                                                                variant="outline" 
                                                                size="icon" 
                                                                className="h-8 w-8 rounded-full border-slate-200 dark:border-zinc-800 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 shadow-sm"
                                                                onClick={() => Swal.fire('Chat', `Initiating messenger chat with ${student.name}...`, 'info')}
                                                            >
                                                                <MessageSquare className="h-3.5 w-3.5" />
                                                            </Button>

                                                            {/* Call Icon Button */}
                                                            <Button 
                                                                variant="outline" 
                                                                size="icon" 
                                                                className="h-8 w-8 rounded-full border-slate-200 dark:border-zinc-800 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 shadow-sm"
                                                                onClick={() => Swal.fire('Call', `Direct phone contact: ${student.phone || 'Not available'}`, 'info')}
                                                            >
                                                                <Phone className="h-3.5 w-3.5" />
                                                            </Button>

                                                            {/* Mail Icon Button */}
                                                            <Button 
                                                                variant="outline" 
                                                                size="icon" 
                                                                className="h-8 w-8 rounded-full border-slate-200 dark:border-zinc-800 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 shadow-sm"
                                                                onClick={() => Swal.fire('Mail', `Constructing mail thread to: ${student.email}`, 'info')}
                                                            >
                                                                <Mail className="h-3.5 w-3.5" />
                                                            </Button>

                                                            {/* Collect Fees Button */}
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                className="h-8 text-xs font-semibold px-3 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border-slate-200 text-slate-700 shadow-sm dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800"
                                                                onClick={() => openCollectFees(student)}
                                                            >
                                                                Collect Fees
                                                            </Button>

                                                            {/* Actions Dropdown Button */}
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600">
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem asChild>
                                                                        <Link href={`/students/profiles/${student.id}`}>
                                                                            <Eye className="mr-2 h-4 w-4" /> View Student
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem asChild>
                                                                        <Link href={`/students/profiles/${student.id}/edit`}>
                                                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => {
                                                                        Swal.fire({
                                                                            title: 'Login Information',
                                                                            html: `<div class="text-left space-y-2 mt-2 font-mono text-sm">
                                                                                <p><strong>Username / Email:</strong> ${student.email}</p>
                                                                                <p><strong>Default Password:</strong> ${student.student_number}</p>
                                                                            </div>`,
                                                                            icon: 'info'
                                                                        });
                                                                    }}>
                                                                        <UserCheck className="mr-2 h-4 w-4" /> Login Details
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleToggleStatus(student)}>
                                                                        <UserX className="mr-2 h-4 w-4" />
                                                                        {student.is_active ? 'Disable Account' : 'Enable Account'}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem asChild>
                                                                        <Link href="/students/promotions">
                                                                            <GraduationCap className="mr-2 h-4 w-4" /> Promote Student
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleDelete(student)} className="text-red-600">
                                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            /* ── GRID CARD VIEW ── */
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 bg-slate-50/40 dark:bg-zinc-900/10">
                                {paginated.map(student => {
                                    const rollNo = 35000 + student.id;
                                    return (
                                        <Card key={student.id} className="relative hover:shadow-md transition-shadow duration-200 border border-slate-200/80 bg-white dark:bg-zinc-950/40 dark:border-zinc-800">
                                            {/* Header details */}
                                            <div className="flex items-center justify-between px-4 pt-4">
                                                <Link href={`/students/profiles/${student.id}`} className="text-xs text-blue-600 hover:underline font-semibold font-mono">
                                                    {student.student_number || `AD989${1000 + student.id}`}
                                                </Link>
                                                
                                                <div className="flex items-center gap-1.5">
                                                    {student.is_active ? (
                                                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0 hover:bg-emerald-50 pointer-events-none text-[9px] font-bold">
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0 hover:bg-rose-50 pointer-events-none text-[9px] font-bold">
                                                            Inactive
                                                        </Badge>
                                                    )}

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-600 p-0">
                                                                <MoreVertical className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/students/profiles/${student.id}`}>
                                                                    <Eye className="mr-2 h-4 w-4" /> View Student
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/students/profiles/${student.id}/edit`}>
                                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleToggleStatus(student)}>
                                                                <UserX className="mr-2 h-4 w-4" /> {student.is_active ? 'Disable' : 'Enable'}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDelete(student)} className="text-red-600">
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                            
                                            <hr className="mt-3 border-slate-100 dark:border-zinc-800" />

                                            {/* Body Summary */}
                                            <div className="flex flex-col items-center py-6 px-4">
                                                <Avatar className="h-16 w-16 border-2 border-slate-100 mb-3">
                                                    <AvatarFallback className={`text-lg font-bold ${student.gender === 'male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                                        {initials(student.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 text-center">{student.name}</h3>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {student.student_profile?.school_class?.name || 'III'}, {student.student_profile?.stream || 'A'}
                                                </p>
                                            </div>

                                            {/* Attributes list */}
                                            <div className="grid grid-cols-3 gap-2 px-4 pb-4 border-t border-slate-100 dark:border-zinc-800 pt-4 text-center bg-slate-50/20">
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Roll No</p>
                                                    <p className="text-xs font-bold text-slate-700 font-mono mt-0.5">{rollNo}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Gender</p>
                                                    <p className="text-xs font-bold text-slate-700 capitalize mt-0.5">{student.gender}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Joined On</p>
                                                    <p className="text-xs font-bold text-slate-700 mt-0.5 truncate" title={formatDate(student.student_profile?.admission_date || student.created_at)}>
                                                        {new Date(student.student_profile?.admission_date || student.created_at).toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Footer Actions */}
                                            <div className="flex items-center justify-between border-t border-slate-100 p-3 bg-slate-50/50">
                                                <div className="flex items-center gap-1.5">
                                                    <Button variant="ghost" size="icon" className="h-7.5 w-7.5 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-slate-600 shadow-sm" onClick={() => Swal.fire('Chat', `Opening messenger for ${student.name}`, 'info')}>
                                                        <MessageSquare className="h-3 w-3" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-7.5 w-7.5 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-slate-600 shadow-sm" onClick={() => Swal.fire('Call', `Student Phone: ${student.phone || '—'}`, 'info')}>
                                                        <Phone className="h-3 w-3" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-7.5 w-7.5 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-slate-600 shadow-sm" onClick={() => Swal.fire('Mail', `Student Email: ${student.email}`, 'info')}>
                                                        <Mail className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <Button size="xs" variant="outline" className="h-7 px-3 bg-white text-slate-700 hover:bg-slate-50 border-slate-200 text-[11px] font-bold shadow-sm" onClick={() => openCollectFees(student)}>
                                                    Add Fees
                                                </Button>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}

                        {/* Empty state */}
                        {filtered.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <Users className="h-12 w-12 text-muted-foreground/30 mb-3" />
                                <p className="text-sm font-semibold text-slate-700">No students found matching current filter context</p>
                                <p className="text-xs text-muted-foreground mt-1 mb-4">Try altering your search or filters parameters</p>
                                <Button size="sm" variant="outline" onClick={resetFilters} className="h-9 gap-1.5 shadow-sm">
                                    <X className="h-4 w-4" /> Reset Filters
                                </Button>
                            </div>
                        )}

                        {/* ── Pagination Footer ── */}
                        {filtered.length > 0 && (
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-slate-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-950">
                                {/* Entry info */}
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{showingFrom}</span> to{' '}
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">{showingTo}</span> of{' '}
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">{totalFiltered}</span> entries
                                    {totalFiltered !== students.data.length && (
                                        <span className="text-slate-400"> (filtered from {students.data.length} total)</span>
                                    )}
                                </p>

                                {/* Page buttons */}
                                {totalPages > 1 && (
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 px-3 text-xs border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
                                            disabled={safePage <= 1}
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        >
                                            ← Prev
                                        </Button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                                            .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                                                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                                                acc.push(p);
                                                return acc;
                                            }, [])
                                            .map((p, i) =>
                                                p === '...' ? (
                                                    <span key={`dots-${i}`} className="px-1 text-xs text-slate-400">…</span>
                                                ) : (
                                                    <Button
                                                        key={p}
                                                        variant={safePage === p ? 'default' : 'outline'}
                                                        size="sm"
                                                        className={`h-8 w-8 p-0 text-xs border-slate-200 ${
                                                            safePage === p
                                                                ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600'
                                                                : 'bg-white hover:bg-slate-50'
                                                        }`}
                                                        onClick={() => setCurrentPage(p as number)}
                                                    >
                                                        {p}
                                                    </Button>
                                                )
                                            )
                                        }
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 px-3 text-xs border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
                                            disabled={safePage >= totalPages}
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        >
                                            Next →
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ── FILTER DRAWER SIDE PANEL (Slides from right, Matched to Image 5) ── */}
            {showFilterPanel && (
                <>
                    <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm transition-opacity duration-200" onClick={() => setShowFilterPanel(false)} />
                    <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-zinc-950 border-l border-slate-200 dark:border-zinc-800 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800/80">
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">Filter</h2>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-full" onClick={() => setShowFilterPanel(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Body Form */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            {/* Class */}
                            <div>
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Class</label>
                                <Select value={classFilter} onValueChange={setClassFilter}>
                                    <SelectTrigger className="mt-1.5 h-10 w-full border-slate-200 text-xs">
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Classes</SelectItem>
                                        {classes.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Section */}
                            <div>
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Section</label>
                                <Select value={sectionFilter} onValueChange={setSectionFilter}>
                                    <SelectTrigger className="mt-1.5 h-10 w-full border-slate-200 text-xs">
                                        <SelectValue placeholder="Select Section" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Sections</SelectItem>
                                        <SelectItem value="A">A</SelectItem>
                                        <SelectItem value="B">B</SelectItem>
                                        <SelectItem value="C">C</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Name Search */}
                            <div>
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Name</label>
                                <Input 
                                    className="mt-1.5 h-10 w-full text-xs border-slate-200" 
                                    placeholder="Search by name..." 
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Gender</label>
                                <Select value={genderFilter} onValueChange={setGenderFilter}>
                                    <SelectTrigger className="mt-1.5 h-10 w-full border-slate-200 text-xs">
                                        <SelectValue placeholder="Select Gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Gender</SelectItem>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Status</label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="mt-1.5 h-10 w-full border-slate-200 text-xs">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Footer Action buttons (Reset & Apply, Matched to Image 5) */}
                        <div className="p-6 border-t border-slate-100 dark:border-zinc-800 flex gap-3">
                            <Button 
                                type="button" 
                                variant="outline" 
                                className="flex-1 h-10 text-xs font-bold border-slate-200 text-slate-700 dark:text-zinc-300 shadow-sm"
                                onClick={resetFilters}
                            >
                                Reset
                            </Button>
                            <Button 
                                type="button" 
                                className="flex-1 h-10 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                                onClick={() => setShowFilterPanel(false)}
                            >
                                Apply
                            </Button>
                        </div>
                    </div>
                </>
            )}

            {/* ── COLLECT FEES DIALOG MODAL (Centered, Matched to Image 2) ── */}
            {showCollectFeesModal && selectedStudent && (
                <>
                    <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm transition-opacity duration-200" onClick={() => setShowCollectFeesModal(false)} />
                    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white dark:bg-zinc-950 rounded-lg border border-slate-200/80 dark:border-zinc-800 shadow-2xl z-50 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800/80 bg-white">
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-slate-900">Collect Fees</h2>
                                <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 font-bold border border-blue-200 font-mono text-[10px] pointer-events-none px-2 py-0.5">
                                    {selectedStudent.student_number || `AD989${1000 + selectedStudent.id}`}
                                </Badge>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-full" onClick={() => setShowCollectFeesModal(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <form onSubmit={handlePayFeesSubmit} className="flex flex-col">
                            {/* Body */}
                            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                                
                                {/* Student Summary Box (Matched to Image 2 card style) */}
                                <div className="border border-slate-100 dark:border-zinc-800 rounded-md p-4 bg-slate-50/50 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border bg-white">
                                            <AvatarFallback className={`text-sm font-bold ${selectedStudent.gender === 'male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                                {initials(selectedStudent.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-800">{selectedStudent.name}</h4>
                                            <p className="text-xs text-muted-foreground">
                                                {selectedStudent.student_profile?.school_class?.name || 'III'}, {selectedStudent.student_profile?.stream || 'A'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Outstanding</p>
                                        <p className="text-sm font-extrabold text-slate-800 mt-0.5">
                                            TZS {Number(selectedStudent.outstanding_balance || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Last Date</p>
                                        <p className="text-xs font-semibold text-slate-700 mt-0.5">25 May 2024</p>
                                    </div>
                                    <div>
                                        {Number(selectedStudent.outstanding_balance || 0) <= 0 ? (
                                            <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                Paid
                                            </span>
                                        ) : (
                                            <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                Unpaid
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Form Layout Inputs (2x2 grid structure, Matched to Image 2) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Fees Group */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-700">Fees Group</label>
                                        <Select value={feeGroup} onValueChange={setFeeGroup}>
                                            <SelectTrigger className="mt-1.5 h-10 w-full border-slate-200 text-xs">
                                                <SelectValue placeholder="Select Group" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {feeCategories.map(c => (
                                                    <SelectItem key={c.id} value={String(c.id)}>
                                                        {c.name} (TZS {Number(c.amount).toLocaleString()})
                                                    </SelectItem>
                                                ))}
                                                {feeCategories.length === 0 && (
                                                    <SelectItem value="none">No Groups Configured</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Fees Type */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-700">Fees Type</label>
                                        <Select value={feeType} onValueChange={setFeeType}>
                                            <SelectTrigger className="mt-1.5 h-10 w-full border-slate-200 text-xs">
                                                <SelectValue placeholder="Select Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {feeItems.map(item => (
                                                    <SelectItem key={item.id} value={String(item.id)}>
                                                        {item.name}
                                                    </SelectItem>
                                                ))}
                                                {feeItems.length === 0 && (
                                                    <SelectItem value="none">No Types Configured</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Amount */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-700">Amount</label>
                                        <div className="relative mt-1.5">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-slate-400 text-xs font-semibold">TZS</span>
                                            </div>
                                            <Input 
                                                type="number"
                                                className="pl-12 h-10 w-full text-xs border-slate-200" 
                                                placeholder="Enter Amount" 
                                                value={amount}
                                                onChange={e => setAmount(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Collection Date */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-700">Collection Date</label>
                                        <Input 
                                            type="date"
                                            className="mt-1.5 h-10 w-full text-xs border-slate-200" 
                                            defaultValue={new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                    </div>

                                    {/* Payment Type */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-700">Payment Type</label>
                                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                            <SelectTrigger className="mt-1.5 h-10 w-full border-slate-200 text-xs">
                                                <SelectValue placeholder="Select Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cash">Cash</SelectItem>
                                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                <SelectItem value="mpesa">M-Pesa</SelectItem>
                                                <SelectItem value="tigopesa">Tigo Pesa</SelectItem>
                                                <SelectItem value="airtelmoney">Airtel Money</SelectItem>
                                                <SelectItem value="halopesa">HaloPesa</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Payment Reference No */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-700">Payment Reference No</label>
                                        <Input 
                                            className="mt-1.5 h-10 w-full text-xs border-slate-200" 
                                            placeholder="Enter Payment Reference No" 
                                            value={referenceNo}
                                            onChange={e => setReferenceNo(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Status Switch toggle */}
                                <div className="flex items-center justify-between rounded-md border border-slate-100 p-3 bg-slate-50/20">
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">Status</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">
                                            Change the Status by toggle
                                        </p>
                                    </div>
                                    <Switch 
                                        checked={statusToggle}
                                        onCheckedChange={setStatusToggle}
                                    />
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="text-xs font-bold text-slate-700">Notes</label>
                                    <textarea 
                                        className="mt-1.5 w-full min-h-[80px] rounded-md border border-slate-200 p-3 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none" 
                                        placeholder="Add Notes" 
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Footer actions */}
                            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    className="h-10 text-xs font-bold border-slate-200 text-slate-700 shadow-sm"
                                    onClick={() => setShowCollectFeesModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="h-10 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                                >
                                    Pay Fees
                                </Button>
                            </div>
                        </form>
                    </div>
                </>
            )}

        </AppLayout>
    );
}
