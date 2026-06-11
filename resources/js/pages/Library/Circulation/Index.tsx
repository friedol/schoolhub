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
import {
    BookOpen,
    User,
    Calendar,
    AlertTriangle,
    CheckCircle,
    Clock,
    Search,
    Plus,
    RefreshCw,
    Filter,
    Download,
    DollarSign
} from 'lucide-react';
import { StatCard, StatGrid } from '@/components/ui/stat-card';

interface BookIssuance {
    id: number;
    book_copy: {
        id: number;
        accession_number: string;
        barcode: string;
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
    status: 'issued' | 'returned' | 'overdue';
    fine_amount: number;
    created_at: string;
}

interface Props {
    issuances: BookIssuance[];
    overdueBooks: BookIssuance[];
    recentReturns: BookIssuance[];
    stats: {
        totalIssued: number;
        totalOverdue: number;
        totalFines: number;
        todayIssued: number;
    };
}

export default function CirculationIndex({ 
    issuances = [], 
    overdueBooks = [], 
    recentReturns = [], 
    stats 
}: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [borrowerTypeFilter, setBorrowerTypeFilter] = useState('all');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'issued':
                return 'bg-blue-100 text-blue-800';
            case 'returned':
                return 'bg-green-100 text-green-800';
            case 'overdue':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'issued':
                return <Clock className="w-4 h-4" />;
            case 'returned':
                return <CheckCircle className="w-4 h-4" />;
            case 'overdue':
                return <AlertTriangle className="w-4 h-4" />;
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

    const filteredIssuances = issuances.filter(issuance => {
        const matchesSearch = 
            issuance.book_copy.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            issuance.borrower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            issuance.book_copy.accession_number.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || issuance.status === statusFilter;
        const matchesBorrowerType = borrowerTypeFilter === 'all' || issuance.borrower.role === borrowerTypeFilter;
        
        return matchesSearch && matchesStatus && matchesBorrowerType;
    });

    return (
        <AppLayout>
            <Head title="Circulation Management" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-base font-semibold tracking-tight">Circulation</h1>
                        <p className="text-sm text-muted-foreground">Manage book issuance, returns, and fines</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                        <Link href="/library/circulation/issue">
                            <Button size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Issue Book
                            </Button>
                        </Link>
                    </div>
                </div>

                <StatGrid cols={4}>
                    <StatCard title="Total Issued" value={stats.totalIssued} icon={BookOpen} color="blue" trend="stable" subtitle="Books currently issued" />
                    <StatCard title="Overdue Books" value={stats.totalOverdue} icon={AlertTriangle} color="red" trend="stable" subtitle="Past due date" />
                    <StatCard title="Today's Issues" value={stats.todayIssued} icon={Calendar} color="green" trend="stable" subtitle="Issued today" />
                    <StatCard title="Total Fines" value={formatCurrency(stats.totalFines)} icon={DollarSign} color="amber" trend="stable" subtitle="Outstanding fines" />
                </StatGrid>

                {/* Main Content */}
                <Tabs defaultValue="all-issuances" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="all-issuances">All Issuances</TabsTrigger>
                        <TabsTrigger value="overdue">Overdue Books</TabsTrigger>
                        <TabsTrigger value="recent-returns">Recent Returns</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all-issuances" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>All Book Issuances</CardTitle>
                                <CardDescription>
                                    Complete list of all book issuances and returns
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
                                                <SelectItem value="issued">Issued</SelectItem>
                                                <SelectItem value="returned">Returned</SelectItem>
                                                <SelectItem value="overdue">Overdue</SelectItem>
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
                                </div>

                                {/* Issuances Table */}
                                <div className="space-y-3">
                                    {filteredIssuances.map((issuance) => (
                                        <div key={issuance.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                                                    {issuance.book_copy.book.cover_image ? (
                                                        <img
                                                            src={issuance.book_copy.book.cover_image}
                                                            alt="Book cover"
                                                            className="w-full h-full object-cover rounded"
                                                        />
                                                    ) : (
                                                        <BookOpen className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{issuance.book_copy.book.title}</div>
                                                    <div className="text-sm text-gray-500">by {issuance.book_copy.book.author}</div>
                                                    <div className="text-sm text-gray-500">
                                                        Accession: {issuance.book_copy.accession_number}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="text-right">
                                                    <div className="font-medium">{issuance.borrower.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {issuance.borrower.student_number || issuance.borrower.employee_id}
                                                    </div>
                                                    <div className="text-sm text-gray-500 capitalize">
                                                        {issuance.borrower.role}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-gray-500">Issued: {formatDate(issuance.issue_date)}</div>
                                                    <div className="text-sm text-gray-500">Due: {formatDate(issuance.due_date)}</div>
                                                    {issuance.return_date && (
                                                        <div className="text-sm text-gray-500">
                                                            Returned: {formatDate(issuance.return_date)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Badge className={getStatusColor(issuance.status)}>
                                                        {getStatusIcon(issuance.status)}
                                                        <span className="ml-1">{issuance.status}</span>
                                                    </Badge>
                                                    {issuance.fine_amount > 0 && (
                                                        <Badge variant="outline" className="text-red-600">
                                                            Fine: {formatCurrency(issuance.fine_amount)}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex space-x-2">
                                                    {issuance.status === 'issued' && (
                                                        <Button size="sm" variant="outline">
                                                            Return
                                                        </Button>
                                                    )}
                                                    <Button size="sm" variant="outline">
                                                        View Details
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {filteredIssuances.length === 0 && (
                                    <div className="text-center py-8">
                                        <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No issuances found</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Try adjusting your search or filter criteria.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="overdue" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                                    Overdue Books
                                </CardTitle>
                                <CardDescription>
                                    Books that are past their due date
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {overdueBooks.map((issuance) => (
                                        <div key={issuance.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                                                    {issuance.book_copy.book.cover_image ? (
                                                        <img
                                                            src={issuance.book_copy.book.cover_image}
                                                            alt="Book cover"
                                                            className="w-full h-full object-cover rounded"
                                                        />
                                                    ) : (
                                                        <BookOpen className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{issuance.book_copy.book.title}</div>
                                                    <div className="text-sm text-gray-500">by {issuance.book_copy.book.author}</div>
                                                    <div className="text-sm text-red-600 font-medium">
                                                        Overdue since: {formatDate(issuance.due_date)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="text-right">
                                                    <div className="font-medium">{issuance.borrower.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {issuance.borrower.student_number || issuance.borrower.employee_id}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-medium text-red-600">
                                                        Fine: {formatCurrency(issuance.fine_amount)}
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button size="sm" variant="outline">
                                                        Send Reminder
                                                    </Button>
                                                    <Button size="sm" variant="outline">
                                                        Collect Fine
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="recent-returns" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                                    Recent Returns
                                </CardTitle>
                                <CardDescription>
                                    Books returned in the last 7 days
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {recentReturns.map((issuance) => (
                                        <div key={issuance.id} className="flex items-center justify-between p-4 border border-green-200 rounded-lg bg-green-50">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                                                    {issuance.book_copy.book.cover_image ? (
                                                        <img
                                                            src={issuance.book_copy.book.cover_image}
                                                            alt="Book cover"
                                                            className="w-full h-full object-cover rounded"
                                                        />
                                                    ) : (
                                                        <BookOpen className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{issuance.book_copy.book.title}</div>
                                                    <div className="text-sm text-gray-500">by {issuance.book_copy.book.author}</div>
                                                    <div className="text-sm text-green-600 font-medium">
                                                        Returned: {formatDate(issuance.return_date!)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="text-right">
                                                    <div className="font-medium">{issuance.borrower.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {issuance.borrower.student_number || issuance.borrower.employee_id}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-gray-500">
                                                        Issued: {formatDate(issuance.issue_date)}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Due: {formatDate(issuance.due_date)}
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button size="sm" variant="outline">
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



