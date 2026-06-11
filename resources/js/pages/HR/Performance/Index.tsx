import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Target, Users, TrendingUp, Calendar, Eye, Edit, Star, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface PerformanceAppraisal {
    id: number;
    staff: {
        name: string;
        employee_id: string;
        role: string;
    };
    appraiser: {
        name: string;
    };
    appraisal_cycle: {
        name: string;
        appraisal_type: string;
        start_date: string;
        end_date: string;
    };
    overall_rating: number;
    status: string;
    meeting_date: string;
    completed_at: string;
    goals_count: number;
    completed_goals: number;
}

interface Props {
    appraisals: {
        data: PerformanceAppraisal[];
        links: any[];
        meta: any;
    };
}

export default function PerformanceIndex({ appraisals }: Props) {
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [cycleFilter, setCycleFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'not_started':
                return 'bg-gray-100 text-gray-800';
            case 'goal_setting':
                return 'bg-blue-100 text-blue-800';
            case 'self_assessment':
                return 'bg-yellow-100 text-yellow-800';
            case 'manager_review':
                return 'bg-orange-100 text-orange-800';
            case 'meeting_scheduled':
                return 'bg-purple-100 text-purple-800';
            case 'meeting_completed':
                return 'bg-indigo-100 text-indigo-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'not_started':
                return <Clock className="w-4 h-4" />;
            case 'goal_setting':
                return <Target className="w-4 h-4" />;
            case 'self_assessment':
                return <Users className="w-4 h-4" />;
            case 'manager_review':
                return <Edit className="w-4 h-4" />;
            case 'meeting_scheduled':
                return <Calendar className="w-4 h-4" />;
            case 'meeting_completed':
                return <CheckCircle className="w-4 h-4" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 4.5) return 'text-green-600';
        if (rating >= 3.5) return 'text-blue-600';
        if (rating >= 2.5) return 'text-yellow-600';
        if (rating >= 1.5) return 'text-orange-600';
        return 'text-red-600';
    };

    const getRatingDisplay = (rating: number) => {
        if (rating >= 4.5) return 'Excellent';
        if (rating >= 3.5) return 'Good';
        if (rating >= 2.5) return 'Satisfactory';
        if (rating >= 1.5) return 'Needs Improvement';
        return 'Unsatisfactory';
    };

    const filteredAppraisals = appraisals.data.filter(appraisal => {
        if (statusFilter && appraisal.status !== statusFilter) return false;
        if (cycleFilter && appraisal.appraisal_cycle.name !== cycleFilter) return false;
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                appraisal.staff.name.toLowerCase().includes(searchLower) ||
                appraisal.staff.employee_id.toLowerCase().includes(searchLower) ||
                appraisal.appraiser.name.toLowerCase().includes(searchLower)
            );
        }
        return true;
    });

    const stats = {
        total: appraisals.data.length,
        completed: appraisals.data.filter(a => a.status === 'completed').length,
        inProgress: appraisals.data.filter(a => ['goal_setting', 'self_assessment', 'manager_review'].includes(a.status)).length,
        pending: appraisals.data.filter(a => a.status === 'not_started').length,
        averageRating: appraisals.data.filter(a => a.overall_rating).reduce((sum, a) => sum + a.overall_rating, 0) / appraisals.data.filter(a => a.overall_rating).length || 0,
    };

    const cycles = Array.from(new Set(appraisals.data.map(a => a.appraisal_cycle.name)));

    return (
        <AppLayout>
            <Head title="Performance Appraisals" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Performance Appraisals</h1>
                        <p className="text-gray-600">Manage staff performance evaluations and goal tracking</p>
                    </div>
                    <div className="flex space-x-2">
                        <Link href="/hr/performance/cycles">
                            <Button variant="outline">
                                <Calendar className="w-4 h-4 mr-2" />
                                Appraisal Cycles
                            </Button>
                        </Link>
                        <Link href="/hr/performance/create">
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Start Appraisal
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Appraisals</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">
                                All appraisals
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                            <p className="text-xs text-muted-foreground">
                                Completed appraisals
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                            <Clock className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                            <p className="text-xs text-muted-foreground">
                                Ongoing appraisals
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                            <Star className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">
                                {stats.averageRating.toFixed(1)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Out of 5.0
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Performance Appraisals</CardTitle>
                                <CardDescription>
                                    View and manage all performance appraisals
                                </CardDescription>
                            </div>
                            <div className="flex space-x-4">
                                <Input
                                    placeholder="Search appraisals..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-64"
                                />
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="All status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="not_started">Not Started</SelectItem>
                                        <SelectItem value="goal_setting">Goal Setting</SelectItem>
                                        <SelectItem value="self_assessment">Self Assessment</SelectItem>
                                        <SelectItem value="manager_review">Manager Review</SelectItem>
                                        <SelectItem value="meeting_scheduled">Meeting Scheduled</SelectItem>
                                        <SelectItem value="meeting_completed">Meeting Completed</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={cycleFilter} onValueChange={setCycleFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="All cycles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Cycles</SelectItem>
                                        {cycles.map((cycle) => (
                                            <SelectItem key={cycle} value={cycle}>
                                                {cycle}
                                            </SelectItem>
                                        ))}
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
                                    <TableHead>Appraisal Cycle</TableHead>
                                    <TableHead>Appraiser</TableHead>
                                    <TableHead>Goals Progress</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Meeting Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAppraisals.map((appraisal) => (
                                    <TableRow key={appraisal.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{appraisal.staff.name}</div>
                                                <div className="text-sm text-gray-500">{appraisal.staff.employee_id}</div>
                                                <div className="text-sm text-gray-500">{appraisal.staff.role}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{appraisal.appraisal_cycle.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    {appraisal.appraisal_cycle.appraisal_type.replace('_', ' ')}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(appraisal.appraisal_cycle.start_date).toLocaleDateString()} - {new Date(appraisal.appraisal_cycle.end_date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{appraisal.appraiser.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <div className="text-sm">
                                                    {appraisal.completed_goals}/{appraisal.goals_count}
                                                </div>
                                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className="bg-blue-600 h-2 rounded-full" 
                                                        style={{ 
                                                            width: `${appraisal.goals_count > 0 ? (appraisal.completed_goals / appraisal.goals_count) * 100 : 0}%` 
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {appraisal.overall_rating ? (
                                                <div>
                                                    <div className={`font-medium ${getRatingColor(appraisal.overall_rating)}`}>
                                                        {appraisal.overall_rating.toFixed(1)}/5.0
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {getRatingDisplay(appraisal.overall_rating)}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">Not rated</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(appraisal.status)}>
                                                <div className="flex items-center">
                                                    {getStatusIcon(appraisal.status)}
                                                    <span className="ml-1">
                                                        {appraisal.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </div>
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {appraisal.meeting_date ? (
                                                <div className="text-sm">
                                                    {new Date(appraisal.meeting_date).toLocaleDateString()}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">Not scheduled</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Link href={`/hr/performance/${appraisal.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                {appraisal.status !== 'completed' && (
                                                    <Link href={`/hr/performance/${appraisal.id}/edit`}>
                                                        <Button variant="outline" size="sm">
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                )}
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



