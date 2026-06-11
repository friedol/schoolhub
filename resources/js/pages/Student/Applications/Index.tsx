import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Eye, Edit, FileText, Calendar, User, Phone, Mail, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { StatCard, StatGrid } from '@/components/ui/stat-card';

interface Application {
    id: number;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    desired_class: string;
    academic_year: string;
    parent_name: string;
    parent_phone: string;
    parent_email: string;
    status: string;
    application_date: string;
    documents_count: number;
    payments_count: number;
    interviews_count: number;
}

interface Props {
    applications: {
        data: Application[];
        links: any[];
        meta: any;
    };
}

export default function ApplicationIndex({ applications }: Props) {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [classFilter, setClassFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'under_review':
                return <Eye className="w-4 h-4 text-blue-600" />;
            case 'approved':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'rejected':
                return <XCircle className="w-4 h-4 text-red-600" />;
            case 'withdrawn':
                return <AlertCircle className="w-4 h-4 text-gray-600" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'under_review':
                return 'bg-blue-100 text-blue-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'withdrawn':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredApplications = applications.data.filter(application => {
        if (statusFilter !== 'all' && application.status !== statusFilter) return false;
        if (classFilter !== 'all' && application.desired_class !== classFilter) return false;
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                application.first_name.toLowerCase().includes(searchLower) ||
                application.last_name.toLowerCase().includes(searchLower) ||
                application.parent_name.toLowerCase().includes(searchLower) ||
                application.parent_phone.includes(searchTerm) ||
                application.parent_email.toLowerCase().includes(searchLower)
            );
        }
        return true;
    });

    const statusStats = {
        pending: applications.data.filter(a => a.status === 'pending').length,
        under_review: applications.data.filter(a => a.status === 'under_review').length,
        approved: applications.data.filter(a => a.status === 'approved').length,
        rejected: applications.data.filter(a => a.status === 'rejected').length,
        withdrawn: applications.data.filter(a => a.status === 'withdrawn').length,
    };

    return (
        <AppLayout>
            <Head title="Student Applications" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Student Applications</h1>
                        <p className="text-gray-600">Manage student admission applications</p>
                    </div>
                    <div className="flex space-x-2">
                        <Link href="/student/applications/reports">
                            <Button variant="outline">
                                <FileText className="w-4 h-4 mr-2" />
                                Reports
                            </Button>
                        </Link>
                        <Link href="/student/applications/create">
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                New Application
                            </Button>
                        </Link>
                    </div>
                </div>

                <StatGrid cols={5}>
                    <StatCard
                        title="Total"
                        value={applications.meta.total}
                        icon={FileText}
                        color="slate"
                        trend="stable"
                        trendLabel="All"
                        subtitle="All applications"
                    />
                    <StatCard
                        title="Pending"
                        value={statusStats.pending}
                        icon={Clock}
                        color="amber"
                        trend="stable"
                        trendLabel="Pending"
                        subtitle="Awaiting review"
                    />
                    <StatCard
                        title="Under Review"
                        value={statusStats.under_review}
                        icon={Eye}
                        color="blue"
                        trend="stable"
                        trendLabel="Reviewing"
                        subtitle="Being reviewed"
                    />
                    <StatCard
                        title="Approved"
                        value={statusStats.approved}
                        icon={CheckCircle}
                        color="green"
                        trend="stable"
                        trendLabel="Accepted"
                        subtitle="Accepted"
                    />
                    <StatCard
                        title="Rejected"
                        value={statusStats.rejected}
                        icon={XCircle}
                        color="rose"
                        trend="stable"
                        trendLabel="Declined"
                        subtitle="Not accepted"
                    />
                </StatGrid>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Applications List</CardTitle>
                                <CardDescription>
                                    View and manage student applications
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
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="under_review">Under Review</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="withdrawn">Withdrawn</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Desired Class</TableHead>
                                    <TableHead>Parent Contact</TableHead>
                                    <TableHead>Application Date</TableHead>
                                    <TableHead>Documents</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredApplications.map((application) => (
                                    <TableRow key={application.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">
                                                    {application.first_name} {application.last_name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {application.gender} • {new Date(application.date_of_birth).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {application.desired_class}
                                            </Badge>
                                            <div className="text-sm text-gray-500">
                                                {application.academic_year}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center text-sm">
                                                    <User className="w-3 h-3 mr-1" />
                                                    {application.parent_name}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Phone className="w-3 h-3 mr-1" />
                                                    {application.parent_phone}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Mail className="w-3 h-3 mr-1" />
                                                    {application.parent_email}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                {new Date(application.application_date).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="text-sm">
                                                    <FileText className="w-3 h-3 inline mr-1" />
                                                    {application.documents_count} docs
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {application.payments_count} payments
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {application.interviews_count} interviews
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(application.status)}>
                                                {getStatusIcon(application.status)}
                                                <span className="ml-1 capitalize">
                                                    {application.status.replace('_', ' ')}
                                                </span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Link href={`/student/applications/${application.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/student/applications/${application.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
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



