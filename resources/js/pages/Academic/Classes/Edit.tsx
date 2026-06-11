import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Class {
    id: number;
    name: string;
    level: string;
    stream: string;
    capacity: number;
    description: string;
    is_active: boolean;
    subjects: Array<{
        id: number;
        name: string;
        code: string;
    }>;
}

interface Props {
    classItem: Class;
    subjects?: Array<{
        id: number;
        name: string;
        code: string;
    }>;
}

export default function EditClass({ classItem, subjects = [] }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: classItem.name,
        level: classItem.level,
        stream: classItem.stream,
        capacity: classItem.capacity,
        description: classItem.description || '',
        is_active: classItem.is_active,
        subject_ids: classItem.subjects.map(s => s.id),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/academic/classes/${classItem.id}`);
    };

    const handleSubjectChange = (subjectId: number, checked: boolean) => {
        if (checked) {
            setData('subject_ids', [...data.subject_ids, subjectId]);
        } else {
            setData('subject_ids', data.subject_ids.filter(id => id !== subjectId));
        }
    };

    return (
        <AppLayout>
            <Head title={`Edit ${classItem.name}`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
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
                            <h1 className="text-3xl font-bold tracking-tight">Edit {classItem.name}</h1>
                            <p className="text-muted-foreground">
                                Update class information and settings
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Class Information</CardTitle>
                        <CardDescription>
                            Update the details for this class
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Class Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Class Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., Form 1A"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">{errors.name}</p>
                                    )}
                                </div>

                                {/* Level */}
                                <div className="space-y-2">
                                    <Label htmlFor="level">Level *</Label>
                                    <Select value={data.level} onValueChange={(value) => setData('level', value)}>
                                        <SelectTrigger className={errors.level ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Form 1">Form 1</SelectItem>
                                            <SelectItem value="Form 2">Form 2</SelectItem>
                                            <SelectItem value="Form 3">Form 3</SelectItem>
                                            <SelectItem value="Form 4">Form 4</SelectItem>
                                            <SelectItem value="Form 5">Form 5</SelectItem>
                                            <SelectItem value="Form 6">Form 6</SelectItem>
                                            <SelectItem value="Nursery">Nursery</SelectItem>
                                            <SelectItem value="Primary 1">Primary 1</SelectItem>
                                            <SelectItem value="Primary 2">Primary 2</SelectItem>
                                            <SelectItem value="Primary 3">Primary 3</SelectItem>
                                            <SelectItem value="Primary 4">Primary 4</SelectItem>
                                            <SelectItem value="Primary 5">Primary 5</SelectItem>
                                            <SelectItem value="Primary 6">Primary 6</SelectItem>
                                            <SelectItem value="Primary 7">Primary 7</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.level && (
                                        <p className="text-sm text-red-500">{errors.level}</p>
                                    )}
                                </div>

                                {/* Stream */}
                                <div className="space-y-2">
                                    <Label htmlFor="stream">Stream</Label>
                                    <Input
                                        id="stream"
                                        value={data.stream}
                                        onChange={(e) => setData('stream', e.target.value)}
                                        placeholder="e.g., A, B, C"
                                        className={errors.stream ? 'border-red-500' : ''}
                                    />
                                    {errors.stream && (
                                        <p className="text-sm text-red-500">{errors.stream}</p>
                                    )}
                                </div>

                                {/* Capacity */}
                                <div className="space-y-2">
                                    <Label htmlFor="capacity">Capacity *</Label>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={data.capacity}
                                        onChange={(e) => setData('capacity', parseInt(e.target.value))}
                                        className={errors.capacity ? 'border-red-500' : ''}
                                    />
                                    {errors.capacity && (
                                        <p className="text-sm text-red-500">{errors.capacity}</p>
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
                                    placeholder="Optional description for this class"
                                    rows={3}
                                    className={errors.description ? 'border-red-500' : ''}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">{errors.description}</p>
                                )}
                            </div>

                            {/* Subjects */}
                            {subjects.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Subjects</Label>
                                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                                        {subjects.map((subject) => (
                                            <div key={subject.id} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id={`subject-${subject.id}`}
                                                    checked={data.subject_ids.includes(subject.id)}
                                                    onChange={(e) => handleSubjectChange(subject.id, e.target.checked)}
                                                    className="rounded border-gray-300"
                                                />
                                                <Label htmlFor={`subject-${subject.id}`} className="text-sm">
                                                    {subject.name} ({subject.code})
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.subject_ids && (
                                        <p className="text-sm text-red-500">{errors.subject_ids}</p>
                                    )}
                                </div>
                            )}

                            {/* Active Status */}
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                                <Label htmlFor="is_active">Active</Label>
                            </div>

                            {/* Form Actions */}
                            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/academic/classes">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Updating...' : 'Update Class'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}



