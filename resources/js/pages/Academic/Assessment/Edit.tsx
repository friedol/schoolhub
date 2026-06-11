import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
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

interface SchoolClass {
    id: number;
    name: string;
    level: string;
}

interface Subject {
    id: number;
    name: string;
    code: string;
}

interface Term {
    id: number;
    name: string;
}

interface Props {
    assessment: Assessment;
    classes: SchoolClass[];
    subjects: Subject[];
    terms: Term[];
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
        title: 'Edit Assessment',
        href: '#',
    },
];

export default function EditAssessment({ assessment, classes, subjects, terms }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: assessment.name,
        type: assessment.type,
        subject_id: assessment.subject.id.toString(),
        school_class_id: assessment.class.id.toString(),
        term_id: assessment.academic_term.id.toString(),
        total_marks: assessment.total_marks.toString(),
        weight: assessment.weight.toString(),
        date: assessment.date,
        due_date: assessment.due_date || '',
        instructions: '',
        duration: '',
    });

    const assessmentTypes = [
        { value: 'exam', label: 'Exam' },
        { value: 'test', label: 'Test' },
        { value: 'quiz', label: 'Quiz' },
        { value: 'assignment', label: 'Assignment' },
        { value: 'project', label: 'Project' },
        { value: 'presentation', label: 'Presentation' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/academic/assessments/${assessment.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Assessment: ${assessment.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/academic/assessments/${assessment.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Assessment
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Assessment</h1>
                        <p className="text-gray-600">Update assessment details</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assessment Information</CardTitle>
                            <CardDescription>
                                Update the basic information about the assessment
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Assessment Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., Mathematics Midterm Exam"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="type">Assessment Type</Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(value) => setData('type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select assessment type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {assessmentTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="subject_id">Subject</Label>
                                    <Select
                                        value={data.subject_id}
                                        onValueChange={(value) => setData('subject_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subjects.map((subject) => (
                                                <SelectItem key={subject.id} value={subject.id.toString()}>
                                                    {subject.name} ({subject.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.subject_id && <p className="text-red-500 text-sm">{errors.subject_id}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="school_class_id">Class</Label>
                                    <Select
                                        value={data.school_class_id}
                                        onValueChange={(value) => setData('school_class_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classes.map((cls) => (
                                                <SelectItem key={cls.id} value={cls.id.toString()}>
                                                    {cls.name} ({cls.level})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.school_class_id && <p className="text-red-500 text-sm">{errors.school_class_id}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="term_id">Academic Term</Label>
                                    <Select
                                        value={data.term_id}
                                        onValueChange={(value) => setData('term_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select term" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {terms.map((term) => (
                                                <SelectItem key={term.id} value={term.id.toString()}>
                                                    {term.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.term_id && <p className="text-red-500 text-sm">{errors.term_id}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="total_marks">Total Marks</Label>
                                    <Input
                                        id="total_marks"
                                        type="number"
                                        value={data.total_marks}
                                        onChange={(e) => setData('total_marks', e.target.value)}
                                        placeholder="100"
                                        className={errors.total_marks ? 'border-red-500' : ''}
                                    />
                                    {errors.total_marks && <p className="text-red-500 text-sm">{errors.total_marks}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="weight">Weight (%)</Label>
                                    <Input
                                        id="weight"
                                        type="number"
                                        value={data.weight}
                                        onChange={(e) => setData('weight', e.target.value)}
                                        placeholder="30"
                                        className={errors.weight ? 'border-red-500' : ''}
                                    />
                                    {errors.weight && <p className="text-red-500 text-sm">{errors.weight}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="date">Assessment Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                        className={errors.date ? 'border-red-500' : ''}
                                    />
                                    {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="due_date">Due Date (Optional)</Label>
                                    <Input
                                        id="due_date"
                                        type="date"
                                        value={data.due_date}
                                        onChange={(e) => setData('due_date', e.target.value)}
                                        className={errors.due_date ? 'border-red-500' : ''}
                                    />
                                    {errors.due_date && <p className="text-red-500 text-sm">{errors.due_date}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="instructions">Instructions</Label>
                                <Textarea
                                    id="instructions"
                                    value={data.instructions}
                                    onChange={(e) => setData('instructions', e.target.value)}
                                    placeholder="Enter assessment instructions for students..."
                                    rows={4}
                                    className={errors.instructions ? 'border-red-500' : ''}
                                />
                                {errors.instructions && <p className="text-red-500 text-sm">{errors.instructions}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href={`/academic/assessments/${assessment.id}`}>
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Updating...' : 'Update Assessment'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}



