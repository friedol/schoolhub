import { useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Building2, 
    School, 
    Users, 
    GraduationCap,
    User,
    MessageSquare,
    Settings,
    BarChart3,
    BookOpen,
    Book,
    Calendar,
    CreditCard,
    Library,
    Package,
    Bus,
    Building,
    Bell,
    Calculator,
    Receipt,
    ClipboardList
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    school_id?: number;
    platform_id?: number;
}

interface DashboardProps {
    auth: {
        user: User;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ auth }: DashboardProps) {
    const { user } = auth;

    // Redirect based on user role
    useEffect(() => {
        const redirectPath = getRedirectPath(user.role);
        if (redirectPath !== '/dashboard') {
            router.visit(redirectPath, { replace: true });
        }
    }, [user.role]);

    const getRedirectPath = (role: string): string => {
        switch (role) {
            case 'super_admin':
                return '/super-admin/dashboard';
            case 'school_admin':
            case 'headteacher':
                return '/school-admin/dashboard';
            case 'bursar':
                return '/bursar/dashboard';
            case 'librarian':
                return '/librarian/dashboard';
            case 'dormitory_manager':
                return '/dormitory-manager/dashboard';
            case 'academic_master':
                return '/academic-master/dashboard';
            case 'teacher':
                return '/teacher/dashboard';
            case 'student':
                return '/student/dashboard';
            case 'parent':
                return '/parent/dashboard';
            default:
                return '/dashboard';
        }
    };

    const getRoleDisplayName = (role: string): string => {
        switch (role) {
            case 'super_admin':
                return 'Super Administrator';
            case 'school_admin':
                return 'School Administrator';
            case 'headteacher':
                return 'Headteacher';
            case 'bursar':
                return 'Bursar';
            case 'librarian':
                return 'Librarian';
            case 'dormitory_manager':
                return 'Dormitory Manager';
            case 'academic_master':
                return 'Academic Master';
            case 'teacher':
                return 'Teacher';
            case 'student':
                return 'Student';
            case 'parent':
                return 'Parent';
            default:
                return 'User';
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'super_admin':
                return Building2;
            case 'school_admin':
            case 'headteacher':
            case 'bursar':
                return School;
            case 'teacher':
                return GraduationCap;
            case 'student':
                return User;
            case 'parent':
                return Users;
            default:
                return User;
        }
    };

    const getRoleDescription = (role: string): string => {
        switch (role) {
            case 'super_admin':
                return 'Manage the entire platform, all schools, and system settings';
            case 'school_admin':
                return 'Manage your school, staff, students, and academic programs';
            case 'headteacher':
                return 'Oversee academic programs, staff, and school operations';
            case 'bursar':
                return 'Manage financial operations, fees, and school finances';
            case 'librarian':
                return 'Manage library resources, book circulation, and fines';
            case 'dormitory_manager':
                return 'Manage hostel operations, resident assignments, and maintenance';
            case 'academic_master':
                return 'Oversee academic programs, student admissions, and examinations';
            case 'teacher':
                return 'Manage your classes, assessments, and student progress';
            case 'student':
                return 'View your academic progress, timetable, and assignments';
            case 'parent':
                return 'Monitor your children\'s progress and communicate with school';
            default:
                return 'Access your personalized dashboard';
        }
    };

    const getQuickActions = (role: string) => {
        switch (role) {
            case 'super_admin':
                return [
                    { name: 'Manage Schools', href: '/super-admin/schools', icon: School },
                    { name: 'Platform Settings', href: '/super-admin/settings', icon: Settings },
                    { name: 'Generate Reports', href: '/super-admin/reports', icon: BarChart3 },
                    { name: 'User Management', href: '/super-admin/users', icon: Users },
                ];
            case 'school_admin':
            case 'headteacher':
                return [
                    { name: 'School Overview', href: '/school-admin/dashboard', icon: School },
                    { name: 'Student Management', href: '/students/profiles', icon: Users },
                    { name: 'Academic Management', href: '/academic/curriculum', icon: GraduationCap },
                    { name: 'Financial Management', href: '/finance/student-fees', icon: CreditCard },
                ];
            case 'bursar':
                return [
                    { name: 'Financial Dashboard', href: '/bursar/dashboard', icon: Calculator },
                    { name: 'Fee Management', href: '/finance/student-fees', icon: CreditCard },
                    { name: 'Payment Records', href: '/finance/payments', icon: Receipt },
                    { name: 'Financial Reports', href: '/finance/reports', icon: BarChart3 },
                ];
            case 'librarian':
                return [
                    { name: 'Library Dashboard', href: '/librarian/dashboard', icon: Library },
                    { name: 'Book Catalog', href: '/library/books', icon: Book },
                    { name: 'Book Issuance', href: '/library/issuance', icon: BookOpen },
                    { name: 'Fine Management', href: '/library/fines', icon: CreditCard },
                ];
            case 'dormitory_manager':
                return [
                    { name: 'Dormitory Dashboard', href: '/dormitory-manager/dashboard', icon: Building },
                    { name: 'Hostel Management', href: '/hostel/hostels', icon: Building },
                    { name: 'Resident Management', href: '/hostel/residents', icon: Users },
                    { name: 'Leave Management', href: '/hostel/leave-records', icon: Calendar },
                ];
            case 'academic_master':
                return [
                    { name: 'Academic Dashboard', href: '/academic-master/dashboard', icon: GraduationCap },
                    { name: 'Student Applications', href: '/students/applications', icon: Users },
                    { name: 'Assessment Management', href: '/academic/assessments', icon: ClipboardList },
                    { name: 'Academic Reports', href: '/academic/reports', icon: BarChart3 },
                ];
            case 'teacher':
                return [
                    { name: 'My Classes', href: '/academic/classes', icon: GraduationCap },
                    { name: 'Create Assessment', href: '/academic/assessments/create', icon: BookOpen },
                    { name: 'Mark Attendance', href: '/students/attendance', icon: Calendar },
                    { name: 'View Results', href: '/academic/assessments', icon: BarChart3 },
                ];
            case 'student':
                return [
                    { name: 'My Results', href: '/student/results', icon: BookOpen },
                    { name: 'My Timetable', href: '/student/timetable', icon: Calendar },
                    { name: 'My Assignments', href: '/student/assignments', icon: BookOpen },
                    { name: 'Library', href: '/student/book-catalog', icon: Library },
                ];
            case 'parent':
                return [
                    { name: 'My Children', href: '/parent/children', icon: Users },
                    { name: 'Academic Progress', href: '/parent/academic-progress', icon: GraduationCap },
                    { name: 'Fee Payments', href: '/parent/fee-payments', icon: CreditCard },
                    { name: 'Messages', href: '/parent/messages', icon: MessageSquare },
                ];
            default:
                return [];
        }
    };

    const RoleIcon = getRoleIcon(user.role);
    const quickActions = getQuickActions(user.role);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Welcome Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Welcome back, {user.name}!
                        </h1>
                        <p className="text-muted-foreground">
                            {getRoleDescription(user.role)}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <RoleIcon className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                </div>

                {/* Role Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <RoleIcon className="h-5 w-5" />
                            <span>{getRoleDisplayName(user.role)}</span>
                        </CardTitle>
                        <CardDescription>
                            {getRoleDescription(user.role)}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {quickActions.map((action) => {
                                const ActionIcon = action.icon;
                                return (
                                    <Button
                                        key={action.name}
                                        variant="outline"
                                        className="h-auto flex-col p-4"
                                        asChild
                                    >
                                        <Link href={action.href}>
                                            <ActionIcon className="mb-2 h-6 w-6" />
                                            <span>{action.name}</span>
                                        </Link>
                                    </Button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* System Information */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>System Status</CardTitle>
                            <CardDescription>
                                Current system status and information
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">System Status</span>
                                    <Badge variant="default">Online</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Last Login</span>
                                    <span className="text-sm text-muted-foreground">
                                        {new Date().toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">User Role</span>
                                    <span className="text-sm text-muted-foreground">
                                        {getRoleDisplayName(user.role)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Links</CardTitle>
                            <CardDescription>
                                Frequently used features and tools
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href="/profile">
                                        <User className="mr-2 h-4 w-4" />
                                        My Profile
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href="/settings">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Settings
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href="/help">
                                        <MessageSquare className="mr-2 h-4 w-4" />
                                        Help & Support
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Redirect Notice */}
                <Card>
                    <CardHeader>
                        <CardTitle>Redirecting...</CardTitle>
                        <CardDescription>
                            You will be redirected to your role-specific dashboard shortly.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            <span className="text-sm text-muted-foreground">
                                Redirecting to {getRoleDisplayName(user.role)} dashboard...
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}