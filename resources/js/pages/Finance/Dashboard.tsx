import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard, StatGrid } from '@/components/ui/stat-card';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Users,
    FileText,
    CreditCard,
    AlertCircle,
    CheckCircle,
    Plus,
    Eye,
    BarChart3,
    PieChart,
    Calendar,
    Smartphone,
    Building
} from 'lucide-react';

interface Props {
    stats: {
        total_revenue: number;
        total_expenses: number;
        net_income: number;
        fee_collection_rate: number;
        outstanding_fees: number;
        total_students: number;
        total_invoices: number;
        paid_invoices: number;
        overdue_invoices: number;
        pending_payments: number;
        reconciled_payments: number;
        active_budgets: number;
        budget_variance: number;
    };
    recentTransactions: Array<{
        id: number;
        type: string;
        amount: number;
        description: string;
        date: string;
        status: string;
    }>;
    topFeeItems: Array<{
        name: string;
        category: string;
        total_amount: number;
        collection_rate: number;
    }>;
    paymentMethods: Array<{
        method: string;
        count: number;
        amount: number;
        percentage: number;
    }>;
}

export default function FinanceDashboard({ stats, recentTransactions, topFeeItems, paymentMethods }: Props) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
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

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'tuition':
                return 'bg-blue-100 text-blue-800';
            case 'development':
                return 'bg-green-100 text-green-800';
            case 'laboratory':
                return 'bg-purple-100 text-purple-800';
            case 'library':
                return 'bg-orange-100 text-orange-800';
            case 'sports':
                return 'bg-pink-100 text-pink-800';
            case 'examination':
                return 'bg-red-100 text-red-800';
            case 'hostel':
                return 'bg-indigo-100 text-indigo-800';
            case 'transport':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout>
            <Head title="Finance Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-base font-semibold text-gray-900">Finance Dashboard</h1>
                        <p className="text-xs text-gray-500">Overview of school financial performance</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/finance/reports">
                            <Button variant="outline" size="sm">
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Reports
                            </Button>
                        </Link>
                        <Link href="/finance/invoice/create">
                            <Button size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Invoice
                            </Button>
                        </Link>
                    </div>
                </div>

                <StatGrid cols={4}>
                    <StatCard
                        title="Total Revenue"
                        value={`TZS ${stats.total_revenue.toLocaleString()}`}
                        icon={TrendingUp}
                        color="green"
                        trend="up"
                        trendLabel="All income sources"
                    />
                    <StatCard
                        title="Net Profit"
                        value={`TZS ${stats.net_income.toLocaleString()}`}
                        icon={DollarSign}
                        color="emerald"
                        trendLabel="Revenue minus expenses"
                    />
                    <StatCard
                        title="Total Expenses"
                        value={`TZS ${stats.total_expenses.toLocaleString()}`}
                        icon={TrendingDown}
                        color="rose"
                        trend="down"
                        trendLabel="All expenses"
                    />
                    <StatCard
                        title="Balance Due"
                        value={`TZS ${stats.outstanding_fees.toLocaleString()}`}
                        icon={AlertCircle}
                        color="red"
                        trendLabel="Unpaid fees"
                    />
                    <StatCard
                        title="Fee Collection Rate"
                        value={`${stats.fee_collection_rate.toFixed(1)}%`}
                        icon={CheckCircle}
                        color="blue"
                        trendLabel="Fee collection efficiency"
                    />
                    <StatCard
                        title="Pending Payments"
                        value={stats.pending_payments}
                        icon={CreditCard}
                        color="amber"
                        trendLabel="Awaiting processing"
                    />
                </StatGrid>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Recent Transactions</CardTitle>
                            <CardDescription className="text-xs">
                                Latest financial transactions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <div className="space-y-4 min-w-0">
                                    {recentTransactions.map((transaction) => (
                                        <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className={`p-2 rounded-full ${
                                                    transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                                                }`}>
                                                    {transaction.type === 'income' ? (
                                                        <TrendingUp className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <TrendingDown className="w-4 h-4 text-red-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium">{transaction.description}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(transaction.date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-sm font-medium ${
                                                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {transaction.type === 'income' ? '+' : '-'}TZS {transaction.amount.toLocaleString()}
                                                </div>
                                                <Badge className={getStatusColor(transaction.status)}>
                                                    {transaction.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Top Fee Items</CardTitle>
                            <CardDescription className="text-xs">
                                Highest revenue generating fee items
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topFeeItems.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium">{item.name}</div>
                                                <Badge className={getCategoryColor(item.category)}>
                                                    {item.category.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium">
                                                TZS {item.total_amount.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {item.collection_rate.toFixed(1)}% collected
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Payment Methods</CardTitle>
                            <CardDescription className="text-xs">
                                Payment method distribution
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {paymentMethods.map((method, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            {getMethodIcon(method.method)}
                                            <div>
                                                <div className="text-sm font-medium">
                                                    {method.method.replace('_', ' ').toUpperCase()}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {method.count} transactions
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium">
                                                TZS {method.amount.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {method.percentage.toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
                            <CardDescription className="text-xs">
                                Common financial tasks
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <Link href="/finance/invoice/create">
                                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                                        <FileText className="w-6 h-6 mb-2" />
                                        <span className="text-xs">Create Invoice</span>
                                    </Button>
                                </Link>
                                <Link href="/finance/payment/create">
                                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                                        <CreditCard className="w-6 h-6 mb-2" />
                                        <span className="text-xs">Record Payment</span>
                                    </Button>
                                </Link>
                                <Link href="/finance/budget/create">
                                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                                        <Building className="w-6 h-6 mb-2" />
                                        <span className="text-xs">Create Budget</span>
                                    </Button>
                                </Link>
                                <Link href="/finance/reports">
                                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                                        <BarChart3 className="w-6 h-6 mb-2" />
                                        <span className="text-xs">View Reports</span>
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
