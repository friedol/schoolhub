import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, FileText, Clock, CheckCircle, AlertTriangle, DollarSign } from 'lucide-react';

interface PurchaseOrder {
    id: number;
    po_number: string;
    po_date: string;
    expected_delivery_date: string;
    status: string;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    supplier: {
        id: number;
        name: string;
    };
    requested_by: {
        name: string;
    };
    approved_by: {
        name: string;
    };
    items: Array<{
        id: number;
        quantity: number;
        unit_price: number;
        total_amount: number;
        inventory_item: {
            name: string;
        };
    }>;
}

interface Supplier {
    id: number;
    name: string;
}

interface Stats {
    total_orders: number;
    pending_orders: number;
    approved_orders: number;
    overdue_orders: number;
    total_value: number;
}

interface Props {
    purchaseOrders: {
        data: PurchaseOrder[];
        links: any[];
        meta: any;
    };
    suppliers: Supplier[];
    stats: Stats;
    statusOptions: Record<string, string>;
    filters: {
        supplier_id?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
        search?: string;
    };
}

export default function Index({ purchaseOrders, suppliers, stats, statusOptions, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [supplierId, setSupplierId] = useState(filters.supplier_id || '');
    const [status, setStatus] = useState(filters.status || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const handleFilter = () => {
        router.get('/inventory/purchase-orders', {
            search,
            supplier_id: supplierId,
            status,
            date_from: dateFrom,
            date_to: dateTo,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setSupplierId('');
        setStatus('');
        setDateFrom('');
        setDateTo('');
        router.get('/inventory/purchase-orders', {}, {
            preserveState: true,
            replace: true,
        });
    };

    const getStatusBadge = (status: string) => {
        const colorMap = {
            draft: 'secondary',
            pending_approval: 'default',
            approved: 'default',
            sent: 'default',
            acknowledged: 'default',
            partially_delivered: 'secondary',
            fully_delivered: 'default',
            closed: 'outline',
            cancelled: 'destructive',
        };
        
        return (
            <Badge variant={colorMap[status as keyof typeof colorMap] || 'outline'}>
                {statusOptions[status] || status}
            </Badge>
        );
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'draft':
            case 'pending_approval':
                return <Clock className="w-4 h-4" />;
            case 'approved':
            case 'sent':
            case 'acknowledged':
                return <CheckCircle className="w-4 h-4" />;
            case 'cancelled':
                return <AlertTriangle className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Purchase Orders" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Purchase Orders</h2>
                                <Link href="/inventory/purchase-orders/create">
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create PO
                                    </Button>
                                </Link>
                            </div>

                            {/* Statistics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stats.total_orders}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-yellow-600">{stats.pending_orders}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Overdue Orders</CardTitle>
                                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-red-600">{stats.overdue_orders}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            TZS {stats.total_value.toLocaleString()}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Filters */}
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle>Filters</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                        <div>
                                            <Input
                                                placeholder="Search PO number or supplier..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className="w-full"
                                            />
                                        </div>

                                        <Select value={supplierId} onValueChange={setSupplierId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Supplier" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Suppliers</SelectItem>
                                                {suppliers.map((supplier) => (
                                                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                                        {supplier.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select value={status} onValueChange={setStatus}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                {Object.entries(statusOptions).map(([key, value]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {value}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <div>
                                            <Input
                                                type="date"
                                                placeholder="From Date"
                                                value={dateFrom}
                                                onChange={(e) => setDateFrom(e.target.value)}
                                                className="w-full"
                                            />
                                        </div>

                                        <div>
                                            <Input
                                                type="date"
                                                placeholder="To Date"
                                                value={dateTo}
                                                onChange={(e) => setDateTo(e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-4">
                                        <Button onClick={handleFilter}>
                                            <Search className="w-4 h-4 mr-2" />
                                            Apply Filters
                                        </Button>
                                        <Button variant="outline" onClick={clearFilters}>
                                            Clear Filters
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Purchase Orders Table */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Purchase Orders</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>PO Number</TableHead>
                                                <TableHead>Supplier</TableHead>
                                                <TableHead>PO Date</TableHead>
                                                <TableHead>Expected Delivery</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Total Amount</TableHead>
                                                <TableHead>Items</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {purchaseOrders.data.map((po) => (
                                                <TableRow key={po.id}>
                                                    <TableCell className="font-medium">{po.po_number}</TableCell>
                                                    <TableCell>{po.supplier.name}</TableCell>
                                                    <TableCell>
                                                        {new Date(po.po_date).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        {po.expected_delivery_date 
                                                            ? new Date(po.expected_delivery_date).toLocaleDateString()
                                                            : 'N/A'
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(po.status)}
                                                            {getStatusBadge(po.status)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        TZS {po.total_amount.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {po.items.length} items
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            <Link href={`/inventory/purchase-orders/${po.id}`}>
                                                                <Button variant="outline" size="sm">
                                                                    View
                                                                </Button>
                                                            </Link>
                                                            <Link href={`/inventory/purchase-orders/${po.id}/print`}>
                                                                <Button variant="outline" size="sm">
                                                                    Print
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {purchaseOrders.data.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            No purchase orders found.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                
            </div>
        </AuthenticatedLayout>
    );
}



