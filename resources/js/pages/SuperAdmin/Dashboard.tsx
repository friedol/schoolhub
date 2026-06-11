import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard, StatGrid } from '@/components/ui/stat-card';
import {
    Building2,
    School,
    Users,
    Plus,
    Eye,
    Settings,
    BarChart3,
    MapPin,
    DollarSign,
    CheckCircle,
    XCircle,
    Clock,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

interface Platform {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    is_active: boolean;
    subscription_plan: string;
    created_at: string;
    schools_count: number;
    users_count: number;
}

interface SchoolItem {
    id: number;
    name: string;
    code: string;
    address: string;
    region: string;
    district: string;
    level: string;
    is_active: boolean;
    created_at: string;
    students_count: number;
    teachers_count: number;
}

interface SuperAdminDashboardProps {
    platforms: Platform[];
    schools: SchoolItem[];
    statistics: {
        total_platforms: number;
        total_schools: number;
        total_students: number;
        total_teachers: number;
        total_revenue: number;
        active_schools: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Super Admin',
        href: '/super-admin',
    },
    {
        title: 'Dashboard',
        href: '/super-admin/dashboard',
    },
];

export default function SuperAdminDashboard({
    platforms,
    schools,
    statistics,
}: SuperAdminDashboardProps) {
    const stats = statistics ?? {
        total_platforms: 0,
        total_schools: 0,
        total_students: 0,
        total_teachers: 0,
        total_revenue: 0,
        active_schools: 0,
    };

    const inactiveSchools = stats.total_schools - stats.active_schools;
    const totalUsers = stats.total_students + stats.total_teachers;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Super Admin Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-base font-semibold tracking-tight">Platform Overview</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage and monitor all schools across the platform
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button size="sm" asChild>
                            <Link href="/super-admin/schools/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Add School
                            </Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                            <Link href="/super-admin/reports">
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Reports
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <StatGrid cols={3}>
                    <StatCard
                        title="Total Schools"
                        value={stats.total_schools}
                        icon={School}
                        color="blue"
                        trend="stable"
                        trendLabel="All schools"
                    />
                    <StatCard
                        title="Active Schools"
                        value={stats.active_schools}
                        icon={CheckCircle}
                        color="green"
                        trend="up"
                        trendLabel={`${stats.total_schools > 0 ? ((stats.active_schools / stats.total_schools) * 100).toFixed(1) : 0}% of total`}
                    />
                    <StatCard
                        title="Inactive Schools"
                        value={inactiveSchools}
                        icon={XCircle}
                        color="slate"
                        trend={inactiveSchools > 0 ? 'down' : 'stable'}
                        trendLabel="Inactive"
                    />
                    <StatCard
                        title="Total Users"
                        value={totalUsers}
                        icon={Users}
                        color="indigo"
                        trend="stable"
                        trendLabel="Students + teachers"
                    />
                    <StatCard
                        title="Platform Revenue"
                        value={`TZS ${stats.total_revenue.toLocaleString()}`}
                        icon={DollarSign}
                        color="emerald"
                        trend="up"
                        trendLabel="This month"
                    />
                    <StatCard
                        title="Pending Approvals"
                        value={stats.total_platforms}
                        icon={Clock}
                        color="amber"
                        trend="stable"
                        trendLabel="Managed platforms"
                    />
                </StatGrid>

                {/* Recent Schools */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Recent Schools</CardTitle>
                            <CardDescription className="text-xs">
                                Latest schools added to the platform
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {schools?.slice(0, 5).map((school) => (
                                    <div key={school.id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                                <School className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{school.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {school.region}, {school.district}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant={school.is_active ? 'default' : 'secondary'} className="text-xs">
                                                {school.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/super-admin/schools/${school.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4">
                                <Button variant="outline" className="w-full text-sm" asChild>
                                    <Link href="/super-admin/schools">
                                        View All Schools
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Platform Management</CardTitle>
                            <CardDescription className="text-xs">
                                Quick actions for platform administration
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <Button variant="outline" className="w-full justify-start text-sm" asChild>
                                    <Link href="/super-admin/schools">
                                        <School className="mr-2 h-4 w-4" />
                                        Manage Schools
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start text-sm" asChild>
                                    <Link href="/super-admin/users">
                                        <Users className="mr-2 h-4 w-4" />
                                        Manage Users
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start text-sm" asChild>
                                    <Link href="/super-admin/settings">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Platform Settings
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start text-sm" asChild>
                                    <Link href="/super-admin/reports">
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        Generate Reports
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Schools by Region */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold">Schools by Region</CardTitle>
                        <CardDescription className="text-xs">
                            Distribution of schools across Tanzania
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {Array.from(new Set(schools?.map((s) => s.region) ?? [])).map((region) => {
                                const regionSchools = schools.filter((s) => s.region === region);
                                return (
                                    <div key={region} className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="flex items-center space-x-3">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">{region}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {regionSchools.length} schools
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            {regionSchools.filter((s) => s.is_active).length} active
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
