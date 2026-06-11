import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Wrench,
    Plus,
    Edit,
    Trash2,
    Bus,
    Calendar,
    AlertTriangle,
    CheckCircle,
    Clock,
    DollarSign,
} from 'lucide-react';

interface MaintenanceRecord {
    id: number;
    vehicle_number: string;
    maintenance_type: 'oil_change' | 'tire_replacement' | 'brake_service' | 'engine_repair' | 'body_repair' | 'inspection' | 'other';
    description: string;
    date: string;
    cost: number;
    next_service_date: string;
    status: 'scheduled' | 'in_progress' | 'completed';
    technician: string;
}

const mockRecords: MaintenanceRecord[] = [
    {
        id: 1,
        vehicle_number: 'T 123 ABC',
        maintenance_type: 'oil_change',
        description: 'Regular engine oil and filter change',
        date: '2026-04-10',
        cost: 45000,
        next_service_date: '2026-07-10',
        status: 'completed',
        technician: 'John Mechanic',
    },
    {
        id: 2,
        vehicle_number: 'T 456 DEF',
        maintenance_type: 'brake_service',
        description: 'Front brake pads replacement and fluid top-up',
        date: '2026-03-22',
        cost: 120000,
        next_service_date: '2026-09-22',
        status: 'completed',
        technician: 'Mike Auto',
    },
    {
        id: 3,
        vehicle_number: 'T 789 GHI',
        maintenance_type: 'tire_replacement',
        description: 'Two rear tires worn out, replaced with new ones',
        date: '2026-05-01',
        cost: 280000,
        next_service_date: '2027-05-01',
        status: 'completed',
        technician: 'Peter Garage',
    },
    {
        id: 4,
        vehicle_number: 'T 321 JKL',
        maintenance_type: 'engine_repair',
        description: 'Engine overheating issue — cooling system repair and coolant flush',
        date: '2026-05-20',
        cost: 350000,
        next_service_date: '2026-08-20',
        status: 'in_progress',
        technician: 'Hassan Motors',
    },
    {
        id: 5,
        vehicle_number: 'T 654 MNO',
        maintenance_type: 'inspection',
        description: 'Annual government roadworthiness inspection',
        date: '2026-06-01',
        cost: 30000,
        next_service_date: '2027-06-01',
        status: 'scheduled',
        technician: 'TBS Inspector',
    },
    {
        id: 6,
        vehicle_number: 'T 123 ABC',
        maintenance_type: 'body_repair',
        description: 'Minor dent and scratch repair on passenger side',
        date: '2026-02-14',
        cost: 75000,
        next_service_date: '',
        status: 'completed',
        technician: 'Color Match Garage',
    },
    {
        id: 7,
        vehicle_number: 'T 456 DEF',
        maintenance_type: 'oil_change',
        description: 'Scheduled oil change and general service',
        date: '2026-06-15',
        cost: 50000,
        next_service_date: '2026-09-15',
        status: 'scheduled',
        technician: 'John Mechanic',
    },
];

const vehicleOptions = ['T 123 ABC', 'T 456 DEF', 'T 789 GHI', 'T 321 JKL', 'T 654 MNO'];

interface MaintenanceFormData {
    vehicle_number: string;
    maintenance_type: MaintenanceRecord['maintenance_type'];
    description: string;
    date: string;
    cost: number;
    next_service_date: string;
    status: MaintenanceRecord['status'];
    technician: string;
}

const emptyForm: MaintenanceFormData = {
    vehicle_number: '',
    maintenance_type: 'oil_change',
    description: '',
    date: new Date().toISOString().split('T')[0],
    cost: 0,
    next_service_date: '',
    status: 'scheduled',
    technician: '',
};

const getStatusColor = (status: MaintenanceRecord['status']) => {
    switch (status) {
        case 'completed':
            return 'bg-green-100 text-green-800';
        case 'in_progress':
            return 'bg-blue-100 text-blue-800';
        case 'scheduled':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getTypeColor = (type: MaintenanceRecord['maintenance_type']) => {
    switch (type) {
        case 'oil_change':
            return 'bg-blue-100 text-blue-800';
        case 'tire_replacement':
            return 'bg-purple-100 text-purple-800';
        case 'brake_service':
            return 'bg-orange-100 text-orange-800';
        case 'engine_repair':
            return 'bg-red-100 text-red-800';
        case 'body_repair':
            return 'bg-pink-100 text-pink-800';
        case 'inspection':
            return 'bg-indigo-100 text-indigo-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const formatTypeLabel = (type: MaintenanceRecord['maintenance_type']) =>
    type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const isOverdue = (nextServiceDate: string) => {
    if (!nextServiceDate) return false;
    return new Date(nextServiceDate) < new Date();
};

const isDueThisMonth = (nextServiceDate: string) => {
    if (!nextServiceDate) return false;
    const date = new Date(nextServiceDate);
    const now = new Date();
    return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date >= now
    );
};

export default function MaintenanceIndex() {
    const [records, setRecords] = useState<MaintenanceRecord[]>(mockRecords);
    const [vehicleFilter, setVehicleFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
    const [formData, setFormData] = useState<MaintenanceFormData>(emptyForm);

    const filtered = records.filter((r) => {
        if (vehicleFilter && r.vehicle_number !== vehicleFilter) return false;
        if (statusFilter && r.status !== statusFilter) return false;
        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            return (
                r.vehicle_number.toLowerCase().includes(s) ||
                r.description.toLowerCase().includes(s) ||
                r.technician.toLowerCase().includes(s)
            );
        }
        return true;
    });

    const currentYear = new Date().getFullYear().toString();
    const stats = {
        due_this_month: records.filter(r => r.status !== 'completed' && isDueThisMonth(r.next_service_date)).length +
            records.filter(r => r.status === 'scheduled' && isDueThisMonth(r.date)).length,
        overdue: records.filter(r => r.status !== 'completed' && isOverdue(r.next_service_date)).length,
        total_cost_this_year: records
            .filter(r => r.date.startsWith(currentYear) && r.status === 'completed')
            .reduce((sum, r) => sum + r.cost, 0),
        in_progress: records.filter(r => r.status === 'in_progress').length,
    };

    const openCreate = () => {
        setEditingRecord(null);
        setFormData(emptyForm);
        setDialogOpen(true);
    };

    const openEdit = (record: MaintenanceRecord) => {
        setEditingRecord(record);
        const { id, ...rest } = record;
        setFormData(rest);
        setDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        setRecords(prev => prev.filter(r => r.id !== id));
    };

    const handleSave = () => {
        if (editingRecord) {
            setRecords(prev =>
                prev.map(r => r.id === editingRecord.id ? { ...formData, id: editingRecord.id } : r)
            );
        } else {
            const newId = Math.max(...records.map(r => r.id)) + 1;
            setRecords(prev => [...prev, { ...formData, id: newId }]);
        }
        setDialogOpen(false);
    };

    const updateField = <K extends keyof MaintenanceFormData>(key: K, value: MaintenanceFormData[K]) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    return (
        <AppLayout>
            <Head title="Vehicle Maintenance" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Vehicle Maintenance</h1>
                        <p className="text-gray-600">Track and schedule vehicle maintenance records</p>
                    </div>
                    <div className="flex space-x-2">
                        <Link href="/transport">
                            <Button variant="outline">
                                <Bus className="w-4 h-4 mr-2" />
                                Dashboard
                            </Button>
                        </Link>
                        <Button onClick={openCreate}>
                            <Plus className="w-4 h-4 mr-2" />
                            Schedule Maintenance
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Due This Month</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.due_this_month}</div>
                            <p className="text-xs text-muted-foreground">Upcoming services</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                            <p className="text-xs text-muted-foreground">Past service date</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                            <Wrench className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.in_progress}</div>
                            <p className="text-xs text-muted-foreground">Currently being serviced</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Cost This Year</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                TZS {stats.total_cost_this_year.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">Completed services {currentYear}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Maintenance Records</CardTitle>
                                <CardDescription>All vehicle maintenance history and schedule</CardDescription>
                            </div>
                            <div className="flex space-x-3">
                                <Input
                                    placeholder="Search records..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-48"
                                />
                                <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="All vehicles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Vehicles</SelectItem>
                                        {vehicleOptions.map(v => (
                                            <SelectItem key={v} value={v}>{v}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-36">
                                        <SelectValue placeholder="All status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="scheduled">Scheduled</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vehicle</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Cost (TZS)</TableHead>
                                    <TableHead>Next Service</TableHead>
                                    <TableHead>Technician</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <Bus className="w-4 h-4 text-gray-600" />
                                                </div>
                                                <Badge variant="outline" className="font-mono">
                                                    {record.vehicle_number}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getTypeColor(record.maintenance_type)}>
                                                {formatTypeLabel(record.maintenance_type)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-[220px] text-sm truncate" title={record.description}>
                                                {record.description}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-sm">
                                                <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                                                {new Date(record.date).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">{record.cost.toLocaleString()}</span>
                                        </TableCell>
                                        <TableCell>
                                            {record.next_service_date ? (
                                                <div className={`flex items-center text-sm ${isOverdue(record.next_service_date) && record.status !== 'completed' ? 'text-red-600 font-medium' : ''}`}>
                                                    {isOverdue(record.next_service_date) && record.status !== 'completed' && (
                                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                                    )}
                                                    {new Date(record.next_service_date).toLocaleDateString()}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{record.technician}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(record.status)}>
                                                {record.status === 'in_progress' ? 'In Progress' :
                                                    record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openEdit(record)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() => handleDelete(record.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                            No maintenance records found matching your filters.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Create / Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingRecord ? 'Edit Maintenance Record' : 'Schedule Maintenance'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingRecord
                                ? 'Update the maintenance record details.'
                                : 'Log a new maintenance record or schedule an upcoming service.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-2">
                        <div className="space-y-1">
                            <Label>Vehicle</Label>
                            <Select
                                value={formData.vehicle_number}
                                onValueChange={(v) => updateField('vehicle_number', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select vehicle" />
                                </SelectTrigger>
                                <SelectContent>
                                    {vehicleOptions.map(v => (
                                        <SelectItem key={v} value={v}>{v}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Maintenance Type</Label>
                            <Select
                                value={formData.maintenance_type}
                                onValueChange={(v) => updateField('maintenance_type', v as MaintenanceRecord['maintenance_type'])}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="oil_change">Oil Change</SelectItem>
                                    <SelectItem value="tire_replacement">Tire Replacement</SelectItem>
                                    <SelectItem value="brake_service">Brake Service</SelectItem>
                                    <SelectItem value="engine_repair">Engine Repair</SelectItem>
                                    <SelectItem value="body_repair">Body Repair</SelectItem>
                                    <SelectItem value="inspection">Inspection</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-2 space-y-1">
                            <Label>Description</Label>
                            <Input
                                value={formData.description}
                                onChange={(e) => updateField('description', e.target.value)}
                                placeholder="Brief description of work done or to be done"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Service Date</Label>
                            <Input
                                type="date"
                                value={formData.date}
                                onChange={(e) => updateField('date', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Cost (TZS)</Label>
                            <Input
                                type="number"
                                value={formData.cost}
                                onChange={(e) => updateField('cost', parseFloat(e.target.value) || 0)}
                                placeholder="e.g. 150000"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Next Service Date</Label>
                            <Input
                                type="date"
                                value={formData.next_service_date}
                                onChange={(e) => updateField('next_service_date', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(v) => updateField('status', v as MaintenanceRecord['status'])}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-2 space-y-1">
                            <Label>Technician / Garage</Label>
                            <Input
                                value={formData.technician}
                                onChange={(e) => updateField('technician', e.target.value)}
                                placeholder="Name of mechanic or garage"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            {editingRecord ? 'Save Changes' : 'Schedule Maintenance'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
