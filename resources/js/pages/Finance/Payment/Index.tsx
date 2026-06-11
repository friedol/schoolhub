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
import { Plus, CreditCard, DollarSign, Eye, CheckCircle, XCircle, Clock, Smartphone, AlertTriangle } from 'lucide-react';

interface Payment {
    id: number;
    payment_number: string;
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
    amount: number;
    payment_method: string;
    payment_date: string;
    transaction_reference: string;
    mobile_money_provider: string;
    mobile_money_number: string;
    bank_name: string;
    bank_reference: string;
    status: string;
    processed_by: {
        first_name: string;
        last_name: string;
    };
    verified_by: {
        first_name: string;
        last_name: string;
    } | null;
    verified_at: string;
    reconciliation_status: string;
}

interface Props {
    payments: {
        data: Payment[];
        links: any[];
        meta: any;
    };
}

export default function PaymentIndex({ payments }: Props) {
    const [methodFilter, setMethodFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [reconciliationFilter, setReconciliationFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800';
            case 'refunded':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getMethodIcon = (method: string) => {
        switch (method) {
            case 'cash':
                return <DollarSign className="w-4 h-4" />;
            case 'bank_transfer':
                return <CreditCard className="w-4 h-4" />;
            case 'mpesa':
            case 'tigo_pesa':
            case 'airtel_money':
            case 'halopesa':
                return <Smartphone className="w-4 h-4" />;
            default:
                return <CreditCard className="w-4 h-4" />;
        }
    };

    const getMethodColor = (method: string) => {
        switch (method) {
            case 'cash':
                return 'bg-green-100 text-green-800';
            case 'bank_transfer':
                return 'bg-blue-100 text-blue-800';
            case 'mpesa':
                return 'bg-green-100 text-green-800';
            case 'tigo_pesa':
                return 'bg-orange-100 text-orange-800';
            case 'airtel_money':
                return 'bg-red-100 text-red-800';
            case 'halopesa':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredPayments = payments.data.filter(payment => {
        if (methodFilter && payment.payment_method !== methodFilter) return false;
        if (statusFilter && payment.status !== statusFilter) return false;
        if (reconciliationFilter && payment.reconciliation_status !== reconciliationFilter) return false;
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                payment.payment_number.toLowerCase().includes(searchLower) ||
                payment.student.first_name.toLowerCase().includes(searchLower) ||
                payment.student.last_name.toLowerCase().includes(searchLower) ||
                payment.student.student_number.toLowerCase().includes(searchLower) ||
                payment.transaction_reference?.toLowerCase().includes(searchLower) ||
                payment.mobile_money_number?.toLowerCase().includes(searchLower)
            );
        }
        return true;
    });

    const stats = {
        total: payments.data.length,
        completed: payments.data.filter(p => p.status === 'completed').length,
        pending: payments.data.filter(p => p.status === 'pending').length,
        failed: payments.data.filter(p => p.status === 'failed').length,
        totalAmount: payments.data.reduce((sum, p) => sum + p.amount, 0),
        completedAmount: payments.data.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
        pendingAmount: payments.data.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
        reconciled: payments.data.filter(p => p.reconciliation_status === 'reconciled').length,
    };

    const overdueAmount = payments.data
        .filter((p) => p.status === 'failed' || p.status === 'cancelled')
        .reduce((sum, p) => sum + p.amount, 0);

    return (
        <AppLayout>
            <Head title="Payment Management" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-base font-semibold text-gray-900">Payment Management</h1>
                        <p className="text-sm text-gray-600">Track and manage all payment transactions</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Reconcile
                        </Button>
                        <Link href="/finance/payment/create">
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Record Payment
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <StatGrid cols={4}>
                    <StatCard
                        title="Total Payments"
                        value={stats.total}
                        icon={CreditCard}
                        color="blue"
                        trendLabel="All transactions"
                    />
                    <StatCard
                        title="Paid TZS"
                        value={`TZS ${stats.completedAmount.toLocaleString()}`}
                        icon={CheckCircle}
                        color="green"
                        trend="up"
                        trendLabel={`${stats.completed} completed`}
                    />
                    <StatCard
                        title="Pending TZS"
                        value={`TZS ${stats.pendingAmount.toLocaleString()}`}
                        icon={Clock}
                        color="amber"
                        trendLabel={`${stats.pending} pending`}
                    />
                    <StatCard
                        title="Overdue TZS"
                        value={`TZS ${overdueAmount.toLocaleString()}`}
                        icon={AlertTriangle}
                        color="red"
                        trend={overdueAmount > 0 ? 'down' : 'stable'}
                        trendLabel={`${stats.failed} failed/cancelled`}
                    />
                </StatGrid>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-sm font-semibold">Payments</CardTitle>
                                <CardDescription className="text-xs">
                                    View and manage all payment transactions
                                </CardDescription>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Input
                                    placeholder="Search payments..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-48"
                                />
                                <Select value={methodFilter} onValueChange={setMethodFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="All methods" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Methods</SelectItem>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="mpesa">M-Pesa</SelectItem>
                                        <SelectItem value="tigo_pesa">Tigo Pesa</SelectItem>
                                        <SelectItem value="airtel_money">Airtel Money</SelectItem>
                                        <SelectItem value="halopesa">HaloPesa</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="All status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="refunded">Refunded</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={reconciliationFilter} onValueChange={setReconciliationFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Reconciliation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="reconciled">Reconciled</SelectItem>
                                        <SelectItem value="discrepancy">Discrepancy</SelectItem>
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
                                    <TableHead>Payment #</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Invoice</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Reconciliation</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPayments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{payment.payment_number}</div>
                                                <div className="text-sm text-gray-500">
                                                    {payment.transaction_reference || 'No reference'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">
                                                    {payment.student.first_name} {payment.student.last_name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {payment.student.student_number}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{payment.invoice.invoice_number}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">
                                                TZS {payment.amount.toLocaleString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                {getMethodIcon(payment.payment_method)}
                                                <Badge className={getMethodColor(payment.payment_method)}>
                                                    {payment.payment_method.replace('_', ' ').toUpperCase()}
                                                </Badge>
                                            </div>
                                            {payment.mobile_money_number && (
                                                <div className="text-sm text-gray-500 mt-1">
                                                    {payment.mobile_money_number}
                                                </div>
                                            )}
                                            {payment.bank_name && (
                                                <div className="text-sm text-gray-500 mt-1">
                                                    {payment.bank_name}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div className="font-medium">
                                                    {new Date(payment.payment_date).toLocaleDateString()}
                                                </div>
                                                <div className="text-gray-500">
                                                    {new Date(payment.payment_date).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(payment.status)}>
                                                {payment.status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={payment.reconciliation_status === 'reconciled' ? 'default' : 'outline'}>
                                                {payment.reconciliation_status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Link href={`/finance/payment/${payment.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                {payment.status === 'pending' && (
                                                    <Button variant="outline" size="sm" className="text-green-600">
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                {payment.status === 'completed' && payment.reconciliation_status === 'pending' && (
                                                    <Button variant="outline" size="sm" className="text-blue-600">
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                )}
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



