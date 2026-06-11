import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard, StatGrid } from '@/components/ui/stat-card';
import {
    BookOpen,
    Users,
    Clock,
    AlertTriangle,
    TrendingUp,
    DollarSign,
    Plus,
    Search,
    BarChart3,
    FileText,
    QrCode,
    BookMarked
} from 'lucide-react';

interface Props {
    stats: {
        total_books: number;
        total_copies: number;
        available_copies: number;
        issued_copies: number;
        active_borrowers: number;
        total_fines: number;
        outstanding_fines: number;
    };
    recentIssuances: Array<{
        id: number;
        book: {
            title: string;
            author: string;
        };
        borrower: {
            first_name: string;
            last_name: string;
            student_number?: string;
        };
        issue_date: string;
        due_date: string;
        status: string;
    }>;
    overdueBooks: Array<{
        id: number;
        book: {
            title: string;
            author: string;
        };
        borrower: {
            first_name: string;
            last_name: string;
            student_number?: string;
        };
        due_date: string;
        days_overdue: number;
    }>;
    topBooks: Array<{
        id: number;
        title: string;
        author: string;
        total_issues: number;
        subject_category: string;
    }>;
}

export default function LibraryDashboard({ stats, recentIssuances, overdueBooks, topBooks }: Props) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'issued':
                return 'bg-blue-100 text-blue-800';
            case 'overdue':
                return 'bg-red-100 text-red-800';
            case 'returned':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
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
            <Head title="Library Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-base font-semibold text-gray-900">Library Dashboard</h1>
                        <p className="text-sm text-gray-600">Manage your school library efficiently</p>
                    </div>
                    <div className="flex space-x-2">
                        <Link href="/library/reports">
                            <Button variant="outline">
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Reports
                            </Button>
                        </Link>
                        <Link href="/library/books/create">
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Book
                            </Button>
                        </Link>
                    </div>
                </div>

                <StatGrid cols={4}>
                    <StatCard
                        title="Total Books"
                        value={stats.total_books}
                        icon={BookOpen}
                        color="purple"
                    />
                    <StatCard
                        title="Books Issued"
                        value={stats.issued_copies}
                        icon={BookMarked}
                        color="blue"
                    />
                    <StatCard
                        title="Overdue Returns"
                        value={overdueBooks.length}
                        icon={AlertTriangle}
                        color="red"
                    />
                    <StatCard
                        title="Active Members"
                        value={stats.active_borrowers}
                        icon={Users}
                        color="emerald"
                    />
                    <StatCard
                        title="Fines Collected TZS"
                        value={`TZS ${stats.total_fines.toLocaleString()}`}
                        icon={DollarSign}
                        color="amber"
                    />
                </StatGrid>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Recent Issuances</CardTitle>
                            <CardDescription className="text-xs">
                                Latest book issuances
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 overflow-x-auto">
                                {recentIssuances.map((issuance) => (
                                    <div key={issuance.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex-1">
                                            <div className="text-sm font-medium">{issuance.book.title}</div>
                                            <div className="text-xs text-gray-500">
                                                by {issuance.book.author}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Borrowed by {issuance.borrower.first_name} {issuance.borrower.last_name}
                                                {issuance.borrower.student_number && (
                                                    <span> ({issuance.borrower.student_number})</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge className={getStatusColor(issuance.status)}>
                                                {issuance.status.toUpperCase()}
                                            </Badge>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Due: {new Date(issuance.due_date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Overdue Books</CardTitle>
                            <CardDescription className="text-xs">
                                Books that need attention
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 overflow-x-auto">
                                {overdueBooks.map((book) => (
                                    <div key={book.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                                        <div className="flex-1">
                                            <div className="text-sm font-medium">{book.book.title}</div>
                                            <div className="text-xs text-gray-500">
                                                by {book.book.author}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Borrowed by {book.borrower.first_name} {book.borrower.last_name}
                                                {book.borrower.student_number && (
                                                    <span> ({book.borrower.student_number})</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge className="bg-red-100 text-red-800">
                                                {book.days_overdue} days overdue
                                            </Badge>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Due: {new Date(book.due_date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold">Most Popular Books</CardTitle>
                        <CardDescription className="text-xs">
                            Top borrowed books this period
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 overflow-x-auto">
                            {topBooks.map((book, index) => (
                                <div key={book.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">{book.title}</div>
                                            <div className="text-xs text-gray-500">
                                                by {book.author}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Badge className={getCategoryColor(book.subject_category)}>
                                            {book.subject_category.replace('_', ' ')}
                                        </Badge>
                                        <div className="text-xs font-medium">
                                            {book.total_issues} issues
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
                        <CardDescription className="text-xs">
                            Common library tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Link href="/library/circulation">
                                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                                    <QrCode className="w-6 h-6 mb-2" />
                                    <span className="text-sm">Issue/Return</span>
                                </Button>
                            </Link>
                            <Link href="/library/books">
                                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                                    <Search className="w-6 h-6 mb-2" />
                                    <span className="text-sm">Search Books</span>
                                </Button>
                            </Link>
                            <Link href="/library/fines">
                                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                                    <DollarSign className="w-6 h-6 mb-2" />
                                    <span className="text-sm">Manage Fines</span>
                                </Button>
                            </Link>
                            <Link href="/library/reports">
                                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                                    <FileText className="w-6 h-6 mb-2" />
                                    <span className="text-sm">View Reports</span>
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}



