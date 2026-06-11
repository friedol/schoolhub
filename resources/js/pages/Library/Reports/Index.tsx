import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    BarChart3, 
    TrendingUp, 
    Users, 
    BookOpen, 
    Calendar, 
    Download,
    Filter,
    RefreshCw,
    Eye,
    FileText,
    PieChart,
    Activity,
    AlertTriangle
} from 'lucide-react';

interface PopularBook {
    id: number;
    title: string;
    author: string;
    total_issues: number;
    available_copies: number;
    total_copies: number;
    cover_image: string;
}

interface ActiveBorrower {
    id: number;
    name: string;
    student_number?: string;
    employee_id?: string;
    role: string;
    total_books_borrowed: number;
    current_books: number;
    total_fines: number;
    last_activity: string;
}

interface OverdueBook {
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
    due_date: string;
    days_overdue: number;
    fine_amount: number;
}

interface UsageStatistic {
    period: string;
    total_issues: number;
    total_returns: number;
    total_fines: number;
    active_borrowers: number;
}

interface Props {
    popularBooks: PopularBook[];
    activeBorrowers: ActiveBorrower[];
    overdueBooks: OverdueBook[];
    usageStatistics: UsageStatistic[];
    inventorySummary: {
        total_books: number;
        total_copies: number;
        available_copies: number;
        issued_copies: number;
        lost_copies: number;
        damaged_copies: number;
        under_repair_copies: number;
    };
    categoryBreakdown: Array<{
        category: string;
        count: number;
        percentage: number;
    }>;
    monthlyTrends: Array<{
        month: string;
        issues: number;
        returns: number;
        fines: number;
    }>;
}

export default function LibraryReports({ 
    popularBooks, 
    activeBorrowers, 
    overdueBooks, 
    usageStatistics, 
    inventorySummary,
    categoryBreakdown,
    monthlyTrends
}: Props) {
    const [dateRange, setDateRange] = useState('30');
    const [reportType, setReportType] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

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

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'fiction':
                return 'bg-purple-100 text-purple-800';
            case 'non_fiction':
                return 'bg-blue-100 text-blue-800';
            case 'science':
                return 'bg-green-100 text-green-800';
            case 'mathematics':
                return 'bg-orange-100 text-orange-800';
            case 'history':
                return 'bg-yellow-100 text-yellow-800';
            case 'kiswahili_literature':
                return 'bg-red-100 text-red-800';
            case 'english_literature':
                return 'bg-indigo-100 text-indigo-800';
            case 'reference':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout>
            <Head title="Library Reports & Analytics" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Library Reports & Analytics</h1>
                        <p className="text-gray-600">Comprehensive library usage and performance reports</p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh Data
                        </Button>
                        <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Export All Reports
                        </Button>
                    </div>
                </div>

                {/* Report Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Filter className="w-5 h-5 mr-2" />
                            Report Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="date-range">Date Range</Label>
                                <Select value={dateRange} onValueChange={setDateRange}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7">Last 7 days</SelectItem>
                                        <SelectItem value="30">Last 30 days</SelectItem>
                                        <SelectItem value="90">Last 90 days</SelectItem>
                                        <SelectItem value="365">Last year</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="report-type">Report Type</Label>
                                <Select value={reportType} onValueChange={setReportType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Reports</SelectItem>
                                        <SelectItem value="usage">Usage Statistics</SelectItem>
                                        <SelectItem value="inventory">Inventory Reports</SelectItem>
                                        <SelectItem value="fines">Fine Reports</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="category-filter">Category Filter</Label>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="fiction">Fiction</SelectItem>
                                        <SelectItem value="non_fiction">Non-Fiction</SelectItem>
                                        <SelectItem value="science">Science</SelectItem>
                                        <SelectItem value="mathematics">Mathematics</SelectItem>
                                        <SelectItem value="history">History</SelectItem>
                                        <SelectItem value="kiswahili_literature">Kiswahili Literature</SelectItem>
                                        <SelectItem value="english_literature">English Literature</SelectItem>
                                        <SelectItem value="reference">Reference</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <BookOpen className="h-8 w-8 text-blue-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Books</p>
                                    <p className="text-2xl font-bold text-gray-900">{inventorySummary.total_books}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Users className="h-8 w-8 text-green-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Active Borrowers</p>
                                    <p className="text-2xl font-bold text-gray-900">{activeBorrowers.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <TrendingUp className="h-8 w-8 text-orange-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Issued Copies</p>
                                    <p className="text-2xl font-bold text-gray-900">{inventorySummary.issued_copies}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Activity className="h-8 w-8 text-red-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Overdue Books</p>
                                    <p className="text-2xl font-bold text-gray-900">{overdueBooks.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Reports */}
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="popular-books">Popular Books</TabsTrigger>
                        <TabsTrigger value="active-borrowers">Active Borrowers</TabsTrigger>
                        <TabsTrigger value="overdue-books">Overdue Books</TabsTrigger>
                        <TabsTrigger value="inventory">Inventory</TabsTrigger>
                        <TabsTrigger value="usage-stats">Usage Statistics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Category Breakdown */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <PieChart className="w-5 h-5 mr-2" />
                                        Books by Category
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {categoryBreakdown.map((category) => (
                                            <div key={category.category} className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Badge className={getCategoryColor(category.category)}>
                                                        {category.category.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium">{category.count} books</div>
                                                    <div className="text-sm text-gray-500">{category.percentage}%</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Monthly Trends */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <BarChart3 className="w-5 h-5 mr-2" />
                                        Monthly Trends
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {monthlyTrends.slice(-6).map((trend) => (
                                            <div key={trend.month} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                                <div className="font-medium">{trend.month}</div>
                                                <div className="flex space-x-4 text-sm">
                                                    <div className="text-blue-600">
                                                        Issues: {trend.issues}
                                                    </div>
                                                    <div className="text-green-600">
                                                        Returns: {trend.returns}
                                                    </div>
                                                    <div className="text-red-600">
                                                        Fines: {formatCurrency(trend.fines)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="popular-books" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <TrendingUp className="w-5 h-5 mr-2" />
                                    Most Popular Books
                                </CardTitle>
                                <CardDescription>
                                    Books with the highest number of issues
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {popularBooks.map((book, index) => (
                                        <div key={book.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                                    {index + 1}
                                                </div>
                                                <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                                                    {book.cover_image ? (
                                                        <img
                                                            src={book.cover_image}
                                                            alt="Book cover"
                                                            className="w-full h-full object-cover rounded"
                                                        />
                                                    ) : (
                                                        <BookOpen className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{book.title}</div>
                                                    <div className="text-sm text-gray-500">by {book.author}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {book.available_copies} / {book.total_copies} copies available
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-blue-600">{book.total_issues}</div>
                                                <div className="text-sm text-gray-500">total issues</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="active-borrowers" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Users className="w-5 h-5 mr-2" />
                                    Most Active Borrowers
                                </CardTitle>
                                <CardDescription>
                                    Users with the highest library activity
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {activeBorrowers.map((borrower, index) => (
                                        <div key={borrower.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{borrower.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {borrower.student_number || borrower.employee_id}
                                                    </div>
                                                    <div className="text-sm text-gray-500 capitalize">
                                                        {borrower.role}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-green-600">{borrower.total_books_borrowed}</div>
                                                <div className="text-sm text-gray-500">books borrowed</div>
                                                <div className="text-sm text-gray-500">
                                                    {borrower.current_books} currently borrowed
                                                </div>
                                                {borrower.total_fines > 0 && (
                                                    <div className="text-sm text-red-600">
                                                        Fines: {formatCurrency(borrower.total_fines)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="overdue-books" className="space-y-4">
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
                                    {overdueBooks.map((book) => (
                                        <div key={book.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                                                    {book.book_copy.book.cover_image ? (
                                                        <img
                                                            src={book.book_copy.book.cover_image}
                                                            alt="Book cover"
                                                            className="w-full h-full object-cover rounded"
                                                        />
                                                    ) : (
                                                        <BookOpen className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{book.book_copy.book.title}</div>
                                                    <div className="text-sm text-gray-500">by {book.book_copy.book.author}</div>
                                                    <div className="text-sm text-gray-500">
                                                        Accession: {book.book_copy.accession_number}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="text-right">
                                                    <div className="font-medium">{book.borrower.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {book.borrower.student_number || book.borrower.employee_id}
                                                    </div>
                                                    <div className="text-sm text-gray-500 capitalize">
                                                        {book.borrower.role}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-red-600 font-medium">
                                                        {book.days_overdue} days overdue
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Due: {formatDate(book.due_date)}
                                                    </div>
                                                    <div className="text-sm text-red-600 font-medium">
                                                        Fine: {formatCurrency(book.fine_amount)}
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

                    <TabsContent value="inventory" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <BookOpen className="w-5 h-5 mr-2" />
                                    Inventory Summary
                                </CardTitle>
                                <CardDescription>
                                    Complete overview of library inventory
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <div className="text-sm font-medium text-blue-600">Total Books</div>
                                        <div className="text-2xl font-bold text-blue-600">{inventorySummary.total_books}</div>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <div className="text-sm font-medium text-green-600">Total Copies</div>
                                        <div className="text-2xl font-bold text-green-600">{inventorySummary.total_copies}</div>
                                    </div>
                                    <div className="p-4 bg-yellow-50 rounded-lg">
                                        <div className="text-sm font-medium text-yellow-600">Available Copies</div>
                                        <div className="text-2xl font-bold text-yellow-600">{inventorySummary.available_copies}</div>
                                    </div>
                                    <div className="p-4 bg-orange-50 rounded-lg">
                                        <div className="text-sm font-medium text-orange-600">Issued Copies</div>
                                        <div className="text-2xl font-bold text-orange-600">{inventorySummary.issued_copies}</div>
                                    </div>
                                    <div className="p-4 bg-red-50 rounded-lg">
                                        <div className="text-sm font-medium text-red-600">Lost Copies</div>
                                        <div className="text-2xl font-bold text-red-600">{inventorySummary.lost_copies}</div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-600">Damaged Copies</div>
                                        <div className="text-2xl font-bold text-gray-600">{inventorySummary.damaged_copies}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="usage-stats" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Activity className="w-5 h-5 mr-2" />
                                    Usage Statistics
                                </CardTitle>
                                <CardDescription>
                                    Library usage trends and patterns
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {usageStatistics.map((stat) => (
                                        <div key={stat.period} className="p-4 border rounded-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="font-medium">{stat.period}</div>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-blue-600">{stat.total_issues}</div>
                                                    <div className="text-sm text-gray-500">Total Issues</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-green-600">{stat.total_returns}</div>
                                                    <div className="text-sm text-gray-500">Total Returns</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-red-600">{formatCurrency(stat.total_fines)}</div>
                                                    <div className="text-sm text-gray-500">Total Fines</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-purple-600">{stat.active_borrowers}</div>
                                                    <div className="text-sm text-gray-500">Active Borrowers</div>
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



