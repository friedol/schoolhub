import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, AlertTriangle, CheckCircle } from 'lucide-react';
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

interface SchoolClass {
    id: number;
    name: string;
    level: string;
}

interface Teacher {
    id: number;
    name: string;
}

interface Subject {
    id: number;
    name: string;
    code: string;
}

interface Room {
    id: number;
    name: string;
    capacity: number;
}

interface Period {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
}

interface Props {
    timetable: Timetable;
    classes: SchoolClass[];
    teachers: Teacher[];
    subjects: Subject[];
    rooms: Room[];
    periods: Period[];
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
        title: 'Edit Timetable Entry',
        href: '#',
    },
];

export default function EditTimetable({ timetable, classes, teachers, subjects, rooms, periods }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        school_class_id: timetable.school_class.id.toString(),
        subject_id: timetable.subject.id.toString(),
        teacher_id: timetable.teacher.id.toString(),
        room_id: timetable.room.id.toString(),
        period_id: timetable.period.id.toString(),
        day_of_week: timetable.day_of_week,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/academic/timetable/${timetable.id}`);
    };

    const daysOfWeek = [
        { value: 'Monday', label: 'Monday' },
        { value: 'Tuesday', label: 'Tuesday' },
        { value: 'Wednesday', label: 'Wednesday' },
        { value: 'Thursday', label: 'Thursday' },
        { value: 'Friday', label: 'Friday' },
        { value: 'Saturday', label: 'Saturday' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Timetable Entry: ${timetable.subject.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/academic/timetable/${timetable.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Timetable Entry
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Timetable Entry</h1>
                        <p className="text-gray-600">Update timetable entry details</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Timetable Information</CardTitle>
                            <CardDescription>
                                Update the timetable entry details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="school_class_id">Class</Label>
                                    <Select
                                        value={data.school_class_id}
                                        onValueChange={(value) => setData('school_class_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classes.map((cls) => (
                                                <SelectItem key={cls.id} value={cls.id.toString()}>
                                                    {cls.name} ({cls.level})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.school_class_id && <p className="text-red-500 text-sm">{errors.school_class_id}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="subject_id">Subject</Label>
                                    <Select
                                        value={data.subject_id}
                                        onValueChange={(value) => setData('subject_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subjects.map((subject) => (
                                                <SelectItem key={subject.id} value={subject.id.toString()}>
                                                    {subject.name} ({subject.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.subject_id && <p className="text-red-500 text-sm">{errors.subject_id}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="teacher_id">Teacher</Label>
                                    <Select
                                        value={data.teacher_id}
                                        onValueChange={(value) => setData('teacher_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select teacher" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teachers.map((teacher) => (
                                                <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                    {teacher.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.teacher_id && <p className="text-red-500 text-sm">{errors.teacher_id}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="room_id">Room</Label>
                                    <Select
                                        value={data.room_id}
                                        onValueChange={(value) => setData('room_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select room" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {rooms.map((room) => (
                                                <SelectItem key={room.id} value={room.id.toString()}>
                                                    {room.name} (Capacity: {room.capacity})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.room_id && <p className="text-red-500 text-sm">{errors.room_id}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="day_of_week">Day of Week</Label>
                                    <Select
                                        value={data.day_of_week}
                                        onValueChange={(value) => setData('day_of_week', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select day" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {daysOfWeek.map((day) => (
                                                <SelectItem key={day.value} value={day.value}>
                                                    {day.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.day_of_week && <p className="text-red-500 text-sm">{errors.day_of_week}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="period_id">Period</Label>
                                    <Select
                                        value={data.period_id}
                                        onValueChange={(value) => setData('period_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select period" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {periods.map((period) => (
                                                <SelectItem key={period.id} value={period.id.toString()}>
                                                    {period.name} ({period.start_time} - {period.end_time})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.period_id && <p className="text-red-500 text-sm">{errors.period_id}</p>}
                                </div>
                            </div>

                            <Alert>
                                <CheckCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Make sure to check for conflicts after making changes to avoid scheduling issues.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href={`/academic/timetable/${timetable.id}`}>
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Updating...' : 'Update Timetable Entry'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}



