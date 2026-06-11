import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    ArrowLeft,
    School as SchoolIcon,
    Users,
    GraduationCap,
    Building2,
    MapPin,
    Phone,
    Mail,
    Calendar,
    CheckCircle,
    XCircle,
    AlertCircle,
    Edit,
    ToggleLeft,
    ToggleRight,
} from 'lucide-react';
import { School, User } from '@/types';

interface SuperAdminSchoolShowProps {
    school: School & {
        users: User[];
        statistics: {
            total_students: number;
            total_teachers: number;
            total_staff: number;
            total_classes: number;
            total_subjects: number;
        };
    };
}

export default function SuperAdminSchoolShow({ school }: SuperAdminSchoolShowProps) {
    const getRoleBadge = (role: string) => {
        const roleColors: Record<string, string> = {
            'super_admin': 'bg-purple-100 text-purple-800',
            'school_admin': 'bg-blue-100 text-blue-800',
            'headteacher': 'bg-indigo-100 text-indigo-800',
            'bursar': 'bg-green-100 text-green-800',
            'librarian': 'bg-yellow-100 text-yellow-800',
            'dormitory_manager': 'bg-orange-100 text-orange-800',
            'academic_master': 'bg-pink-100 text-pink-800',
            'teacher': 'bg-teal-100 text-teal-800',
            'student': 'bg-gray-100 text-gray-800',
            'parent': 'bg-cyan-100 text-cyan-800',
        };
        const displayName = role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        return <Badge className={roleColors[role] || 'bg-gray-100 text-gray-800'}>{displayName}</Badge>;
    };

    return (
        <AppLayout title={`School: ${school.name}`}>
            <Head title={`School: ${school.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <Link href="/super-admin/schools">
                                        <Button variant="outline" size="sm" className="mr-4">
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Back to Schools
                                        </Button>
                                    </Link>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                            <SchoolIcon className="h-8 w-8 mr-3 text-blue-600" />
                                            {school.name}
                                        </h2>
                                        <p className="text-gray-600">{school.motto}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Link href={`/super-admin/schools/${school.id}/edit`}>
                                        <Button variant="outline">
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit School
                                        </Button>
                                    </Link>
                                    <Button
                                        variant={school.is_active ? "destructive" : "default"}
                                        onClick={() => {
                                            // Handle toggle status
                                        }}
                                    >
                                        {school.is_active ? (
                                            <><ToggleLeft className="h-4 w-4 mr-2" /> Deactivate</>
                                        ) : (
                                            <><ToggleRight className="h-4 w-4 mr-2" /> Activate</>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Status Alert */}
                            {!school.is_active && (
                                <Alert variant="destructive" className="mb-6">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        This school is currently inactive.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Statistics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center">
                                            <Users className="h-8 w-8 text-blue-600 mr-3" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Total Students</p>
                                                <p className="text-2xl font-bold">{school.statistics.total_students}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center">
                                            <GraduationCap className="h-8 w-8 text-green-600 mr-3" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Total Teachers</p>
                                                <p className="text-2xl font-bold">{school.statistics.total_teachers}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center">
                                            <Building2 className="h-8 w-8 text-purple-600 mr-3" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                                                <p className="text-2xl font-bold">{school.statistics.total_staff}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p4">
                                        <div className="flex items-center">
                                            <SchoolIcon className="h-8 w-8 text-orange-600 mr-3" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Total Classes</p>
                                                <p className="text-2xl font-bold">{school.statistics.total_classes}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center">
                                            <GraduationCap className="h-8 w-8 text-teal-600 mr-3" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Total Subjects</p>
                                                <p className="text-2xl font-bold">{school.statistics.total_subjects}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* School Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>School Information</CardTitle>
                                        <CardDescription>Basic details about the school</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center">
                                                <SchoolIcon className="h-5 w-5 text-gray-400 mr-3" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{school.name}</p>
                                                    <p className="text-sm text-gray-500">School Name</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center">
                                                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{school.address}</p>
                                                    <p className="text-sm text-gray-500">Address</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{school.region}, {school.district}</p>
                                                    <p className="text-sm text-gray-500">Location</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{school.contact_phone}</p>
                                                    <p className="text-sm text-gray-500">Phone</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{school.contact_email}</p>
                                                    <p className="text-sm text-gray-500">Email</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{school.school_level}</p>
                                                    <p className="text-sm text-gray-500">School Level</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                {school.is_active ? (
                                                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-500 mr-3" />
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {school.is_active ? 'Active' : 'Inactive'}
                                                    </p>
                                                    <p className="text-sm text-gray-500">Status</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Registration Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Registration Information</CardTitle>
                                        <CardDescription>Official registration details</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Registration Number</p>
                                                <p className="text-sm text-gray-500">{school.registration_number || 'Not provided'}</p>
                                            </div>
                                            
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">NECTA Number</p>
                                                <p className="text-sm text-gray-500">{school.necta_number || 'Not provided'}</p>
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium text-gray-900">School Code</p>
                                                <p className="text-sm text-gray-500">{school.code || 'Not provided'}</p>
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Created</p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(school.created_at).toLocaleDateString()}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Last Updated</p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(school.updated_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* School Users */}
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>School Users ({school.users.length})</CardTitle>
                                    <CardDescription>All users associated with this school</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {school.users.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            No users found for this school.
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Role</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Last Login</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {school.users.map((user) => (
                                                    <TableRow key={user.id}>
                                                        <TableCell className="font-medium">
                                                            {user.name}
                                                        </TableCell>
                                                        <TableCell>{user.email}</TableCell>
                                                        <TableCell>
                                                            {getRoleBadge(user.role)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={user.is_active ? "default" : "secondary"}>
                                                                {user.is_active ? "Active" : "Inactive"}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {user.last_login_at 
                                                                ? new Date(user.last_login_at).toLocaleDateString()
                                                                : 'Never'
                                                            }
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                
            </div>
        </AppLayout>
    );
}



