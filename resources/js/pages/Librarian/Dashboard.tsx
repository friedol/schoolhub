import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard, StatGrid } from '@/components/ui/stat-card';
import {
    Library,
    BookOpen,
    Book,
    Users,
    Clock,
    AlertCircle,
    CheckCircle,
    TrendingUp,
    TrendingDown,
    Plus,
    Eye,
    Search,
    Calendar,
    CreditCard,
    BarChart3,
    FileText,
    DollarSign
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

interface Librarian {
    id: number;
    name: string;
    email: string;
    school_id: number;
}

interface LibrarianDashboardProps {
    librarian: Librarian;
    school: {
        id: number;
        name: string;
        code: string;
    };
    statistics: {
        total_books: number;
        available_books: number;
        borrowed_books: number;
        overdue_books: number;
        total_borrowers: number;
        active_borrowers: number;
        total_fines: number;
        collected_fines: number;
        pending_fines: number;
        books_issued_today: number;
        books_returned_today: number;
        popular_categories: Array<{
            category: string;
            count: number;
        }>;
    };
    recentIssuances: Array<{
        id: number;
        book_title: string;
        borrower_name: string;
        borrower_type: string;
        issue_date: string;
        due_date: string;
        status: string;
    }>;
    overdueBooks: Array<{
        id: number;
        book_title: string;
        borrower_name: string;
        borrower_type: string;
        due_date: string;
        days_overdue: number;
        fine_amount: number;
    }>;
    popularBooks: Array<{
        id: number;
        title: string;
        author: string;
        category: string;
        total_borrows: number;
        available_copies: number;
        total_copies: number;
    }>;
    recentReturns: Array<{
        id: number;
        book_title: string;
        borrower_name: string;
        return_date: string;
        fine_amount: number;
        condition: string;
    }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Librarian',
        href: '/librarian',
    },
    {
        title: 'Dashboard',
        href: '/librarian/dashboard',
    },
];

export default function LibrarianDashboard({ 
    librarian, 
    school, 
    statistics, 
    recentIssuances,
    overdueBooks,
    popularBooks,
    recentReturns
}: LibrarianDashboardProps) {
    const availabilityRate = statistics.total_books > 0 
        ? ((statistics.available_books / statistics.total_books) * 100).toFixed(1)
        : 0;

    const fineCollectionRate = statistics.total_fines > 0 
        ? ((statistics.collected_fines / statistics.total_fines) * 100).toFixed(1)
        : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Librarian Dashboard" />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-base font-semibold tracking-tight">Library Management</h1>
                        <p className="text-sm text-muted-foreground">
                            {school.name} • Library Dashboard
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button asChild>
                            <Link href="/library/issuance/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Issue Book
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/library/reports">
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Library Reports
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Key Library Metrics */}
                <StatGrid cols={4}>
                    <StatCard
                        title="Total Books"
                        value={statistics.total_books}
                        icon={Library}
                        color="purple"
                    />
                    <StatCard
                        title="Issued Today"
                        value={statistics.books_issued_today}
                        icon={BookOpen}
                        color="blue"
                    />
                    <StatCard
                        title="Overdue"
                        value={statistics.overdue_books}
                        icon={AlertCircle}
                        color="red"
                    />
                    <StatCard
                        title="Fines Pending TZS"
                        value={`TZS ${statistics.pending_fines.toLocaleString()}`}
                        icon={DollarSign}
                        color="amber"
                    />
                    <StatCard
                        title="Available Books"
                        value={statistics.available_books}
                        icon={CheckCircle}
                        color="green"
                    />
                </StatGrid>

                {/* Recent Issuances and Overdue Books */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Recent Book Issuances</CardTitle>
                            <CardDescription className="text-xs">
                                Latest books issued to borrowers
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 overflow-x-auto">
                                {recentIssuances.map((issuance) => (
                                    <div key={issuance.id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                                <BookOpen className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{issuance.book_title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {issuance.borrower_name} • {issuance.borrower_type}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">Due: {issuance.due_date}</p>
                                            <Badge variant={issuance.status === 'active' ? 'default' : 'secondary'}>
                                                {issuance.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/library/issuance">
                                        View All Issuances
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Overdue Books</CardTitle>
                            <CardDescription className="text-xs">
                                Books that are past their due date
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 overflow-x-auto">
                                {overdueBooks.map((book) => (
                                    <div key={book.id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                                                <AlertCircle className="h-4 w-4 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{book.book_title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {book.borrower_name} • {book.borrower_type}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">
                                                {book.days_overdue} days overdue
                                            </p>
                                            <Badge variant="destructive">
                                                TZS {book.fine_amount.toLocaleString()}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/library/overdue-books">
                                        View All Overdue Books
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Popular Books */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold">Popular Books</CardTitle>
                        <CardDescription className="text-xs">
                            Most frequently borrowed books
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 overflow-x-auto">
                            {popularBooks.map((book) => (
                                <div key={book.id} className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                            <Book className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{book.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                by {book.author} • {book.category}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">
                                            {book.total_borrows} borrows
                                        </p>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant={book.available_copies > 0 ? 'default' : 'secondary'}>
                                                {book.available_copies}/{book.total_copies} available
                                            </Badge>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/library/books/${book.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Book Categories */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold">Book Categories</CardTitle>
                        <CardDescription className="text-xs">
                            Distribution of books by category
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {statistics.popular_categories.map((category, index) => (
                                <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                            <Library className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{category.category}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {category.count} books
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
                        <CardDescription className="text-xs">
                            Common library management tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                            <Button variant="outline" className="h-auto flex-col p-4" asChild>
                                <Link href="/library/issuance/create">
                                    <Plus className="mb-2 h-6 w-6" />
                                    <span className="text-sm">Issue Book</span>
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-auto flex-col p-4" asChild>
                                <Link href="/library/books">
                                    <Book className="mb-2 h-6 w-6" />
                                    <span className="text-sm">Manage Books</span>
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-auto flex-col p-4" asChild>
                                <Link href="/library/fines">
                                    <CreditCard className="mb-2 h-6 w-6" />
                                    <span className="text-sm">Manage Fines</span>
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-auto flex-col p-4" asChild>
                                <Link href="/library/reports">
                                    <BarChart3 className="mb-2 h-6 w-6" />
                                    <span className="text-sm">Library Reports</span>
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}



