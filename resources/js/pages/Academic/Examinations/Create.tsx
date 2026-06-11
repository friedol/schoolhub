import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Calendar, GraduationCap } from 'lucide-react';

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

interface Props {
    classes: Class[];
    subjects: Subject[];
}

export default function CreateExamination({ classes, subjects }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        type: '',
        start_date: '',
        end_date: '',
        description: '',
        classes: [] as number[],
        subjects: [] as number[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/academic/examinations');
    };

    const handleClassChange = (classId: number, checked: boolean) => {
        if (checked) {
            setData('classes', [...data.classes, classId]);
        } else {
            setData('classes', data.classes.filter(id => id !== classId));
        }
    };

    const handleSubjectChange = (subjectId: number, checked: boolean) => {
        if (checked) {
            setData('subjects', [...data.subjects, subjectId]);
        } else {
            setData('subjects', data.subjects.filter(id => id !== subjectId));
        }
    };

    return (
        <AppLayout>
            <Head title="Schedule Examination" />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/academic/examinations">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Schedule Examination</h1>
                            <p className="text-muted-foreground">
                                Create a new examination schedule
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <GraduationCap className="mr-2 h-5 w-5" />
                            Examination Details
                        </CardTitle>
                        <CardDescription>
                            Fill in the details to schedule a new examination
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Examination Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., Mid-term Examinations"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">Examination Type *</Label>
                                    <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                                        <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select examination type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Internal">Internal</SelectItem>
                                            <SelectItem value="External">External</SelectItem>
                                            <SelectItem value="NECTA">NECTA</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.type && (
                                        <p className="text-sm text-red-500">{errors.type}</p>
                                    )}
                                </div>
                            </div>

                            {/* Date Range */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">Start Date *</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="start_date"
                                            type="date"
                                            value={data.start_date}
                                            onChange={(e) => setData('start_date', e.target.value)}
                                            className={`pl-10 ${errors.start_date ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.start_date && (
                                        <p className="text-sm text-red-500">{errors.start_date}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_date">End Date *</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="end_date"
                                            type="date"
                                            value={data.end_date}
                                            onChange={(e) => setData('end_date', e.target.value)}
                                            className={`pl-10 ${errors.end_date ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.end_date && (
                                        <p className="text-sm text-red-500">{errors.end_date}</p>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Enter examination description..."
                                    rows={3}
                                />
                            </div>

                            {/* Classes Selection */}
                            <div className="space-y-2">
                                <Label>Classes *</Label>
                                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                                    {classes.map((classItem) => (
                                        <div key={classItem.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`class-${classItem.id}`}
                                                checked={data.classes.includes(classItem.id)}
                                                onCheckedChange={(checked) => 
                                                    handleClassChange(classItem.id, checked as boolean)
                                                }
                                            />
                                            <Label 
                                                htmlFor={`class-${classItem.id}`}
                                                className="text-sm font-normal"
                                            >
                                                {classItem.name} ({classItem.level})
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                {errors.classes && (
                                    <p className="text-sm text-red-500">{errors.classes}</p>
                                )}
                            </div>

                            {/* Subjects Selection */}
                            <div className="space-y-2">
                                <Label>Subjects *</Label>
                                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                                    {subjects.map((subject) => (
                                        <div key={subject.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`subject-${subject.id}`}
                                                checked={data.subjects.includes(subject.id)}
                                                onCheckedChange={(checked) => 
                                                    handleSubjectChange(subject.id, checked as boolean)
                                                }
                                            />
                                            <Label 
                                                htmlFor={`subject-${subject.id}`}
                                                className="text-sm font-normal"
                                            >
                                                {subject.name} ({subject.code})
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                {errors.subjects && (
                                    <p className="text-sm text-red-500">{errors.subjects}</p>
                                )}
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex items-center justify-end space-x-4 pt-6">
                                <Button variant="outline" asChild>
                                    <Link href="/academic/examinations">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Scheduling...' : 'Schedule Examination'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}



