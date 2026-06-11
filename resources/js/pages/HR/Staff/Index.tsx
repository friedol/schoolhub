import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatCard, StatGrid } from '@/components/ui/stat-card';
import { Plus, Users, GraduationCap, FileText, Eye, Edit, Trash2, Phone, Mail, MapPin, Calendar, AlertTriangle } from 'lucide-react';

interface Staff {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    employee_id: string;
    date_of_birth: string;
    gender: string;
    address: string;
    is_active: boolean;
    created_at: string;
    staff_profile?: {
        tsc_number: string;
        designation: string;
        date_of_joining: string;
        is_teaching_staff: boolean;
    };
    qualifications_count: number;
    documents_count: number;
    salary_structure?: {
        name: string;
        basic_salary: number;
    };
}

interface Props {
    staff: {
        data: Staff[];
        links: any[];
        meta: any;
    };
    departments: Array<{ id: number; name: string }>;
}

export default function StaffIndex({ staff, departments }: Props) {
    const [departmentFilter, setDepartmentFilter] = useState<string>('');
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'teacher':
                return 'bg-blue-100 text-blue-800';
            case 'headteacher':
                return 'bg-purple-100 text-purple-800';
            case 'bursar':
                return 'bg-green-100 text-green-800';
            case 'librarian':
                return 'bg-orange-100 text-orange-800';
            case 'dormitory_manager':
                return 'bg-pink-100 text-pink-800';
            case 'academic_master':
                return 'bg-indigo-100 text-indigo-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredStaff = staff.data.filter(member => {
        if (departmentFilter && member.staff_profile?.designation !== departmentFilter) return false;
        if (roleFilter && member.role !== roleFilter) return false;
        if (statusFilter) {
            if (statusFilter === 'active' && !member.is_active) return false;
            if (statusFilter === 'inactive' && member.is_active) return false;
        }
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                member.name.toLowerCase().includes(searchLower) ||
                member.email.toLowerCase().includes(searchLower) ||
                member.phone.includes(searchTerm) ||
                member.employee_id.toLowerCase().includes(searchLower)
            );
        }
        return true;
    });

    const statsData = {
        total: staff.data.length,
        active: staff.data.filter(s => s.is_active).length,
        teachers: staff.data.filter(s => s.role === 'teacher').length,
        nonTeaching: staff.data.filter(s => s.role !== 'teacher').length,
    };

    return (
        <AppLayout>
            <Head title="Staff Management" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-base font-semibold text-gray-900">Staff Management</h1>
                        <p className="text-xs text-gray-500">Manage school staff profiles and information</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/hr/staff/reports">
                            <Button variant="outline" size="sm">
                                <FileText className="w-4 h-4 mr-2" />
                                Reports
                            </Button>
                        </Link>
                        <Link href="/hr/staff/create">
                            <Button size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Staff
                            </Button>
                        </Link>
                    </div>
                </div>

                <StatGrid cols={4}>
                    <StatCard
                        title="Total Staff"
                        value={statsData.total}
                        icon={Users}
                        color="blue"
                        trendLabel="All staff members"
                    />
                    <StatCard
                        title="Teaching Staff"
                        value={statsData.teachers}
                        icon={GraduationCap}
                        color="indigo"
                        trendLabel="Teaching staff"
                    />
                    <StatCard
                        title="Non-Teaching"
                        value={statsData.nonTeaching}
                        icon={Users}
                        color="amber"
                        trendLabel="Non-teaching staff"
                    />
                    <StatCard
                        title="Active"
                        value={statsData.active}
                        icon={Users}
                        color="green"
                        trendLabel="Currently employed"
                    />
                </StatGrid>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-sm font-semibold">Staff Directory</CardTitle>
                                <CardDescription className="text-xs">
                                    View and manage all staff members
                                </CardDescription>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Input
                                    placeholder="Search staff..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-64 text-sm"
                                />
                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger className="w-40 text-sm">
                                        <SelectValue placeholder="All roles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="teacher">Teacher</SelectItem>
                                        <SelectItem value="headteacher">Headteacher</SelectItem>
                                        <SelectItem value="bursar">Bursar</SelectItem>
                                        <SelectItem value="librarian">Librarian</SelectItem>
                                        <SelectItem value="dormitory_manager">Dormitory Manager</SelectItem>
                                        <SelectItem value="academic_master">Academic Master</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-32 text-sm">
                                        <SelectValue placeholder="All status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-xs">Staff Member</TableHead>
                                        <TableHead className="text-xs">Employee ID</TableHead>
                                        <TableHead className="text-xs">Role</TableHead>
                                        <TableHead className="text-xs">Contact</TableHead>
                                        <TableHead className="text-xs">Qualifications</TableHead>
                                        <TableHead className="text-xs">Documents</TableHead>
                                        <TableHead className="text-xs">Status</TableHead>
                                        <TableHead className="text-xs text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStaff.map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <span className="text-xs font-medium">
                                                            {member.name.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium">{member.name}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {member.gender} • {new Date(member.date_of_birth).toLocaleDateString()}
                                                        </div>
                                                        {member.staff_profile?.tsc_number && (
                                                            <div className="text-xs text-blue-600">
                                                                TSC: {member.staff_profile.tsc_number}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-xs">
                                                    {member.employee_id}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getRoleColor(member.role)} text-xs`}>
                                                    {member.role.replace('_', ' ').toUpperCase()}
                                                </Badge>
                                                {member.staff_profile?.designation && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {member.staff_profile.designation}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center text-xs">
                                                        <Phone className="w-3 h-3 mr-1" />
                                                        {member.phone || 'N/A'}
                                                    </div>
                                                    <div className="flex items-center text-xs text-gray-500">
                                                        <Mail className="w-3 h-3 mr-1" />
                                                        {member.email}
                                                    </div>
                                                    {member.address && (
                                                        <div className="flex items-center text-xs text-gray-500">
                                                            <MapPin className="w-3 h-3 mr-1" />
                                                            {member.address.substring(0, 30)}...
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-xs">
                                                    <GraduationCap className="w-4 h-4 mr-1" />
                                                    {member.qualifications_count}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-xs">
                                                    <FileText className="w-4 h-4 mr-1" />
                                                    {member.documents_count}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={member.is_active ? "default" : "secondary"} className="text-xs">
                                                    {member.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                                {member.staff_profile?.date_of_joining && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Joined: {new Date(member.staff_profile.date_of_joining).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Link href={`/hr/staff/${member.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/hr/staff/${member.id}/edit`}>
                                                        <Button variant="outline" size="sm">
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button variant="outline" size="sm" className="text-red-600">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
