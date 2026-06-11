import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, AlertTriangle, CheckCircle } from 'lucide-react';

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
    classes: SchoolClass[];
    teachers: Teacher[];
    subjects: Subject[];
    rooms: Room[];
    periods: Period[];
}

export default function CreateTimetable({ classes, teachers, subjects, rooms, periods }: Props) {
    const [conflicts, setConflicts] = useState<string[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        school_class_id: '',
        subject_id: '',
        teacher_id: '',
        room_id: '',
        period_id: '',
        day_of_week: '',
        start_time: '',
        end_time: '',
    });

    const checkConflicts = () => {
        const newConflicts: string[] = [];
        
        // Check if teacher is already assigned at this time
        if (data.teacher_id && data.day_of_week && data.start_time) {
            newConflicts.push('Teacher may have a conflict at this time');
        }
        
        // Check if class is already assigned at this time
        if (data.school_class_id && data.day_of_week && data.start_time) {
            newConflicts.push('Class may have a conflict at this time');
        }
        
        // Check if room is already assigned at this time
        if (data.room_id && data.day_of_week && data.start_time) {
            newConflicts.push('Room may have a conflict at this time');
        }
        
        setConflicts(newConflicts);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/academic/timetable');
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
        <AppLayout>
            <Head title="Create Timetable Entry" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex items-center gap-3">
                    <Link href="/academic/timetable" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors gap-1">
                        ← Back to Timetable
                    </Link>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Create Timetable Entry</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Timetable Information</CardTitle>
                            <CardDescription>
                                Define the timetable entry details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="school_class_id">Class</Label>
                                    <Select
                                        value={data.school_class_id}
                                        onValueChange={(value) => {
                                            setData('school_class_id', value);
                                            checkConflicts();
                                        }}
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
                                        onValueChange={(value) => {
                                            setData('teacher_id', value);
                                            checkConflicts();
                                        }}
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
                                        onValueChange={(value) => {
                                            setData('room_id', value);
                                            checkConflicts();
                                        }}
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
                                        onValueChange={(value) => {
                                            setData('day_of_week', value);
                                            checkConflicts();
                                        }}
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
                                        onValueChange={(value) => {
                                            const period = periods.find(p => p.id.toString() === value);
                                            setData('period_id', value);
                                            if (period) {
                                                setData('start_time', period.start_time);
                                                setData('end_time', period.end_time);
                                            }
                                            checkConflicts();
                                        }}
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

                            {conflicts.length > 0 && (
                                <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>Potential Conflicts:</strong>
                                        <ul className="list-disc list-inside mt-2">
                                            {conflicts.map((conflict, index) => (
                                                <li key={index}>{conflict}</li>
                                            ))}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            )}

                            {conflicts.length === 0 && data.school_class_id && data.teacher_id && data.room_id && data.day_of_week && (
                                <Alert>
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        No conflicts detected. This timetable entry is safe to create.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/academic/timetable">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing || conflicts.length > 0}>
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Creating...' : 'Create Timetable Entry'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
