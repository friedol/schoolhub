import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { School } from '@/types';
import { Plus, Search, Eye, Edit, ToggleLeft, ToggleRight } from 'lucide-react';

interface SuperAdminSchoolsProps {
    schools: School[];
    statistics: {
        total_schools: number;
        active_schools: number;
        inactive_schools: number;
        total_students: number;
        total_teachers: number;
    };
}

export default function SuperAdminSchools({ schools, statistics }: SuperAdminSchoolsProps) {
    const { props } = usePage();

    return (
        <AppLayout
            title="Schools Management"
            breadcrumbs={[
                { title: 'Dashboard', href: '/super-admin/dashboard' },
                { title: 'Schools', href: '/super-admin/schools' },
            ]}
        >
            <Head title="Schools Management" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Schools Management</h1>
                        <p className="text-muted-foreground">
                            Manage all schools in your platform.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/super-admin/schools/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add School
                        </Link>
                    </Button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.total_schools}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Schools</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{statistics.active_schools}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Inactive Schools</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{statistics.inactive_schools}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.total_students}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.total_teachers}</div>
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
                                <Label htmlFor="search">Search Schools</Label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Search by name, region, or district..."
                                        className="pl-8"
                                    />
                                </div>
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
                            <div className="space-y-2">
                                <Label htmlFor="level">School Level</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All levels" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Levels</SelectItem>
                                        <SelectItem value="nursery">Nursery</SelectItem>
                                        <SelectItem value="primary">Primary</SelectItem>
                                        <SelectItem value="secondary">Secondary</SelectItem>
                                        <SelectItem value="advanced">Advanced Level</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Schools Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Schools</CardTitle>
                        <CardDescription>
                            A list of all schools in your platform.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {schools.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">No schools found.</p>
                                    <Button asChild className="mt-4">
                                        <Link href="/super-admin/schools/create">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Your First School
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {schools.map((school) => (
                                        <Card key={school.id} className="hover:shadow-md transition-shadow">
                                            <CardContent className="p-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3">
                                                            <h3 className="text-lg font-semibold">{school.name}</h3>
                                                            <Badge variant={school.is_active ? "default" : "secondary"}>
                                                                {school.is_active ? "Active" : "Inactive"}
                                                            </Badge>
                                                            <Badge variant="outline">
                                                                {school.school_level}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {school.description}
                                                        </p>
                                                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                                                            <span>📍 {school.region}, {school.district}</span>
                                                            <span>📧 {school.contact_email}</span>
                                                            <span>📞 {school.contact_phone}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/super-admin/schools/${school.id}`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/super-admin/schools/${school.id}/edit`}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => {
                                                                // Toggle school status
                                                                // This would call the toggle-status endpoint
                                                            }}
                                                        >
                                                            {school.is_active ? (
                                                                <ToggleRight className="h-4 w-4 text-green-600" />
                                                            ) : (
                                                                <ToggleLeft className="h-4 w-4 text-gray-400" />
                                                            )}
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
