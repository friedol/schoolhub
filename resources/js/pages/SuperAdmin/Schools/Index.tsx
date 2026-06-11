import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Plus,
    Search,
    Eye,
    Edit,
    ToggleLeft,
    ToggleRight,
    School as SchoolIcon,
    CheckCircle,
    XCircle,
    AlertCircle,
    Users,
    GraduationCap,
    Building2,
} from 'lucide-react';
import { School } from '@/types';

interface SuperAdminSchoolsIndexProps {
    schools: {
        data: School[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        region?: string;
        level?: string;
        status?: string;
    };
    regions: string[];
}

export default function SuperAdminSchoolsIndex({ schools, filters, regions }: SuperAdminSchoolsIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [regionFilter, setRegionFilter] = useState(filters.region || '');
    const [levelFilter, setLevelFilter] = useState(filters.level || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleFilterChange = () => {
        router.get(
            '/super-admin/schools',
            { 
                search: searchTerm, 
                region: regionFilter, 
                level: levelFilter, 
                status: statusFilter 
            },
            { preserveState: true, replace: true }
        );
    };

    const handleToggleStatus = (schoolId: number, currentStatus: boolean) => {
        router.patch(
            `/super-admin/schools/${schoolId}/toggle-status`,
            { is_active: !currentStatus },
            {
                onSuccess: () => {
                    setMessage({ type: 'success', text: 'School status updated successfully.' });
                },
                onError: (errors) => {
                    setMessage({ type: 'error', text: Object.values(errors)[0] as string });
                },
            }
        );
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
            </Badge>
        ) : (
            <Badge variant="secondary" className="bg-red-100 text-red-800">
                <XCircle className="h-3 w-3 mr-1" />
                Inactive
            </Badge>
        );
    };

    const getLevelBadge = (level: string) => {
        const levelColors: Record<string, string> = {
            'nursery': 'bg-pink-100 text-pink-800',
            'primary': 'bg-blue-100 text-blue-800',
            'secondary': 'bg-green-100 text-green-800',
            'advanced_level': 'bg-purple-100 text-purple-800',
        };
        const displayName = level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        return <Badge className={levelColors[level] || 'bg-gray-100 text-gray-800'}>{displayName}</Badge>;
    };

    return (
        <AppLayout title="Manage Schools">
            <Head title="Manage Schools" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                        <SchoolIcon className="h-8 w-8 mr-3 text-blue-600" />
                                        Manage Schools
                                    </h2>
                                    <p className="text-gray-600">Oversee all schools within the platform.</p>
                                </div>
                                <Link href="/super-admin/schools/create">
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add New School
                                    </Button>
                                </Link>
                            </div>

                            {message && (
                                <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                                    {message.type === 'error' ? (
                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    )}
                                    <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
                                        {message.text}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Statistics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center">
                                            <Building2 className="h-8 w-8 text-blue-600 mr-3" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Total Schools</p>
                                                <p className="text-2xl font-bold">{schools.total}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center">
                                            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Active Schools</p>
                                                <p className="text-2xl font-bold">
                                                    {schools.data.filter(school => school.is_active).length}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center">
                                            <XCircle className="h-8 w-8 text-red-600 mr-3" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Inactive Schools</p>
                                                <p className="text-2xl font-bold">
                                                    {schools.data.filter(school => !school.is_active).length}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center">
                                            <Users className="h-8 w-8 text-purple-600 mr-3" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Total Students</p>
                                                <p className="text-2xl font-bold">
                                                    {schools.data.reduce((sum, school) => sum + (school.student_count || 0), 0)}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Filters */}
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle>Filters</CardTitle>
                                    <CardDescription>Filter schools by various criteria</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder="Search schools..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                onBlur={handleFilterChange}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') handleFilterChange();
                                                }}
                                                className="pl-10"
                                            />
                                        </div>

                                        <Select
                                            value={regionFilter}
                                            onValueChange={(value) => {
                                                setRegionFilter(value);
                                                handleFilterChange();
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Filter by Region" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Regions</SelectItem>
                                                {regions.map((region) => (
                                                    <SelectItem key={region} value={region}>
                                                        {region}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select
                                            value={levelFilter}
                                            onValueChange={(value) => {
                                                setLevelFilter(value);
                                                handleFilterChange();
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Filter by Level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Levels</SelectItem>
                                                <SelectItem value="nursery">Nursery</SelectItem>
                                                <SelectItem value="primary">Primary</SelectItem>
                                                <SelectItem value="secondary">Secondary</SelectItem>
                                                <SelectItem value="advanced_level">Advanced Level</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select
                                            value={statusFilter}
                                            onValueChange={(value) => {
                                                setStatusFilter(value);
                                                handleFilterChange();
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Filter by Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Statuses</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Schools Table */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Schools ({schools.total})</CardTitle>
                                    <CardDescription>
                                        View and manage all registered schools.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {schools.data.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            No schools found matching your criteria.
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>School Name</TableHead>
                                                    <TableHead>Location</TableHead>
                                                    <TableHead>Level</TableHead>
                                                    <TableHead>Students</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Created</TableHead>
                                                    <TableHead>Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {schools.data.map((school) => (
                                                    <TableRow key={school.id}>
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium">{school.name}</div>
                                                                <div className="text-sm text-gray-500">{school.motto}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <div className="text-sm">{school.region}</div>
                                                                <div className="text-sm text-gray-500">{school.district}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {getLevelBadge(school.school_level)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center">
                                                                <Users className="h-4 w-4 mr-1 text-gray-400" />
                                                                {school.student_count || 0}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {getStatusBadge(school.is_active)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(school.created_at).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center space-x-2">
                                                                <Link href={`/super-admin/schools/${school.id}`}>
                                                                    <Button variant="outline" size="sm">
                                                                        <Eye className="h-4 w-4 mr-1" />
                                                                        View
                                                                    </Button>
                                                                </Link>
                                                                <Link href={`/super-admin/schools/${school.id}/edit`}>
                                                                    <Button variant="outline" size="sm">
                                                                        <Edit className="h-4 w-4 mr-1" />
                                                                        Edit
                                                                    </Button>
                                                                </Link>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleToggleStatus(school.id, school.is_active)}
                                                                >
                                                                    {school.is_active ? (
                                                                        <><ToggleLeft className="h-4 w-4 mr-1" /> Deactivate</>
                                                                    ) : (
                                                                        <><ToggleRight className="h-4 w-4 mr-1" /> Activate</>
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Pagination */}
                            {schools.last_page > 1 && (
                                <div className="flex items-center justify-between mt-6">
                                    <div className="text-sm text-gray-700">
                                        Showing {((schools.current_page - 1) * schools.per_page) + 1} to{' '}
                                        {Math.min(schools.current_page * schools.per_page, schools.total)} of{' '}
                                        {schools.total} results
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={schools.current_page === 1}
                                            onClick={() => {
                                                router.get('/super-admin/schools', {
                                                    ...filters,
                                                    page: schools.current_page - 1
                                                });
                                            }}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={schools.current_page === schools.last_page}
                                            onClick={() => {
                                                router.get('/super-admin/schools', {
                                                    ...filters,
                                                    page: schools.current_page + 1
                                                });
                                            }}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                
            </div>
        </AppLayout>
    );
}



