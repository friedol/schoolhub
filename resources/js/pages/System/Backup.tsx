import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { 
    Database, 
    Download, 
    Upload, 
    Trash2, 
    Clock, 
    CheckCircle, 
    XCircle, 
    AlertCircle,
    HardDrive,
    Cloud,
    Calendar,
    FileText
} from 'lucide-react';

interface BackupData {
    id: number;
    file_name: string;
    file_path: string;
    backup_type: 'full' | 'incremental' | 'differential';
    status: 'completed' | 'failed' | 'in_progress';
    size: number;
    created_at: string;
    notes?: string;
}

interface SystemBackupProps {
    backups: BackupData[];
    statistics: {
        total_backups: number;
        successful_backups: number;
        failed_backups: number;
        total_size: number;
        last_backup: string | null;
    };
}

export default function SystemBackup({ backups, statistics }: SystemBackupProps) {
    const { props } = usePage();

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
            case 'failed':
                return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
            case 'in_progress':
                return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'full':
                return <Badge variant="default">Full Backup</Badge>;
            case 'incremental':
                return <Badge variant="secondary">Incremental</Badge>;
            case 'differential':
                return <Badge variant="outline">Differential</Badge>;
            default:
                return <Badge variant="secondary">{type}</Badge>;
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <AppLayout
            title="Backup & Recovery"
            breadcrumbs={[
                { title: 'Dashboard', href: '/super-admin/dashboard' },
                { title: 'System Configuration', href: '/system/configurations' },
                { title: 'Backup & Recovery', href: '/system/backup' },
            ]}
        >
            <Head title="Backup & Recovery" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Backup & Recovery</h1>
                        <p className="text-muted-foreground">
                            Manage system backups and data recovery operations.
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" asChild>
                            <Link href="/system/backups/restore">
                                <Upload className="mr-2 h-4 w-4" />
                                Restore
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/system/backups/create">
                                <Database className="mr-2 h-4 w-4" />
                                Create Backup
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
                            <Database className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.total_backups}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Successful</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{statistics.successful_backups}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Failed</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{statistics.failed_backups}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
                            <HardDrive className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatFileSize(statistics.total_size)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Common backup and recovery operations.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="backup_type">Backup Type</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select backup type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="full">Full Backup</SelectItem>
                                        <SelectItem value="incremental">Incremental Backup</SelectItem>
                                        <SelectItem value="differential">Differential Backup</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="backup_location">Storage Location</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="local">Local Storage</SelectItem>
                                        <SelectItem value="cloud">Cloud Storage</SelectItem>
                                        <SelectItem value="external">External Drive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="backup_notes">Notes (Optional)</Label>
                                <Input
                                    id="backup_notes"
                                    placeholder="Add backup notes..."
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button>
                                <Database className="mr-2 h-4 w-4" />
                                Create Backup Now
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Backups */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Backups</CardTitle>
                        <CardDescription>
                            List of recent backup operations and their status.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {backups.length === 0 ? (
                                <div className="text-center py-8">
                                    <Database className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No backups</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Get started by creating your first backup.
                                    </p>
                                    <div className="mt-6">
                                        <Button asChild>
                                            <Link href="/system/backups/create">
                                                <Database className="mr-2 h-4 w-4" />
                                                Create Backup
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {backups.map((backup) => (
                                        <Card key={backup.id} className="hover:shadow-md transition-shadow">
                                            <CardContent className="p-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="flex items-center space-x-2">
                                                                <FileText className="h-5 w-5 text-muted-foreground" />
                                                                <h3 className="text-lg font-semibold">{backup.file_name}</h3>
                                                            </div>
                                                            {getStatusBadge(backup.status)}
                                                            {getTypeBadge(backup.backup_type)}
                                                        </div>
                                                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                                                            <span className="flex items-center">
                                                                <Calendar className="h-4 w-4 mr-1" />
                                                                {new Date(backup.created_at).toLocaleString()}
                                                            </span>
                                                            <span className="flex items-center">
                                                                <HardDrive className="h-4 w-4 mr-1" />
                                                                {formatFileSize(backup.size)}
                                                            </span>
                                                            <span className="flex items-center">
                                                                <Database className="h-4 w-4 mr-1" />
                                                                {backup.backup_type}
                                                            </span>
                                                        </div>
                                                        {backup.notes && (
                                                            <p className="text-sm text-muted-foreground mt-2">
                                                                {backup.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/system/backups/${backup.id}/download`}>
                                                                <Download className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                            size="sm"
                                                            className="text-red-600 hover:text-red-700"
                                                            onClick={() => {
                                                                // Delete backup
                                                                // This would call the delete endpoint
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Backup Schedule */}
                <Card>
                    <CardHeader>
                        <CardTitle>Backup Schedule</CardTitle>
                        <CardDescription>
                            Configure automatic backup schedules and retention policies.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="font-medium">Schedule Settings</h4>
                                <div className="space-y-2">
                                    <Label htmlFor="schedule_frequency">Frequency</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select frequency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="hourly">Hourly</SelectItem>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="schedule_time">Time</Label>
                                    <Input
                                        id="schedule_time"
                                        type="time"
                                        defaultValue="02:00"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-medium">Retention Policy</h4>
                                <div className="space-y-2">
                                    <Label htmlFor="retention_days">Keep backups for (days)</Label>
                                    <Input
                                        id="retention_days"
                                        type="number"
                                        defaultValue="30"
                                        min="1"
                                        max="365"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="max_backups">Maximum number of backups</Label>
                                    <Input
                                        id="max_backups"
                                        type="number"
                                        defaultValue="10"
                                        min="1"
                                        max="100"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <Button>
                                Save Schedule
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
