import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, BookOpen, Calendar, GraduationCap } from 'lucide-react';

interface Subject {
    id: number;
    name: string;
    code: string;
    necta_code: string;
    is_core: boolean;
    is_elective: boolean;
    is_compulsory: boolean;
    credits: number;
    weekly_periods: number;
    passing_grade: number;
}

interface Curriculum {
    id: number;
    name: string;
    code: string;
    description: string;
    level: string;
    level_display: string;
    academic_year: string;
    is_active: boolean;
    is_necta_curriculum: boolean;
    subjects_count: number;
    subjects: Subject[];
    created_at: string;
    updated_at: string;
}

interface Props {
    curriculum: Curriculum;
}

export default function ShowCurriculum({ curriculum }: Props) {
    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge variant="default">Active</Badge>
        ) : (
            <Badge variant="secondary">Inactive</Badge>
        );
    };

    const getSubjectTypeBadge = (subject: Subject) => {
        if (subject.is_core) {
            return <Badge variant="default">Core</Badge>;
        } else if (subject.is_elective) {
            return <Badge variant="outline">Elective</Badge>;
        } else {
            return <Badge variant="secondary">Other</Badge>;
        }
    };

    return (
        <AppLayout>
            <Head title={`Curriculum: ${curriculum.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{curriculum.name}</h1>
                        <p className="text-gray-600">Curriculum Details</p>
                    </div>
                    <div className="flex space-x-2">
                        <Link href="/academic/curriculum">
                            <Button variant="outline">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Curricula
                            </Button>
                        </Link>
                        <Link href={`/academic/curriculum/${curriculum.id}/edit`}>
                            <Button variant="outline">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Curriculum Code</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{curriculum.code}</div>
                            <p className="text-xs text-muted-foreground">
                                Unique curriculum identifier
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Level</CardTitle>
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{curriculum.level_display}</div>
                            <p className="text-xs text-muted-foreground">
                                Educational level
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Academic Year</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{curriculum.academic_year}</div>
                            <p className="text-xs text-muted-foreground">
                                Academic year
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Curriculum Information</CardTitle>
                            <CardDescription>
                                Basic details about this curriculum
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-500">Name</Label>
                                <p className="text-lg">{curriculum.name}</p>
                            </div>
                            
                            <div>
                                <Label className="text-sm font-medium text-gray-500">Code</Label>
                                <p className="text-lg">{curriculum.code}</p>
                            </div>
                            
                            <div>
                                <Label className="text-sm font-medium text-gray-500">Level</Label>
                                <p className="text-lg">{curriculum.level_display}</p>
                            </div>
                            
                            <div>
                                <Label className="text-sm font-medium text-gray-500">Academic Year</Label>
                                <p className="text-lg">{curriculum.academic_year}</p>
                            </div>
                            
                            <div>
                                <Label className="text-sm font-medium text-gray-500">Status</Label>
                                <div className="mt-1">
                                    {getStatusBadge(curriculum.is_active)}
                                </div>
                            </div>
                            
                            <div>
                                <Label className="text-sm font-medium text-gray-500">NECTA Compliant</Label>
                                <div className="mt-1">
                                    {curriculum.is_necta_curriculum ? (
                                        <Badge variant="default">Yes</Badge>
                                    ) : (
                                        <Badge variant="secondary">No</Badge>
                                    )}
                                </div>
                            </div>
                            
                            {curriculum.description && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Description</Label>
                                    <p className="text-sm text-gray-700 mt-1">{curriculum.description}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Statistics</CardTitle>
                            <CardDescription>
                                Curriculum statistics and metrics
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-500">Total Subjects</Label>
                                <p className="text-2xl font-bold">{curriculum.subjects_count}</p>
                            </div>
                            
                            <div>
                                <Label className="text-sm font-medium text-gray-500">Core Subjects</Label>
                                <p className="text-2xl font-bold text-blue-600">
                                    {curriculum.subjects.filter(s => s.is_core).length}
                                </p>
                            </div>
                            
                            <div>
                                <Label className="text-sm font-medium text-gray-500">Elective Subjects</Label>
                                <p className="text-2xl font-bold text-green-600">
                                    {curriculum.subjects.filter(s => s.is_elective).length}
                                </p>
                            </div>
                            
                            <div>
                                <Label className="text-sm font-medium text-gray-500">Compulsory Subjects</Label>
                                <p className="text-2xl font-bold text-orange-600">
                                    {curriculum.subjects.filter(s => s.is_compulsory).length}
                                </p>
                            </div>
                            
                            <div>
                                <Label className="text-sm font-medium text-gray-500">Created</Label>
                                <p className="text-sm">{new Date(curriculum.created_at).toLocaleDateString()}</p>
                            </div>
                            
                            <div>
                                <Label className="text-sm font-medium text-gray-500">Last Updated</Label>
                                <p className="text-sm">{new Date(curriculum.updated_at).toLocaleDateString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Subjects in this Curriculum</CardTitle>
                        <CardDescription>
                            All subjects included in this curriculum
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {curriculum.subjects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {curriculum.subjects.map((subject) => (
                                    <div key={subject.id} className="border rounded-lg p-4 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">{subject.name}</h4>
                                            {getSubjectTypeBadge(subject)}
                                        </div>
                                        
                                        <div className="text-sm text-gray-500">
                                            <p>Code: {subject.code}</p>
                                            {subject.necta_code && <p>NECTA: {subject.necta_code}</p>}
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2">
                                            {subject.is_core && <Badge variant="default" className="text-xs">Core</Badge>}
                                            {subject.is_elective && <Badge variant="outline" className="text-xs">Elective</Badge>}
                                            {subject.is_compulsory && <Badge variant="secondary" className="text-xs">Compulsory</Badge>}
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                            <div>Credits: {subject.credits || 'N/A'}</div>
                                            <div>Periods: {subject.weekly_periods || 'N/A'}</div>
                                            <div>Passing: {subject.passing_grade || 'N/A'}%</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold text-gray-900">No subjects</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    This curriculum doesn't have any subjects yet.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}



