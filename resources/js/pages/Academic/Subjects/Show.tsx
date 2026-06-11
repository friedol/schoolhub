import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Edit, BookOpen, GraduationCap, Users, Calendar, CheckCircle } from 'lucide-react';
import { StatCard, StatGrid } from '@/components/ui/stat-card';

interface Subject {
    id: number;
    name: string;
    code: string;
    description: string;
    necta_code: string;
    is_active: boolean;
    classes_count: number;
    teachers_count: number;
    classes: Array<{
        id: number;
        name: string;
        level: string;
    }>;
    teachers?: Array<{
        id: number;
        name: string;
        email: string;
    }>;
    created_at: string;
    updated_at: string;
}

interface Props {
    subject: Subject;
}

export default function ShowSubject({ subject }: Props) {
    const { flash } = usePage().props as any;
    
    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge variant="default">Active</Badge>
        ) : (
            <Badge variant="secondary">Inactive</Badge>
        );
    };

    return (
        <AppLayout>
            <Head title={subject.name} />
            
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
                            <Link href="/academic/subjects">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Subjects
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{subject.name}</h1>
                            <p className="text-muted-foreground">
                                Subject details and information
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={`/academic/subjects/${subject.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Subject
                        </Link>
                    </Button>
                </div>

                {/* Subject Overview Cards */}
                <StatGrid cols={4}>
                    <StatCard
                        title="Subject Code"
                        value={subject.code}
                        icon={BookOpen}
                        color="blue"
                        trend="stable"
                        trendLabel="Code"
                        subtitle="Internal code"
                    />
                    <StatCard
                        title="NECTA Code"
                        value={subject.necta_code || 'N/A'}
                        icon={GraduationCap}
                        color="green"
                        trend="stable"
                        trendLabel="NECTA"
                        subtitle="National code"
                    />
                    <StatCard
                        title="Classes"
                        value={subject.classes_count}
                        icon={GraduationCap}
                        color="violet"
                        trend="stable"
                        trendLabel="Classes"
                        subtitle="classes taught"
                    />
                    <StatCard
                        title="Teachers"
                        value={subject.teachers_count}
                        icon={Users}
                        color="amber"
                        trend="stable"
                        trendLabel="Teachers"
                        subtitle="teachers assigned"
                    />
                </StatGrid>

                {/* Subject Details */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Subject Information</CardTitle>
                            <CardDescription>
                                Basic details about this subject
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Subject Name</label>
                                <p className="text-sm">{subject.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Subject Code</label>
                                <p className="text-sm">{subject.code}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">NECTA Code</label>
                                <p className="text-sm">{subject.necta_code}</p>
                            </div>
                            {subject.description && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                                    <p className="text-sm">{subject.description}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Status</label>
                                <p className="text-sm">{getStatusBadge(subject.is_active)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Created</label>
                                <p className="text-sm">{new Date(subject.created_at).toLocaleDateString()}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Classes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Classes</CardTitle>
                            <CardDescription>
                                Classes where this subject is taught
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {subject.classes.length > 0 ? (
                                <div className="space-y-2">
                                    {subject.classes.map((classItem) => (
                                        <div key={classItem.id} className="flex items-center justify-between p-2 border rounded">
                                            <div>
                                                <p className="font-medium">{classItem.name}</p>
                                                <p className="text-sm text-muted-foreground">{classItem.level}</p>
                                            </div>
                                            <Badge variant="outline">{classItem.level}</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No classes assigned to this subject.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Teachers List */}
                {subject.teachers && subject.teachers.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Teachers</CardTitle>
                            <CardDescription>
                                Teachers assigned to this subject
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Teacher Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {subject.teachers.map((teacher) => (
                                        <TableRow key={teacher.id}>
                                            <TableCell className="font-medium">{teacher.name}</TableCell>
                                            <TableCell>{teacher.email}</TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/teachers/${teacher.id}`}>
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
