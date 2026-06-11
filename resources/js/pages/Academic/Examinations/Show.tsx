import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Calendar, GraduationCap, Users, BookOpen, Edit, Trash2 } from 'lucide-react';

interface Class {
    id: number;
    name: string;
    level: string;
}

interface Subject {
    id: number;
    name: string;
    code: string;
}

interface Examination {
    id: number;
    name: string;
    type: string;
    start_date: string;
    end_date: string;
    status: string;
    description: string;
    classes: Class[];
    subjects: Subject[];
    created_at: string;
}

interface Props {
    examination: Examination;
}

export default function ShowExamination({ examination }: Props) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Scheduled':
                return <Badge variant="default">Scheduled</Badge>;
            case 'Planned':
                return <Badge variant="secondary">Planned</Badge>;
            case 'In Progress':
                return <Badge variant="outline">In Progress</Badge>;
            case 'Completed':
                return <Badge variant="outline">Completed</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'Internal':
                return <Badge variant="outline">Internal</Badge>;
            case 'External':
                return <Badge variant="default">External</Badge>;
            case 'NECTA':
                return <Badge variant="default">NECTA</Badge>;
            default:
                return <Badge variant="secondary">{type}</Badge>;
        }
    };

    return (
        <AppLayout>
            <Head title={`${examination.name} - Examination Details`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/academic/examinations">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Examinations
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{examination.name}</h1>
                            <p className="text-muted-foreground">
                                Examination details and information
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" asChild>
                            <Link href={`/academic/examinations/${examination.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Examination Details */}
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Information */}
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <GraduationCap className="mr-2 h-5 w-5" />
                                    Examination Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                                        <p className="text-sm font-medium">{examination.name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                                        <div className="mt-1">
                                            {getTypeBadge(examination.type)}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Start Date</Label>
                                        <div className="flex items-center mt-1">
                                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm">{new Date(examination.start_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">End Date</Label>
                                        <div className="flex items-center mt-1">
                                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm">{new Date(examination.end_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                    <div className="mt-1">
                                        {getStatusBadge(examination.status)}
                                    </div>
                                </div>

                                {examination.description && (
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                                        <p className="text-sm mt-1">{examination.description}</p>
                                    </div>
                                )}

                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                                    <p className="text-sm mt-1">{new Date(examination.created_at).toLocaleDateString()}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                        {/* Classes */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-base">
                                    <Users className="mr-2 h-4 w-4" />
                                    Classes ({examination.classes.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {examination.classes.map((classItem) => (
                                        <div key={classItem.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">{classItem.name}</p>
                                                <p className="text-xs text-muted-foreground">{classItem.level}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Subjects */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-base">
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    Subjects ({examination.subjects.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {examination.subjects.map((subject) => (
                                        <div key={subject.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">{subject.name}</p>
                                                <p className="text-xs text-muted-foreground">{subject.code}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
