import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CheckSquare } from 'lucide-react';

interface Examination {
    id: number;
    name: string;
}

interface ExamSession {
    id: number;
    class_name: string;
    subject_name: string;
    date: string;
}

interface Student {
    id: number;
    name: string;
    student_number: string;
}

interface Props {
    examination: Examination;
    sessions: ExamSession[];
    students: Student[];
    attendances: Record<number, 'present' | 'absent'>;
    selectedSessionId?: string;
}

export default function ExamAttendanceView({ examination, sessions, students, attendances, selectedSessionId }: Props) {
    const [localAttendances, setLocalAttendances] = useState<Record<number, 'present' | 'absent'>>(
        students.reduce((acc, stu) => {
            acc[stu.id] = attendances[stu.id] || 'present';
            return acc;
        }, {} as Record<number, 'present' | 'absent'>)
    );

    const handleSessionChange = (sessionId: string) => {
        router.get(`/academic/examinations/${examination.id}/attendance`, { session_id: sessionId });
    };

    const handleAttendanceChange = (studentId: number, status: 'present' | 'absent') => {
        setLocalAttendances({
            ...localAttendances,
            [studentId]: status,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`/academic/examinations/${examination.id}/attendance`, {
            session_id: selectedSessionId,
            attendances: localAttendances,
        });
    };

    return (
        <AppLayout>
            <Head title="Mark Exam Attendance" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={`/academic/examinations/${examination.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Mark Attendance</h1>
                        <p className="text-muted-foreground">Mark student attendance for {examination.name}.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Exam Session</CardTitle>
                            <CardDescription>Choose the class/subject paper session to record attendance for</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="max-w-md space-y-2">
                                <Label htmlFor="session">Exam Session Paper</Label>
                                <Select 
                                    value={selectedSessionId || ''} 
                                    onValueChange={handleSessionChange}
                                >
                                    <SelectTrigger id="session">
                                        <SelectValue placeholder="Select class & subject session" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sessions.map(sess => (
                                            <SelectItem key={sess.id} value={String(sess.id)}>
                                                {sess.class_name} - {sess.subject_name} ({sess.date})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {selectedSessionId && students.length > 0 && (
                        <form onSubmit={handleSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Students Attendance List</CardTitle>
                                    <CardDescription>Mark physical attendance of students sitting in the exam room</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Student Number</TableHead>
                                                <TableHead>Name</TableHead>
                                                <TableHead className="w-[300px]">Attendance Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {students.map(student => (
                                                <TableRow key={student.id}>
                                                    <TableCell className="font-mono text-xs">{student.student_number}</TableCell>
                                                    <TableCell className="font-medium">{student.name}</TableCell>
                                                    <TableCell>
                                                        <div className="flex space-x-6">
                                                            <div className="flex items-center space-x-2">
                                                                <input 
                                                                    type="radio" 
                                                                    name={`attendance-${student.id}`} 
                                                                    id={`p-${student.id}`} 
                                                                    value="present"
                                                                    checked={(localAttendances[student.id] || 'present') === 'present'}
                                                                    onChange={() => handleAttendanceChange(student.id, 'present')}
                                                                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                                />
                                                                <Label htmlFor={`p-${student.id}`} className="cursor-pointer">Present / Yupo</Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <input 
                                                                    type="radio" 
                                                                    name={`attendance-${student.id}`} 
                                                                    id={`a-${student.id}`} 
                                                                    value="absent"
                                                                    checked={(localAttendances[student.id] || 'present') === 'absent'}
                                                                    onChange={() => handleAttendanceChange(student.id, 'absent')}
                                                                    className="h-4 w-4 border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                                                />
                                                                <Label htmlFor={`a-${student.id}`} className="cursor-pointer text-red-600 font-medium">Absent / Hayupo</Label>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    <div className="flex justify-end pt-6 border-t mt-6">
                                        <Button type="submit">
                                            <CheckSquare className="mr-2 h-4 w-4" /> Save Attendance
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </form>
                    )}

                    {selectedSessionId && students.length === 0 && (
                        <Card>
                            <CardContent className="text-center py-8 text-muted-foreground">
                                No students registered in this session's class.
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
