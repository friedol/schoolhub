import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AppLayout from '@/layouts/app-layout';
import { User } from '@/types';
import { Plus, Search, Eye, Edit, Trash2, Shield, UserCheck } from 'lucide-react';

interface SystemUsersProps {
    users: User[];
    statistics: {
        total_users: number;
        active_users: number;
        inactive_users: number;
        super_admins: number;
        school_admins: number;
        teachers: number;
        students: number;
        parents: number;
    };
}

export default function SystemUsers({ users, statistics }: SystemUsersProps) {
    const { props } = usePage();

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'super_admin':
                return 'destructive';
            case 'school_admin':
            case 'headteacher':
                return 'default';
            case 'teacher':
                return 'secondary';
            case 'student':
                return 'outline';
            case 'parent':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    const getRoleDisplayName = (role: string) => {
        return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <AppLayout
            title="User Management"
            breadcrumbs={[
                { title: 'Dashboard', href: '/super-admin/dashboard' },
                { title: 'System Configuration', href: '/system/configurations' },
                { title: 'User Management', href: '/system/users' },
            ]}
        >
            <Head title="User Management" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                        <p className="text-muted-foreground">
                            Manage all users across your platform.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/system/users/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add User
                        </Link>
                    </Button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.total_users}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                            <UserCheck className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{statistics.active_users}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
                            <Shield className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{statistics.super_admins}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">School Admins</CardTitle>
                            <Shield className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{statistics.school_admins}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Role Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.teachers}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Students</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.students}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Parents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.parents}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="search">Search Users</Label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Search by name or email..."
                                        className="pl-8"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All roles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="super_admin">Super Admin</SelectItem>
                                        <SelectItem value="school_admin">School Admin</SelectItem>
                                        <SelectItem value="headteacher">Headteacher</SelectItem>
                                        <SelectItem value="teacher">Teacher</SelectItem>
                                        <SelectItem value="student">Student</SelectItem>
                                        <SelectItem value="parent">Parent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Users</CardTitle>
                        <CardDescription>
                            A list of all users in your platform.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {users.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">No users found.</p>
                                    <Button asChild className="mt-4">
                                        <Link href="/system/users/create">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Your First User
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {users.map((user) => (
                                        <Card key={user.id} className="hover:shadow-md transition-shadow">
                                            <CardContent className="p-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        <Avatar className="h-12 w-12">
                                                            <AvatarImage src={user.avatar} alt={user.name} />
                                                            <AvatarFallback>
                                                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-3">
                                                                <h3 className="text-lg font-semibold">{user.name}</h3>
                                                                <Badge variant={getRoleBadgeVariant(user.role || '')}>
                                                                    {getRoleDisplayName(user.role || '')}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                {user.email}
                                                            </p>
                                                            <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                                                                <span>ID: {user.id}</span>
                                                                <span>Created: {new Date(user.created_at).toLocaleDateString()}</span>
                                                                {user.email_verified_at && (
                                                                    <Badge variant="outline" className="text-green-600">
                                                                        Verified
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/system/users/${user.id}`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/system/users/${user.id}/edit`}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            className="text-red-600 hover:text-red-700"
                                                            onClick={() => {
                                                                // Delete user
                                                                // This would call the delete endpoint
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
