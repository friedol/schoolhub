import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard, StatGrid } from '@/components/ui/stat-card';
import {
    AlertCircle,
    BookOpen,
    Calendar,
    Clock,
    FileText,
    User,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

interface Student {
    id: number;
    name: string;
    student_number: string;
    class: {
        id: number;
        name: string;
        level: string;
    };
    admission_date: string;
}

interface StudentDashboardProps {
    student: Student;
    statistics: {
        attendance_rate: number;
        average_marks: number;
        total_subjects: number;
        completed_assignments: number;
        pending_assignments: number;
        borrowed_books: number;
        overdue_books: number;
        pending_fees?: number;
    };
    recentResults: Array<{
        id: number;
        subject: string;
        assessment: string;
        marks: number;
        grade: string;
        date: string;
    }>;
    todaySchedule: Array<{
        id: number;
        subject: string;
        start_time: string;
        end_time: string;
        room: string;
        teacher: string;
    }>;
    upcomingAssignments: Array<{
        id: number;
        title: string;
        subject: string;
        due_date: string;
        status: string;
    }>;
    borrowedBooks: Array<{
        id: number;
        title: string;
        author: string;
        due_date: string;
        status: string;
    }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Student',
        href: '/student',
    },
    {
        title: 'Dashboard',
        href: '/student/dashboard',
    },
];

export default function StudentDashboard({
    student,
    statistics,
    recentResults,
    todaySchedule,
    upcomingAssignments,
    borrowedBooks,
}: StudentDashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Student Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-base font-semibold">Welcome, {student.name}</h1>
                        <p className="text-sm text-muted-foreground">
                            {student.class.name} &bull; Student ID: {student.student_number}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/student/results">
                                <FileText className="mr-2 h-4 w-4" />
                                View All Results
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <StatGrid cols={4}>
                    <StatCard
                        title="Attendance Rate"
                        value={`${statistics.attendance_rate}%`}
                        icon={Calendar}
                        color="green"
                        trend={statistics.attendance_rate >= 90 ? 'up' : 'down'}
                        trendLabel="This month"
                    />
                    <StatCard
                        title="My Assessments"
                        value={statistics.completed_assignments + statistics.pending_assignments}
                        icon={FileText}
                        color="indigo"
                        trendLabel={`${statistics.pending_assignments} pending`}
                    />
                    <StatCard
                        title="Books Borrowed"
                        value={statistics.borrowed_books}
                        icon={BookOpen}
                        color="purple"
                        trendLabel={`${statistics.overdue_books} overdue`}
                    />
                    <StatCard
                        title="Pending Fees TZS"
                        value={statistics.pending_fees ? `TZS ${statistics.pending_fees.toLocaleString()}` : 'TZS 0'}
                        icon={User}
                        color="amber"
                        trendLabel="Outstanding balance"
                    />
                </StatGrid>

                {/* Today's Schedule */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold">Today's Schedule</CardTitle>
                        <CardDescription className="text-xs">
                            Your classes for today
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {todaySchedule.length > 0 ? (
                            <div className="space-y-4">
                                {todaySchedule.map((schedule) => (
                                    <div key={schedule.id} className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                                <Clock className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{schedule.subject}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {schedule.room} &bull; {schedule.teacher}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">
                                                {schedule.start_time} - {schedule.end_time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-medium">No classes today</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Enjoy your free time!
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Results and Upcoming Assignments */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Recent Results</CardTitle>
                            <CardDescription className="text-xs">
                                Your latest assessment results
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentResults.map((result) => (
                                    <div key={result.id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                                <FileText className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{result.assessment}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {result.subject} &bull; {result.date}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{result.marks}%</p>
                                            <Badge variant={result.grade === 'A' || result.grade === 'B' ? 'default' : 'secondary'}>
                                                {result.grade}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/student/results">
                                        View All Results
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Upcoming Assignments</CardTitle>
                            <CardDescription className="text-xs">
                                Assignments due soon
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {upcomingAssignments.map((assignment) => (
                                    <div key={assignment.id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                                                <AlertCircle className="h-4 w-4 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{assignment.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {assignment.subject} &bull; Due: {assignment.due_date}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={assignment.status === 'completed' ? 'default' : 'secondary'}>
                                            {assignment.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/student/assignments">
                                        View All Assignments
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Borrowed Books */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold">Borrowed Books</CardTitle>
                        <CardDescription className="text-xs">
                            Books currently borrowed from the library
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {borrowedBooks.length > 0 ? (
                            <div className="space-y-4">
                                {borrowedBooks.map((book) => (
                                    <div key={book.id} className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                                <BookOpen className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{book.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    by {book.author}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">Due: {book.due_date}</p>
                                            <Badge variant={book.status === 'overdue' ? 'destructive' : 'default'}>
                                                {book.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-medium">No borrowed books</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Visit the library to borrow books
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
                        <CardDescription className="text-xs">
                            Common student tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                            <Button variant="outline" className="h-auto flex-col p-4" asChild>
                                <Link href="/student/results">
                                    <FileText className="mb-2 h-6 w-6" />
                                    <span className="text-sm">View Results</span>
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-auto flex-col p-4" asChild>
                                <Link href="/student/timetable">
                                    <Calendar className="mb-2 h-6 w-6" />
                                    <span className="text-sm">View Timetable</span>
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-auto flex-col p-4" asChild>
                                <Link href="/student/assignments">
                                    <Clock className="mb-2 h-6 w-6" />
                                    <span className="text-sm">Assignments</span>
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-auto flex-col p-4" asChild>
                                <Link href="/student/book-catalog">
                                    <BookOpen className="mb-2 h-6 w-6" />
                                    <span className="text-sm">Library</span>
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
