import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Package, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

interface InventoryItem {
    id: number;
    item_code: string;
    name: string;
    description: string;
    item_type: 'consumable' | 'asset';
    current_stock: number;
    min_stock_level: number;
    reorder_level: number;
    cost_price: number;
    status: string;
    stock_status_color: string;
    category: {
        id: number;
        name: string;
    };
    supplier: {
        id: number;
        name: string;
    };
}

interface Category {
    id: number;
    name: string;
}

interface Supplier {
    id: number;
    name: string;
}

interface Stats {
    total_items: number;
    consumable_items: number;
    asset_items: number;
    low_stock_items: number;
    out_of_stock_items: number;
    total_stock_value: number;
}

interface Props {
    items: {
        data: InventoryItem[];
        links: any[];
        meta: any;
    };
    categories: Category[];
    suppliers: Supplier[];
    stats: Stats;
    filters: {
        category_id?: string;
        item_type?: string;
        supplier_id?: string;
        stock_status?: string;
        search?: string;
    };
}

export default function Index({ items, categories, suppliers, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [itemType, setItemType] = useState(filters.item_type || '');
    const [supplierId, setSupplierId] = useState(filters.supplier_id || '');
    const [stockStatus, setStockStatus] = useState(filters.stock_status || '');

    const handleFilter = () => {
        router.get('/inventory/items', {
            search,
            category_id: categoryId,
            item_type: itemType,
            supplier_id: supplierId,
            stock_status: stockStatus,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setCategoryId('');
        setItemType('');
        setSupplierId('');
        setStockStatus('');
        router.get('/inventory/items', {}, {
            preserveState: true,
            replace: true,
        });
    };

    const getStockStatusBadge = (item: InventoryItem) => {
        const colorMap = {
            red: 'destructive',
            yellow: 'secondary',
            blue: 'default',
            green: 'default',
            gray: 'outline',
        };
        
        return (
            <Badge variant={colorMap[item.stock_status_color as keyof typeof colorMap] || 'outline'}>
                {item.status}
            </Badge>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Inventory Management" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Inventory Management</h2>
                                <Link href="/inventory/items/create">
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Item
                                    </Button>
                                </Link>
                            </div>

                            {/* Statistics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stats.total_items}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-yellow-600">{stats.low_stock_items}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-red-600">{stats.out_of_stock_items}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            TZS {stats.total_stock_value.toLocaleString()}
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
                                                placeholder="Search items..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className="w-full"
                                            />
                                        </div>

                                        <Select value={categoryId} onValueChange={setCategoryId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Categories</SelectItem>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id.toString()}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select value={itemType} onValueChange={setItemType}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Item Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Types</SelectItem>
                                                <SelectItem value="consumable">Consumable</SelectItem>
                                                <SelectItem value="asset">Asset</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select value={supplierId} onValueChange={setSupplierId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Supplier" />
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

                                        <Select value={stockStatus} onValueChange={setStockStatus}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Stock Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="low_stock">Low Stock</SelectItem>
                                                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                                <SelectItem value="overstocked">Overstocked</SelectItem>
                                                <SelectItem value="needs_reorder">Needs Reorder</SelectItem>
                                            </SelectContent>
                                        </Select>
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

                            {/* Items Table */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Inventory Items</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Item Code</TableHead>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Current Stock</TableHead>
                                                <TableHead>Min Level</TableHead>
                                                <TableHead>Cost Price</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.data.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">{item.item_code}</TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{item.name}</div>
                                                            {item.description && (
                                                                <div className="text-sm text-gray-500">
                                                                    {item.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{item.category?.name || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={item.item_type === 'asset' ? 'default' : 'secondary'}>
                                                            {item.item_type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{item.current_stock}</TableCell>
                                                    <TableCell>{item.min_stock_level}</TableCell>
                                                    <TableCell>TZS {item.cost_price.toLocaleString()}</TableCell>
                                                    <TableCell>{getStockStatusBadge(item)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            <Link href={`/inventory/items/${item.id}`}>
                                                                <Button variant="outline" size="sm">
                                                                    View
                                                                </Button>
                                                            </Link>
                                                            <Link href={`/inventory/items/${item.id}/edit`}>
                                                                <Button variant="outline" size="sm">
                                                                    Edit
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {items.data.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            No inventory items found.
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



