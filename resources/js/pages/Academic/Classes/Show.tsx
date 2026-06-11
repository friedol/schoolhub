import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Edit, Users, BookOpen, GraduationCap, Calendar, CheckCircle } from 'lucide-react';
import { StatCard, StatGrid } from '@/components/ui/stat-card';

interface Class {
    id: number;
    name: string;
    level: string;
    stream: string;
    capacity: number;
    description: string;
    is_active: boolean;
    students_count: number;
    subjects_count: number;
    subjects: Array<{
        id: number;
        name: string;
        code: string;
    }>;
    students?: Array<{
        id: number;
        name: string;
        student_number: string;
    }>;
    created_at: string;
    updated_at: string;
}

interface Props {
    classItem: Class;
}

export default function ShowClass({ classItem }: Props) {
    const { flash } = usePage().props as any;
    
    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge variant="default">Active</Badge>
        ) : (
            <Badge variant="secondary">Inactive</Badge>
        );
    };

    const getCapacityStatus = (current: number, capacity: number) => {
        const percentage = (current / capacity) * 100;
        if (percentage >= 90) {
            return <Badge variant="destructive">Full</Badge>;
        } else if (percentage >= 75) {
            return <Badge variant="outline">Almost Full</Badge>;
        } else {
            return <Badge variant="secondary">Available</Badge>;
        }
    };

    return (
        <AppLayout>
            <Head title={classItem.name} />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Success Message */}
                {flash?.success && (
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                            {flash.success}
                        </AlertDescription>
                    </Alert>
                )}
                
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/academic/classes">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Classes
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{classItem.name}</h1>
                            <p className="text-muted-foreground">
                                Class details and information
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={`/academic/classes/${classItem.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Class
                        </Link>
                    </Button>
                </div>

                {/* Class Overview Cards */}
                <StatGrid cols={4}>
                    <StatCard
                        title="Students"
                        value={classItem.students_count}
                        icon={Users}
                        color="red"
                        trend="up"
                        trendLabel="Capacity"
                        subtitle={`of ${classItem.capacity} capacity`}
                    />
                    <StatCard
                        title="Subjects"
                        value={classItem.subjects_count}
                        icon={BookOpen}
                        color="blue"
                        trend="stable"
                        trendLabel="Active"
                        subtitle="subjects taught"
                    />
                    <StatCard
                        title="Level"
                        value={classItem.level}
                        icon={GraduationCap}
                        color="indigo"
                        trend="stable"
                        trendLabel="Academic"
                        subtitle={classItem.stream ? `Stream: ${classItem.stream}` : 'No Stream'}
                    />
                    <StatCard
                        title="Status"
                        value={classItem.is_active ? 'Active' : 'Inactive'}
                        icon={Calendar}
                        color={classItem.is_active ? 'green' : 'slate'}
                        trend="stable"
                        trendLabel="Status"
                        subtitle={`${Math.round((classItem.students_count / classItem.capacity) * 100)}% filled`}
                    />
                </StatGrid>

                {/* Class Details */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Class Information</CardTitle>
                            <CardDescription>
                                Basic details about this class
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Class Name</label>
                                <p className="text-sm">{classItem.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Level</label>
                                <p className="text-sm">{classItem.level}</p>
                            </div>
                            {classItem.stream && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Stream</label>
                                    <p className="text-sm">{classItem.stream}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Capacity</label>
                                <p className="text-sm">{classItem.capacity} students</p>
                            </div>
                            {classItem.description && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                                    <p className="text-sm">{classItem.description}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Created</label>
                                <p className="text-sm">{new Date(classItem.created_at).toLocaleDateString()}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Subjects */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Subjects</CardTitle>
                            <CardDescription>
                                Subjects taught in this class
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {classItem.subjects.length > 0 ? (
                                <div className="space-y-2">
                                    {classItem.subjects.map((subject) => (
                                        <div key={subject.id} className="flex items-center justify-between p-2 border rounded">
                                            <div>
                                                <p className="font-medium">{subject.name}</p>
                                                <p className="text-sm text-muted-foreground">{subject.code}</p>
                                            </div>
                                            <Badge variant="outline">{subject.code}</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No subjects assigned to this class.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Students List */}
                {classItem.students && classItem.students.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Students</CardTitle>
                            <CardDescription>
                                Students enrolled in this class
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead>Student Number</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {classItem.students.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">{student.name}</TableCell>
                                            <TableCell>{student.student_number}</TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/students/${student.id}`}>
                                                        View Profile
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
