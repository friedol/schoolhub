import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Edit, Trash2, BookOpen, Calendar, Users, TrendingUp, Eye } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Assessment {
    id: number;
    name: string;
    type: string;
    total_marks: number;
    weight: number;
    date: string;
    due_date?: string;
    is_published: boolean;
    class: {
        id: number;
        name: string;
    };
    subject: {
        id: number;
        name: string;
    };
    teacher: {
        id: number;
        name: string;
    };
    academic_term: {
        id: number;
        name: string;
    };
    created_at: string;
}

interface Statistics {
    total_students: number;
    submitted_count: number;
    graded_count: number;
    average_score: number;
    highest_score: number;
    lowest_score: number;
}

interface Props {
    assessment: Assessment;
    statistics: Statistics;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Academic',
        href: '/academic',
    },
    {
        title: 'Assessments',
        href: '/academic/assessments',
    },
    {
        title: 'View Assessment',
        href: '#',
    },
];

export default function ShowAssessment({ assessment, statistics }: Props) {
    const getTypeColor = (type: string) => {
        switch (type) {
            case 'exam': return 'bg-red-100 text-red-800';
            case 'test': return 'bg-orange-100 text-orange-800';
            case 'quiz': return 'bg-yellow-100 text-yellow-800';
            case 'assignment': return 'bg-blue-100 text-blue-800';
            case 'project': return 'bg-purple-100 text-purple-800';
            case 'presentation': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeDisplay = (type: string) => {
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Assessment: ${assessment.name}`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/academic/assessments">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Assessments
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{assessment.name}</h1>
                            <p className="text-muted-foreground">
                                Assessment details and statistics
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" asChild>
                            <Link href={`/academic/assessments/${assessment.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Assessment
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={`/academic/assessments/${assessment.id}/grade`}>
                                <TrendingUp className="mr-2 h-4 w-4" />
                                Grade Results
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Assessment Details */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assessment Information</CardTitle>
                            <CardDescription>
                                Basic details about this assessment
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                                    <p className="text-lg font-semibold">{assessment.name}</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Type</label>
                                        <div className="mt-1">
                                            <Badge className={getTypeColor(assessment.type)}>
                                                {getTypeDisplay(assessment.type)}
                                            </Badge>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                                        <div className="mt-1">
                                            <Badge variant={assessment.is_published ? "default" : "secondary"}>
                                                {assessment.is_published ? "Published" : "Draft"}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Total Marks</label>
                                        <p className="text-lg font-semibold">{assessment.total_marks}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Weight</label>
                                        <p className="text-lg font-semibold">{assessment.weight}%</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Date</label>
                                    <p className="text-lg font-semibold">
                                        {new Date(assessment.date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Class & Subject</CardTitle>
                            <CardDescription>
                                Associated class and subject information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Class</label>
                                    <div className="flex items-center mt-1">
                                        <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <p className="text-lg font-semibold">{assessment.class.name}</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Subject</label>
                                    <p className="text-lg font-semibold">{assessment.subject.name}</p>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Teacher</label>
                                    <div className="flex items-center mt-1">
                                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <p className="text-lg font-semibold">{assessment.teacher.name}</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Academic Term</label>
                                    <p className="text-lg font-semibold">{assessment.academic_term.name}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Statistics */}
                <Card>
                    <CardHeader>
                        <CardTitle>Assessment Statistics</CardTitle>
                        <CardDescription>
                            Performance metrics and student participation
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{statistics.total_students}</div>
                                <div className="text-sm text-muted-foreground">Total Students</div>
                            </div>
                            
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{statistics.submitted_count}</div>
                                <div className="text-sm text-muted-foreground">Submitted</div>
                            </div>
                            
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">{statistics.graded_count}</div>
                                <div className="text-sm text-muted-foreground">Graded</div>
                            </div>
                            
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-orange-600">{statistics.average_score.toFixed(1)}</div>
                                <div className="text-sm text-muted-foreground">Average Score</div>
                            </div>
                            
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{statistics.highest_score}</div>
                                <div className="text-sm text-muted-foreground">Highest Score</div>
                            </div>
                            
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-red-600">{statistics.lowest_score}</div>
                                <div className="text-sm text-muted-foreground">Lowest Score</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}



