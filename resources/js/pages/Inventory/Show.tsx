import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Edit, Package, TrendingUp, AlertTriangle, Calendar, User } from 'lucide-react';

interface InventoryItem {
    id: number;
    item_code: string;
    name: string;
    description: string;
    item_type: 'consumable' | 'asset';
    manufacturer: string;
    model: string;
    serial_number: string;
    unit_of_measure: string;
    cost_price: number;
    replacement_value: number;
    current_stock: number;
    min_stock_level: number;
    reorder_level: number;
    max_stock_level: number;
    location: string;
    shelf_location: string;
    barcode: string;
    batch_number: string;
    expiry_date: string;
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
    transactions: Array<{
        id: number;
        type: string;
        quantity: number;
        transaction_date: string;
        remarks: string;
        performed_by: {
            name: string;
        };
    }>;
    assignments: Array<{
        id: number;
        assignment_date: string;
        purpose: string;
        assigned_to: {
            name: string;
        };
    }>;
    maintenance_records: Array<{
        id: number;
        maintenance_type: string;
        maintenance_date: string;
        description: string;
        cost: number;
        status: string;
    }>;
}

interface Props {
    item: InventoryItem;
}

export default function Show({ item }: Props) {
    const getStockStatusBadge = () => {
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

    const getTransactionTypeBadge = (type: string) => {
        const colorMap = {
            in: 'default',
            out: 'destructive',
            adjustment: 'secondary',
        };
        
        return (
            <Badge variant={colorMap[type as keyof typeof colorMap] || 'outline'}>
                {type.toUpperCase()}
            </Badge>
        );
    };

    const getMaintenanceTypeBadge = (type: string) => {
        const colorMap = {
            preventive: 'default',
            corrective: 'destructive',
            emergency: 'destructive',
            upgrade: 'secondary',
        };
        
        return (
            <Badge variant={colorMap[type as keyof typeof colorMap] || 'outline'}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={`${item.name} - Inventory Item`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <Link href="/inventory/items">
                                        <Button variant="outline" size="sm">
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Back
                                        </Button>
                                    </Link>
                                    <div>
                                        <h2 className="text-2xl font-bold">{item.name}</h2>
                                        <p className="text-gray-600">{item.item_code}</p>
                                    </div>
                                </div>
                                <Link href={`/inventory/items/${item.id}/edit`}>
                                    <Button>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Item
                                    </Button>
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Main Information */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Basic Details */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Package className="w-5 h-5" />
                                                Basic Details
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Item Code</label>
                                                    <p className="text-lg font-semibold">{item.item_code}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Item Type</label>
                                                    <div className="mt-1">
                                                        <Badge variant={item.item_type === 'asset' ? 'default' : 'secondary'}>
                                                            {item.item_type}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Category</label>
                                                    <p className="text-lg">{item.category?.name || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Supplier</label>
                                                    <p className="text-lg">{item.supplier?.name || 'N/A'}</p>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="text-sm font-medium text-gray-500">Description</label>
                                                    <p className="text-lg">{item.description || 'No description provided'}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Technical Details */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Technical Details</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Manufacturer</label>
                                                    <p className="text-lg">{item.manufacturer || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Model</label>
                                                    <p className="text-lg">{item.model || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Serial Number</label>
                                                    <p className="text-lg">{item.serial_number || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Unit of Measure</label>
                                                    <p className="text-lg">{item.unit_of_measure}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Barcode</label>
                                                    <p className="text-lg">{item.barcode || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Batch Number</label>
                                                    <p className="text-lg">{item.batch_number || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Stock Transactions */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <TrendingUp className="w-5 h-5" />
                                                Recent Stock Transactions
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {item.transactions.length > 0 ? (
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Date</TableHead>
                                                            <TableHead>Type</TableHead>
                                                            <TableHead>Quantity</TableHead>
                                                            <TableHead>Remarks</TableHead>
                                                            <TableHead>Performed By</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {item.transactions.map((transaction) => (
                                                            <TableRow key={transaction.id}>
                                                                <TableCell>
                                                                    {new Date(transaction.transaction_date).toLocaleDateString()}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {getTransactionTypeBadge(transaction.type)}
                                                                </TableCell>
                                                                <TableCell>{transaction.quantity}</TableCell>
                                                                <TableCell>{transaction.remarks}</TableCell>
                                                                <TableCell>{transaction.performed_by.name}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            ) : (
                                                <p className="text-gray-500 text-center py-4">No transactions recorded</p>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Asset Assignments */}
                                    {item.item_type === 'asset' && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <User className="w-5 h-5" />
                                                    Current Assignments
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {item.assignments.length > 0 ? (
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Assigned To</TableHead>
                                                                <TableHead>Assignment Date</TableHead>
                                                                <TableHead>Purpose</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {item.assignments.map((assignment) => (
                                                                <TableRow key={assignment.id}>
                                                                    <TableCell>{assignment.assigned_to.name}</TableCell>
                                                                    <TableCell>
                                                                        {new Date(assignment.assignment_date).toLocaleDateString()}
                                                                    </TableCell>
                                                                    <TableCell>{assignment.purpose}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                ) : (
                                                    <p className="text-gray-500 text-center py-4">No current assignments</p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Maintenance Records */}
                                    {item.item_type === 'asset' && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Calendar className="w-5 h-5" />
                                                    Maintenance Records
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {item.maintenance_records.length > 0 ? (
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Date</TableHead>
                                                                <TableHead>Type</TableHead>
                                                                <TableHead>Description</TableHead>
                                                                <TableHead>Cost</TableHead>
                                                                <TableHead>Status</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {item.maintenance_records.map((maintenance) => (
                                                                <TableRow key={maintenance.id}>
                                                                    <TableCell>
                                                                        {new Date(maintenance.maintenance_date).toLocaleDateString()}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {getMaintenanceTypeBadge(maintenance.maintenance_type)}
                                                                    </TableCell>
                                                                    <TableCell>{maintenance.description}</TableCell>
                                                                    <TableCell>TZS {maintenance.cost.toLocaleString()}</TableCell>
                                                                    <TableCell>
                                                                        <Badge variant="outline">{maintenance.status}</Badge>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                ) : (
                                                    <p className="text-gray-500 text-center py-4">No maintenance records</p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>

                                {/* Sidebar */}
                                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                                    {/* Stock Status */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <AlertTriangle className="w-5 h-5" />
                                                Stock Status
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="text-center">
                                                <div className="text-3xl font-bold">{item.current_stock}</div>
                                                <div className="text-sm text-gray-500">Current Stock</div>
                                                {getStockStatusBadge()}
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-500">Min Level:</span>
                                                    <span className="font-medium">{item.min_stock_level}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-500">Reorder Level:</span>
                                                    <span className="font-medium">{item.reorder_level}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-500">Max Level:</span>
                                                    <span className="font-medium">{item.max_stock_level || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Financial Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Financial Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Cost Price</label>
                                                <p className="text-lg font-semibold">TZS {item.cost_price.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Replacement Value</label>
                                                <p className="text-lg font-semibold">TZS {item.replacement_value.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Total Stock Value</label>
                                                <p className="text-lg font-semibold text-green-600">
                                                    TZS {(item.current_stock * item.cost_price).toLocaleString()}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Location Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Location Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Location</label>
                                                <p className="text-lg">{item.location || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Shelf Location</label>
                                                <p className="text-lg">{item.shelf_location || 'N/A'}</p>
                                            </div>
                                            {item.expiry_date && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Expiry Date</label>
                                                    <p className="text-lg">{new Date(item.expiry_date).toLocaleDateString()}</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>
                
            </div>
        </AuthenticatedLayout>
    );
}



