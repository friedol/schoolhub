import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, FileText, DollarSign, Calendar, Eye, Edit, Send, Download, Printer, AlertCircle } from 'lucide-react';
import { StatCard, StatGrid } from '@/components/ui/stat-card';

interface Invoice {
    id: number;
    invoice_number: string;
    student: {
        id: number;
        first_name: string;
        last_name: string;
        student_number: string;
    };
    academic_year: string;
    term: string;
    issue_date: string;
    due_date: string;
    total_amount: number;
    paid_amount: number;
    balance_amount: number;
    status: string;
    sent_at: string;
    reminder_sent_at: string;
}

interface Props {
    invoices: {
        data: Invoice[];
        links: any[];
        meta: any;
    };
    classes: Array<{ id: number; name: string; level: string }>;
}

export default function InvoiceIndex({ invoices, classes }: Props) {
    const [classFilter, setClassFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [yearFilter, setYearFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft':
                return 'bg-gray-100 text-gray-800';
            case 'sent':
                return 'bg-blue-100 text-blue-800';
            case 'partial':
                return 'bg-yellow-100 text-yellow-800';
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'overdue':
                return 'bg-red-100 text-red-800';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredInvoices = invoices.data.filter(invoice => {
        if (classFilter && invoice.student.student_number.includes(classFilter)) return false;
        if (statusFilter && invoice.status !== statusFilter) return false;
        if (yearFilter && invoice.academic_year !== yearFilter) return false;
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                invoice.invoice_number.toLowerCase().includes(searchLower) ||
                invoice.student.first_name.toLowerCase().includes(searchLower) ||
                invoice.student.last_name.toLowerCase().includes(searchLower) ||
                invoice.student.student_number.toLowerCase().includes(searchLower)
            );
        }
        return true;
    });

    const stats = {
        total: invoices.data.length,
        draft: invoices.data.filter(i => i.status === 'draft').length,
        sent: invoices.data.filter(i => i.status === 'sent').length,
        paid: invoices.data.filter(i => i.status === 'paid').length,
        overdue: invoices.data.filter(i => i.status === 'overdue').length,
        totalAmount: invoices.data.reduce((sum, i) => sum + i.total_amount, 0),
        paidAmount: invoices.data.reduce((sum, i) => sum + i.paid_amount, 0),
        outstandingAmount: invoices.data.reduce((sum, i) => sum + i.balance_amount, 0),
    };

    const years = Array.from(new Set(invoices.data.map(i => i.academic_year)));

    return (
        <AppLayout>
            <Head title="Invoice Management" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
                        <p className="text-gray-600">Manage student fee invoices and payments</p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                        <Button variant="outline">
                            <Send className="w-4 h-4 mr-2" />
                            Send Reminders
                        </Button>
                        <Link href="/finance/invoice/create">
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Invoice
                            </Button>
                        </Link>
                    </div>
                </div>

                <StatGrid cols={4}>
                    <StatCard
                        title="Total Invoices"
                        value={stats.total}
                        icon={FileText}
                        color="blue"
                        trendLabel="All invoices"
                    />
                    <StatCard
                        title="Paid Invoices"
                        value={stats.paid}
                        icon={DollarSign}
                        color="green"
                        trendLabel="Fully paid"
                    />
                    <StatCard
                        title="Overdue"
                        value={stats.overdue}
                        icon={AlertCircle}
                        color="red"
                        trendLabel="Past due date"
                    />
                    <StatCard
                        title="Outstanding"
                        value={`TZS ${stats.outstandingAmount.toLocaleString()}`}
                        icon={DollarSign}
                        color="orange"
                        trendLabel="Unpaid amount"
                    />
                </StatGrid>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Invoices</CardTitle>
                                <CardDescription>
                                    View and manage all student invoices
                                </CardDescription>
                            </div>
                            <div className="flex space-x-4">
                                <Input
                                    placeholder="Search invoices..."
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
                                        <SelectItem value="sent">Sent</SelectItem>
                                        <SelectItem value="partial">Partial</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="overdue">Overdue</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={yearFilter} onValueChange={setYearFilter}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="All years" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Years</SelectItem>
                                        {years.map((year) => (
                                            <SelectItem key={year} value={year}>
                                                {year}
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
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Academic Year</TableHead>
                                    <TableHead>Term</TableHead>
                                    <TableHead>Amounts</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInvoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{invoice.invoice_number}</div>
                                                <div className="text-sm text-gray-500">
                                                    {new Date(invoice.issue_date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">
                                                    {invoice.student.first_name} {invoice.student.last_name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {invoice.student.student_number}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {invoice.academic_year}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {invoice.term.replace('_', ' ').toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="text-sm">
                                                    <span className="font-medium">Total:</span> TZS {invoice.total_amount.toLocaleString()}
                                                </div>
                                                <div className="text-sm text-green-600">
                                                    <span className="font-medium">Paid:</span> TZS {invoice.paid_amount.toLocaleString()}
                                                </div>
                                                <div className="text-sm text-red-600">
                                                    <span className="font-medium">Balance:</span> TZS {invoice.balance_amount.toLocaleString()}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div className="font-medium">
                                                    {new Date(invoice.due_date).toLocaleDateString()}
                                                </div>
                                                {invoice.status === 'overdue' && (
                                                    <div className="text-red-600 text-xs">
                                                        Overdue
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(invoice.status)}>
                                                {invoice.status.replace('_', ' ').toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Link href={`/finance/invoice/${invoice.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/finance/invoice/${invoice.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button variant="outline" size="sm">
                                                    <Printer className="w-4 h-4" />
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    <Send className="w-4 h-4" />
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



