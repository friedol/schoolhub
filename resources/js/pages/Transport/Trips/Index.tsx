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
    Bus,
    Calendar,
    Clock,
    Users,
    CheckCircle,
    XCircle,
    AlertCircle,
    Route,
    TrendingUp,
    MapPin,
} from 'lucide-react';

interface Trip {
    id: number;
    date: string;
    route_name: string;
    vehicle_number: string;
    driver_name: string;
    departure_time: string;
    arrival_time: string | null;
    students_on_board: number;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    trip_type: 'morning' | 'afternoon';
}

const mockTrips: Trip[] = [
    {
        id: 1,
        date: '2026-05-25',
        route_name: 'Msasani - School',
        vehicle_number: 'T 123 ABC',
        driver_name: 'Juma Mwangi',
        departure_time: '06:30',
        arrival_time: '07:15',
        students_on_board: 28,
        status: 'completed',
        trip_type: 'morning',
    },
    {
        id: 2,
        date: '2026-05-25',
        route_name: 'Mbezi Beach - School',
        vehicle_number: 'T 456 DEF',
        driver_name: 'Hassan Ally',
        departure_time: '06:45',
        arrival_time: '07:30',
        students_on_board: 32,
        status: 'completed',
        trip_type: 'morning',
    },
    {
        id: 3,
        date: '2026-05-25',
        route_name: 'Kimara - School',
        vehicle_number: 'T 789 GHI',
        driver_name: 'Peter Otieno',
        departure_time: '07:00',
        arrival_time: '07:55',
        students_on_board: 25,
        status: 'completed',
        trip_type: 'morning',
    },
    {
        id: 4,
        date: '2026-05-25',
        route_name: 'Msasani - School',
        vehicle_number: 'T 123 ABC',
        driver_name: 'Juma Mwangi',
        departure_time: '13:30',
        arrival_time: null,
        students_on_board: 28,
        status: 'in_progress',
        trip_type: 'afternoon',
    },
    {
        id: 5,
        date: '2026-05-25',
        route_name: 'Mbezi Beach - School',
        vehicle_number: 'T 456 DEF',
        driver_name: 'Hassan Ally',
        departure_time: '13:45',
        arrival_time: null,
        students_on_board: 0,
        status: 'scheduled',
        trip_type: 'afternoon',
    },
    {
        id: 6,
        date: '2026-05-25',
        route_name: 'Sinza - School',
        vehicle_number: 'T 321 JKL',
        driver_name: 'Ahmed Said',
        departure_time: '06:50',
        arrival_time: null,
        students_on_board: 0,
        status: 'cancelled',
        trip_type: 'morning',
    },
    {
        id: 7,
        date: '2026-05-24',
        route_name: 'Msasani - School',
        vehicle_number: 'T 123 ABC',
        driver_name: 'Juma Mwangi',
        departure_time: '06:30',
        arrival_time: '07:18',
        students_on_board: 27,
        status: 'completed',
        trip_type: 'morning',
    },
    {
        id: 8,
        date: '2026-05-24',
        route_name: 'Kimara - School',
        vehicle_number: 'T 789 GHI',
        driver_name: 'Peter Otieno',
        departure_time: '13:00',
        arrival_time: '13:55',
        students_on_board: 24,
        status: 'completed',
        trip_type: 'afternoon',
    },
];

const getStatusColor = (status: Trip['status']) => {
    switch (status) {
        case 'completed':
            return 'bg-green-100 text-green-800';
        case 'in_progress':
            return 'bg-blue-100 text-blue-800';
        case 'scheduled':
            return 'bg-yellow-100 text-yellow-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getStatusLabel = (status: Trip['status']) => {
    switch (status) {
        case 'in_progress':
            return 'In Progress';
        default:
            return status.charAt(0).toUpperCase() + status.slice(1);
    }
};

const getTripTypeColor = (type: Trip['trip_type']) => {
    switch (type) {
        case 'morning':
            return 'bg-orange-100 text-orange-800';
        case 'afternoon':
            return 'bg-indigo-100 text-indigo-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export default function TripsIndex() {
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [tripTypeFilter, setTripTypeFilter] = useState<string>('');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const today = '2026-05-25';

    const filtered = mockTrips.filter((t) => {
        if (statusFilter && t.status !== statusFilter) return false;
        if (tripTypeFilter && t.trip_type !== tripTypeFilter) return false;
        if (dateFrom && t.date < dateFrom) return false;
        if (dateTo && t.date > dateTo) return false;
        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            return (
                t.route_name.toLowerCase().includes(s) ||
                t.vehicle_number.toLowerCase().includes(s) ||
                t.driver_name.toLowerCase().includes(s)
            );
        }
        return true;
    });

    const todayTrips = mockTrips.filter(t => t.date === today);
    const stats = {
        today_total: todayTrips.length,
        today_completed: todayTrips.filter(t => t.status === 'completed').length,
        today_in_progress: todayTrips.filter(t => t.status === 'in_progress').length,
        today_cancelled: todayTrips.filter(t => t.status === 'cancelled').length,
    };

    return (
        <AppLayout>
            <Head title="Trip Tracking" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Trip Tracking</h1>
                        <p className="text-gray-600">Monitor all transport trips in real time</p>
                    </div>
                    <Link href="/transport">
                        <Button variant="outline">
                            <Route className="w-4 h-4 mr-2" />
                            Dashboard
                        </Button>
                    </Link>
                </div>

                {/* Today's Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's Trips</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.today_total}</div>
                            <p className="text-xs text-muted-foreground">Scheduled for today</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.today_completed}</div>
                            <p className="text-xs text-muted-foreground">Successfully done</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                            <Bus className="h-4 w-4 text-indigo-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-indigo-600">{stats.today_in_progress}</div>
                            <p className="text-xs text-muted-foreground">Currently on the road</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.today_cancelled}</div>
                            <p className="text-xs text-muted-foreground">Cancelled today</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Table with Filters */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center flex-wrap gap-3">
                            <div>
                                <CardTitle>Trip Records</CardTitle>
                                <CardDescription>All transport trip history</CardDescription>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Input
                                    placeholder="Search trips..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-48"
                                />
                                <div className="flex items-center space-x-2">
                                    <Input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="w-36"
                                        placeholder="From"
                                    />
                                    <span className="text-gray-400 text-sm">to</span>
                                    <Input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="w-36"
                                        placeholder="To"
                                    />
                                </div>
                                <Select value={tripTypeFilter} onValueChange={setTripTypeFilter}>
                                    <SelectTrigger className="w-36">
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="morning">Morning</SelectItem>
                                        <SelectItem value="afternoon">Afternoon</SelectItem>
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
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Route</TableHead>
                                    <TableHead>Vehicle</TableHead>
                                    <TableHead>Driver</TableHead>
                                    <TableHead>Departure</TableHead>
                                    <TableHead>Arrival</TableHead>
                                    <TableHead>Students</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((trip) => (
                                    <TableRow key={trip.id}>
                                        <TableCell>
                                            <div className="flex items-center text-sm">
                                                <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                                                {new Date(trip.date).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getTripTypeColor(trip.trip_type)}>
                                                {trip.trip_type.charAt(0).toUpperCase() + trip.trip_type.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                                                <span className="font-medium">{trip.route_name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono">
                                                {trip.vehicle_number}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{trip.driver_name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-sm">
                                                <Clock className="w-3 h-3 mr-1 text-green-500" />
                                                {trip.departure_time}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {trip.arrival_time ? (
                                                <div className="flex items-center text-sm">
                                                    <Clock className="w-3 h-3 mr-1 text-red-500" />
                                                    {trip.arrival_time}
                                                </div>
                                            ) : trip.status === 'in_progress' ? (
                                                <div className="flex items-center text-sm text-blue-600">
                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                    On route
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <Users className="w-3 h-3 mr-1 text-gray-400" />
                                                {trip.students_on_board}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(trip.status)}>
                                                {getStatusLabel(trip.status)}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                            No trips found matching your filters.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
