import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard, StatGrid } from '@/components/ui/stat-card';
import {
    Building,
    Bed,
    Users,
    User,
    Calendar,
    AlertCircle,
    CheckCircle,
    Clock,
    TrendingUp,
    TrendingDown,
    Plus,
    Eye,
    Settings,
    FileText,
    Bell,
    Home
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

interface DormitoryManager {
    id: number;
    name: string;
    email: string;
    school_id: number;
}

interface DormitoryManagerDashboardProps {
    dormitoryManager: DormitoryManager;
    school: {
        id: number;
        name: string;
        code: string;
    };
    statistics: {
        total_hostels: number;
        total_rooms: number;
        total_beds: number;
        occupied_beds: number;
        available_beds: number;
        total_residents: number;
        male_residents: number;
        female_residents: number;
        pending_leave_applications: number;
        approved_leave_applications: number;
        residents_on_leave: number;
        maintenance_requests: number;
        completed_maintenance: number;
        occupancy_rate: number;
    };
    hostels: Array<{
        id: number;
        name: string;
        gender: string;
        capacity: number;
        current_occupancy: number;
        occupancy_rate: number;
        warden_name: string;
        building_name: string;
        floor: number;
    }>;
    recentLeaveApplications: Array<{
        id: number;
        student_name: string;
        hostel_name: string;
        leave_type: string;
        start_date: string;
        end_date: string;
        status: string;
        applied_date: string;
    }>;
    residentsOnLeave: Array<{
        id: number;
        student_name: string;
        hostel_name: string;
        room_number: string;
        leave_type: string;
        start_date: string;
        end_date: string;
        destination: string;
        contact_person: string;
    }>;
    maintenanceRequests: Array<{
        id: number;
        hostel_name: string;
        room_number: string;
        issue_type: string;
        description: string;
        priority: string;
        reported_date: string;
        status: string;
        reported_by: string;
    }>;
    upcomingReturns: Array<{
        id: number;
        student_name: string;
        hostel_name: string;
        room_number: string;
        return_date: string;
        leave_type: string;
    }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dormitory Manager',
        href: '/dormitory-manager',
    },
    {
        title: 'Dashboard',
        href: '/dormitory-manager/dashboard',
    },
];

export default function DormitoryManagerDashboard({ 
    dormitoryManager, 
    school, 
    statistics, 
    hostels,
    recentLeaveApplications,
    residentsOnLeave,
    maintenanceRequests,
    upcomingReturns
}: DormitoryManagerDashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dormitory Manager Dashboard" />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-base font-semibold tracking-tight">Dormitory Management</h1>
                        <p className="text-sm text-muted-foreground">
                            {school.name} • Hostel & Dormitory Dashboard
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button asChild>
                            <Link href="/hostel/residents/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Assign Resident
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/hostel/reports">
                                <FileText className="mr-2 h-4 w-4" />
                                Hostel Reports
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Key Dormitory Metrics */}
                <StatGrid cols={4}>
                    <StatCard
                        title="Total Rooms"
                        value={statistics.total_rooms}
                        icon={Building}
                        color="blue"
                    />
                    <StatCard
                        title="Occupied"
                        value={statistics.occupied_beds}
                        icon={Bed}
                        color="rose"
                    />
                    <StatCard
                        title="Available Beds"
                        value={statistics.available_beds}
                        icon={CheckCircle}
                        color="green"
                    />
                    <StatCard
                        title="Residents"
                        value={statistics.total_residents}
                        icon={Users}
                        color="emerald"
                    />
                    <StatCard
                        title="Pending Requests"
                        value={statistics.pending_leave_applications}
                        icon={Clock}
                        color="amber"
                    />
                </StatGrid>

                {/* Hostels Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold">Hostels Overview</CardTitle>
                        <CardDescription className="text-xs">
                            Current status of all hostels
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 overflow-x-auto">
                            {hostels.map((hostel) => (
                                <div key={hostel.id} className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                            <Building className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{hostel.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {hostel.building_name} • Floor {hostel.floor} • {hostel.warden_name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">
                                            {hostel.current_occupancy}/{hostel.capacity} residents
                                        </p>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant={hostel.occupancy_rate >= 90 ? 'destructive' : 'default'}>
                                                {hostel.occupancy_rate}% occupied
                                            </Badge>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/hostel/hostels/${hostel.id}`}>
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

                {/* Recent Leave Applications and Maintenance Requests */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Recent Leave Applications</CardTitle>
                            <CardDescription className="text-xs">
                                Latest leave applications from residents
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentLeaveApplications.map((application) => (
                                    <div key={application.id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                                <Calendar className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{application.student_name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {application.hostel_name} • {application.leave_type}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">
                                                {application.start_date} - {application.end_date}
                                            </p>
                                            <Badge variant={application.status === 'approved' ? 'default' : 'secondary'}>
                                                {application.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/hostel/leave-records">
                                        View All Leave Applications
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Maintenance Requests</CardTitle>
                            <CardDescription className="text-xs">
                                Recent maintenance and repair requests
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {maintenanceRequests.map((request) => (
                                    <div key={request.id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                                                <Settings className="h-4 w-4 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{request.issue_type}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {request.hostel_name} • Room {request.room_number}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{request.priority}</p>
                                            <Badge variant={request.status === 'completed' ? 'default' : 'secondary'}>
                                                {request.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/hostel/maintenance">
                                        View All Maintenance Requests
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Residents on Leave and Upcoming Returns */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Residents on Leave</CardTitle>
                            <CardDescription className="text-xs">
                                Students currently on leave
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {residentsOnLeave.map((resident) => (
                                    <div key={resident.id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                                <User className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{resident.student_name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {resident.hostel_name} • Room {resident.room_number}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{resident.leave_type}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Until: {resident.end_date}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Upcoming Returns</CardTitle>
                            <CardDescription className="text-xs">
                                Residents returning from leave soon
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {upcomingReturns.map((return_) => (
                                    <div key={return_.id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                                <Home className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{return_.student_name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {return_.hostel_name} • Room {return_.room_number}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">Returns: {return_.return_date}</p>
                                            <Badge variant="outline">{return_.leave_type}</Badge>
                                        </div>
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
                            Common dormitory management tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                            <Button variant="outline" className="h-auto flex-col p-4" asChild>
                                <Link href="/hostel/residents/create">
                                    <Plus className="mb-2 h-6 w-6" />
                                    <span className="text-sm">Assign Resident</span>
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-auto flex-col p-4" asChild>
                                <Link href="/hostel/leave-records">
                                    <Calendar className="mb-2 h-6 w-6" />
                                    <span className="text-sm">Manage Leave</span>
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-auto flex-col p-4" asChild>
                                <Link href="/hostel/maintenance">
                                    <Settings className="mb-2 h-6 w-6" />
                                    <span className="text-sm">Maintenance</span>
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-auto flex-col p-4" asChild>
                                <Link href="/hostel/reports">
                                    <FileText className="mb-2 h-6 w-6" />
                                    <span className="text-sm">Hostel Reports</span>
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}



