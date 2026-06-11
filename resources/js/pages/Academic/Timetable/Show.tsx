import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Calendar, Clock, Users, BookOpen, MapPin } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Timetable {
    id: number;
    day_of_week: string;
    start_time: string;
    end_time: string;
    subject: {
        id: number;
        name: string;
        code: string;
    };
    teacher: {
        id: number;
        name: string;
    };
    school_class: {
        id: number;
        name: string;
    };
    room: {
        id: number;
        name: string;
        capacity: number;
    };
    period: {
        id: number;
        name: string;
        start_time: string;
        end_time: string;
    };
    created_at: string;
}

interface Props {
    timetable: Timetable;
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
        title: 'View Timetable Entry',
        href: '#',
    },
];

export default function ShowTimetable({ timetable }: Props) {
    const getDayColor = (day: string) => {
        switch (day.toLowerCase()) {
            case 'monday': return 'bg-blue-100 text-blue-800';
            case 'tuesday': return 'bg-green-100 text-green-800';
            case 'wednesday': return 'bg-yellow-100 text-yellow-800';
            case 'thursday': return 'bg-purple-100 text-purple-800';
            case 'friday': return 'bg-orange-100 text-orange-800';
            case 'saturday': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Timetable Entry: ${timetable.subject.name}`} />
            
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
                            <h1 className="text-3xl font-bold tracking-tight">Timetable Entry</h1>
                            <p className="text-muted-foreground">
                                {timetable.subject.name} - {timetable.school_class.name}
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={`/academic/timetable/${timetable.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Entry
                        </Link>
                    </Button>
                </div>

                {/* Timetable Details */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Schedule Information</CardTitle>
                            <CardDescription>
                                Time and day details for this timetable entry
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Day of Week</label>
                                    <div className="mt-1">
                                        <Badge className={getDayColor(timetable.day_of_week)}>
                                            {timetable.day_of_week}
                                        </Badge>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Start Time</label>
                                        <div className="flex items-center mt-1">
                                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <p className="text-lg font-semibold">{timetable.start_time}</p>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">End Time</label>
                                        <div className="flex items-center mt-1">
                                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <p className="text-lg font-semibold">{timetable.end_time}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Period</label>
                                    <p className="text-lg font-semibold">{timetable.period.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {timetable.period.start_time} - {timetable.period.end_time}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Class & Subject</CardTitle>
                            <CardDescription>
                                Associated class, subject, teacher, and room information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Class</label>
                                    <div className="flex items-center mt-1">
                                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <p className="text-lg font-semibold">{timetable.school_class.name}</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Subject</label>
                                    <div className="flex items-center mt-1">
                                        <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-lg font-semibold">{timetable.subject.name}</p>
                                            <p className="text-sm text-muted-foreground">Code: {timetable.subject.code}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Teacher</label>
                                    <div className="flex items-center mt-1">
                                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <p className="text-lg font-semibold">{timetable.teacher.name}</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Room</label>
                                    <div className="flex items-center mt-1">
                                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-lg font-semibold">{timetable.room.name}</p>
                                            <p className="text-sm text-muted-foreground">Capacity: {timetable.room.capacity} students</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Additional Information</CardTitle>
                        <CardDescription>
                            Metadata and creation details
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                                <div className="flex items-center mt-1">
                                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <p className="text-lg font-semibold">
                                        {new Date(timetable.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Entry ID</label>
                                <p className="text-lg font-semibold">#{timetable.id}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}



