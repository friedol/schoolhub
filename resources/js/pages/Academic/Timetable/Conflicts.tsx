import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, AlertTriangle, CheckCircle, Users, MapPin, Clock, Calendar } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Conflict {
    id: number;
    type: string;
    description: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    teacher?: {
        name: string;
    };
    room?: {
        name: string;
    };
    classes: string[];
}

interface Props {
    conflicts: Conflict[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Academic',
        href: '/academic',
    },
    {
        title: 'Timetable',
        href: '/academic/timetable',
    },
    {
        title: 'Conflicts',
        href: '#',
    },
];

export default function TimetableConflicts({ conflicts }: Props) {
    const getConflictTypeColor = (type: string) => {
        switch (type) {
            case 'teacher_conflict': return 'bg-red-100 text-red-800';
            case 'room_conflict': return 'bg-orange-100 text-orange-800';
            case 'class_conflict': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getConflictTypeDisplay = (type: string) => {
        switch (type) {
            case 'teacher_conflict': return 'Teacher Conflict';
            case 'room_conflict': return 'Room Conflict';
            case 'class_conflict': return 'Class Conflict';
            default: return 'Conflict';
        }
    };

    const getConflictIcon = (type: string) => {
        switch (type) {
            case 'teacher_conflict': return <Users className="h-4 w-4" />;
            case 'room_conflict': return <MapPin className="h-4 w-4" />;
            case 'class_conflict': return <Users className="h-4 w-4" />;
            default: return <AlertTriangle className="h-4 w-4" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Timetable Conflicts" />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/academic/timetable">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Timetable
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Timetable Conflicts</h1>
                            <p className="text-muted-foreground">
                                Resolve scheduling conflicts in the timetable
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href="/academic/timetable/create">
                            Add New Entry
                        </Link>
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Conflicts</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{conflicts.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Conflicts detected
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Teacher Conflicts</CardTitle>
                            <Users className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">
                                {conflicts.filter(c => c.type === 'teacher_conflict').length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Teacher scheduling issues
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Room Conflicts</CardTitle>
                            <MapPin className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">
                                {conflicts.filter(c => c.type === 'room_conflict').length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Room double bookings
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Conflicts Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Detected Conflicts</CardTitle>
                        <CardDescription>
                            List of all timetable conflicts that need to be resolved
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {conflicts.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Day & Time</TableHead>
                                        <TableHead>Affected Resources</TableHead>
                                        <TableHead>Classes</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {conflicts.map((conflict) => (
                                        <TableRow key={conflict.id}>
                                            <TableCell>
                                                <Badge className={getConflictTypeColor(conflict.type)}>
                                                    <div className="flex items-center gap-1">
                                                        {getConflictIcon(conflict.type)}
                                                        {getConflictTypeDisplay(conflict.type)}
                                                    </div>
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-xs">
                                                    <p className="text-sm font-medium">{conflict.description}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-sm font-medium">{conflict.day_of_week}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {conflict.start_time} - {conflict.end_time}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {conflict.teacher && (
                                                        <div className="flex items-center gap-1">
                                                            <Users className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-xs">{conflict.teacher.name}</span>
                                                        </div>
                                                    )}
                                                    {conflict.room && (
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-xs">{conflict.room.name}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {conflict.classes.map((className, index) => (
                                                        <Badge key={index} variant="outline" className="text-xs">
                                                            {className}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="sm">
                                                        Resolve
                                                    </Button>
                                                    <Button variant="outline" size="sm">
                                                        View Details
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8">
                                <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
                                <h3 className="mt-2 text-sm font-medium">No conflicts found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Your timetable is conflict-free! All schedules are properly organized.
                                </p>
                                <div className="mt-6">
                                    <Button asChild>
                                        <Link href="/academic/timetable/create">
                                            Add New Entry
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}



