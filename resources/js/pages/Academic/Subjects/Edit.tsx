import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Subject {
    id: number;
    name: string;
    code: string;
    description: string;
    necta_code: string;
    is_active: boolean;
    classes: Array<{
        id: number;
        name: string;
        level: string;
    }>;
}

interface Props {
    subject: Subject;
    classes?: Array<{
        id: number;
        name: string;
        level: string;
    }>;
}

export default function EditSubject({ subject, classes = [] }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: subject.name,
        code: subject.code,
        description: subject.description || '',
        necta_code: subject.necta_code,
        is_active: subject.is_active,
        class_ids: subject.classes.map(c => c.id),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/academic/subjects/${subject.id}`);
    };

    const handleClassChange = (classId: number, checked: boolean) => {
        if (checked) {
            setData('class_ids', [...data.class_ids, classId]);
        } else {
            setData('class_ids', data.class_ids.filter(id => id !== classId));
        }
    };

    return (
        <AppLayout>
            <Head title={`Edit ${subject.name}`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
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
                            <h1 className="text-3xl font-bold tracking-tight">Edit {subject.name}</h1>
                            <p className="text-muted-foreground">
                                Update subject information and settings
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Subject Information</CardTitle>
                        <CardDescription>
                            Update the details for this subject
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Subject Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Subject Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., Mathematics"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">{errors.name}</p>
                                    )}
                                </div>

                                {/* Subject Code */}
                                <div className="space-y-2">
                                    <Label htmlFor="code">Subject Code *</Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                        placeholder="e.g., MATH"
                                        className={errors.code ? 'border-red-500' : ''}
                                    />
                                    {errors.code && (
                                        <p className="text-sm text-red-500">{errors.code}</p>
                                    )}
                                </div>

                                {/* NECTA Code */}
                                <div className="space-y-2">
                                    <Label htmlFor="necta_code">NECTA Code *</Label>
                                    <Input
                                        id="necta_code"
                                        value={data.necta_code}
                                        onChange={(e) => setData('necta_code', e.target.value)}
                                        placeholder="e.g., 041"
                                        className={errors.necta_code ? 'border-red-500' : ''}
                                    />
                                    {errors.necta_code && (
                                        <p className="text-sm text-red-500">{errors.necta_code}</p>
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
                                    placeholder="Brief description of the subject"
                                    rows={3}
                                    className={errors.description ? 'border-red-500' : ''}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">{errors.description}</p>
                                )}
                            </div>

                            {/* Classes */}
                            {classes.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Classes</Label>
                                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                                        {classes.map((classItem) => (
                                            <div key={classItem.id} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id={`class-${classItem.id}`}
                                                    checked={data.class_ids.includes(classItem.id)}
                                                    onChange={(e) => handleClassChange(classItem.id, e.target.checked)}
                                                    className="rounded border-gray-300"
                                                />
                                                <Label htmlFor={`class-${classItem.id}`} className="text-sm">
                                                    {classItem.name} ({classItem.level})
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.class_ids && (
                                        <p className="text-sm text-red-500">{errors.class_ids}</p>
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
                                    <Link href="/academic/subjects">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Updating...' : 'Update Subject'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}



