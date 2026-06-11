import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    DollarSign,
    AlertTriangle,
    CheckCircle,
    Clock,
    Search,
    Filter,
    Download,
    Eye,
    X,
    RefreshCw,
    User,
    BookOpen,
    Calendar
} from 'lucide-react';
import { StatCard, StatGrid } from '@/components/ui/stat-card';

interface LibraryFine {
    id: number;
    book_issuance: {
        id: number;
        book_copy: {
            id: number;
            accession_number: string;
            book: {
                id: number;
                title: string;
                author: string;
                cover_image: string;
            };
        };
        borrower: {
            id: number;
            name: string;
            student_number?: string;
            employee_id?: string;
            role: string;
        };
        issue_date: string;
        due_date: string;
        return_date?: string;
    };
    amount: number;
    reason: string;
    status: 'pending' | 'paid' | 'waived';
    paid_at?: string;
    waived_at?: string;
    waived_by?: {
        id: number;
        name: string;
    };
    created_at: string;
}

interface Props {
    fines: LibraryFine[];
    pendingFines: LibraryFine[];
    paidFines: LibraryFine[];
    waivedFines: LibraryFine[];
    stats: {
        totalPending: number;
        totalPaid: number;
        totalWaived: number;
        totalAmount: number;
        pendingAmount: number;
        paidAmount: number;
        waivedAmount: number;
    };
}

export default function FinesIndex({ fines, pendingFines, paidFines, waivedFines, stats }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [borrowerTypeFilter, setBorrowerTypeFilter] = useState('all');
    const [amountRangeFilter, setAmountRangeFilter] = useState('all');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'waived':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-4 h-4" />;
            case 'paid':
                return <CheckCircle className="w-4 h-4" />;
            case 'waived':
                return <X className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-TZ', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-TZ', {
            style: 'currency',
            currency: 'TZS',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const filteredFines = fines.filter(fine => {
        const matchesSearch = 
            fine.book_issuance.book_copy.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fine.book_issuance.borrower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fine.book_issuance.book_copy.accession_number.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || fine.status === statusFilter;
        const matchesBorrowerType = borrowerTypeFilter === 'all' || fine.book_issuance.borrower.role === borrowerTypeFilter;
        
        let matchesAmount = true;
        if (amountRangeFilter !== 'all') {
            switch (amountRangeFilter) {
                case 'low':
                    matchesAmount = fine.amount < 1000;
                    break;
                case 'medium':
                    matchesAmount = fine.amount >= 1000 && fine.amount < 5000;
                    break;
                case 'high':
                    matchesAmount = fine.amount >= 5000;
                    break;
            }
        }
        
        return matchesSearch && matchesStatus && matchesBorrowerType && matchesAmount;
    });

    return (
        <AppLayout>
            <Head title="Fine Management" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-base font-semibold tracking-tight">Library Fines</h1>
                        <p className="text-sm text-muted-foreground">Manage library fines and payments</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                        <Button variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Recalculate
                        </Button>
                    </div>
                </div>

                <StatGrid cols={4}>
                    <StatCard title="Pending Fines" value={stats.totalPending} icon={Clock} color="amber" trend="stable" subtitle={formatCurrency(stats.pendingAmount)} />
                    <StatCard title="Paid Fines" value={stats.totalPaid} icon={CheckCircle} color="green" trend="stable" subtitle={formatCurrency(stats.paidAmount)} />
                    <StatCard title="Waived Fines" value={stats.totalWaived} icon={X} color="slate" trend="stable" subtitle={formatCurrency(stats.waivedAmount)} />
                    <StatCard title="Total Amount" value={formatCurrency(stats.totalAmount)} icon={DollarSign} color="blue" trend="stable" subtitle="All fine amounts" />
                </StatGrid>

                {/* Main Content */}
                <Tabs defaultValue="all-fines" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="all-fines">All Fines</TabsTrigger>
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="paid">Paid</TabsTrigger>
                        <TabsTrigger value="waived">Waived</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all-fines" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>All Library Fines</CardTitle>
                                <CardDescription>
                                    Complete list of all library fines
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Filters */}
                                <div className="flex flex-col md:flex-row gap-4 mb-6">
                                    <div className="flex-1">
                                        <Label htmlFor="search">Search</Label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="search"
                                                placeholder="Search by book title, borrower, or accession number..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="status-filter">Status</Label>
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="paid">Paid</SelectItem>
                                                <SelectItem value="waived">Waived</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="borrower-type-filter">Borrower Type</Label>
                                        <Select value={borrowerTypeFilter} onValueChange={setBorrowerTypeFilter}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Types</SelectItem>
                                                <SelectItem value="student">Students</SelectItem>
                                                <SelectItem value="teacher">Teachers</SelectItem>
                                                <SelectItem value="staff">Staff</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="amount-range-filter">Amount Range</Label>
                                        <Select value={amountRangeFilter} onValueChange={setAmountRangeFilter}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Amounts</SelectItem>
                                                <SelectItem value="low">Under TZS 1,000</SelectItem>
                                                <SelectItem value="medium">TZS 1,000 - 5,000</SelectItem>
                                                <SelectItem value="high">Over TZS 5,000</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Fines Table */}
                                <div className="space-y-3">
                                    {filteredFines.map((fine) => (
                                        <div key={fine.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                                                    {fine.book_issuance.book_copy.book.cover_image ? (
                                                        <img
                                                            src={fine.book_issuance.book_copy.book.cover_image}
                                                            alt="Book cover"
                                                            className="w-full h-full object-cover rounded"
                                                        />
                                                    ) : (
                                                        <BookOpen className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{fine.book_issuance.book_copy.book.title}</div>
                                                    <div className="text-sm text-gray-500">by {fine.book_issuance.book_copy.book.author}</div>
                                                    <div className="text-sm text-gray-500">
                                                        Accession: {fine.book_issuance.book_copy.accession_number}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="text-right">
                                                    <div className="font-medium">{fine.book_issuance.borrower.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {fine.book_issuance.borrower.student_number || fine.book_issuance.borrower.employee_id}
                                                    </div>
                                                    <div className="text-sm text-gray-500 capitalize">
                                                        {fine.book_issuance.borrower.role}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-gray-500">Due: {formatDate(fine.book_issuance.due_date)}</div>
                                                    {fine.book_issuance.return_date && (
                                                        <div className="text-sm text-gray-500">
                                                            Returned: {formatDate(fine.book_issuance.return_date)}
                                                        </div>
                                                    )}
                                                    <div className="text-sm text-gray-500">
                                                        Created: {formatDate(fine.created_at)}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold text-lg">{formatCurrency(fine.amount)}</div>
                                                    <div className="text-sm text-gray-500">{fine.reason}</div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Badge className={getStatusColor(fine.status)}>
                                                        {getStatusIcon(fine.status)}
                                                        <span className="ml-1">{fine.status}</span>
                                                    </Badge>
                                                    {fine.paid_at && (
                                                        <div className="text-sm text-gray-500">
                                                            Paid: {formatDate(fine.paid_at)}
                                                        </div>
                                                    )}
                                                    {fine.waived_at && (
                                                        <div className="text-sm text-gray-500">
                                                            Waived: {formatDate(fine.waived_at)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex space-x-2">
                                                    {fine.status === 'pending' && (
                                                        <>
                                                            <Button size="sm" variant="outline">
                                                                Collect Payment
                                                            </Button>
                                                            <Button size="sm" variant="outline">
                                                                Waive Fine
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button size="sm" variant="outline">
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        View Details
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {filteredFines.length === 0 && (
                                    <div className="text-center py-8">
                                        <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No fines found</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Try adjusting your search or filter criteria.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="pending" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Clock className="w-5 h-5 mr-2 text-yellow-600" />
                                    Pending Fines
                                </CardTitle>
                                <CardDescription>
                                    Fines that are awaiting payment
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {pendingFines.map((fine) => (
                                        <div key={fine.id} className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                                                    {fine.book_issuance.book_copy.book.cover_image ? (
                                                        <img
                                                            src={fine.book_issuance.book_copy.book.cover_image}
                                                            alt="Book cover"
                                                            className="w-full h-full object-cover rounded"
                                                        />
                                                    ) : (
                                                        <BookOpen className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{fine.book_issuance.book_copy.book.title}</div>
                                                    <div className="text-sm text-gray-500">by {fine.book_issuance.book_copy.book.author}</div>
                                                    <div className="text-sm text-yellow-600 font-medium">
                                                        Fine: {formatCurrency(fine.amount)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="text-right">
                                                    <div className="font-medium">{fine.book_issuance.borrower.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {fine.book_issuance.borrower.student_number || fine.book_issuance.borrower.employee_id}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-gray-500">Due: {formatDate(fine.book_issuance.due_date)}</div>
                                                    <div className="text-sm text-gray-500">
                                                        Returned: {formatDate(fine.book_issuance.return_date!)}
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button size="sm" variant="outline">
                                                        Collect Payment
                                                    </Button>
                                                    <Button size="sm" variant="outline">
                                                        Waive Fine
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="paid" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                                    Paid Fines
                                </CardTitle>
                                <CardDescription>
                                    Fines that have been paid
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {paidFines.map((fine) => (
                                        <div key={fine.id} className="flex items-center justify-between p-4 border border-green-200 rounded-lg bg-green-50">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                                                    {fine.book_issuance.book_copy.book.cover_image ? (
                                                        <img
                                                            src={fine.book_issuance.book_copy.book.cover_image}
                                                            alt="Book cover"
                                                            className="w-full h-full object-cover rounded"
                                                        />
                                                    ) : (
                                                        <BookOpen className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{fine.book_issuance.book_copy.book.title}</div>
                                                    <div className="text-sm text-gray-500">by {fine.book_issuance.book_copy.book.author}</div>
                                                    <div className="text-sm text-green-600 font-medium">
                                                        Paid: {formatCurrency(fine.amount)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="text-right">
                                                    <div className="font-medium">{fine.book_issuance.borrower.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {fine.book_issuance.borrower.student_number || fine.book_issuance.borrower.employee_id}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-gray-500">Paid: {formatDate(fine.paid_at!)}</div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button size="sm" variant="outline">
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        View Receipt
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="waived" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <X className="w-5 h-5 mr-2 text-gray-600" />
                                    Waived Fines
                                </CardTitle>
                                <CardDescription>
                                    Fines that have been waived
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {waivedFines.map((fine) => (
                                        <div key={fine.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                                                    {fine.book_issuance.book_copy.book.cover_image ? (
                                                        <img
                                                            src={fine.book_issuance.book_copy.book.cover_image}
                                                            alt="Book cover"
                                                            className="w-full h-full object-cover rounded"
                                                        />
                                                    ) : (
                                                        <BookOpen className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{fine.book_issuance.book_copy.book.title}</div>
                                                    <div className="text-sm text-gray-500">by {fine.book_issuance.book_copy.book.author}</div>
                                                    <div className="text-sm text-gray-600 font-medium">
                                                        Waived: {formatCurrency(fine.amount)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="text-right">
                                                    <div className="font-medium">{fine.book_issuance.borrower.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {fine.book_issuance.borrower.student_number || fine.book_issuance.borrower.employee_id}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-gray-500">Waived: {formatDate(fine.waived_at!)}</div>
                                                    <div className="text-sm text-gray-500">
                                                        By: {fine.waived_by?.name}
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button size="sm" variant="outline">
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        View Details
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}



