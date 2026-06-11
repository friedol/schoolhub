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
    Database, 
    Plus, 
    Search, 
    MoreHorizontal, 
    Download, 
    Trash2, 
    RotateCcw,
    Calendar,
    User,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    HardDrive
} from 'lucide-react';

interface DataBackup {
    id: number;
    file_name: string;
    backup_type: string;
    status: string;
    size: number;
    notes?: string;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
}

interface Statistics {
    total_backups: number;
    successful_backups: number;
    failed_backups: number;
    pending_backups: number;
    total_size: number;
    last_backup?: DataBackup;
    next_scheduled?: string;
}

interface Props {
    backups: {
        data: DataBackup[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    statistics: Statistics;
    filters: {
        backup_type?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
    };
    backupTypes: Record<string, string>;
    statuses: Record<string, string>;
}

export default function DataBackupsIndex({ backups, statistics, filters, backupTypes, statuses }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value || undefined };
        router.get('/system/backups', newFilters, {
            preserveState: true,
            replace: true
        });
    };

    const handleCreateBackup = async () => {
        setIsCreating(true);
        try {
            await router.post('/system/backups', {
                backup_type: 'full',
                modules: [],
                include_files: true,
                notes: 'Manual backup created from dashboard'
            }, {
                onSuccess: () => {
                    setMessage({ type: 'success', text: 'Backup process started successfully.' });
                },
                onError: (errors) => {
                    setMessage({ type: 'error', text: Object.values(errors)[0] as string });
                }
            });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to start backup process.' });
        } finally {
            setIsCreating(false);
        }
    };

    const handleDownload = async (backup: DataBackup) => {
        try {
            const response = await fetch(`/system/backups/${backup.id}/download`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = backup.file_name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to download backup file.' });
        }
    };

    const handleRestore = async (backup: DataBackup) => {
        if (confirm(`Are you sure you want to restore from backup "${backup.file_name}"? This action cannot be undone.`)) {
            try {
                await router.post(`/system/backups/${backup.id}/restore`, {
                    confirm: true,
                    modules: [],
                    overwrite_existing: false
                }, {
                    onSuccess: () => {
                        setMessage({ type: 'success', text: 'Restore process started successfully.' });
                    },
                    onError: (errors) => {
                        setMessage({ type: 'error', text: Object.values(errors)[0] as string });
                    }
                });
            } catch (error) {
                setMessage({ type: 'error', text: 'Failed to start restore process.' });
            }
        }
    };

    const handleDelete = async (backup: DataBackup) => {
        if (confirm(`Are you sure you want to delete backup "${backup.file_name}"? This action cannot be undone.`)) {
            try {
                await router.delete(`/system/backups/${backup.id}`, {
                    onSuccess: () => {
                        setMessage({ type: 'success', text: 'Backup deleted successfully.' });
                    },
                    onError: (errors) => {
                        setMessage({ type: 'error', text: Object.values(errors)[0] as string });
                    }
                });
            } catch (error) {
                setMessage({ type: 'error', text: 'Failed to delete backup.' });
            }
        }
    };

    const getStatusBadge = (status: string) => {
        const statusColors: Record<string, string> = {
            'completed': 'bg-green-100 text-green-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'failed': 'bg-red-100 text-red-800',
            'restoring': 'bg-blue-100 text-blue-800',
        };

        const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
        return <Badge className={colorClass}>{status}</Badge>;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'pending':
            case 'restoring':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-500" />;
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString()
        };
    };

    const filteredBackups = backups.data.filter(backup =>
        backup.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        backup.backup_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        backup.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AppLayout title="Data Backups">
            <Head title="Data Backups" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                        <Database className="h-8 w-8 mr-3 text-blue-600" />
                                        Data Backups
                                    </h2>
                                    <p className="text-gray-600">Manage system backups and data recovery</p>
                                </div>
                                <Button onClick={handleCreateBackup} disabled={isCreating}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    {isCreating ? 'Creating...' : 'Create Backup'}
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

                            {/* Statistics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center">
                                            <Database className="h-8 w-8 text-blue-600 mr-3" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Total Backups</p>
                                                <p className="text-2xl font-bold">{statistics.total_backups}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center">
                                            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Successful</p>
                                                <p className="text-2xl font-bold">{statistics.successful_backups}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center">
                                            <XCircle className="h-8 w-8 text-red-600 mr-3" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Failed</p>
                                                <p className="text-2xl font-bold">{statistics.failed_backups}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center">
                                            <HardDrive className="h-8 w-8 text-purple-600 mr-3" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Total Size</p>
                                                <p className="text-2xl font-bold">{formatFileSize(statistics.total_size)}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Backups ({backups.total})</CardTitle>
                                            <CardDescription>
                                                Manage system backups and recovery operations
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {/* Filters */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Backup Type</label>
                                            <Select
                                                value={filters.backup_type || ''}
                                                onValueChange={(value) => handleFilterChange('backup_type', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="All types" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All types</SelectItem>
                                                    {Object.entries(backupTypes).map(([key, label]) => (
                                                        <SelectItem key={key} value={key}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Status</label>
                                            <Select
                                                value={filters.status || ''}
                                                onValueChange={(value) => handleFilterChange('status', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="All statuses" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All statuses</SelectItem>
                                                    {Object.entries(statuses).map(([key, label]) => (
                                                        <SelectItem key={key} value={key}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Date Range</label>
                                            <div className="flex space-x-2">
                                                <Input
                                                    type="date"
                                                    placeholder="From"
                                                    value={filters.date_from || ''}
                                                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                                />
                                                <Input
                                                    type="date"
                                                    placeholder="To"
                                                    value={filters.date_to || ''}
                                                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Search */}
                                    <div className="relative mb-6">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search backups..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>

                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>File Name</TableHead>
                                                    <TableHead>Type</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Size</TableHead>
                                                    <TableHead>Created By</TableHead>
                                                    <TableHead>Created</TableHead>
                                                    <TableHead className="w-[50px]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredBackups.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={7} className="text-center py-8">
                                                            <div className="flex flex-col items-center">
                                                                <Database className="h-12 w-12 text-gray-400 mb-4" />
                                                                <p className="text-gray-500">No backups found</p>
                                                                <Button 
                                                                    onClick={handleCreateBackup} 
                                                                    variant="outline" 
                                                                    size="sm" 
                                                                    className="mt-2"
                                                                    disabled={isCreating}
                                                                >
                                                                    <Plus className="h-4 w-4 mr-2" />
                                                                    Create your first backup
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    filteredBackups.map((backup) => {
                                                        const { date, time } = formatDate(backup.created_at);
                                                        return (
                                                            <TableRow key={backup.id}>
                                                                <TableCell>
                                                                    <div className="flex items-center">
                                                                        <FileText className="h-4 w-4 mr-2 text-gray-400" />
                                                                        <div>
                                                                            <div className="font-medium">{backup.file_name}</div>
                                                                            {backup.notes && (
                                                                                <div className="text-sm text-gray-500">{backup.notes}</div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant="outline">
                                                                        {backupTypes[backup.backup_type] || backup.backup_type}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center">
                                                                        {getStatusIcon(backup.status)}
                                                                        <span className="ml-2">{getStatusBadge(backup.status)}</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {formatFileSize(backup.size)}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {backup.user ? (
                                                                        <div className="flex items-center">
                                                                            <User className="h-4 w-4 mr-1 text-gray-400" />
                                                                            {backup.user.name}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-400">System</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center">
                                                                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
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
                                                                                <Link href={`/system/backups/${backup.id}`}>
                                                                                    View Details
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                            {backup.status === 'completed' && (
                                                                                <DropdownMenuItem onClick={() => handleDownload(backup)}>
                                                                                    <Download className="h-4 w-4 mr-2" />
                                                                                    Download
                                                                                </DropdownMenuItem>
                                                                            )}
                                                                            {backup.status === 'completed' && (
                                                                                <DropdownMenuItem onClick={() => handleRestore(backup)}>
                                                                                    <RotateCcw className="h-4 w-4 mr-2" />
                                                                                    Restore
                                                                                </DropdownMenuItem>
                                                                            )}
                                                                            <DropdownMenuItem 
                                                                                onClick={() => handleDelete(backup)}
                                                                                className="text-red-600"
                                                                            >
                                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                                Delete
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
                                    {backups.last_page > 1 && (
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="text-sm text-gray-500">
                                                Showing {((backups.current_page - 1) * backups.per_page) + 1} to{' '}
                                                {Math.min(backups.current_page * backups.per_page, backups.total)} of{' '}
                                                {backups.total} results
                                            </div>
                                            <div className="flex space-x-2">
                                                {backups.current_page > 1 && (
                                                    <Link
                                                        href={`/system/backups?page=${backups.current_page - 1}`}
                                                        className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                                                    >
                                                        Previous
                                                    </Link>
                                                )}
                                                {backups.current_page < backups.last_page && (
                                                    <Link
                                                        href={`/system/backups?page=${backups.current_page + 1}`}
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
