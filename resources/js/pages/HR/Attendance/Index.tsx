import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Clock, Users, TrendingUp, Calendar, Eye, Edit, CheckCircle, AlertCircle, User, MapPin } from 'lucide-react';
import { StatCard, StatGrid } from '@/components/ui/stat-card';

interface StaffAttendance {
    id: number;
    staff: {
        name: string;
        employee_id: string;
        role: string;
    };
    date: string;
    clock_in_time: string;
    clock_out_time: string;
    total_working_hours: number;
    overtime_hours: number;
    attendance_status: string;
    clock_in_method: string;
    clock_out_method: string;
    clock_in_location: string;
    clock_out_location: string;
    is_late: boolean;
    is_early_departure: boolean;
    notes: string;
}

interface Props {
    attendances: {
        data: StaffAttendance[];
        links: any[];
        meta: any;
    };
    currentDate: string;
}

export default function AttendanceIndex({ attendances, currentDate }: Props) {
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [dateFilter, setDateFilter] = useState<string>(currentDate);
    const [searchTerm, setSearchTerm] = useState<string>('');

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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'present':
                return <CheckCircle className="w-4 h-4" />;
            case 'absent':
                return <AlertCircle className="w-4 h-4" />;
            case 'late':
                return <Clock className="w-4 h-4" />;
            case 'half_day':
                return <Clock className="w-4 h-4" />;
            case 'leave':
                return <Calendar className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const attendanceData = attendances?.data || [];

    const filteredAttendances = attendanceData.filter(attendance => {
        if (statusFilter && attendance.attendance_status !== statusFilter) return false;
        if (dateFilter && attendance.date !== dateFilter) return false;
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                attendance?.staff?.name?.toLowerCase().includes(searchLower) ||
                attendance?.staff?.employee_id?.toLowerCase().includes(searchLower) ||
                attendance?.staff?.role?.toLowerCase().includes(searchLower)
            );
        }
        return true;
    });

    const stats = {
        total: attendanceData.length,
        present: attendanceData.filter(a => a.attendance_status === 'present').length,
        absent: attendanceData.filter(a => a.attendance_status === 'absent').length,
        late: attendanceData.filter(a => a.attendance_status === 'late' || a.is_late).length,
        totalHours: attendanceData.reduce((sum, a) => sum + (a.total_working_hours || 0), 0),
        averageHours: attendanceData.length > 0 ? attendanceData.reduce((sum, a) => sum + (a.total_working_hours || 0), 0) / attendanceData.length : 0,
    };

    return (
        <AppLayout>
            <Head title="Staff Attendance" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-base font-semibold tracking-tight">Staff Attendance</h1>
                        <p className="text-sm text-muted-foreground">Track and manage staff attendance records</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href="/hr/attendance/reports">
                            <Button variant="outline" size="sm">
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Reports
                            </Button>
                        </Link>
                        <Link href="/hr/attendance/mark">
                            <Button size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Mark Attendance
                            </Button>
                        </Link>
                    </div>
                </div>

                <StatGrid cols={4}>
                    <StatCard title="Total Staff" value={stats.total} icon={Users} color="blue" trend="stable" subtitle="Staff members today" />
                    <StatCard title="Present" value={stats.present} icon={CheckCircle} color="green" trend="stable" subtitle="Present today" />
                    <StatCard title="Absent" value={stats.absent} icon={AlertCircle} color="red" trend="stable" subtitle="Absent today" />
                    <StatCard title="Avg Hours" value={`${stats.averageHours.toFixed(1)}h`} icon={Clock} color="indigo" trend="stable" subtitle="Per staff member" />
                </StatGrid>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Attendance Records</CardTitle>
                                <CardDescription>
                                    View and manage staff attendance for {new Date(dateFilter).toLocaleDateString()}
                                </CardDescription>
                            </div>
                            <div className="flex space-x-4">
                                <Input
                                    placeholder="Search staff..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-64"
                                />
                                <Input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="w-40"
                                />
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="All status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="present">Present</SelectItem>
                                        <SelectItem value="absent">Absent</SelectItem>
                                        <SelectItem value="late">Late</SelectItem>
                                        <SelectItem value="half_day">Half Day</SelectItem>
                                        <SelectItem value="leave">On Leave</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Staff Member</TableHead>
                                    <TableHead>Clock In</TableHead>
                                    <TableHead>Clock Out</TableHead>
                                    <TableHead>Working Hours</TableHead>
                                    <TableHead>Overtime</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAttendances.map((attendance) => (
                                    <TableRow key={attendance.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{attendance.staff.name}</div>
                                                    <div className="text-sm text-gray-500">{attendance.staff.employee_id}</div>
                                                    <div className="text-sm text-gray-500">{attendance.staff.role}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {attendance.clock_in_time ? (
                                                <div>
                                                    <div className="font-medium">
                                                        {new Date(attendance.clock_in_time).toLocaleTimeString()}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {attendance.clock_in_method}
                                                    </div>
                                                    {attendance.is_late && (
                                                        <Badge variant="destructive" className="text-xs">
                                                            Late
                                                        </Badge>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">Not clocked in</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {attendance.clock_out_time ? (
                                                <div>
                                                    <div className="font-medium">
                                                        {new Date(attendance.clock_out_time).toLocaleTimeString()}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {attendance.clock_out_method}
                                                    </div>
                                                    {attendance.is_early_departure && (
                                                        <Badge variant="destructive" className="text-xs">
                                                            Early
                                                        </Badge>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">Not clocked out</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-center">
                                                <div className="font-medium">
                                                    {attendance.total_working_hours.toFixed(1)}h
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-center">
                                                {attendance.overtime_hours > 0 ? (
                                                    <div className="text-orange-600 font-medium">
                                                        +{attendance.overtime_hours.toFixed(1)}h
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">0h</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(attendance.attendance_status)}>
                                                <div className="flex items-center">
                                                    {getStatusIcon(attendance.attendance_status)}
                                                    <span className="ml-1">
                                                        {attendance.attendance_status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </div>
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {attendance.clock_in_location && (
                                                    <div className="flex items-center text-gray-500">
                                                        <MapPin className="w-3 h-3 mr-1" />
                                                        {attendance.clock_in_location}
                                                    </div>
                                                )}
                                                {attendance.clock_out_location && attendance.clock_out_location !== attendance.clock_in_location && (
                                                    <div className="flex items-center text-gray-500">
                                                        <MapPin className="w-3 h-3 mr-1" />
                                                        {attendance.clock_out_location}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Link href={`/hr/attendance/${attendance.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/hr/attendance/${attendance.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}



