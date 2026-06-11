import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Calendar as CalendarIcon } from 'lucide-react';

interface Props {
    studentId: number | string;
}

export default function StudentProfile({ studentId }: Props) {
    return (
        <AppLayout>
            <Head title="Student Attendance Profile" />
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Student Attendance Profile</h1>
                    <p className="text-muted-foreground">Detailed attendance history for the student</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Profile Summary Placeholder */}
                    <Card className="shadow-sm md:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center">
                                <User className="mr-2 h-5 w-5 text-indigo-500" />
                                Student Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="border-t pt-4 flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                <User className="h-10 w-10 text-slate-400" />
                            </div>
                            <h3 className="font-bold text-lg">Student Name</h3>
                            <p className="text-sm text-muted-foreground">ID: {studentId}</p>
                            <div className="w-full mt-6 grid grid-cols-2 gap-4 text-left">
                                <div className="bg-emerald-50 rounded p-3">
                                    <p className="text-xs text-muted-foreground">Present</p>
                                    <p className="text-lg font-bold text-emerald-600">85</p>
                                </div>
                                <div className="bg-red-50 rounded p-3">
                                    <p className="text-xs text-muted-foreground">Absent</p>
                                    <p className="text-lg font-bold text-red-600">3</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Attendance Calendar Placeholder */}
                    <Card className="shadow-sm md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center">
                                <CalendarIcon className="mr-2 h-5 w-5 text-indigo-500" />
                                Attendance History
                            </CardTitle>
                            <CardDescription>Visual map of the student's attendance over time</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px] flex flex-col items-center justify-center text-center border-t mt-2">
                            <CalendarIcon className="h-10 w-10 text-muted-foreground/30 mb-3" />
                            <p className="font-medium">Calendar View Interface</p>
                            <p className="text-sm text-muted-foreground max-w-sm mt-1">
                                A dynamic calendar displaying daily attendance status colors will be implemented here.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
