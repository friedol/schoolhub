import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, DollarSign, Users, TrendingUp, Calendar, Eye, Edit, CheckCircle, Clock, AlertCircle, Download } from 'lucide-react';
import { StatCard, StatGrid } from '@/components/ui/stat-card';

interface Payroll {
    id: number;
    payroll_period: string;
    month: number;
    year: number;
    status: string;
    total_staff: number;
    total_gross_pay: number;
    total_deductions: number;
    total_net_pay: number;
    processed_at: string;
    approved_at: string;
    processed_by: {
        name: string;
    };
    approved_by?: {
        name: string;
    };
}

interface Props {
    payrolls: {
        data: Payroll[];
        links: any[];
        meta: any;
    };
}

export default function PayrollIndex({ payrolls }: Props) {
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [yearFilter, setYearFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft':
                return 'bg-gray-100 text-gray-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'pending_approval':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'paid':
                return 'bg-emerald-100 text-emerald-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'draft':
                return <Edit className="w-4 h-4" />;
            case 'processing':
                return <Clock className="w-4 h-4" />;
            case 'pending_approval':
                return <AlertCircle className="w-4 h-4" />;
            case 'approved':
                return <CheckCircle className="w-4 h-4" />;
            case 'paid':
                return <CheckCircle className="w-4 h-4" />;
            case 'cancelled':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const filteredPayrolls = payrolls.data.filter(payroll => {
        if (statusFilter && payroll.status !== statusFilter) return false;
        if (yearFilter && payroll.year.toString() !== yearFilter) return false;
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                payroll.payroll_period.toLowerCase().includes(searchLower) ||
                payroll.processed_by.name.toLowerCase().includes(searchLower)
            );
        }
        return true;
    });

    const stats = {
        total: payrolls.data.length,
        pending: payrolls.data.filter(p => p.status === 'pending_approval').length,
        approved: payrolls.data.filter(p => p.status === 'approved').length,
        paid: payrolls.data.filter(p => p.status === 'paid').length,
        totalAmount: payrolls.data.reduce((sum, p) => sum + p.total_net_pay, 0),
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <AppLayout>
            <Head title="Payroll Management" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-base font-semibold tracking-tight">Payroll</h1>
                        <p className="text-sm text-muted-foreground">Manage staff payroll processing and payments</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href="/hr/payroll/reports">
                            <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Reports
                            </Button>
                        </Link>
                        <Link href="/hr/payroll/create">
                            <Button size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Process Payroll
                            </Button>
                        </Link>
                    </div>
                </div>

                <StatGrid cols={4}>
                    <StatCard title="Total Payrolls" value={stats.total} icon={Calendar} color="blue" trend="stable" subtitle="All payroll periods" />
                    <StatCard title="Pending Approval" value={stats.pending} icon={AlertCircle} color="amber" trend="stable" subtitle="Awaiting approval" />
                    <StatCard title="Approved" value={stats.approved} icon={CheckCircle} color="green" trend="stable" subtitle="Ready for payment" />
                    <StatCard title="Total Net Pay" value={`TZS ${stats.totalAmount.toLocaleString()}`} icon={DollarSign} color="emerald" trend="stable" subtitle="Total amount paid" />
                </StatGrid>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Payroll History</CardTitle>
                                <CardDescription>
                                    View and manage all payroll periods
                                </CardDescription>
                            </div>
                            <div className="flex space-x-4">
                                <Input
                                    placeholder="Search payrolls..."
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
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="pending_approval">Pending Approval</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={yearFilter} onValueChange={setYearFilter}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="All years" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Years</SelectItem>
                                        <SelectItem value="2024">2024</SelectItem>
                                        <SelectItem value="2023">2023</SelectItem>
                                        <SelectItem value="2022">2022</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Payroll Period</TableHead>
                                    <TableHead>Staff Count</TableHead>
                                    <TableHead>Gross Pay</TableHead>
                                    <TableHead>Deductions</TableHead>
                                    <TableHead>Net Pay</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Processed By</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPayrolls.map((payroll) => (
                                    <TableRow key={payroll.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">
                                                    {months[payroll.month - 1]} {payroll.year}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {payroll.payroll_period}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <Users className="w-4 h-4 mr-1" />
                                                {payroll.total_staff}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">
                                                TZS {payroll.total_gross_pay.toLocaleString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-red-600">
                                                TZS {payroll.total_deductions.toLocaleString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-green-600">
                                                TZS {payroll.total_net_pay.toLocaleString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(payroll.status)}>
                                                <div className="flex items-center">
                                                    {getStatusIcon(payroll.status)}
                                                    <span className="ml-1">
                                                        {payroll.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </div>
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{payroll.processed_by.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    {new Date(payroll.processed_at).toLocaleDateString()}
                                                </div>
                                                {payroll.approved_by && (
                                                    <div className="text-sm text-green-600">
                                                        Approved by: {payroll.approved_by.name}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Link href={`/hr/payroll/${payroll.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                {payroll.status === 'draft' && (
                                                    <Link href={`/hr/payroll/${payroll.id}/edit`}>
                                                        <Button variant="outline" size="sm">
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                )}
                                                {payroll.status === 'approved' && (
                                                    <Button variant="outline" size="sm" className="text-green-600">
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                <Button variant="outline" size="sm">
                                                    <Download className="w-4 h-4" />
                                                </Button>
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
