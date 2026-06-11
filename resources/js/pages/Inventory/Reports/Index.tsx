import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    BarChart3, 
    TrendingUp, 
    Package, 
    FileText, 
    AlertTriangle, 
    Wrench,
    Download,
    Eye
} from 'lucide-react';

export default function Index() {
    const reports = [
        {
            id: 'stock-status',
            title: 'Stock Status Report',
            description: 'Overview of all inventory items with their current stock levels and status',
            icon: Package,
            route: '/inventory/reports/stock-status',
            color: 'bg-blue-500',
        },
        {
            id: 'stock-movement',
            title: 'Stock Movement Report',
            description: 'Detailed analysis of stock movements, issues, and receipts over time',
            icon: TrendingUp,
            route: '/inventory/reports/stock-movement',
            color: 'bg-green-500',
        },
        {
            id: 'slow-moving',
            title: 'Slow Moving Items Report',
            description: 'Identify items that have not been issued for a specified period',
            icon: AlertTriangle,
            route: '/inventory/reports/slow-moving',
            color: 'bg-yellow-500',
        },
        {
            id: 'asset-register',
            title: 'Asset Register Report',
            description: 'Complete list of all assets with their details, status, and current value',
            icon: FileText,
            route: '/inventory/reports/asset-register',
            color: 'bg-purple-500',
        },
        {
            id: 'consumption-analysis',
            title: 'Consumption Analysis Report',
            description: 'Analyze consumption patterns to forecast future needs',
            icon: BarChart3,
            route: '/inventory/reports/consumption-analysis',
            color: 'bg-indigo-500',
        },
        {
            id: 'purchase-orders',
            title: 'Purchase Order Report',
            description: 'Summary of purchase orders, suppliers, and procurement activities',
            icon: FileText,
            route: '/inventory/reports/purchase-orders',
            color: 'bg-orange-500',
        },
        {
            id: 'maintenance',
            title: 'Maintenance Report',
            description: 'Track asset maintenance activities, costs, and schedules',
            icon: Wrench,
            route: '/inventory/reports/maintenance',
            color: 'bg-red-500',
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Inventory Reports" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold mb-2">Inventory Reports</h2>
                                <p className="text-gray-600">
                                    Generate comprehensive reports for inventory management, stock analysis, and asset tracking.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {reports.map((report) => {
                                    const IconComponent = report.icon;
                                    return (
                                        <Card key={report.id} className="hover:shadow-lg transition-shadow">
                                            <CardHeader>
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${report.color}`}>
                                                        <IconComponent className="w-6 h-6 text-white" />
                                                    </div>
                                                    <CardTitle className="text-lg">{report.title}</CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-gray-600 mb-4 text-sm">
                                                    {report.description}
                                                </p>
                                                <div className="flex gap-2">
                                                    <Link href={report.route}>
                                                        <Button className="flex-1">
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            View Report
                                                        </Button>
                                                    </Link>
                                                    <Button variant="outline" size="sm">
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            {/* Quick Actions */}
                            <div className="mt-8">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Quick Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <Link href="/inventory">
                                                <Button variant="outline" className="w-full">
                                                    <Package className="w-4 h-4 mr-2" />
                                                    View Inventory
                                                </Button>
                                            </Link>
                                            <Link href="/inventory/purchase-orders">
                                                <Button variant="outline" className="w-full">
                                                    <FileText className="w-4 h-4 mr-2" />
                                                    Purchase Orders
                                                </Button>
                                            </Link>
                                            <Link href="/inventory/goods-received">
                                                <Button variant="outline" className="w-full">
                                                    <TrendingUp className="w-4 h-4 mr-2" />
                                                    Goods Received
                                                </Button>
                                            </Link>
                                            <Link href="/inventory/issue-notes">
                                                <Button variant="outline" className="w-full">
                                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                                    Issue Notes
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Report Categories */}
                            <div className="mt-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Stock Management Reports</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                <li>
                                                    <Link href="/inventory/reports/stock-status" className="text-blue-600 hover:underline">
                                                        Stock Status Report
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/inventory/reports/stock-movement" className="text-blue-600 hover:underline">
                                                        Stock Movement Report
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/inventory/reports/slow-moving" className="text-blue-600 hover:underline">
                                                        Slow Moving Items Report
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/inventory/reports/consumption-analysis" className="text-blue-600 hover:underline">
                                                        Consumption Analysis Report
                                                    </Link>
                                                </li>
                                            </ul>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Asset & Procurement Reports</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                <li>
                                                    <Link href="/inventory/reports/asset-register" className="text-blue-600 hover:underline">
                                                        Asset Register Report
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/inventory/reports/purchase-orders" className="text-blue-600 hover:underline">
                                                        Purchase Order Report
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/inventory/reports/maintenance" className="text-blue-600 hover:underline">
                                                        Maintenance Report
                                                    </Link>
                                                </li>
                                            </ul>
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



