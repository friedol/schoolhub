import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard, StatGrid } from '@/components/ui/stat-card';
import {
    Calendar,
    CreditCard,
    Eye,
    FileText,
    MessageSquare,
    User,
    Users,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

interface Parent {
    id: number;
    name: string;
    email: string;
    phone: string;
    children: Array<{
        id: number;
        name: string;
        student_number: string;
        class: string;
        level: string;
    }>;
}

interface ParentDashboardProps {
    parent: Parent;
    childrenStatistics: Array<{
        child_id: number;
        child_name: string;
        attendance_rate: number;
        average_marks: number;
        pending_fees: number;
        overdue_books: number;
    }>;
    recentResults: Array<{
        id: number;
        child_name: string;
        subject: string;
        assessment: string;
        marks: number;
        grade: string;
        date: string;
    }>;
    upcomingEvents: Array<{
        id: number;
        title: string;
        date: string;
        type: string;
        description: string;
    }>;
    feePayments: Array<{
        id: number;
        child_name: string;
        fee_type: string;
        amount: number;
        due_date: string;
        status: string;
    }>;
    recentMessages: Array<{
        id: number;
        title: string;
        content: string;
        sender: string;
        date: string;
        is_read: boolean;
    }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Parent',
        href: '/parent',
    },
    {
        title: 'Dashboard',
        href: '/parent/dashboard',
    },
];

export default function ParentDashboard({
    parent,
    childrenStatistics,
    recentResults,
    upcomingEvents,
    feePayments,
    recentMessages,
}: ParentDashboardProps) {
    const avgAttendance = childrenStatistics.length
        ? Math.round(
              childrenStatistics.reduce((sum, s) => sum + s.attendance_rate, 0) /
                  childrenStatistics.length,
          )
        : 0;

    const totalPendingFees = childrenStatistics.reduce(
        (sum, s) => sum + (s.pending_fees ?? 0),
        0,
    );

    const unreadMessages = recentMessages.filter((m) => !m.is_read).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Parent Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-base font-semibold">Welcome, {parent.name}</h1>
                        <p className="text-sm text-muted-foreground">
                            Parent of {parent.children.length} child
                            {parent.children.length !== 1 ? 'ren' : ''}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/parent/messages">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Messages
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Summary Stats */}
                <StatGrid cols={4}>
                    <StatCard
                        title="My Children"
                        value={parent.children.length}
                        icon={Users}
                        color="emerald"
                        trendLabel="Enrolled students"
                    />
                    <StatCard
                        title="Avg Attendance %"
                        value={`${avgAttendance}%`}
                        icon={Calendar}
                        color="green"
                        trend={avgAttendance >= 90 ? 'up' : avgAttendance >= 75 ? 'stable' : 'down'}
                        trendLabel="Across all children"
                    />
                    <StatCard
                        title="Pending Fees TZS"
                        value={`TZS ${totalPendingFees.toLocaleString()}`}
                        icon={CreditCard}
                        color="amber"
                        trend={totalPendingFees > 0 ? 'down' : 'stable'}
                        trendLabel="Outstanding balance"
                    />
                    <StatCard
                        title="Unread Messages"
                        value={unreadMessages}
                        icon={MessageSquare}
                        color="sky"
                        trendLabel="From school"
                    />
                </StatGrid>

                {/* Children Overview */}
                <div>
                    <h2 className="mb-3 text-sm font-semibold">Children Overview</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {parent.children.map((child) => {
                            const stats = childrenStatistics.find((s) => s.child_id === child.id);
                            return (
                                <Card key={child.id}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">{child.name}</CardTitle>
                                        <User className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <p className="text-xs text-muted-foreground">
                                                {child.class} &bull; {child.level}
                                            </p>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div>
                                                    <p className="text-muted-foreground">Attendance</p>
                                                    <p className="font-medium">{stats?.attendance_rate ?? 0}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Average</p>
                                                    <p className="font-medium">{stats?.average_marks ?? 0}%</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" className="w-full" asChild>
                                                <Link href={`/parent/children/${child.id}`}>
                                                    <Eye className="mr-2 h-3 w-3" />
                                                    View Details
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Results */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold">Recent Results</CardTitle>
                        <CardDescription className="text-xs">
                            Latest assessment results for your children
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
                                                {result.child_name} &bull; {result.subject} &bull; {result.date}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{result.marks}%</p>
                                        <Badge
                                            variant={
                                                result.grade === 'A' || result.grade === 'B'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {result.grade}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <Button variant="outline" className="w-full" asChild>
                                <Link href="/parent/academic-progress">View All Results</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Fee Payments and Upcoming Events */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Fee Payments</CardTitle>
                            <CardDescription className="text-xs">
                                Fee status for your children
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {feePayments.map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                                <CreditCard className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{payment.fee_type}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {payment.child_name} &bull; Due: {payment.due_date}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">
                                                TZS {payment.amount.toLocaleString()}
                                            </p>
                                            <Badge
                                                variant={
                                                    payment.status === 'paid' ? 'default' : 'destructive'
                                                }
                                            >
                                                {payment.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/parent/fee-payments">View All Payments</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Upcoming Events</CardTitle>
                            <CardDescription className="text-xs">
                                Important school events and dates
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {upcomingEvents.map((event) => (
                                    <div key={event.id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                                <Calendar className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{event.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {event.date} &bull; {event.description}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline">{event.type}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Messages */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold">Recent Messages</CardTitle>
                        <CardDescription className="text-xs">
                            Latest messages from the school
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentMessages.map((message) => (
                                <div
                                    key={message.id}
                                    className="flex items-start space-x-3 rounded-lg border p-3"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                        <MessageSquare className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium">{message.title}</p>
                                            {!message.is_read && (
                                                <div className="h-2 w-2 rounded-full bg-primary" />
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {message.sender} &bull; {message.date}
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {message.content.substring(0, 100)}...
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <Button variant="outline" className="w-full" asChild>
                                <Link href="/parent/messages">View All Messages</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
                        <CardDescription className="text-xs">Common parent tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                            <Button variant="outline" className="h-auto flex-col p-4" asChild>
                                <Link href="/parent/children">
                                    <Users className="mb-2 h-6 w-6" />
                                    <span className="text-sm">View Children</span>
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-auto flex-col p-4" asChild>
                                <Link href="/parent/academic-progress">
                                    <FileText className="mb-2 h-6 w-6" />
                                    <span className="text-sm">Academic Progress</span>
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-auto flex-col p-4" asChild>
                                <Link href="/parent/fee-payments">
                                    <CreditCard className="mb-2 h-6 w-6" />
                                    <span className="text-sm">Fee Payments</span>
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-auto flex-col p-4" asChild>
                                <Link href="/parent/messages">
                                    <MessageSquare className="mb-2 h-6 w-6" />
                                    <span className="text-sm">Messages</span>
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
