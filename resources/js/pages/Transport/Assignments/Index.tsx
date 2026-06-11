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
    Users,
    Plus,
    Trash2,
    MapPin,
    Route,
    Calendar,
    CheckCircle,
    XCircle,
    UserPlus,
} from 'lucide-react';

interface Assignment {
    id: number;
    student_name: string;
    student_id: string;
    class: string;
    route_name: string;
    pickup_stop: string;
    dropoff_stop: string;
    status: 'active' | 'inactive' | 'suspended';
    assigned_date: string;
}

const mockAssignments: Assignment[] = [
    {
        id: 1,
        student_name: 'Amina Juma',
        student_id: 'STU-2024-001',
        class: 'Form 3A',
        route_name: 'Msasani - School',
        pickup_stop: 'Msasani Roundabout',
        dropoff_stop: 'School Gate',
        status: 'active',
        assigned_date: '2026-01-15',
    },
    {
        id: 2,
        student_name: 'Brian Otieno',
        student_id: 'STU-2024-002',
        class: 'Form 1B',
        route_name: 'Mbezi Beach - School',
        pickup_stop: 'Morocco Junction',
        dropoff_stop: 'School Gate',
        status: 'active',
        assigned_date: '2026-01-15',
    },
    {
        id: 3,
        student_name: 'Clara Hassan',
        student_id: 'STU-2024-003',
        class: 'Form 2C',
        route_name: 'Kimara - School',
        pickup_stop: 'Kimara Suka',
        dropoff_stop: 'School Gate',
        status: 'active',
        assigned_date: '2026-02-01',
    },
    {
        id: 4,
        student_name: 'David Mwangi',
        student_id: 'STU-2024-004',
        class: 'Form 4A',
        route_name: 'Sinza - School',
        pickup_stop: 'Sinza C',
        dropoff_stop: 'School Gate',
        status: 'active',
        assigned_date: '2026-01-20',
    },
    {
        id: 5,
        student_name: 'Esther Kimani',
        student_id: 'STU-2024-005',
        class: 'Form 1A',
        route_name: 'Msasani - School',
        pickup_stop: 'Shoppers Plaza',
        dropoff_stop: 'School Gate',
        status: 'suspended',
        assigned_date: '2026-01-15',
    },
    {
        id: 6,
        student_name: 'Frank Ally',
        student_id: 'STU-2024-006',
        class: 'Form 3B',
        route_name: 'Mbezi Beach - School',
        pickup_stop: 'Mbezi Beach Hotel',
        dropoff_stop: 'School Gate',
        status: 'active',
        assigned_date: '2026-03-05',
    },
];

const availableRoutes = [
    { name: 'Msasani - School', stops: ['Msasani Roundabout', 'Shoppers Plaza', 'Mlimani City', 'University Road'] },
    { name: 'Mbezi Beach - School', stops: ['Mbezi Beach Hotel', 'Morocco Junction', 'Makumbusho', 'Makongo'] },
    { name: 'Kimara - School', stops: ['Kimara Suka', 'Kimara Mwisho', 'Tabata Segerea', 'Tabata Junction'] },
    { name: 'Sinza - School', stops: ['Sinza C', 'Mwenge Junction', 'Kijitonyama'] },
];

const availableClasses = ['Form 1A', 'Form 1B', 'Form 2A', 'Form 2B', 'Form 2C', 'Form 3A', 'Form 3B', 'Form 4A', 'Form 4B'];

interface AssignmentFormData {
    student_name: string;
    student_id: string;
    class: string;
    route_name: string;
    pickup_stop: string;
    dropoff_stop: string;
    status: 'active' | 'inactive' | 'suspended';
    assigned_date: string;
}

const emptyForm: AssignmentFormData = {
    student_name: '',
    student_id: '',
    class: '',
    route_name: '',
    pickup_stop: '',
    dropoff_stop: 'School Gate',
    status: 'active',
    assigned_date: new Date().toISOString().split('T')[0],
};

const getStatusColor = (status: Assignment['status']) => {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800';
        case 'inactive':
            return 'bg-gray-100 text-gray-800';
        case 'suspended':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export default function AssignmentsIndex() {
    const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
    const [classFilter, setClassFilter] = useState<string>('');
    const [routeFilter, setRouteFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState<AssignmentFormData>(emptyForm);

    const filtered = assignments.filter((a) => {
        if (classFilter && a.class !== classFilter) return false;
        if (routeFilter && a.route_name !== routeFilter) return false;
        if (statusFilter && a.status !== statusFilter) return false;
        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            return (
                a.student_name.toLowerCase().includes(s) ||
                a.student_id.toLowerCase().includes(s) ||
                a.class.toLowerCase().includes(s)
            );
        }
        return true;
    });

    const stats = {
        total: assignments.length,
        active: assignments.filter(a => a.status === 'active').length,
        suspended: assignments.filter(a => a.status === 'suspended').length,
        inactive: assignments.filter(a => a.status === 'inactive').length,
    };

    const selectedRouteStops = availableRoutes.find(r => r.name === formData.route_name)?.stops ?? [];

    const handleSave = () => {
        const newId = Math.max(...assignments.map(a => a.id)) + 1;
        setAssignments(prev => [...prev, { ...formData, id: newId }]);
        setDialogOpen(false);
        setFormData(emptyForm);
    };

    const handleRemove = (id: number) => {
        setAssignments(prev => prev.filter(a => a.id !== id));
    };

    const updateField = <K extends keyof AssignmentFormData>(key: K, value: AssignmentFormData[K]) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    return (
        <AppLayout>
            <Head title="Student Transport Assignments" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Transport Assignments</h1>
                        <p className="text-gray-600">Manage student transport route assignments</p>
                    </div>
                    <div className="flex space-x-2">
                        <Link href="/transport">
                            <Button variant="outline">
                                <Route className="w-4 h-4 mr-2" />
                                Dashboard
                            </Button>
                        </Link>
                        <Button onClick={() => { setFormData(emptyForm); setDialogOpen(true); }}>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Assign Student
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Assigned</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">All assignments</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                            <p className="text-xs text-muted-foreground">Using transport</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
                            <p className="text-xs text-muted-foreground">Temporarily suspended</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                            <Users className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-500">{stats.inactive}</div>
                            <p className="text-xs text-muted-foreground">Not using transport</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Assignment Records</CardTitle>
                                <CardDescription>All student transport assignments</CardDescription>
                            </div>
                            <div className="flex space-x-3">
                                <Input
                                    placeholder="Search students..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-48"
                                />
                                <Select value={classFilter} onValueChange={setClassFilter}>
                                    <SelectTrigger className="w-36">
                                        <SelectValue placeholder="All classes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Classes</SelectItem>
                                        {availableClasses.map(c => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={routeFilter} onValueChange={setRouteFilter}>
                                    <SelectTrigger className="w-44">
                                        <SelectValue placeholder="All routes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Routes</SelectItem>
                                        {availableRoutes.map(r => (
                                            <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="All status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
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
                                    <TableHead>Student</TableHead>
                                    <TableHead>Class</TableHead>
                                    <TableHead>Route</TableHead>
                                    <TableHead>Pickup Stop</TableHead>
                                    <TableHead>Drop-off Stop</TableHead>
                                    <TableHead>Assigned Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((assignment) => (
                                    <TableRow key={assignment.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-medium text-purple-600">
                                                        {assignment.student_name.charAt(0)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="font-medium">{assignment.student_name}</div>
                                                    <div className="text-xs text-gray-500">{assignment.student_id}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{assignment.class}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-sm">
                                                <Route className="w-3 h-3 mr-1 text-gray-400" />
                                                {assignment.route_name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-sm">
                                                <MapPin className="w-3 h-3 mr-1 text-green-500" />
                                                {assignment.pickup_stop}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-sm">
                                                <MapPin className="w-3 h-3 mr-1 text-red-500" />
                                                {assignment.dropoff_stop}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {new Date(assignment.assigned_date).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(assignment.status)}>
                                                {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700"
                                                onClick={() => handleRemove(assignment.id)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                Remove
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                            No assignments found matching your filters.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Assign Student Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Assign Student to Route</DialogTitle>
                        <DialogDescription>
                            Select a student and assign them to a transport route.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-2">
                        <div className="col-span-2 space-y-1">
                            <Label>Student Name</Label>
                            <Input
                                value={formData.student_name}
                                onChange={(e) => updateField('student_name', e.target.value)}
                                placeholder="Full name"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Student ID</Label>
                            <Input
                                value={formData.student_id}
                                onChange={(e) => updateField('student_id', e.target.value)}
                                placeholder="e.g. STU-2024-XXX"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Class</Label>
                            <Select value={formData.class} onValueChange={(v) => updateField('class', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableClasses.map(c => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-2 space-y-1">
                            <Label>Route</Label>
                            <Select
                                value={formData.route_name}
                                onValueChange={(v) => {
                                    updateField('route_name', v);
                                    updateField('pickup_stop', '');
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select route" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableRoutes.map(r => (
                                        <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Pickup Stop</Label>
                            <Select
                                value={formData.pickup_stop}
                                onValueChange={(v) => updateField('pickup_stop', v)}
                                disabled={!formData.route_name}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select stop" />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedRouteStops.map(stop => (
                                        <SelectItem key={stop} value={stop}>{stop}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Drop-off Stop</Label>
                            <Input
                                value={formData.dropoff_stop}
                                onChange={(e) => updateField('dropoff_stop', e.target.value)}
                                placeholder="e.g. School Gate"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Assignment Date</Label>
                            <Input
                                type="date"
                                value={formData.assigned_date}
                                onChange={(e) => updateField('assigned_date', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Status</Label>
                            <Select value={formData.status} onValueChange={(v) => updateField('status', v as Assignment['status'])}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            <Plus className="w-4 h-4 mr-2" />
                            Assign Student
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
