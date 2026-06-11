import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { 
    FileText, 
    Search, 
    Filter, 
    MoreHorizontal, 
    Eye, 
    Download, 
    Calendar,
    User,
    Activity,
    Clock,
    Globe,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

interface AuditLog {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
    };
    action: string;
    auditable_type?: string;
    auditable_id?: number;
    ip_address?: string;
    user_agent?: string;
    url?: string;
    created_at: string;
}

interface Props {
    auditLogs: {
        data: AuditLog[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    users: Array<{ id: number; name: string; email: string }>;
    actions: string[];
    auditableTypes: string[];
    filters: {
        user_id?: number;
        action?: string;
        auditable_type?: string;
        date_from?: string;
        date_to?: string;
        ip_address?: string;
    };
}

export default function AuditLogsIndex({ auditLogs, users, actions, auditableTypes, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value || undefined };
        router.get('/system/audit-logs', newFilters, {
            preserveState: true,
            replace: true
        });
    };

    const handleExport = async () => {
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value.toString());
            });
            params.append('format', 'csv');

            const response = await fetch(`/system/audit-logs/export?${params}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to export audit logs.' });
        }
    };

    const getActionBadge = (action: string) => {
        const actionColors: Record<string, string> = {
            'created': 'bg-green-100 text-green-800',
            'updated': 'bg-blue-100 text-blue-800',
            'deleted': 'bg-red-100 text-red-800',
            'logged_in': 'bg-green-100 text-green-800',
            'logged_out': 'bg-gray-100 text-gray-800',
            'failed_login': 'bg-red-100 text-red-800',
            'password_changed': 'bg-yellow-100 text-yellow-800',
        };

        const colorClass = actionColors[action] || 'bg-gray-100 text-gray-800';
        return <Badge className={colorClass}>{action.replace('_', ' ')}</Badge>;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString()
        };
    };

    const filteredLogs = auditLogs.data.filter(log =>
        log.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.auditable_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ip_address?.includes(searchTerm)
    );

    return (
        <AppLayout title="Audit Logs">
            <Head title="Audit Logs" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                        <FileText className="h-8 w-8 mr-3 text-blue-600" />
                                        Audit Logs
                                    </h2>
                                    <p className="text-gray-600">Monitor system activities and user actions</p>
                                </div>
                                <Button onClick={handleExport} variant="outline">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export CSV
                                </Button>
                            </div>

                            {message && (
                                <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                                    {message.type === 'error' ? (
                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    )}
                                    <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
                                        {message.text}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Activity Log ({auditLogs.total})</CardTitle>
                                            <CardDescription>
                                                Track all system activities and user actions
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {/* Filters */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">User</label>
                                            <Select
                                                value={filters.user_id?.toString() || ''}
                                                onValueChange={(value) => handleFilterChange('user_id', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="All users" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All users</SelectItem>
                                                    {users.map((user) => (
                                                        <SelectItem key={user.id} value={user.id.toString()}>
                                                            {user.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Action</label>
                                            <Select
                                                value={filters.action || ''}
                                                onValueChange={(value) => handleFilterChange('action', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="All actions" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All actions</SelectItem>
                                                    {actions.map((action) => (
                                                        <SelectItem key={action} value={action}>
                                                            {action.replace('_', ' ')}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Model Type</label>
                                            <Select
                                                value={filters.auditable_type || ''}
                                                onValueChange={(value) => handleFilterChange('auditable_type', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="All types" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All types</SelectItem>
                                                    {auditableTypes.map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                            {type}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium mb-2 block">IP Address</label>
                                            <Input
                                                placeholder="Search IP..."
                                                value={filters.ip_address || ''}
                                                onChange={(e) => handleFilterChange('ip_address', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Date Range Filters */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">From Date</label>
                                            <Input
                                                type="date"
                                                value={filters.date_from || ''}
                                                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">To Date</label>
                                            <Input
                                                type="date"
                                                value={filters.date_to || ''}
                                                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Search */}
                                    <div className="relative mb-6">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search audit logs..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>

                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>User</TableHead>
                                                    <TableHead>Action</TableHead>
                                                    <TableHead>Model</TableHead>
                                                    <TableHead>IP Address</TableHead>
                                                    <TableHead>Date & Time</TableHead>
                                                    <TableHead className="w-[50px]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredLogs.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="text-center py-8">
                                                            <div className="flex flex-col items-center">
                                                                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                                                                <p className="text-gray-500">No audit logs found</p>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    filteredLogs.map((log) => {
                                                        const { date, time } = formatDate(log.created_at);
                                                        return (
                                                            <TableRow key={log.id}>
                                                                <TableCell>
                                                                    <div className="flex items-center">
                                                                        <User className="h-4 w-4 mr-2 text-gray-400" />
                                                                        <div>
                                                                            <div className="font-medium">{log.user.name}</div>
                                                                            <div className="text-sm text-gray-500">{log.user.email}</div>
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {getActionBadge(log.action)}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {log.auditable_type ? (
                                                                        <div>
                                                                            <div className="font-medium">{log.auditable_type}</div>
                                                                            {log.auditable_id && (
                                                                                <div className="text-sm text-gray-500">ID: {log.auditable_id}</div>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-400">-</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {log.ip_address ? (
                                                                        <div className="flex items-center">
                                                                            <Globe className="h-4 w-4 mr-1 text-gray-400" />
                                                                            {log.ip_address}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-400">-</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center">
                                                                        <Clock className="h-4 w-4 mr-1 text-gray-400" />
                                                                        <div>
                                                                            <div className="text-sm">{date}</div>
                                                                            <div className="text-xs text-gray-500">{time}</div>
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="sm">
                                                                                <MoreHorizontal className="h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={`/system/audit-logs/${log.id}`}>
                                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                                    View Details
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Pagination */}
                                    {auditLogs.last_page > 1 && (
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="text-sm text-gray-500">
                                                Showing {((auditLogs.current_page - 1) * auditLogs.per_page) + 1} to{' '}
                                                {Math.min(auditLogs.current_page * auditLogs.per_page, auditLogs.total)} of{' '}
                                                {auditLogs.total} results
                                            </div>
                                            <div className="flex space-x-2">
                                                {auditLogs.current_page > 1 && (
                                                    <Link
                                                        href={`/system/audit-logs?page=${auditLogs.current_page - 1}`}
                                                        className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                                                    >
                                                        Previous
                                                    </Link>
                                                )}
                                                {auditLogs.current_page < auditLogs.last_page && (
                                                    <Link
                                                        href={`/system/audit-logs?page=${auditLogs.current_page + 1}`}
                                                        className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                                                    >
                                                        Next
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                
            </div>
        </AppLayout>
    );
}
