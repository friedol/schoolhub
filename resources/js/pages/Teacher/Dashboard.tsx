import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard, StatGrid } from '@/components/ui/stat-card';
import {
    GraduationCap,
    Users,
    BookOpen,
    Calendar,
    ClipboardList,
    FileText,
    Clock,
    AlertCircle,
    Plus,
    Eye,
    Edit,
    MessageSquare,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

interface Teacher {
    id: number;
    name: string;
    email: string;
    subjects: string[];
    classes: Array<{
        id: number;
        name: string;
        level: string;
    }>;
}

interface TeacherDashboardProps {
    teacher: Teacher;
    statistics: {
        total_students: number;
        total_classes: number;
        total_subjects: number;
        pending_assessments: number;
        completed_assessments: number;
        attendance_rate: number;
    };
    todaySchedule: Array<{
        id: number;
        subject: string;
        class: string;
        start_time: string;
        end_time: string;
        room: string;
    }>;
    recentAssessments: Array<{
        id: number;
        name: string;
        class: string;
        subject: string;
        due_date: string;
        status: string;
    }>;
    upcomingDeadlines: Array<{
        id: number;
        title: string;
        due_date: string;
        type: string;
    }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Teacher',
        href: '/teacher',
    },
    {
        title: 'Dashboard',
        href: '/teacher/dashboard',
    },
];

export default function TeacherDashboard({
    teacher,
    statistics,
    todaySchedule,
    recentAssessments,
    upcomingDeadlines,
}: TeacherDashboardProps) {
    const stats = statistics ?? {
        total_students: 0,
        total_classes: 0,
        total_subjects: 0,
        pending_assessments: 0,
        completed_assessments: 0,
        attendance_rate: 0,
    };

    // Derive upcoming exams count from deadlines with type "exam"
    const upcomingExams = upcomingDeadlines?.filter((d) => d.type === 'exam').length ?? 0;
    // Messages mock — no prop available so default to 0
    const messages = 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Teacher Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-base font-semibold tracking-tight">Welcome, {teacher?.name}</h1>
                        <p className="text-sm text-muted-foreground">
                            Teacher • {teacher?.subjects?.join(', ')}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button size="sm" asChild>
                            <Link href="/academic/assessments/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Assessment
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <StatGrid cols={3}>
                    <StatCard
                        title="My Classes"
                        value={stats.total_classes}
                        icon={GraduationCap}
                        color="indigo"
                        trend="stable"
                        trendLabel="Active classes"
                    />
                    <StatCard
                        title="Students"
                        value={stats.total_students}
                        icon={Users}
                        color="emerald"
                        trend="stable"
                        trendLabel="Across all classes"
                    />
                    <StatCard
                        title="Pending Assessments"
                        value={stats.pending_assessments}
                        icon={ClipboardList}
                        color="amber"
                        trend={stats.pending_assessments > 0 ? 'down' : 'stable'}
                        trendLabel="Awaiting grading"
                    />
                    <StatCard
                        title="Attendance Rate"
                        value={`${stats.attendance_rate}%`}
                        icon={Calendar}
                        color="green"
                        trend={stats.attendance_rate >= 90 ? 'up' : 'down'}
                        trendLabel="This month"
                    />
                    <StatCard
                        title="Upcoming Exams"
                        value={upcomingExams}
                        icon={BookOpen}
                        color="blue"
                        trend="stable"
                        trendLabel="Scheduled exams"
                    />
                    <StatCard
                        title="Messages"
                        value={messages}
                        icon={MessageSquare}
                        color="sky"
                        trend="stable"
                        trendLabel="Unread messages"
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
                        {todaySchedule?.length > 0 ? (
                            <div className="overflow-x-auto">
                                <div className="space-y-3 min-w-[420px]">
                                    {todaySchedule.map((schedule) => (
                                        <div key={schedule.id} className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                                                    <Clock className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{schedule.subject}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {schedule.class} • {schedule.room}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium">
                                                    {schedule.start_time} - {schedule.end_time}
                                                </p>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/academic/attendance/${schedule.id}`}>
                                                        Mark Attendance
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-medium">No classes today</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Enjoy your free time!
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Assessments */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Recent Assessments</CardTitle>
                            <CardDescription className="text-xs">
                                Your latest assessments and their status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentAssessments?.map((assessment) => (
                                    <div key={assessment.id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                                <ClipboardList className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{assessment.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {assessment.class} • {assessment.subject}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant={assessment.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                                                {assessment.status}
                                            </Badge>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/academic/assessments/${assessment.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4">
                                <Button variant="outline" className="w-full text-sm" asChild>
                                    <Link href="/academic/assessments">
                                        View All Assessments
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Upcoming Deadlines</CardTitle>
                            <CardDescription className="text-xs">
                                Important dates and deadlines
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {upcomingDeadlines?.map((deadline) => (
                                    <div key={deadline.id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                                                <AlertCircle className="h-4 w-4 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{deadline.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Due: {deadline.due_date}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-xs">{deadline.type}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
                        <CardDescription className="text-xs">
                            Common teaching tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                            <Button variant="outline" className="h-auto flex-col p-4" asChild>
                                <Link href="/academic/assessments/create">
                                    <Plus className="mb-2 h-6 w-6" />
                                    <span className="text-sm">Create Assessment</span>
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-auto flex-col p-4" asChild>
                                <Link href="/students/attendance">
                                    <Calendar className="mb-2 h-6 w-6" />
                                    <span className="text-sm">Mark Attendance</span>
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-auto flex-col p-4" asChild>
                                <Link href="/academic/assessments/grade">
                                    <Edit className="mb-2 h-6 w-6" />
                                    <span className="text-sm">Grade Assessments</span>
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-auto flex-col p-4" asChild>
                                <Link href="/academic/report-cards">
                                    <FileText className="mb-2 h-6 w-6" />
                                    <span className="text-sm">Generate Reports</span>
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
