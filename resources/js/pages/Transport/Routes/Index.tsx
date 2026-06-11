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
    Route,
    Plus,
    Edit,
    Trash2,
    MapPin,
    Bus,
    Users,
    Navigation,
    X,
} from 'lucide-react';

interface TransportRoute {
    id: number;
    route_name: string;
    start_point: string;
    end_point: string;
    distance_km: number;
    stops: string[];
    assigned_vehicle: string | null;
    students_count: number;
    status: 'active' | 'inactive';
    description: string;
}

const mockRoutes: TransportRoute[] = [
    {
        id: 1,
        route_name: 'Msasani - School',
        start_point: 'Msasani Peninsula',
        end_point: 'School Gate',
        distance_km: 12,
        stops: ['Msasani Roundabout', 'Shoppers Plaza', 'Mlimani City', 'University Road'],
        assigned_vehicle: 'T 123 ABC',
        students_count: 28,
        status: 'active',
        description: 'Morning and afternoon route covering Msasani area.',
    },
    {
        id: 2,
        route_name: 'Mbezi Beach - School',
        start_point: 'Mbezi Beach',
        end_point: 'School Gate',
        distance_km: 18,
        stops: ['Mbezi Beach Hotel', 'Morocco Junction', 'Makumbusho', 'Makongo'],
        assigned_vehicle: 'T 456 DEF',
        students_count: 32,
        status: 'active',
        description: 'Covers Mbezi Beach and surrounding estates.',
    },
    {
        id: 3,
        route_name: 'Kimara - School',
        start_point: 'Kimara Bus Stand',
        end_point: 'School Gate',
        distance_km: 22,
        stops: ['Kimara Suka', 'Kimara Mwisho', 'Tabata Segerea', 'Tabata Junction'],
        assigned_vehicle: 'T 789 GHI',
        students_count: 25,
        status: 'active',
        description: 'Long distance route through Kimara and Tabata.',
    },
    {
        id: 4,
        route_name: 'Sinza - School',
        start_point: 'Sinza Mori',
        end_point: 'School Gate',
        distance_km: 8,
        stops: ['Sinza C', 'Mwenge Junction', 'Kijitonyama'],
        assigned_vehicle: 'T 321 JKL',
        students_count: 18,
        status: 'active',
        description: 'Short route for Sinza and Mwenge students.',
    },
    {
        id: 5,
        route_name: 'Magomeni - School',
        start_point: 'Magomeni Mapipa',
        end_point: 'School Gate',
        distance_km: 6,
        stops: ['Magomeni Market', 'Kinondoni Road', 'Kinondoni DC'],
        assigned_vehicle: null,
        students_count: 0,
        status: 'inactive',
        description: 'Currently suspended due to low enrolment.',
    },
];

interface RouteFormData {
    route_name: string;
    start_point: string;
    end_point: string;
    distance_km: number;
    stops: string[];
    assigned_vehicle: string;
    status: 'active' | 'inactive';
    description: string;
}

const emptyForm: RouteFormData = {
    route_name: '',
    start_point: '',
    end_point: '',
    distance_km: 0,
    stops: [''],
    assigned_vehicle: '',
    status: 'active',
    description: '',
};

const getStatusColor = (status: TransportRoute['status']) => {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800';
        case 'inactive':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export default function RoutesIndex() {
    const [routes, setRoutes] = useState<TransportRoute[]>(mockRoutes);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState<TransportRoute | null>(null);
    const [formData, setFormData] = useState<RouteFormData>(emptyForm);

    const filtered = routes.filter((r) => {
        if (statusFilter && r.status !== statusFilter) return false;
        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            return (
                r.route_name.toLowerCase().includes(s) ||
                r.start_point.toLowerCase().includes(s) ||
                r.end_point.toLowerCase().includes(s)
            );
        }
        return true;
    });

    const stats = {
        total: routes.length,
        active: routes.filter(r => r.status === 'active').length,
        totalStudents: routes.reduce((sum, r) => sum + r.students_count, 0),
        totalStops: routes.reduce((sum, r) => sum + r.stops.length, 0),
    };

    const openCreate = () => {
        setEditingRoute(null);
        setFormData(emptyForm);
        setDialogOpen(true);
    };

    const openEdit = (route: TransportRoute) => {
        setEditingRoute(route);
        setFormData({
            route_name: route.route_name,
            start_point: route.start_point,
            end_point: route.end_point,
            distance_km: route.distance_km,
            stops: route.stops.length > 0 ? route.stops : [''],
            assigned_vehicle: route.assigned_vehicle ?? '',
            status: route.status,
            description: route.description,
        });
        setDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        setRoutes(prev => prev.filter(r => r.id !== id));
    };

    const handleSave = () => {
        const cleanedStops = formData.stops.filter(s => s.trim() !== '');
        if (editingRoute) {
            setRoutes(prev =>
                prev.map(r =>
                    r.id === editingRoute.id
                        ? {
                            ...r,
                            ...formData,
                            stops: cleanedStops,
                            assigned_vehicle: formData.assigned_vehicle || null,
                        }
                        : r
                )
            );
        } else {
            const newId = Math.max(...routes.map(r => r.id)) + 1;
            setRoutes(prev => [
                ...prev,
                {
                    ...formData,
                    id: newId,
                    stops: cleanedStops,
                    students_count: 0,
                    assigned_vehicle: formData.assigned_vehicle || null,
                },
            ]);
        }
        setDialogOpen(false);
    };

    const addStop = () => {
        setFormData(prev => ({ ...prev, stops: [...prev.stops, ''] }));
    };

    const updateStop = (index: number, value: string) => {
        setFormData(prev => {
            const stops = [...prev.stops];
            stops[index] = value;
            return { ...prev, stops };
        });
    };

    const removeStop = (index: number) => {
        setFormData(prev => ({
            ...prev,
            stops: prev.stops.filter((_, i) => i !== index),
        }));
    };

    return (
        <AppLayout>
            <Head title="Transport Routes" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Transport Routes</h1>
                        <p className="text-gray-600">Manage school transport routes and stops</p>
                    </div>
                    <div className="flex space-x-2">
                        <Link href="/transport">
                            <Button variant="outline">
                                <Navigation className="w-4 h-4 mr-2" />
                                Dashboard
                            </Button>
                        </Link>
                        <Button onClick={openCreate}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Route
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Routes</CardTitle>
                            <Route className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">All routes</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
                            <Route className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                            <p className="text-xs text-muted-foreground">Currently operating</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Students Served</CardTitle>
                            <Users className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
                            <p className="text-xs text-muted-foreground">Across all routes</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Stops</CardTitle>
                            <MapPin className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{stats.totalStops}</div>
                            <p className="text-xs text-muted-foreground">Pickup/drop-off points</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Routes Directory</CardTitle>
                                <CardDescription>All configured transport routes</CardDescription>
                            </div>
                            <div className="flex space-x-3">
                                <Input
                                    placeholder="Search routes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-56"
                                />
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-36">
                                        <SelectValue placeholder="All status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Route Name</TableHead>
                                    <TableHead>Start Point</TableHead>
                                    <TableHead>End Point</TableHead>
                                    <TableHead>Distance</TableHead>
                                    <TableHead>Stops</TableHead>
                                    <TableHead>Vehicle</TableHead>
                                    <TableHead>Students</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((route) => (
                                    <TableRow key={route.id}>
                                        <TableCell>
                                            <div className="font-medium">{route.route_name}</div>
                                            {route.description && (
                                                <div className="text-xs text-gray-500 mt-0.5 max-w-[200px] truncate">
                                                    {route.description}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-sm">
                                                <MapPin className="w-3 h-3 mr-1 text-green-500" />
                                                {route.start_point}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-sm">
                                                <MapPin className="w-3 h-3 mr-1 text-red-500" />
                                                {route.end_point}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">{route.distance_km}</span>
                                            <span className="text-sm text-gray-500"> km</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                                                <span>{route.stops.length} stops</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {route.assigned_vehicle ? (
                                                <Badge variant="outline" className="font-mono">
                                                    <Bus className="w-3 h-3 mr-1" />
                                                    {route.assigned_vehicle}
                                                </Badge>
                                            ) : (
                                                <span className="text-sm text-gray-400">Unassigned</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <Users className="w-3 h-3 mr-1 text-gray-400" />
                                                {route.students_count}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(route.status)}>
                                                {route.status.charAt(0).toUpperCase() + route.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openEdit(route)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() => handleDelete(route.id)}
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
                                            No routes found matching your filters.
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
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingRoute ? 'Edit Route' : 'Add New Route'}</DialogTitle>
                        <DialogDescription>
                            {editingRoute ? 'Update the route information below.' : 'Enter the details for the new route.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-2">
                        <div className="col-span-2 space-y-1">
                            <Label>Route Name</Label>
                            <Input
                                value={formData.route_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, route_name: e.target.value }))}
                                placeholder="e.g. Msasani - School"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Start Point</Label>
                            <Input
                                value={formData.start_point}
                                onChange={(e) => setFormData(prev => ({ ...prev, start_point: e.target.value }))}
                                placeholder="Starting location"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>End Point</Label>
                            <Input
                                value={formData.end_point}
                                onChange={(e) => setFormData(prev => ({ ...prev, end_point: e.target.value }))}
                                placeholder="Ending location"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Distance (km)</Label>
                            <Input
                                type="number"
                                value={formData.distance_km}
                                onChange={(e) => setFormData(prev => ({ ...prev, distance_km: parseFloat(e.target.value) || 0 }))}
                                placeholder="e.g. 12"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Assigned Vehicle</Label>
                            <Input
                                value={formData.assigned_vehicle}
                                onChange={(e) => setFormData(prev => ({ ...prev, assigned_vehicle: e.target.value }))}
                                placeholder="e.g. T 123 ABC (optional)"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(v) => setFormData(prev => ({ ...prev, status: v as TransportRoute['status'] }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-2 space-y-1">
                            <Label>Description</Label>
                            <Input
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Brief route description (optional)"
                            />
                        </div>

                        {/* Dynamic stops list */}
                        <div className="col-span-2 space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>Stops</Label>
                                <Button type="button" variant="outline" size="sm" onClick={addStop}>
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Stop
                                </Button>
                            </div>
                            {formData.stops.map((stop, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-medium text-gray-600">{index + 1}</span>
                                    </div>
                                    <Input
                                        value={stop}
                                        onChange={(e) => updateStop(index, e.target.value)}
                                        placeholder={`Stop ${index + 1} name`}
                                        className="flex-1"
                                    />
                                    {formData.stops.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeStop(index)}
                                            className="text-red-500 hover:text-red-700 px-2"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            {editingRoute ? 'Save Changes' : 'Add Route'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
