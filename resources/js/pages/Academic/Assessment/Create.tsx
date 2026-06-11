import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Calendar, BookOpen, Users } from 'lucide-react';

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

interface Props {
    classes: SchoolClass[];
    subjects: Subject[];
}

export default function CreateAssessment({ classes, subjects }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        type: '',
        subject_id: '',
        school_class_id: '',
        max_marks: '',
        weightage: '',
        date: '',
        instructions: '',
        duration: '',
    });

    const assessmentTypes = [
        { value: 'homework', label: 'Homework' },
        { value: 'class_test', label: 'Class Test' },
        { value: 'midterm', label: 'Midterm Exam' },
        { value: 'final_exam', label: 'Final Exam' },
        { value: 'project', label: 'Project' },
        { value: 'practical', label: 'Practical' },
        { value: 'oral', label: 'Oral Exam' },
        { value: 'assignment', label: 'Assignment' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/academic/assessment');
    };

    return (
        <AppLayout>
            <Head title="Create Assessment" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create New Assessment</h1>
                    <p className="text-gray-600">Define a new assessment for students</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assessment Information</CardTitle>
                            <CardDescription>
                                Basic information about the assessment
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
                                    <Label htmlFor="max_marks">Maximum Marks</Label>
                                    <Input
                                        id="max_marks"
                                        type="number"
                                        value={data.max_marks}
                                        onChange={(e) => setData('max_marks', e.target.value)}
                                        placeholder="100"
                                        className={errors.max_marks ? 'border-red-500' : ''}
                                    />
                                    {errors.max_marks && <p className="text-red-500 text-sm">{errors.max_marks}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="weightage">Weightage (%)</Label>
                                    <Input
                                        id="weightage"
                                        type="number"
                                        value={data.weightage}
                                        onChange={(e) => setData('weightage', e.target.value)}
                                        placeholder="30"
                                        className={errors.weightage ? 'border-red-500' : ''}
                                    />
                                    {errors.weightage && <p className="text-red-500 text-sm">{errors.weightage}</p>}
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
                                    <Label htmlFor="duration">Duration (minutes)</Label>
                                    <Input
                                        id="duration"
                                        type="number"
                                        value={data.duration}
                                        onChange={(e) => setData('duration', e.target.value)}
                                        placeholder="90"
                                        className={errors.duration ? 'border-red-500' : ''}
                                    />
                                    {errors.duration && <p className="text-red-500 text-sm">{errors.duration}</p>}
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
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Creating...' : 'Create Assessment'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
