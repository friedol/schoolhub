import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, Clock, Users, CheckCircle, AlertCircle, MapPin, Smartphone } from 'lucide-react';

interface Staff {
    id: number;
    name: string;
    employee_id: string;
    role: string;
    is_present: boolean;
    clock_in_time?: string;
    clock_out_time?: string;
    attendance_status: string;
}

interface Props {
    staff: Staff[];
    currentDate: string;
    workingHours: {
        start_time: string;
        end_time: string;
        break_start_time?: string;
        break_end_time?: string;
    };
}

export default function MarkAttendance({ staff, currentDate, workingHours }: Props) {
    const [attendanceRecords, setAttendanceRecords] = useState<Record<number, {
        status: string;
        clock_in_time: string;
        clock_out_time: string;
        notes: string;
    }>>({});

    const { data, setData, post, processing, errors } = useForm({
        date: currentDate,
        attendance_records: attendanceRecords,
    });

    const updateAttendanceRecord = (staffId: number, field: string, value: string) => {
        setAttendanceRecords({
            ...attendanceRecords,
            [staffId]: {
                ...attendanceRecords[staffId],
                [field]: value,
            }
        });
    };

    const markAllPresent = () => {
        const updated = { ...attendanceRecords };
        staff.forEach(member => {
            updated[member.id] = {
                ...updated[member.id],
                status: 'present',
                clock_in_time: workingHours.start_time,
                clock_out_time: workingHours.end_time,
            };
        });
        setAttendanceRecords(updated);
    };

    const markAllAbsent = () => {
        const updated = { ...attendanceRecords };
        staff.forEach(member => {
            updated[member.id] = {
                ...updated[member.id],
                status: 'absent',
                clock_in_time: '',
                clock_out_time: '',
            };
        });
        setAttendanceRecords(updated);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present':
                return 'bg-green-100 text-green-800';
            case 'absent':
                return 'bg-red-100 text-red-800';
            case 'late':
                return 'bg-yellow-100 text-yellow-800';
            case 'half_day':
                return 'bg-orange-100 text-orange-800';
            case 'leave':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const calculateWorkingHours = (clockIn: string, clockOut: string) => {
        if (!clockIn || !clockOut) return 0;
        const start = new Date(`2000-01-01T${clockIn}`);
        const end = new Date(`2000-01-01T${clockOut}`);
        const diffMs = end.getTime() - start.getTime();
        return Math.max(0, diffMs / (1000 * 60 * 60)); // Convert to hours
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setData('attendance_records', attendanceRecords);
        post('/hr/attendance/mark');
    };

    const stats = {
        total: staff.length,
        present: Object.values(attendanceRecords).filter(r => r.status === 'present').length,
        absent: Object.values(attendanceRecords).filter(r => r.status === 'absent').length,
        late: Object.values(attendanceRecords).filter(r => r.status === 'late').length,
    };

    return (
        <AppLayout>
            <Head title="Mark Attendance" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mark Staff Attendance</h1>
                    <p className="text-gray-600">Record attendance for {new Date(currentDate).toLocaleDateString()}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance Summary</CardTitle>
                            <CardDescription>
                                Overview of attendance for today
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                                    <div className="text-sm text-gray-600">Total Staff</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                                    <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                                    <div className="text-sm text-gray-600">Present</div>
                                </div>
                                <div className="text-center p-4 bg-red-50 rounded-lg">
                                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
                                    <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                                    <div className="text-sm text-gray-600">Absent</div>
                                </div>
                                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                    <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                                    <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
                                    <div className="text-sm text-gray-600">Late</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Staff Attendance</CardTitle>
                                    <CardDescription>
                                        Mark attendance for each staff member
                                    </CardDescription>
                                </div>
                                <div className="flex space-x-2">
                                    <Button type="button" onClick={markAllPresent} variant="outline">
                                        Mark All Present
                                    </Button>
                                    <Button type="button" onClick={markAllAbsent} variant="outline">
                                        Mark All Absent
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Staff Member</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Clock In</TableHead>
                                        <TableHead>Clock Out</TableHead>
                                        <TableHead>Working Hours</TableHead>
                                        <TableHead>Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {staff.map((member) => {
                                        const record = attendanceRecords[member.id] || {
                                            status: member.attendance_status || 'present',
                                            clock_in_time: member.clock_in_time || workingHours.start_time,
                                            clock_out_time: member.clock_out_time || workingHours.end_time,
                                            notes: '',
                                        };

                                        const workingHours = calculateWorkingHours(record.clock_in_time, record.clock_out_time);

                                        return (
                                            <TableRow key={member.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{member.name}</div>
                                                        <div className="text-sm text-gray-500">{member.employee_id}</div>
                                                        <div className="text-sm text-gray-500">{member.role}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={record.status}
                                                        onValueChange={(value) => updateAttendanceRecord(member.id, 'status', value)}
                                                    >
                                                        <SelectTrigger className="w-32">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="present">Present</SelectItem>
                                                            <SelectItem value="absent">Absent</SelectItem>
                                                            <SelectItem value="late">Late</SelectItem>
                                                            <SelectItem value="half_day">Half Day</SelectItem>
                                                            <SelectItem value="leave">On Leave</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="time"
                                                        value={record.clock_in_time}
                                                        onChange={(e) => updateAttendanceRecord(member.id, 'clock_in_time', e.target.value)}
                                                        disabled={record.status === 'absent'}
                                                        className="w-32"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="time"
                                                        value={record.clock_out_time}
                                                        onChange={(e) => updateAttendanceRecord(member.id, 'clock_out_time', e.target.value)}
                                                        disabled={record.status === 'absent'}
                                                        className="w-32"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-center">
                                                        <div className="font-medium">
                                                            {workingHours.toFixed(1)}h
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        value={record.notes}
                                                        onChange={(e) => updateAttendanceRecord(member.id, 'notes', e.target.value)}
                                                        placeholder="Notes..."
                                                        className="w-40"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Working Hours Configuration</CardTitle>
                            <CardDescription>
                                Default working hours for the school
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="text-sm font-medium text-gray-600">Start Time</div>
                                    <div className="text-lg font-semibold">{workingHours.start_time}</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="text-sm font-medium text-gray-600">End Time</div>
                                    <div className="text-lg font-semibold">{workingHours.end_time}</div>
                                </div>
                                {workingHours.break_start_time && (
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-600">Break Start</div>
                                        <div className="text-lg font-semibold">{workingHours.break_start_time}</div>
                                    </div>
                                )}
                                {workingHours.break_end_time && (
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-600">Break End</div>
                                        <div className="text-lg font-semibold">{workingHours.break_end_time}</div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Saving...' : 'Save Attendance'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}



