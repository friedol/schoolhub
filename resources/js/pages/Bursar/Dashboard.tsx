import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard, StatGrid } from '@/components/ui/stat-card';
import {
    Calculator,
    CreditCard,
    DollarSign,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    CheckCircle,
    Clock,
    Users,
    FileText,
    BarChart3,
    Plus,
    Eye,
    Download,
    Receipt,
    Banknote,
    Smartphone
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

interface Bursar {
    id: number;
    name: string;
    email: string;
    school_id: number;
}

interface BursarDashboardProps {
    bursar: Bursar;
    school: {
        id: number;
        name: string;
        code: string;
    };
    statistics: {
        total_fee_collection: number;
        fee_collection_rate: number;
        pending_payments: number;
        overdue_fees: number;
        total_students: number;
        students_with_fees: number;
        mobile_money_payments: number;
        cash_payments: number;
        bank_transfers: number;
        monthly_revenue: number;
        previous_month_revenue: number;
        fee_categories_count: number;
    };
    recentPayments: Array<{
        id: number;
        student_name: string;
        fee_type: string;
        amount: number;
        payment_method: string;
        payment_date: string;
        status: string;
        receipt_number: string;
    }>;
    overdueFees: Array<{
        id: number;
        student_name: string;
        student_number: string;
        class: string;
        fee_type: string;
        amount: number;
        due_date: string;
        days_overdue: number;
    }>;
    feeCategories: Array<{
        id: number;
        name: string;
        amount: number;
        total_collected: number;
        collection_rate: number;
        students_count: number;
    }>;
    monthlyTrends: Array<{
        month: string;
        revenue: number;
        payments_count: number;
    }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Bursar',
        href: '/bursar',
    },
    {
        title: 'Dashboard',
        href: '/bursar/dashboard',
    },
];

export default function BursarDashboard({
    bursar,
    school,
    statistics,
    recentPayments,
    overdueFees,
    feeCategories,
    monthlyTrends
}: BursarDashboardProps) {
    const revenueChange = statistics.monthly_revenue - statistics.previous_month_revenue;
    const revenueChangePercent = statistics.previous_month_revenue > 0
        ? ((revenueChange / statistics.previous_month_revenue) * 100).toFixed(1)
        : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bursar Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-base font-semibold tracking-tight">Financial Management</h1>
                        <p className="text-xs text-muted-foreground">
                            {school.name} • Bursar Dashboard
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button asChild size="sm">
                            <Link href="/finance/payments/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Record Payment
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/finance/reports">
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Financial Reports
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Key Financial Metrics */}
                <StatGrid cols={4}>
                    <StatCard
                        title="Total Revenue"
                        value={`TZS ${statistics.total_fee_collection.toLocaleString()}`}
                        icon={DollarSign}
                        color="green"
                        trend={revenueChange >= 0 ? 'up' : 'down'}
                        trendLabel={`${revenueChangePercent}% from last month`}
                    />
                    <StatCard
                        title="Fee Collected"
                        value={`TZS ${statistics.monthly_revenue.toLocaleString()}`}
                        icon={TrendingUp}
                        color="emerald"
                        trendLabel="This month"
                    />
                    <StatCard
                        title="Outstanding Fees"
                        value={statistics.overdue_fees}
                        icon={AlertCircle}
                        color="red"
                        trendLabel="Students with overdue fees"
                    />
                    <StatCard
                        title="Total Invoices"
                        value={statistics.students_with_fees}
                        icon={FileText}
                        color="blue"
                        trendLabel="Students with fees"
                    />
                    <StatCard
                        title="Overdue Payments"
                        value={statistics.pending_payments}
                        icon={Clock}
                        color="amber"
                        trendLabel="Awaiting processing"
                    />
                    <StatCard
                        title="Collection Rate"
                        value={`${statistics.fee_collection_rate}%`}
                        icon={CheckCircle}
                        color="teal"
                        trendLabel="Target: 80%"
                    />
                </StatGrid>

                {/* Recent Payments and Overdue Fees */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Recent Payments</CardTitle>
                            <CardDescription className="text-xs">
                                Latest fee payments received
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <div className="space-y-4 min-w-0">
                                    {recentPayments.map((payment) => (
                                        <div key={payment.id} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                                    <Receipt className="h-4 w-4 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{payment.student_name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {payment.fee_type} • {payment.payment_date}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium">
                                                    TZS {payment.amount.toLocaleString()}
                                                </p>
                                                <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                                                    {payment.payment_method}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-4">
                                <Button variant="outline" className="w-full text-xs" asChild>
                                    <Link href="/finance/payments">
                                        View All Payments
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Overdue Fees</CardTitle>
                            <CardDescription className="text-xs">
                                Students with outstanding fee payments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <div className="space-y-4 min-w-0">
                                    {overdueFees.map((fee) => (
                                        <div key={fee.id} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{fee.student_name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {fee.student_number} • {fee.class}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium">
                                                    TZS {fee.amount.toLocaleString()}
                                                </p>
                                                <Badge variant="destructive">
                                                    {fee.days_overdue} days overdue
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-4">
                                <Button variant="outline" className="w-full text-xs" asChild>
                                    <Link href="/finance/overdue-fees">
                                        View All Overdue Fees
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Fee Categories Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold">Fee Categories Performance</CardTitle>
                        <CardDescription className="text-xs">
                            Collection performance by fee category
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <div className="space-y-4 min-w-0">
                                {feeCategories.map((category) => (
                                    <div key={category.id} className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                                <CreditCard className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{category.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    TZS {category.amount.toLocaleString()} • {category.students_count} students
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">
                                                TZS {category.total_collected.toLocaleString()}
                                            </p>
                                            <div className="flex items-center space-x-2">
                                                <Badge variant={category.collection_rate >= 80 ? 'default' : 'secondary'}>
                                                    {category.collection_rate}%
                                                </Badge>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/finance/fee-categories/${category.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
                        <CardDescription className="text-xs">
                            Common financial management tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                            <Button variant="outline" className="h-auto flex-col p-4" asChild>
                                <Link href="/finance/payments/create">
                                    <Plus className="mb-2 h-6 w-6" />
                                    <span className="text-xs">Record Payment</span>
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-auto flex-col p-4" asChild>
                                <Link href="/finance/student-fees">
                                    <Users className="mb-2 h-6 w-6" />
                                    <span className="text-xs">Manage Student Fees</span>
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-auto flex-col p-4" asChild>
                                <Link href="/finance/fee-categories">
                                    <CreditCard className="mb-2 h-6 w-6" />
                                    <span className="text-xs">Fee Categories</span>
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-auto flex-col p-4" asChild>
                                <Link href="/finance/reports">
                                    <BarChart3 className="mb-2 h-6 w-6" />
                                    <span className="text-xs">Financial Reports</span>
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
