import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, TrendingUp, TrendingDown, DollarSign, Calendar, Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { StatCard, StatGrid } from '@/components/ui/stat-card';

interface Budget {
    id: number;
    academic_year: string;
    budget_name: string;
    department: string;
    budget_type: string;
    total_budgeted_amount: number;
    total_actual_amount: number;
    start_date: string;
    end_date: string;
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
    budgets: {
        data: Budget[];
        links: any[];
        meta: any;
    };
}

export default function BudgetIndex({ budgets }: Props) {
    const [departmentFilter, setDepartmentFilter] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [yearFilter, setYearFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft':
                return 'bg-gray-100 text-gray-800';
            case 'approved':
                return 'bg-blue-100 text-blue-800';
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'completed':
                return 'bg-purple-100 text-purple-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getDepartmentColor = (department: string) => {
        switch (department) {
            case 'academic':
                return 'bg-blue-100 text-blue-800';
            case 'sports':
                return 'bg-green-100 text-green-800';
            case 'administration':
                return 'bg-purple-100 text-purple-800';
            case 'maintenance':
                return 'bg-orange-100 text-orange-800';
            case 'library':
                return 'bg-indigo-100 text-indigo-800';
            case 'laboratory':
                return 'bg-red-100 text-red-800';
            case 'transport':
                return 'bg-yellow-100 text-yellow-800';
            case 'hostel':
                return 'bg-pink-100 text-pink-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'annual':
                return 'bg-blue-100 text-blue-800';
            case 'term':
                return 'bg-green-100 text-green-800';
            case 'monthly':
                return 'bg-yellow-100 text-yellow-800';
            case 'project':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredBudgets = budgets.data.filter(budget => {
        if (departmentFilter && budget.department !== departmentFilter) return false;
        if (typeFilter && budget.budget_type !== typeFilter) return false;
        if (statusFilter && budget.status !== statusFilter) return false;
        if (yearFilter && budget.academic_year !== yearFilter) return false;
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                budget.budget_name.toLowerCase().includes(searchLower) ||
                budget.department.toLowerCase().includes(searchLower) ||
                budget.academic_year.toLowerCase().includes(searchLower)
            );
        }
        return true;
    });

    const stats = {
        total: budgets.data.length,
        active: budgets.data.filter(b => b.status === 'active').length,
        approved: budgets.data.filter(b => b.status === 'approved').length,
        draft: budgets.data.filter(b => b.status === 'draft').length,
        totalBudgeted: budgets.data.reduce((sum, b) => sum + b.total_budgeted_amount, 0),
        totalActual: budgets.data.reduce((sum, b) => sum + b.total_actual_amount, 0),
        variance: budgets.data.reduce((sum, b) => sum + (b.total_actual_amount - b.total_budgeted_amount), 0),
    };

    const departments = Array.from(new Set(budgets.data.map(b => b.department)));
    const types = Array.from(new Set(budgets.data.map(b => b.budget_type)));
    const years = Array.from(new Set(budgets.data.map(b => b.academic_year)));

    const getVarianceIcon = (budgeted: number, actual: number) => {
        const variance = actual - budgeted;
        if (variance > 0) {
            return <TrendingUp className="w-4 h-4 text-red-600" />;
        } else if (variance < 0) {
            return <TrendingDown className="w-4 h-4 text-green-600" />;
        } else {
            return <CheckCircle className="w-4 h-4 text-gray-600" />;
        }
    };

    const getVarianceColor = (budgeted: number, actual: number) => {
        const variance = actual - budgeted;
        if (variance > 0) {
            return 'text-red-600';
        } else if (variance < 0) {
            return 'text-green-600';
        } else {
            return 'text-gray-600';
        }
    };

    return (
        <AppLayout>
            <Head title="Budget Management" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
                        <p className="text-gray-600">Create and manage school budgets</p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Reports
                        </Button>
                        <Link href="/finance/budget/create">
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Budget
                            </Button>
                        </Link>
                    </div>
                </div>

                <StatGrid cols={4}>
                    <StatCard
                        title="Total Budgets"
                        value={stats.total}
                        icon={DollarSign}
                        color="blue"
                        trendLabel="All budgets"
                    />
                    <StatCard
                        title="Active Budgets"
                        value={stats.active}
                        icon={CheckCircle}
                        color="green"
                        trendLabel="Currently active"
                    />
                    <StatCard
                        title="Total Budgeted"
                        value={`TZS ${stats.totalBudgeted.toLocaleString()}`}
                        icon={DollarSign}
                        color="indigo"
                        trendLabel="Budgeted amount"
                    />
                    <StatCard
                        title="Variance"
                        value={`TZS ${stats.variance.toLocaleString()}`}
                        icon={stats.variance > 0 ? TrendingUp : stats.variance < 0 ? TrendingDown : CheckCircle}
                        color={stats.variance > 0 ? 'red' : stats.variance < 0 ? 'green' : 'slate'}
                        trend={stats.variance > 0 ? 'down' : stats.variance < 0 ? 'up' : 'stable'}
                        trendLabel="Actual vs Budgeted"
                    />
                </StatGrid>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Budgets</CardTitle>
                                <CardDescription>
                                    View and manage all budgets
                                </CardDescription>
                            </div>
                            <div className="flex space-x-4">
                                <Input
                                    placeholder="Search budgets..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-64"
                                />
                                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="All departments" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Departments</SelectItem>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept} value={dept}>
                                                {dept.charAt(0).toUpperCase() + dept.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        {types.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="All status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
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
                                    <TableHead>Budget Name</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Academic Year</TableHead>
                                    <TableHead>Amounts</TableHead>
                                    <TableHead>Variance</TableHead>
                                    <TableHead>Period</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBudgets.map((budget) => (
                                    <TableRow key={budget.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{budget.budget_name}</div>
                                                <div className="text-sm text-gray-500">
                                                    Created by {budget.created_by.first_name} {budget.created_by.last_name}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getDepartmentColor(budget.department)}>
                                                {budget.department.charAt(0).toUpperCase() + budget.department.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getTypeColor(budget.budget_type)}>
                                                {budget.budget_type.charAt(0).toUpperCase() + budget.budget_type.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {budget.academic_year}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="text-sm">
                                                    <span className="font-medium">Budgeted:</span> TZS {budget.total_budgeted_amount.toLocaleString()}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <span className="font-medium">Actual:</span> TZS {budget.total_actual_amount.toLocaleString()}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                {getVarianceIcon(budget.total_budgeted_amount, budget.total_actual_amount)}
                                                <span className={`text-sm font-medium ${getVarianceColor(budget.total_budgeted_amount, budget.total_actual_amount)}`}>
                                                    TZS {(budget.total_actual_amount - budget.total_budgeted_amount).toLocaleString()}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div className="font-medium">
                                                    {new Date(budget.start_date).toLocaleDateString()}
                                                </div>
                                                <div className="text-gray-500">
                                                    to {new Date(budget.end_date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(budget.status)}>
                                                {budget.status.charAt(0).toUpperCase() + budget.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Link href={`/finance/budget/${budget.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/finance/budget/${budget.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                {budget.status === 'draft' && (
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



