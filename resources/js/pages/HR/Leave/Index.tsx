import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Eye, Edit, FileText, User } from 'lucide-react';
import { StatCard, StatGrid } from '@/components/ui/stat-card';

interface LeaveApplication {
    id: number;
    staff: {
        name: string;
        employee_id: string;
        role: string;
    };
    leave_type: {
        name: string;
        is_paid: boolean;
    };
    start_date: string;
    end_date: string;
    total_days: number;
    reason: string;
    status: string;
    applied_at: string;
    approved_by?: {
        name: string;
    };
    approved_at?: string;
    rejected_by?: {
        name: string;
    };
    rejected_at?: string;
    rejection_reason?: string;
}

interface Props {
    leaveApplications: {
        data: LeaveApplication[];
        links: any[];
        meta: any;
    };
}

export default function LeaveIndex({ leaveApplications }: Props) {
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-4 h-4" />;
            case 'approved':
                return <CheckCircle className="w-4 h-4" />;
            case 'rejected':
                return <XCircle className="w-4 h-4" />;
            case 'cancelled':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const filteredApplications = leaveApplications.data.filter(application => {
        if (statusFilter && application.status !== statusFilter) return false;
        if (typeFilter && application.leave_type.name !== typeFilter) return false;
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                application.staff.name.toLowerCase().includes(searchLower) ||
                application.staff.employee_id.toLowerCase().includes(searchLower) ||
                application.reason.toLowerCase().includes(searchLower)
            );
        }
        return true;
    });

    const stats = {
        total: leaveApplications.data.length,
        pending: leaveApplications.data.filter(a => a.status === 'pending').length,
        approved: leaveApplications.data.filter(a => a.status === 'approved').length,
        rejected: leaveApplications.data.filter(a => a.status === 'rejected').length,
        totalDays: leaveApplications.data.reduce((sum, a) => sum + a.total_days, 0),
    };

    const leaveTypes = Array.from(new Set(leaveApplications.data.map(a => a.leave_type.name)));

    return (
        <AppLayout>
            <Head title="Leave Management" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-base font-semibold tracking-tight">Leave Applications</h1>
                        <p className="text-sm text-muted-foreground">Manage staff leave applications and approvals</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href="/hr/leave/reports">
                            <Button variant="outline" size="sm">
                                <FileText className="w-4 h-4 mr-2" />
                                Reports
                            </Button>
                        </Link>
                        <Link href="/hr/leave/create">
                            <Button size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Apply for Leave
                            </Button>
                        </Link>
                    </div>
                </div>

                <StatGrid cols={4}>
                    <StatCard title="Total Applications" value={stats.total} icon={FileText} color="blue" trend="stable" subtitle="All leave applications" />
                    <StatCard title="Pending" value={stats.pending} icon={Clock} color="amber" trend="stable" subtitle="Awaiting approval" />
                    <StatCard title="Approved" value={stats.approved} icon={CheckCircle} color="green" trend="stable" subtitle="Approved applications" />
                    <StatCard title="Total Days" value={stats.totalDays} icon={Calendar} color="indigo" trend="stable" subtitle="Total leave days" />
                </StatGrid>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Leave Applications</CardTitle>
                                <CardDescription>
                                    View and manage all leave applications
                                </CardDescription>
                            </div>
                            <div className="flex space-x-4">
                                <Input
                                    placeholder="Search applications..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-64"
                                />
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="All status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        {leaveTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Staff Member</TableHead>
                                    <TableHead>Leave Type</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Days</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Applied Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredApplications.map((application) => (
                                    <TableRow key={application.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{application.staff.name}</div>
                                                    <div className="text-sm text-gray-500">{application.staff.employee_id}</div>
                                                    <div className="text-sm text-gray-500">{application.staff.role}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <Badge variant={application.leave_type.is_paid ? "default" : "secondary"}>
                                                    {application.leave_type.name}
                                                </Badge>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {application.leave_type.is_paid ? 'Paid' : 'Unpaid'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div className="font-medium">
                                                    {new Date(application.start_date).toLocaleDateString()}
                                                </div>
                                                <div className="text-gray-500">
                                                    to {new Date(application.end_date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-center">
                                                <div className="font-medium">{application.total_days}</div>
                                                <div className="text-xs text-gray-500">days</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-xs truncate" title={application.reason}>
                                                {application.reason}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(application.status)}>
                                                <div className="flex items-center">
                                                    {getStatusIcon(application.status)}
                                                    <span className="ml-1">
                                                        {application.status.toUpperCase()}
                                                    </span>
                                                </div>
                                            </Badge>
                                            {application.approved_by && (
                                                <div className="text-xs text-green-600 mt-1">
                                                    Approved by: {application.approved_by.name}
                                                </div>
                                            )}
                                            {application.rejected_by && (
                                                <div className="text-xs text-red-600 mt-1">
                                                    Rejected by: {application.rejected_by.name}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {new Date(application.applied_at).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Link href={`/hr/leave/${application.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                {application.status === 'pending' && (
                                                    <>
                                                        <Button variant="outline" size="sm" className="text-green-600">
                                                            <CheckCircle className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="outline" size="sm" className="text-red-600">
                                                            <XCircle className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                )}
                                                {application.status === 'approved' && (
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
