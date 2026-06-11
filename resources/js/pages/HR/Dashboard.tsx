import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard, StatGrid } from '@/components/ui/stat-card';
import { Users, DollarSign, Calendar, Clock, TrendingUp, AlertCircle, CheckCircle, FileText, Target, GraduationCap } from 'lucide-react';

interface HRStats {
    totalStaff: number;
    activeStaff: number;
    newHires: number;
    pendingLeave: number;
    approvedLeave: number;
    totalPayroll: number;
    pendingPayroll: number;
    completedAppraisals: number;
    pendingAppraisals: number;
    attendanceRate: number;
    averageWorkingHours: number;
}

interface RecentActivity {
    id: number;
    type: string;
    description: string;
    user: string;
    timestamp: string;
    status: string;
}

interface Props {
    stats: HRStats;
    recentActivities: RecentActivity[];
    upcomingEvents: Array<{
        id: number;
        title: string;
        date: string;
        type: string;
    }>;
}

export default function HRDashboard({ stats, recentActivities, upcomingEvents }: Props) {
    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'leave':
                return <Calendar className="w-4 h-4" />;
            case 'payroll':
                return <DollarSign className="w-4 h-4" />;
            case 'appraisal':
                return <Target className="w-4 h-4" />;
            case 'attendance':
                return <Clock className="w-4 h-4" />;
            case 'staff':
                return <Users className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    const getActivityColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'text-yellow-600';
            case 'approved':
                return 'text-green-600';
            case 'rejected':
                return 'text-red-600';
            case 'completed':
                return 'text-blue-600';
            default:
                return 'text-gray-600';
        }
    };

    const getEventColor = (type: string) => {
        switch (type) {
            case 'payroll':
                return 'bg-green-100 text-green-800';
            case 'appraisal':
                return 'bg-blue-100 text-blue-800';
            case 'leave':
                return 'bg-yellow-100 text-yellow-800';
            case 'meeting':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout>
            <Head title="HR Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-base font-semibold text-gray-900">HR Dashboard</h1>
                        <p className="text-xs text-gray-500">Human Resources Management Overview</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/hr/reports">
                            <Button variant="outline" size="sm">
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Reports
                            </Button>
                        </Link>
                        <Link href="/hr/settings">
                            <Button variant="outline" size="sm">
                                <FileText className="w-4 h-4 mr-2" />
                                Settings
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Key Metrics */}
                <StatGrid cols={4}>
                    <StatCard
                        title="Total Staff"
                        value={stats.totalStaff}
                        icon={Users}
                        color="blue"
                        trendLabel={`${stats.activeStaff} active staff members`}
                    />
                    <StatCard
                        title="Active Staff"
                        value={stats.activeStaff}
                        icon={CheckCircle}
                        color="green"
                        trendLabel="Currently active"
                    />
                    <StatCard
                        title="On Leave"
                        value={stats.approvedLeave}
                        icon={Calendar}
                        color="amber"
                        trendLabel="Approved leave"
                    />
                    <StatCard
                        title="Pending Leave Requests"
                        value={stats.pendingLeave}
                        icon={AlertCircle}
                        color="orange"
                        trendLabel="Awaiting approval"
                    />
                    <StatCard
                        title="Payroll This Month"
                        value={`TZS ${stats.totalPayroll.toLocaleString()}`}
                        icon={DollarSign}
                        color="indigo"
                        trendLabel={`${stats.pendingPayroll} pending approvals`}
                    />
                    <StatCard
                        title="Avg Performance"
                        value={`${stats.attendanceRate}%`}
                        icon={Target}
                        color="teal"
                        trendLabel="Average daily attendance"
                    />
                </StatGrid>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link href="/hr/staff/create">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium">Add Staff</h3>
                                        <p className="text-xs text-gray-500">Register new employee</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/hr/payroll/create">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <DollarSign className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium">Process Payroll</h3>
                                        <p className="text-xs text-gray-500">Run monthly payroll</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/hr/leave/create">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <Calendar className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium">Leave Management</h3>
                                        <p className="text-xs text-gray-500">Manage leave requests</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/hr/attendance/mark">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <Clock className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium">Mark Attendance</h3>
                                        <p className="text-xs text-gray-500">Record daily attendance</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activities */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Recent Activities</CardTitle>
                            <CardDescription className="text-xs">
                                Latest HR activities and updates
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivities.map((activity) => (
                                    <div key={activity.id} className="flex items-start space-x-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            {getActivityIcon(activity.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900">
                                                {activity.description}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {activity.user} • {new Date(activity.timestamp).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Badge className={getActivityColor(activity.status)}>
                                            {activity.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upcoming Events */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Upcoming Events</CardTitle>
                            <CardDescription className="text-xs">
                                Important HR deadlines and events
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {upcomingEvents.map((event) => (
                                    <div key={event.id} className="flex items-center space-x-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900">
                                                {event.title}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(event.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Badge className={getEventColor(event.type)}>
                                            {event.type}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Alerts and Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold">Alerts & Notifications</CardTitle>
                        <CardDescription className="text-xs">
                            Important alerts requiring attention
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.pendingLeave > 0 && (
                                <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                                    <div>
                                        <p className="text-sm font-medium text-yellow-800">
                                            {stats.pendingLeave} leave applications pending approval
                                        </p>
                                        <p className="text-xs text-yellow-600">
                                            Review and approve leave requests
                                        </p>
                                    </div>
                                    <Link href="/hr/leave">
                                        <Button variant="outline" size="sm">
                                            Review
                                        </Button>
                                    </Link>
                                </div>
                            )}

                            {stats.pendingPayroll > 0 && (
                                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                                    <DollarSign className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm font-medium text-blue-800">
                                            {stats.pendingPayroll} payroll records pending approval
                                        </p>
                                        <p className="text-xs text-blue-600">
                                            Approve payroll before processing payments
                                        </p>
                                    </div>
                                    <Link href="/hr/payroll">
                                        <Button variant="outline" size="sm">
                                            Review
                                        </Button>
                                    </Link>
                                </div>
                            )}

                            {stats.pendingAppraisals > 0 && (
                                <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                                    <Target className="w-5 h-5 text-purple-600" />
                                    <div>
                                        <p className="text-sm font-medium text-purple-800">
                                            {stats.pendingAppraisals} performance appraisals pending
                                        </p>
                                        <p className="text-xs text-purple-600">
                                            Complete performance reviews
                                        </p>
                                    </div>
                                    <Link href="/hr/performance">
                                        <Button variant="outline" size="sm">
                                            Review
                                        </Button>
                                    </Link>
                                </div>
                            )}

                            {stats.attendanceRate < 90 && (
                                <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
                                    <Clock className="w-5 h-5 text-red-600" />
                                    <div>
                                        <p className="text-sm font-medium text-red-800">
                                            Low attendance rate: {stats.attendanceRate}%
                                        </p>
                                        <p className="text-xs text-red-600">
                                            Monitor staff attendance patterns
                                        </p>
                                    </div>
                                    <Link href="/hr/attendance">
                                        <Button variant="outline" size="sm">
                                            View
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
