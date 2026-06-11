import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Calendar, DollarSign, Clock, CheckCircle, XCircle, Eye, Edit, Trash2 } from 'lucide-react';

interface PaymentPlan {
    id: number;
    plan_name: string;
    student: {
        id: number;
        first_name: string;
        last_name: string;
        student_number: string;
    };
    invoice: {
        id: number;
        invoice_number: string;
    };
    total_amount: number;
    installment_count: number;
    installment_amount: number;
    start_date: string;
    end_date: string;
    frequency: string;
    status: string;
    created_by: {
        first_name: string;
        last_name: string;
    };
    approved_by: {
        first_name: string;
        last_name: string;
    } | null;
    approved_at: string;
}

interface Props {
    paymentPlans: {
        data: PaymentPlan[];
        links: any[];
        meta: any;
    };
}

export default function PaymentPlanIndex({ paymentPlans }: Props) {
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [frequencyFilter, setFrequencyFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-blue-100 text-blue-800';
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'completed':
                return 'bg-purple-100 text-purple-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'defaulted':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getFrequencyColor = (frequency: string) => {
        switch (frequency) {
            case 'weekly':
                return 'bg-blue-100 text-blue-800';
            case 'monthly':
                return 'bg-green-100 text-green-800';
            case 'termly':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredPlans = paymentPlans.data.filter(plan => {
        if (statusFilter && plan.status !== statusFilter) return false;
        if (frequencyFilter && plan.frequency !== frequencyFilter) return false;
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                plan.plan_name.toLowerCase().includes(searchLower) ||
                plan.student.first_name.toLowerCase().includes(searchLower) ||
                plan.student.last_name.toLowerCase().includes(searchLower) ||
                plan.student.student_number.toLowerCase().includes(searchLower) ||
                plan.invoice.invoice_number.toLowerCase().includes(searchLower)
            );
        }
        return true;
    });

    const stats = {
        total: paymentPlans.data.length,
        active: paymentPlans.data.filter(p => p.status === 'active').length,
        completed: paymentPlans.data.filter(p => p.status === 'completed').length,
        defaulted: paymentPlans.data.filter(p => p.status === 'defaulted').length,
        totalAmount: paymentPlans.data.reduce((sum, p) => sum + p.total_amount, 0),
        activeAmount: paymentPlans.data.filter(p => p.status === 'active').reduce((sum, p) => sum + p.total_amount, 0),
        completedAmount: paymentPlans.data.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.total_amount, 0),
    };

    const frequencies = Array.from(new Set(paymentPlans.data.map(p => p.frequency)));

    return (
        <AppLayout>
            <Head title="Payment Plans" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Payment Plans</h1>
                        <p className="text-gray-600">Manage student payment plans and installments</p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline">
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule
                        </Button>
                        <Link href="/finance/payment-plans/create">
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Plan
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">
                                All payment plans
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                            <p className="text-xs text-muted-foreground">
                                TZS {stats.activeAmount.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
                            <p className="text-xs text-muted-foreground">
                                TZS {stats.completedAmount.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Defaulted</CardTitle>
                            <XCircle className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.defaulted}</div>
                            <p className="text-xs text-muted-foreground">
                                Overdue plans
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Payment Plans</CardTitle>
                                <CardDescription>
                                    View and manage all payment plans
                                </CardDescription>
                            </div>
                            <div className="flex space-x-4">
                                <Input
                                    placeholder="Search plans..."
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
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="defaulted">Defaulted</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="All frequencies" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Frequencies</SelectItem>
                                        {frequencies.map((frequency) => (
                                            <SelectItem key={frequency} value={frequency}>
                                                {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
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
                                    <TableHead>Plan Name</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Invoice</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Installments</TableHead>
                                    <TableHead>Frequency</TableHead>
                                    <TableHead>Period</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPlans.map((plan) => (
                                    <TableRow key={plan.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{plan.plan_name}</div>
                                                <div className="text-sm text-gray-500">
                                                    Created by {plan.created_by.first_name} {plan.created_by.last_name}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">
                                                    {plan.student.first_name} {plan.student.last_name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {plan.student.student_number}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{plan.invoice.invoice_number}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">
                                                    TZS {plan.total_amount.toLocaleString()}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    TZS {plan.installment_amount.toLocaleString()} per installment
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-center">
                                                <div className="font-medium">{plan.installment_count}</div>
                                                <div className="text-sm text-gray-500">installments</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getFrequencyColor(plan.frequency)}>
                                                {plan.frequency.charAt(0).toUpperCase() + plan.frequency.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div className="font-medium">
                                                    {new Date(plan.start_date).toLocaleDateString()}
                                                </div>
                                                <div className="text-gray-500">
                                                    to {new Date(plan.end_date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(plan.status)}>
                                                {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Link href={`/finance/payment-plans/${plan.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/finance/payment-plans/${plan.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                {plan.status === 'pending' && (
                                                    <Button variant="outline" size="sm" className="text-green-600">
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                <Button variant="outline" size="sm" className="text-red-600">
                                                    <Trash2 className="w-4 h-4" />
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



