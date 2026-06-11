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
    Bus,
    Plus,
    Edit,
    Trash2,
    Phone,
    Calendar,
    AlertTriangle,
    CheckCircle,
    Wrench,
} from 'lucide-react';

interface Vehicle {
    id: number;
    vehicle_number: string;
    type: 'bus' | 'van' | 'minibus';
    capacity: number;
    driver_name: string;
    driver_phone: string;
    insurance_expiry: string;
    registration_expiry: string;
    status: 'active' | 'inactive' | 'maintenance';
    last_maintenance: string;
}

const mockVehicles: Vehicle[] = [
    {
        id: 1,
        vehicle_number: 'T 123 ABC',
        type: 'bus',
        capacity: 40,
        driver_name: 'Juma Mwangi',
        driver_phone: '+255 712 345 678',
        insurance_expiry: '2026-12-31',
        registration_expiry: '2026-09-15',
        status: 'active',
        last_maintenance: '2026-04-10',
    },
    {
        id: 2,
        vehicle_number: 'T 456 DEF',
        type: 'bus',
        capacity: 45,
        driver_name: 'Hassan Ally',
        driver_phone: '+255 713 456 789',
        insurance_expiry: '2026-11-30',
        registration_expiry: '2026-08-20',
        status: 'active',
        last_maintenance: '2026-03-22',
    },
    {
        id: 3,
        vehicle_number: 'T 789 GHI',
        type: 'minibus',
        capacity: 25,
        driver_name: 'Peter Otieno',
        driver_phone: '+255 714 567 890',
        insurance_expiry: '2027-01-15',
        registration_expiry: '2026-10-05',
        status: 'active',
        last_maintenance: '2026-05-01',
    },
    {
        id: 4,
        vehicle_number: 'T 321 JKL',
        type: 'van',
        capacity: 14,
        driver_name: 'Ahmed Said',
        driver_phone: '+255 715 678 901',
        insurance_expiry: '2026-07-30',
        registration_expiry: '2026-06-30',
        status: 'maintenance',
        last_maintenance: '2026-05-20',
    },
    {
        id: 5,
        vehicle_number: 'T 654 MNO',
        type: 'minibus',
        capacity: 28,
        driver_name: 'Samuel Kimani',
        driver_phone: '+255 716 789 012',
        insurance_expiry: '2025-12-01',
        registration_expiry: '2026-04-10',
        status: 'inactive',
        last_maintenance: '2025-11-15',
    },
];

const emptyForm: Omit<Vehicle, 'id'> = {
    vehicle_number: '',
    type: 'bus',
    capacity: 0,
    driver_name: '',
    driver_phone: '',
    insurance_expiry: '',
    registration_expiry: '',
    status: 'active',
    last_maintenance: '',
};

const getStatusColor = (status: Vehicle['status']) => {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800';
        case 'inactive':
            return 'bg-gray-100 text-gray-800';
        case 'maintenance':
            return 'bg-orange-100 text-orange-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getTypeColor = (type: Vehicle['type']) => {
    switch (type) {
        case 'bus':
            return 'bg-blue-100 text-blue-800';
        case 'minibus':
            return 'bg-purple-100 text-purple-800';
        case 'van':
            return 'bg-indigo-100 text-indigo-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const isExpiringSoon = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
};

export default function VehiclesIndex() {
    const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [formData, setFormData] = useState<Omit<Vehicle, 'id'>>(emptyForm);

    const filtered = vehicles.filter((v) => {
        if (typeFilter && v.type !== typeFilter) return false;
        if (statusFilter && v.status !== statusFilter) return false;
        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            return (
                v.vehicle_number.toLowerCase().includes(s) ||
                v.driver_name.toLowerCase().includes(s) ||
                v.driver_phone.includes(searchTerm)
            );
        }
        return true;
    });

    const stats = {
        total: vehicles.length,
        active: vehicles.filter(v => v.status === 'active').length,
        maintenance: vehicles.filter(v => v.status === 'maintenance').length,
        inactive: vehicles.filter(v => v.status === 'inactive').length,
    };

    const openCreate = () => {
        setEditingVehicle(null);
        setFormData(emptyForm);
        setDialogOpen(true);
    };

    const openEdit = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle);
        const { id, ...rest } = vehicle;
        setFormData(rest);
        setDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        setVehicles(prev => prev.filter(v => v.id !== id));
    };

    const handleSave = () => {
        if (editingVehicle) {
            setVehicles(prev =>
                prev.map(v => v.id === editingVehicle.id ? { ...formData, id: editingVehicle.id } : v)
            );
        } else {
            const newId = Math.max(...vehicles.map(v => v.id)) + 1;
            setVehicles(prev => [...prev, { ...formData, id: newId }]);
        }
        setDialogOpen(false);
    };

    const updateField = <K extends keyof Omit<Vehicle, 'id'>>(key: K, value: Omit<Vehicle, 'id'>[K]) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    return (
        <AppLayout>
            <Head title="Vehicle Fleet Management" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Vehicle Fleet</h1>
                        <p className="text-gray-600">Manage school transport vehicles</p>
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
                            Add Vehicle
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
                            <Bus className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">Fleet size</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                            <p className="text-xs text-muted-foreground">Operational</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">In Maintenance</CardTitle>
                            <Wrench className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.maintenance}</div>
                            <p className="text-xs text-muted-foreground">Under repair</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-500">{stats.inactive}</div>
                            <p className="text-xs text-muted-foreground">Not in service</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Fleet Directory</CardTitle>
                                <CardDescription>All registered transport vehicles</CardDescription>
                            </div>
                            <div className="flex space-x-3">
                                <Input
                                    placeholder="Search vehicles..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-56"
                                />
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-36">
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="bus">Bus</SelectItem>
                                        <SelectItem value="minibus">Minibus</SelectItem>
                                        <SelectItem value="van">Van</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-36">
                                        <SelectValue placeholder="All status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vehicle Number</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Capacity</TableHead>
                                    <TableHead>Driver</TableHead>
                                    <TableHead>Insurance Expiry</TableHead>
                                    <TableHead>Reg. Expiry</TableHead>
                                    <TableHead>Last Maintenance</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((vehicle) => (
                                    <TableRow key={vehicle.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <Bus className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <Badge variant="outline" className="font-mono">
                                                    {vehicle.vehicle_number}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getTypeColor(vehicle.type)}>
                                                {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">{vehicle.capacity}</span>
                                            <span className="text-sm text-gray-500"> seats</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{vehicle.driver_name}</div>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Phone className="w-3 h-3 mr-1" />
                                                {vehicle.driver_phone}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className={`flex items-center text-sm ${isExpiringSoon(vehicle.insurance_expiry) ? 'text-red-600 font-medium' : ''}`}>
                                                {isExpiringSoon(vehicle.insurance_expiry) && (
                                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                                )}
                                                {new Date(vehicle.insurance_expiry).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className={`flex items-center text-sm ${isExpiringSoon(vehicle.registration_expiry) ? 'text-red-600 font-medium' : ''}`}>
                                                {isExpiringSoon(vehicle.registration_expiry) && (
                                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                                )}
                                                {new Date(vehicle.registration_expiry).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {new Date(vehicle.last_maintenance).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(vehicle.status)}>
                                                {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openEdit(vehicle)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() => handleDelete(vehicle.id)}
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
                                            No vehicles found matching your filters.
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
                        <DialogTitle>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
                        <DialogDescription>
                            {editingVehicle
                                ? 'Update the vehicle information below.'
                                : 'Enter the details for the new vehicle.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-2">
                        <div className="space-y-1">
                            <Label>Vehicle Number</Label>
                            <Input
                                value={formData.vehicle_number}
                                onChange={(e) => updateField('vehicle_number', e.target.value)}
                                placeholder="e.g. T 123 ABC"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(v) => updateField('type', v as Vehicle['type'])}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bus">Bus</SelectItem>
                                    <SelectItem value="minibus">Minibus</SelectItem>
                                    <SelectItem value="van">Van</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Capacity (seats)</Label>
                            <Input
                                type="number"
                                value={formData.capacity}
                                onChange={(e) => updateField('capacity', parseInt(e.target.value) || 0)}
                                placeholder="e.g. 40"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(v) => updateField('status', v as Vehicle['status'])}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Driver Name</Label>
                            <Input
                                value={formData.driver_name}
                                onChange={(e) => updateField('driver_name', e.target.value)}
                                placeholder="Full name"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Driver Phone</Label>
                            <Input
                                value={formData.driver_phone}
                                onChange={(e) => updateField('driver_phone', e.target.value)}
                                placeholder="+255 7xx xxx xxx"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Insurance Expiry</Label>
                            <Input
                                type="date"
                                value={formData.insurance_expiry}
                                onChange={(e) => updateField('insurance_expiry', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Registration Expiry</Label>
                            <Input
                                type="date"
                                value={formData.registration_expiry}
                                onChange={(e) => updateField('registration_expiry', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1 col-span-2">
                            <Label>Last Maintenance Date</Label>
                            <Input
                                type="date"
                                value={formData.last_maintenance}
                                onChange={(e) => updateField('last_maintenance', e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            {editingVehicle ? 'Save Changes' : 'Add Vehicle'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
