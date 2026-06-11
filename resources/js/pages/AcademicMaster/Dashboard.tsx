import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard, StatGrid } from '@/components/ui/stat-card';
import {
    GraduationCap,
    BookOpen,
    Users,
    Calendar,
    FileText,
    AlertCircle,
    Plus,
    Eye,
    BarChart3,
    ClipboardList,
    School,
    User,
    Award,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

interface AcademicMaster {
    id: number;
    name: string;
    email: string;
    school_id: number;
}

interface AcademicMasterDashboardProps {
    academicMaster: AcademicMaster;
    school: {
        id: number;
        name: string;
        code: string;
    };
    statistics: {
        total_students: number;
        total_teachers: number;
        total_classes: number;
        total_subjects: number;
        total_assessments: number;
        completed_assessments: number;
        pending_assessments: number;
        average_attendance_rate: number;
        students_promoted: number;
        students_repeated: number;
        necta_candidates: number;
        report_cards_generated: number;
        pending_report_cards: number;
        academic_year: string;
        current_term: string;
    };
    recentApplications: Array<{
        id: number;
        student_name: string;
        applied_class: string;
        application_date: string;
        status: string;
        previous_school?: string;
    }>;
    upcomingExaminations: Array<{
        id: number;
        name: string;
        class: string;
        subject: string;
        date: string;
        type: string;
        max_marks: number;
    }>;
    classPerformance: Array<{
        id: number;
        class_name: string;
        level: string;
        total_students: number;
        average_marks: number;
        attendance_rate: number;
        teacher_name: string;
    }>;
    teacherWorkload: Array<{
        id: number;
        teacher_name: string;
        subjects: string[];
        classes: string[];
        total_students: number;
        assessments_pending: number;
    }>;
    academicCalendar: Array<{
        id: number;
        event_name: string;
        event_type: string;
        start_date: string;
        end_date: string;
        description: string;
    }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Academic Master',
        href: '/academic-master',
    },
    {
        title: 'Dashboard',
        href: '/academic-master/dashboard',
    },
];

export default function AcademicMasterDashboard({
    academicMaster,
    school,
    statistics,
    recentApplications,
    upcomingExaminations,
    classPerformance,
    teacherWorkload,
    academicCalendar,
}: AcademicMasterDashboardProps) {
    const stats = statistics ?? {
        total_students: 0,
        total_teachers: 0,
        total_classes: 0,
        total_subjects: 0,
        total_assessments: 0,
        completed_assessments: 0,
        pending_assessments: 0,
        average_attendance_rate: 0,
        students_promoted: 0,
        students_repeated: 0,
        necta_candidates: 0,
        report_cards_generated: 0,
        pending_report_cards: 0,
        academic_year: '',
        current_term: '',
    };

    const avgPassRate = stats.total_assessments > 0
        ? Number(((stats.completed_assessments / stats.total_assessments) * 100).toFixed(1))
        : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Academic Master Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-base font-semibold tracking-tight">Academic Management</h1>
                        <p className="text-sm text-muted-foreground">
                            {school?.name} • Academic Year: {stats.academic_year} • Term: {stats.current_term}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button size="sm" asChild>
                            <Link href="/students/applications">
                                <Plus className="mr-2 h-4 w-4" />
                                Review Applications
                            </Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                            <Link href="/academic/reports">
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Academic Reports
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <StatGrid cols={3}>
                    <StatCard
                        title="Total Classes"
                        value={stats.total_classes}
                        icon={School}
                        color="indigo"
                        trend="stable"
                        trendLabel="Active classes"
                    />
                    <StatCard
                        title="Total Subjects"
                        value={stats.total_subjects}
                        icon={BookOpen}
                        color="blue"
                        trend="stable"
                        trendLabel="Offered subjects"
                    />
                    <StatCard
                        title="Active Assessments"
                        value={stats.pending_assessments}
                        icon={ClipboardList}
                        color="amber"
                        trend={stats.pending_assessments > 0 ? 'down' : 'stable'}
                        trendLabel="Pending assessments"
                    />
                    <StatCard
                        title="Avg Pass Rate"
                        value={`${avgPassRate}%`}
                        icon={Award}
                        color="green"
                        trend={avgPassRate >= 70 ? 'up' : 'down'}
                        trendLabel={`${stats.completed_assessments}/${stats.total_assessments} completed`}
                    />
                    <StatCard
                        title="Students Enrolled"
                        value={stats.total_students}
                        icon={Users}
                        color="emerald"
                        trend="stable"
                        trendLabel={`${stats.necta_candidates} NECTA candidates`}
                    />
                    <StatCard
                        title="Report Cards"
                        value={stats.report_cards_generated}
                        icon={FileText}
                        color="teal"
                        trend={stats.pending_report_cards > 0 ? 'down' : 'stable'}
                        trendLabel={`${stats.pending_report_cards} pending`}
                    />
                </StatGrid>

                {/* Recent Applications and Upcoming Examinations */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-sm font-semibold">Recent Student Applications</CardTitle>
                            <CardDescription className="text-xs">
                                Latest student admission applications
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentApplications?.map((application) => (
                                    <div key={application.id} className="flex items-center justify-between rounded-lg border p-3 hover:border-gray-200 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                                <User className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{application.student_name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {application.applied_class} • {application.application_date}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant={application.status === 'approved' ? 'default' : 'secondary'} className="text-xs">
                                                {application.status}
                                            </Badge>
                                            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                                                <Link href={`/students/applications/${application.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4">
                                <Button variant="outline" className="w-full text-sm" asChild>
                                    <Link href="/students/applications">
                                        View All Applications
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-sm font-semibold">Upcoming Examinations</CardTitle>
                            <CardDescription className="text-xs">
                                Scheduled examinations and assessments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {upcomingExaminations?.map((exam) => (
                                    <div key={exam.id} className="flex items-center justify-between rounded-lg border p-3 hover:border-gray-200 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                                                <BookOpen className="h-4 w-4 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{exam.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {exam.class} • {exam.subject}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{exam.date}</p>
                                            <Badge variant="outline" className="text-xs">{exam.type}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4">
                                <Button variant="outline" className="w-full text-sm" asChild>
                                    <Link href="/academic/assessments">
                                        View All Examinations
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Class Performance */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-sm font-semibold">Class Performance Overview</CardTitle>
                        <CardDescription className="text-xs">
                            Academic performance by class
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <div className="space-y-3 min-w-[480px]">
                                {classPerformance?.map((cls) => (
                                    <div key={cls.id} className="flex items-center justify-between rounded-lg border p-4 hover:border-gray-200 hover:shadow-sm transition-all duration-200">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100">
                                                <School className="h-4 w-4 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{cls.class_name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {cls.level} • {cls.teacher_name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-6 text-sm">
                                            <div className="text-center">
                                                <p className="text-xs text-muted-foreground mb-0.5">Students</p>
                                                <p className="text-sm font-semibold">{cls.total_students}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-muted-foreground mb-0.5">Average</p>
                                                <p className="text-sm font-semibold">{cls.average_marks}%</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-muted-foreground mb-0.5">Attendance</p>
                                                <p className="text-sm font-semibold">{cls.attendance_rate}%</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Teacher Workload and Academic Calendar */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Teacher Workload</CardTitle>
                            <CardDescription className="text-xs">
                                Current teaching assignments and workload
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {teacherWorkload?.map((teacher) => (
                                    <div key={teacher.id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                                <GraduationCap className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{teacher.teacher_name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {teacher.subjects.join(', ')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">
                                                {teacher.total_students} students
                                            </p>
                                            <Badge variant={teacher.assessments_pending > 0 ? 'destructive' : 'default'} className="text-xs">
                                                {teacher.assessments_pending} pending
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Academic Calendar</CardTitle>
                            <CardDescription className="text-xs">
                                Upcoming academic events and deadlines
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {academicCalendar?.map((event) => (
                                    <div key={event.id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                                                <Calendar className="h-4 w-4 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{event.event_name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {event.start_date} - {event.end_date}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-xs">{event.event_type}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
                        <CardDescription className="text-xs">
                            Common academic management tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Button variant="outline" className="h-auto flex-col p-5" asChild>
                                <Link href="/students/applications">
                                    <div className="p-2.5 rounded-full bg-blue-100 mb-2">
                                        <Plus className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <span className="text-sm font-medium">Review Applications</span>
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-auto flex-col p-5" asChild>
                                <Link href="/academic/assessments">
                                    <div className="p-2.5 rounded-full bg-green-100 mb-2">
                                        <ClipboardList className="h-5 w-5 text-green-600" />
                                    </div>
                                    <span className="text-sm font-medium">Manage Assessments</span>
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-auto flex-col p-5" asChild>
                                <Link href="/academic/report-cards">
                                    <div className="p-2.5 rounded-full bg-purple-100 mb-2">
                                        <FileText className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <span className="text-sm font-medium">Generate Reports</span>
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-auto flex-col p-5" asChild>
                                <Link href="/academic/reports">
                                    <div className="p-2.5 rounded-full bg-orange-100 mb-2">
                                        <BarChart3 className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <span className="text-sm font-medium">Academic Reports</span>
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
