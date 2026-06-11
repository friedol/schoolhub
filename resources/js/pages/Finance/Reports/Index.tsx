import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    FileText, 
    Download, 
    Calendar, 
    BarChart3, 
    PieChart, 
    Users, 
    CreditCard,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

interface FinancialReport {
    id: number;
    report_type: string;
    title: string;
    description: string;
    period: string;
    generated_at: string;
    generated_by: {
        first_name: string;
        last_name: string;
    };
    file_path: string;
    status: string;
}

interface Props {
    reports: {
        data: FinancialReport[];
        links: any[];
        meta: any;
    };
    summary: {
        total_revenue: number;
        total_expenses: number;
        net_income: number;
        fee_collection_rate: number;
        outstanding_fees: number;
        total_students: number;
        total_invoices: number;
        paid_invoices: number;
        overdue_invoices: number;
    };
}

export default function FinancialReportsIndex({ reports, summary }: Props) {
    const [reportTypeFilter, setReportTypeFilter] = useState<string>('');
    const [periodFilter, setPeriodFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const reportTypes = [
        { value: 'income_statement', label: 'Income Statement', icon: TrendingUp },
        { value: 'balance_sheet', label: 'Balance Sheet', icon: BarChart3 },
        { value: 'cash_flow', label: 'Cash Flow Statement', icon: DollarSign },
        { value: 'fee_collection', label: 'Fee Collection Report', icon: CreditCard },
        { value: 'arrears_report', label: 'Arrears Report', icon: AlertCircle },
        { value: 'budget_variance', label: 'Budget Variance Report', icon: PieChart },
        { value: 'student_debtor_aging', label: 'Student Debtor Aging', icon: Users },
        { value: 'tax_report', label: 'Tax Report', icon: FileText },
    ];

    const periods = [
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'termly', label: 'Termly' },
        { value: 'annual', label: 'Annual' },
        { value: 'custom', label: 'Custom Period' },
    ];

    const filteredReports = reports.data.filter(report => {
        if (reportTypeFilter && report.report_type !== reportTypeFilter) return false;
        if (periodFilter && report.period !== periodFilter) return false;
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                report.title.toLowerCase().includes(searchLower) ||
                report.description.toLowerCase().includes(searchLower) ||
                report.report_type.toLowerCase().includes(searchLower)
            );
        }
        return true;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'generated':
                return 'bg-green-100 text-green-800';
            case 'processing':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getReportTypeIcon = (type: string) => {
        const reportType = reportTypes.find(rt => rt.value === type);
        return reportType ? <reportType.icon className="w-4 h-4" /> : <FileText className="w-4 h-4" />;
    };

    const getReportTypeLabel = (type: string) => {
        const reportType = reportTypes.find(rt => rt.value === type);
        return reportType ? reportType.label : type.replace('_', ' ').toUpperCase();
    };

    return (
        <AppLayout>
            <Head title="Financial Reports" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
                        <p className="text-gray-600">Generate and view financial reports and analytics</p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline">
                            <Calendar className="w-4 h-4 mr-2" />
                            Generate Report
                        </Button>
                        <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Export All
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                TZS {summary.total_revenue.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                All income sources
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                TZS {summary.total_expenses.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                All expenses
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                            <DollarSign className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${summary.net_income >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                TZS {summary.net_income.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Revenue - Expenses
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">
                                {summary.fee_collection_rate.toFixed(1)}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Fee collection efficiency
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Outstanding Fees</CardTitle>
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">
                                TZS {summary.outstanding_fees.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Unpaid fees
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <Users className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {summary.total_students}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Enrolled students
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Invoice Status</CardTitle>
                            <FileText className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Total:</span>
                                    <span className="font-medium">{summary.total_invoices}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Paid:</span>
                                    <span className="font-medium text-green-600">{summary.paid_invoices}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Overdue:</span>
                                    <span className="font-medium text-red-600">{summary.overdue_invoices}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Available Reports</CardTitle>
                                <CardDescription>
                                    Generate and view financial reports
                                </CardDescription>
                            </div>
                            <div className="flex space-x-4">
                                <Input
                                    placeholder="Search reports..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-64"
                                />
                                <Select value={reportTypeFilter} onValueChange={setReportTypeFilter}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="All report types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Report Types</SelectItem>
                                        {reportTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="All periods" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Periods</SelectItem>
                                        {periods.map((period) => (
                                            <SelectItem key={period.value} value={period.value}>
                                                {period.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {reportTypes.map((reportType) => (
                                <Card key={reportType.value} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center space-x-2">
                                            <reportType.icon className="w-5 h-5 text-blue-600" />
                                            <CardTitle className="text-lg">{reportType.label}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600 mb-4">
                                            {reportType.value === 'income_statement' && 'Revenue, expenses, and net income for a period'}
                                            {reportType.value === 'balance_sheet' && 'Assets, liabilities, and equity at a point in time'}
                                            {reportType.value === 'cash_flow' && 'Cash movements and liquidity analysis'}
                                            {reportType.value === 'fee_collection' && 'Fee collection performance and trends'}
                                            {reportType.value === 'arrears_report' && 'Outstanding fees and collection status'}
                                            {reportType.value === 'budget_variance' && 'Budget vs actual performance analysis'}
                                            {reportType.value === 'student_debtor_aging' && 'Student debt analysis by age'}
                                            {reportType.value === 'tax_report' && 'Tax compliance and reporting'}
                                        </p>
                                        <div className="flex space-x-2">
                                            <Button size="sm" className="flex-1">
                                                <BarChart3 className="w-4 h-4 mr-2" />
                                                Generate
                                            </Button>
                                            <Button size="sm" variant="outline">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Reports</CardTitle>
                        <CardDescription>
                            View recently generated reports
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Report</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Period</TableHead>
                                    <TableHead>Generated</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredReports.map((report) => (
                                    <TableRow key={report.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{report.title}</div>
                                                <div className="text-sm text-gray-500">{report.description}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                {getReportTypeIcon(report.report_type)}
                                                <span className="text-sm">{getReportTypeLabel(report.report_type)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {report.period.charAt(0).toUpperCase() + report.period.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div className="font-medium">
                                                    {new Date(report.generated_at).toLocaleDateString()}
                                                </div>
                                                <div className="text-gray-500">
                                                    by {report.generated_by.first_name} {report.generated_by.last_name}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(report.status)}>
                                                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button variant="outline" size="sm">
                                                    <FileText className="w-4 h-4" />
                                                </Button>
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



