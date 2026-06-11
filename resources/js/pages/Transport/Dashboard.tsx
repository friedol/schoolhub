import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatCard, StatGrid } from '@/components/ui/stat-card';
import {
    Bus,
    Route,
    Users,
    Calendar,
    Wrench,
    MapPin,
    Clock,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    Plus,
    Eye,
} from 'lucide-react';

interface RecentTrip {
    id: number;
    date: string;
    route_name: string;
    vehicle_number: string;
    driver_name: string;
    departure_time: string;
    arrival_time: string;
    students_on_board: number;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

const mockStats = {
    total_vehicles: 8,
    active_routes: 5,
    students_assigned: 124,
    trips_today: 10,
};

const mockQuickLinks = [
    { label: 'Vehicles', href: '/transport/vehicles', icon: Bus, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Routes', href: '/transport/routes', icon: Route, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Assignments', href: '/transport/assignments', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Trips', href: '/transport/trips', icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Maintenance', href: '/transport/maintenance', icon: Wrench, color: 'text-red-600', bg: 'bg-red-100' },
];

const mockRecentTrips: RecentTrip[] = [
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
    },
    {
        id: 3,
        date: '2026-05-25',
        route_name: 'Kimara - School',
        vehicle_number: 'T 789 GHI',
        driver_name: 'Peter Otieno',
        departure_time: '13:00',
        arrival_time: null as any,
        students_on_board: 25,
        status: 'in_progress',
    },
    {
        id: 4,
        date: '2026-05-25',
        route_name: 'Sinza - School',
        vehicle_number: 'T 321 JKL',
        driver_name: 'Ahmed Said',
        departure_time: '13:00',
        arrival_time: null as any,
        students_on_board: 0,
        status: 'scheduled',
    },
    {
        id: 5,
        date: '2026-05-24',
        route_name: 'Magomeni - School',
        vehicle_number: 'T 654 MNO',
        driver_name: 'Samuel Kimani',
        departure_time: '06:30',
        arrival_time: '07:10',
        students_on_board: 20,
        status: 'completed',
    },
];

const getTripStatusColor = (status: RecentTrip['status']) => {
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

const getTripStatusLabel = (status: RecentTrip['status']) => {
    switch (status) {
        case 'in_progress':
            return 'In Progress';
        default:
            return status.charAt(0).toUpperCase() + status.slice(1);
    }
};

export default function TransportDashboard() {
    return (
        <AppLayout>
            <Head title="Transport Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-base font-semibold text-gray-900">Transport Dashboard</h1>
                        <p className="text-sm text-gray-600">Overview of school transport operations</p>
                    </div>
                    <div className="flex space-x-2">
                        <Link href="/transport/trips">
                            <Button variant="outline">
                                <Eye className="w-4 h-4 mr-2" />
                                View All Trips
                            </Button>
                        </Link>
                        <Link href="/transport/assignments">
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Assign Student
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <StatGrid cols={4}>
                    <StatCard
                        title="Total Vehicles"
                        value={mockStats.total_vehicles}
                        icon={Bus}
                        color="cyan"
                    />
                    <StatCard
                        title="Active Routes"
                        value={mockStats.active_routes}
                        icon={Route}
                        color="blue"
                    />
                    <StatCard
                        title="Students Assigned"
                        value={mockStats.students_assigned}
                        icon={Users}
                        color="emerald"
                    />
                    <StatCard
                        title="Trips Today"
                        value={mockStats.trips_today}
                        icon={TrendingUp}
                        color="amber"
                    />
                </StatGrid>

                {/* Quick Links */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold">Quick Navigation</CardTitle>
                        <CardDescription className="text-xs">Jump to key transport management sections</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {mockQuickLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link key={link.label} href={link.href}>
                                        <Button
                                            variant="outline"
                                            className="w-full h-24 flex flex-col items-center justify-center space-y-2"
                                        >
                                            <div className={`p-2 rounded-full ${link.bg}`}>
                                                <Icon className={`w-5 h-5 ${link.color}`} />
                                            </div>
                                            <span className="text-sm font-medium">{link.label}</span>
                                        </Button>
                                    </Link>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Trips Table */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-sm font-semibold">Recent Trips</CardTitle>
                                <CardDescription className="text-xs">Latest transport activity</CardDescription>
                            </div>
                            <Link href="/transport/trips">
                                <Button variant="outline" size="sm">
                                    <Eye className="w-4 h-4 mr-2" />
                                    View All
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
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
                                {mockRecentTrips.map((trip) => (
                                    <TableRow key={trip.id}>
                                        <TableCell>
                                            <div className="flex items-center text-sm">
                                                <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                                                {new Date(trip.date).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                                                <span className="font-medium">{trip.route_name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{trip.vehicle_number}</Badge>
                                        </TableCell>
                                        <TableCell>{trip.driver_name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-sm">
                                                <Clock className="w-3 h-3 mr-1 text-gray-400" />
                                                {trip.departure_time}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {trip.arrival_time ? (
                                                <div className="flex items-center text-sm">
                                                    <Clock className="w-3 h-3 mr-1 text-gray-400" />
                                                    {trip.arrival_time}
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
                                            <Badge className={getTripStatusColor(trip.status)}>
                                                {getTripStatusLabel(trip.status)}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Status Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Trips Completed Today</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {mockRecentTrips.filter(t => t.date === '2026-05-25' && t.status === 'completed').length}
                            </div>
                            <p className="text-xs text-muted-foreground">Successfully completed</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Trips In Progress</CardTitle>
                            <Bus className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {mockRecentTrips.filter(t => t.status === 'in_progress').length}
                            </div>
                            <p className="text-xs text-muted-foreground">Currently on the road</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Maintenance Alerts</CardTitle>
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">2</div>
                            <p className="text-xs text-muted-foreground">Vehicles due for service</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
